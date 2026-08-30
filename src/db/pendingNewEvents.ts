export interface PendingNewEvent {
  userId: number;
  name: string;
  pattern: string;
}

interface PendingNewEventRow {
  user_id: number;
  name: string;
  pattern: string;
}

function fromRow(row: PendingNewEventRow): PendingNewEvent {
  return { userId: row.user_id, name: row.name, pattern: row.pattern };
}

/**
 * Stores (or replaces) the event `/newevent` will create for `userId`
 * once they confirm leaving their currently active event — see
 * CLAUDE.md "Succession on leaving an event". At most one pending
 * creation per user; a repeat `/newevent` before confirming just
 * overwrites it.
 */
export async function setPendingNewEvent(
  db: D1Database,
  params: { userId: number; name: string; pattern: string }
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO pending_newevents (user_id, name, pattern) VALUES (?, ?, ?)
       ON CONFLICT (user_id) DO UPDATE SET
         name = excluded.name, pattern = excluded.pattern, created_at = datetime('now')`
    )
    .bind(params.userId, params.name, params.pattern)
    .run();
}

/** Fetches a user's pending event creation, if any. */
export async function getPendingNewEvent(db: D1Database, userId: number): Promise<PendingNewEvent | null> {
  const row = await db.prepare("SELECT * FROM pending_newevents WHERE user_id = ?").bind(userId).first<PendingNewEventRow>();
  return row ? fromRow(row) : null;
}

/** Clears a user's pending event creation, whether confirmed, cancelled, or superseded. */
export async function clearPendingNewEvent(db: D1Database, userId: number): Promise<void> {
  await db.prepare("DELETE FROM pending_newevents WHERE user_id = ?").bind(userId).run();
}
