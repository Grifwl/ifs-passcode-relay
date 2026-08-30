import type { EventParticipation, EventStatus, IfsEvent } from "../domain/types.js";
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
 * Lists every event a user is or has been part of, for /events — their
 * *current* one (if any), then every other one they've left behind,
 * most recently-left first. Filtering by `admin_user_id` alone doesn't
 * work for this: that field never gets cleared when its holder moves
 * on without a successor (see CLAUDE.md "Administrator succession"), so
 * it can keep pointing at someone long after they've stopped being a
 * participant at all — which is also why each entry also carries
 * whether the event is still their *current* one, not just whether
 * they administer it.
 */
export async function listEventsParticipatedIn(db: D1Database, userId: number): Promise<EventParticipation[]> {
  const currentRow = await db
    .prepare("SELECT e.* FROM events e JOIN participants p ON p.event_id = e.id WHERE p.user_id = ?")
    .bind(userId)
    .first<EventRow>();

  const { results: historyRows } = await db
    .prepare(
      `SELECT e.*, MAX(h.left_at) AS left_at
       FROM participant_history h
       JOIN events e ON e.id = h.event_id
       WHERE h.user_id = ?
       GROUP BY h.event_id
       ORDER BY left_at DESC`
    )
    .bind(userId)
    .all<EventRow & { left_at: string }>();

  const entries: EventParticipation[] = [];
  if (currentRow) entries.push({ event: fromRow(currentRow), isCurrent: true, leftAt: null });
  for (const row of historyRows) {
    if (currentRow && row.id === currentRow.id) continue;
    entries.push({ event: fromRow(row), isCurrent: false, leftAt: row.left_at });
  }
  return entries;
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
 * `reason` records whether it completed normally (a store-confirmed
 * `/verify`) or was auto-closed because `/leave` ran out of eligible
 * successors (see CLAUDE.md "Administrator succession").
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

/**
 * Reactivates an event that was closed as `abandoned` (see CLAUDE.md
 * "Reviving an abandoned event"), handing it to whoever `/join`s its
 * code next: clears `status`/`closed_reason` and installs them as the
 * new `admin_user_id` in the same statement. Never used on a
 * `completed` event — that closure is deliberate and final, unlike
 * `abandoned`, which just means nobody was left to take over.
 */
export async function reviveAbandonedEvent(db: D1Database, eventId: number, newAdminUserId: number): Promise<void> {
  await db
    .prepare("UPDATE events SET status = 'active', closed_reason = NULL, admin_user_id = ? WHERE id = ?")
    .bind(newAdminUserId, eventId)
    .run();
}
