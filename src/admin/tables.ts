/**
 * D1 table snapshots for the admin dashboard, split the same way the
 * data model itself is: tables with no `event_id` column (shown in
 * full, always) versus tables that belong to a specific event (shown
 * only once the dashboard's caller picks one, filtered by it). See
 * CLAUDE.md's "Data model (D1)" for what each table holds.
 */

export interface TableDef {
  name: string;
  sql: string;
}

export const GLOBAL_TABLES: TableDef[] = [
  { name: "events", sql: "SELECT * FROM events ORDER BY id DESC" },
  { name: "users", sql: "SELECT * FROM users ORDER BY user_id" },
  { name: "known_words", sql: "SELECT * FROM known_words ORDER BY word" },
  { name: "pending_newevents", sql: "SELECT * FROM pending_newevents ORDER BY user_id" },
];

export const EVENT_TABLES: TableDef[] = [
  { name: "participants", sql: "SELECT * FROM participants WHERE event_id = ? ORDER BY user_id" },
  { name: "participant_history", sql: "SELECT * FROM participant_history WHERE event_id = ? ORDER BY id" },
  { name: "passcode_reports", sql: "SELECT * FROM passcode_reports WHERE event_id = ? ORDER BY position, created_at" },
  { name: "passcode_candidates", sql: "SELECT * FROM passcode_candidates WHERE event_id = ? ORDER BY position, value" },
  { name: "passcode_resolutions", sql: "SELECT * FROM passcode_resolutions WHERE event_id = ? ORDER BY position" },
  { name: "event_trust", sql: "SELECT * FROM event_trust WHERE event_id = ? ORDER BY user_id" },
  { name: "admin_claims", sql: "SELECT * FROM admin_claims WHERE event_id = ?" },
  { name: "admin_claim_candidates", sql: "SELECT * FROM admin_claim_candidates WHERE event_id = ? ORDER BY user_id" },
];

/** Snapshots every global table in a single D1 round trip. */
export async function fetchGlobalTables(db: D1Database): Promise<Record<string, unknown[]>> {
  const results = await db.batch(GLOBAL_TABLES.map((t) => db.prepare(t.sql)));
  const out: Record<string, unknown[]> = {};
  GLOBAL_TABLES.forEach((t, i) => {
    out[t.name] = results[i]?.results ?? [];
  });
  return out;
}

/** Snapshots every event-scoped table, filtered to one event, in a single D1 round trip. */
export async function fetchEventTables(db: D1Database, eventId: number): Promise<Record<string, unknown[]>> {
  const results = await db.batch(EVENT_TABLES.map((t) => db.prepare(t.sql).bind(eventId)));
  const out: Record<string, unknown[]> = {};
  EVENT_TABLES.forEach((t, i) => {
    out[t.name] = results[i]?.results ?? [];
  });
  return out;
}
