import type { EventStatus, IfsEvent } from "../domain/types.js";
import { generateEventCode } from "../domain/codeGen.js";

interface EventRow {
  id: number;
  code: string;
  name: string;
  pattern: string;
  status: string;
  closed_reason: string | null;
  admin_user_id: number;
  created_at: string;
}

function fromRow(row: EventRow): IfsEvent {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    pattern: row.pattern,
    status: row.status as EventStatus,
    closedReason: row.closed_reason as IfsEvent["closedReason"],
    adminUserId: row.admin_user_id,
    createdAt: row.created_at,
  };
}

/** Fetches an event by its join code, regardless of status. */
export async function getEventByCode(db: D1Database, code: string): Promise<IfsEvent | null> {
  const row = await db
    .prepare("SELECT * FROM events WHERE code = ?")
    .bind(code.toUpperCase())
    .first<EventRow>();
  return row ? fromRow(row) : null;
}

/** Fetches an event by id. */
export async function getEventById(db: D1Database, id: number): Promise<IfsEvent | null> {
  const row = await db.prepare("SELECT * FROM events WHERE id = ?").bind(id).first<EventRow>();
  return row ? fromRow(row) : null;
}

/**
 * Lists the events a given user currently administers, most recent
 * first. Since the admin role can move on via `/promote` or `/leave`
 * succession (see CLAUDE.md "Administrator succession"), this reflects
 * who holds the role *now*, not necessarily who ran `/newevent`.
 */
export async function listEventsAdministeredBy(db: D1Database, userId: number): Promise<IfsEvent[]> {
  const { results } = await db
    .prepare("SELECT * FROM events WHERE admin_user_id = ? ORDER BY created_at DESC")
    .bind(userId)
    .all<EventRow>();
  return results.map(fromRow);
}

/**
 * Creates a new event with a freshly generated, collision-free join
 * code. Whoever creates it becomes its first administrator.
 */
export async function createEvent(
  db: D1Database,
  params: { name: string; pattern: string; adminUserId: number }
): Promise<IfsEvent> {
  let code = generateEventCode();
  // Codes are short and drawn from a small alphabet; collisions are rare
  // but possible, so retry a handful of times against the unique index.
  for (let attempt = 0; attempt < 5; attempt++) {
    const clash = await getEventByCode(db, code);
    if (!clash) break;
    code = generateEventCode();
  }

  const { results } = await db
    .prepare(
      "INSERT INTO events (code, name, pattern, admin_user_id) VALUES (?, ?, ?, ?) RETURNING *"
    )
    .bind(code, params.name, params.pattern, params.adminUserId)
    .all<EventRow>();

  const row = results[0];
  if (!row) throw new Error("Failed to create event");
  return fromRow(row);
}

/**
 * Marks an event as closed, freezing it against further joins/submissions.
 * `reason` records whether it completed normally (`/closeevent`) or was
 * auto-closed because `/leave` ran out of eligible successors (see
 * CLAUDE.md "Administrator succession").
 */
export async function closeEvent(
  db: D1Database,
  eventId: number,
  reason: "completed" | "abandoned" = "completed"
): Promise<void> {
  await db.prepare("UPDATE events SET status = 'closed', closed_reason = ? WHERE id = ?").bind(reason, eventId).run();
}

/** Transfers an event's administrator role to a different user (used by /promote and /leave succession). */
export async function transferAdmin(db: D1Database, eventId: number, newAdminUserId: number): Promise<void> {
  await db.prepare("UPDATE events SET admin_user_id = ? WHERE id = ?").bind(newAdminUserId, eventId).run();
}
