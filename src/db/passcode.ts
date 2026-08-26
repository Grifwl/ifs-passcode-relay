import type { EventTrustStatus } from "../domain/trust.js";

export interface CandidateRow {
  position: number;
  value: string;
  supporterCount: number;
}

/** Distinct candidate values reported for every position of an event, excluding trolled users. */
export async function getCandidates(db: D1Database, eventId: number): Promise<CandidateRow[]> {
  const { results } = await db
    .prepare(
      "SELECT position, value, supporter_count FROM passcode_candidates WHERE event_id = ? ORDER BY position, value"
    )
    .bind(eventId)
    .all<{ position: number; value: string; supporter_count: number }>();
  return results.map((r) => ({ position: r.position, value: r.value, supporterCount: r.supporter_count }));
}

/** Candidate values reported at one position, excluding trolled users, most-supported first. */
export async function getCandidatesAtPosition(
  db: D1Database,
  eventId: number,
  position: number
): Promise<CandidateRow[]> {
  const { results } = await db
    .prepare(
      "SELECT position, value, supporter_count FROM passcode_candidates WHERE event_id = ? AND position = ? ORDER BY supporter_count DESC, value"
    )
    .bind(eventId, position)
    .all<{ position: number; value: string; supporter_count: number }>();
  return results.map((r) => ({ position: r.position, value: r.value, supporterCount: r.supporter_count }));
}

/** A single user's most recent report at a position, if any (regardless of trust status). */
export async function getOwnReport(
  db: D1Database,
  eventId: number,
  position: number,
  userId: number
): Promise<{ value: string } | null> {
  const row = await db
    .prepare(
      "SELECT value FROM passcode_reports WHERE event_id = ? AND position = ? AND user_id = ? ORDER BY created_at DESC LIMIT 1"
    )
    .bind(eventId, position, userId)
    .first<{ value: string }>();
  return row ? { value: row.value } : null;
}

/**
 * Distinct values reported at a position by users other than the given
 * one, excluding trolls. Used to tell a self-correction (no conflict,
 * whatever this user said before doesn't count) apart from a genuine
 * disagreement with someone else.
 */
export async function getOtherCandidateValues(
  db: D1Database,
  eventId: number,
  position: number,
  excludingUserId: number
): Promise<string[]> {
  const { results } = await db
    .prepare(
      `SELECT DISTINCT r.value AS value
       FROM passcode_reports r
       WHERE r.event_id = ? AND r.position = ? AND r.user_id != ?
         AND NOT EXISTS (
           SELECT 1 FROM event_trust t
           WHERE t.event_id = r.event_id AND t.user_id = r.user_id AND t.status = 'troll'
         )`
    )
    .bind(eventId, position, excludingUserId)
    .all<{ value: string }>();
  return results.map((r) => r.value);
}

/** Deletes every prior report a user made at a position (used when they self-correct). */
export async function deleteOwnReports(
  db: D1Database,
  eventId: number,
  position: number,
  userId: number
): Promise<void> {
  await db
    .prepare("DELETE FROM passcode_reports WHERE event_id = ? AND position = ? AND user_id = ?")
    .bind(eventId, position, userId)
    .run();
}

/** Appends a report to the log. */
export async function insertReport(
  db: D1Database,
  params: { eventId: number; position: number; value: string; userId: number; displayName: string }
): Promise<void> {
  await db
    .prepare(
      "INSERT INTO passcode_reports (event_id, position, value, user_id, display_name_snapshot) VALUES (?, ?, ?, ?, ?)"
    )
    .bind(params.eventId, params.position, params.value, params.userId, params.displayName)
    .run();
}

/** Distinct (non-troll) supporters of a specific position/value, most recent first. */
export async function getSupporters(
  db: D1Database,
  eventId: number,
  position: number,
  value: string
): Promise<{ userId: number; displayName: string }[]> {
  const { results } = await db
    .prepare(
      `SELECT r.user_id AS user_id, r.display_name_snapshot AS display_name
       FROM passcode_reports r
       WHERE r.event_id = ? AND r.position = ? AND r.value = ?
         AND NOT EXISTS (
           SELECT 1 FROM event_trust t
           WHERE t.event_id = r.event_id AND t.user_id = r.user_id AND t.status = 'troll'
         )
       GROUP BY r.user_id
       ORDER BY MAX(r.created_at) DESC`
    )
    .bind(eventId, position, value)
    .all<{ user_id: number; display_name: string }>();
  return results.map((r) => ({ userId: r.user_id, displayName: r.display_name }));
}

export interface ResolutionRow {
  position: number;
  value: string;
}

/** Every resolved position of an event. */
export async function getResolutions(db: D1Database, eventId: number): Promise<ResolutionRow[]> {
  const { results } = await db
    .prepare("SELECT position, value FROM passcode_resolutions WHERE event_id = ?")
    .bind(eventId)
    .all<ResolutionRow>();
  return results;
}

/** Sets (or overwrites) the canonical value for a position. */
export async function setResolution(
  db: D1Database,
  params: { eventId: number; position: number; value: string; resolvedBy: number }
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO passcode_resolutions (event_id, position, value, resolved_by)
       VALUES (?, ?, ?, ?)
       ON CONFLICT (event_id, position) DO UPDATE SET
         value = excluded.value, resolved_by = excluded.resolved_by, resolved_at = datetime('now')`
    )
    .bind(params.eventId, params.position, params.value, params.resolvedBy)
    .run();
}

/** Clears a position's resolution, reopening it to its reported candidates. */
export async function clearResolution(db: D1Database, eventId: number, position: number): Promise<void> {
  await db
    .prepare("DELETE FROM passcode_resolutions WHERE event_id = ? AND position = ?")
    .bind(eventId, position)
    .run();
}

/** The trust status of every participant of an event who has one set. */
export async function getEventTrustMap(db: D1Database, eventId: number): Promise<Map<number, EventTrustStatus>> {
  const { results } = await db
    .prepare("SELECT user_id, status FROM event_trust WHERE event_id = ?")
    .bind(eventId)
    .all<{ user_id: number; status: string }>();
  return new Map(results.map((r) => [r.user_id, r.status as EventTrustStatus]));
}

/** Sets (or overwrites) a participant's trust status for one event. */
export async function setTrust(
  db: D1Database,
  params: { eventId: number; userId: number; status: EventTrustStatus; setBy: number }
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO event_trust (event_id, user_id, status, set_by)
       VALUES (?, ?, ?, ?)
       ON CONFLICT (event_id, user_id) DO UPDATE SET
         status = excluded.status, set_by = excluded.set_by, set_at = datetime('now')`
    )
    .bind(params.eventId, params.userId, params.status, params.setBy)
    .run();
}

/** Clears a participant's trust flag, back to neutral. */
export async function clearTrust(db: D1Database, eventId: number, userId: number): Promise<void> {
  await db.prepare("DELETE FROM event_trust WHERE event_id = ? AND user_id = ?").bind(eventId, userId).run();
}

/** Registers a word-slot value in the shared cross-event vocabulary, or bumps its use count. */
export async function recordKnownWord(db: D1Database, word: string, eventId: number): Promise<void> {
  await db
    .prepare(
      `INSERT INTO known_words (word, first_used_in_event_id) VALUES (?, ?)
       ON CONFLICT (word) DO UPDATE SET use_count = use_count + 1`
    )
    .bind(word, eventId)
    .run();
}
