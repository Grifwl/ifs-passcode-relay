import type { EventStatus, IfsEvent } from "../domain/types.js";
import { generateEventCode } from "../domain/codeGen.js";

interface EventRow {
  id: number;
  code: string;
  name: string;
  pattern: string;
  status: string;
  created_by: number;
  created_at: string;
}

function fromRow(row: EventRow): IfsEvent {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    pattern: row.pattern,
    status: row.status as EventStatus,
    createdBy: row.created_by,
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

/** Lists the events a given user has created, most recent first. */
export async function listEventsCreatedBy(db: D1Database, userId: number): Promise<IfsEvent[]> {
  const { results } = await db
    .prepare("SELECT * FROM events WHERE created_by = ? ORDER BY created_at DESC")
    .bind(userId)
    .all<EventRow>();
  return results.map(fromRow);
}

/**
 * Creates a new event with a freshly generated, collision-free join
 * code.
 */
export async function createEvent(
  db: D1Database,
  params: { name: string; pattern: string; createdBy: number }
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
      "INSERT INTO events (code, name, pattern, created_by) VALUES (?, ?, ?, ?) RETURNING *"
    )
    .bind(code, params.name, params.pattern, params.createdBy)
    .all<EventRow>();

  const row = results[0];
  if (!row) throw new Error("Failed to create event");
  return fromRow(row);
}

/** Marks an event as closed, freezing it against further joins/submissions. */
export async function closeEvent(db: D1Database, eventId: number): Promise<void> {
  await db.prepare("UPDATE events SET status = 'closed' WHERE id = ?").bind(eventId).run();
}

/** Transfers an event's creator role to a different user (used by /promote). */
export async function transferCreator(db: D1Database, eventId: number, newCreatorId: number): Promise<void> {
  await db.prepare("UPDATE events SET created_by = ? WHERE id = ?").bind(newCreatorId, eventId).run();
}
