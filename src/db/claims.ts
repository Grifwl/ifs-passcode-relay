import type { SuccessionCandidate } from "../domain/succession.js";
import type { EventTrustStatus } from "../domain/trust.js";

export interface AdminClaim {
  eventId: number;
  initiatedAt: string;
  notifyChatId: number;
  notifyMessageId: number;
}

interface AdminClaimRow {
  event_id: number;
  initiated_at: string;
  notify_chat_id: number;
  notify_message_id: number;
}

function fromRow(row: AdminClaimRow): AdminClaim {
  return {
    eventId: row.event_id,
    initiatedAt: row.initiated_at,
    notifyChatId: row.notify_chat_id,
    notifyMessageId: row.notify_message_id,
  };
}

/** The currently open claim negotiation for an event, if any — at most one at a time. */
export async function getOpenClaim(db: D1Database, eventId: number): Promise<AdminClaim | null> {
  const row = await db.prepare("SELECT * FROM admin_claims WHERE event_id = ?").bind(eventId).first<AdminClaimRow>();
  return row ? fromRow(row) : null;
}

/** Opens a new claim negotiation, recording where the Accept/Keep notification was sent so it can be edited later. */
export async function openClaim(
  db: D1Database,
  params: { eventId: number; notifyChatId: number; notifyMessageId: number }
): Promise<void> {
  await db
    .prepare("INSERT INTO admin_claims (event_id, notify_chat_id, notify_message_id) VALUES (?, ?, ?)")
    .bind(params.eventId, params.notifyChatId, params.notifyMessageId)
    .run();
}

/** Closes a claim negotiation (however it was resolved), clearing its candidate pool too. */
export async function closeClaim(db: D1Database, eventId: number): Promise<void> {
  await db.prepare("DELETE FROM admin_claim_candidates WHERE event_id = ?").bind(eventId).run();
  await db.prepare("DELETE FROM admin_claims WHERE event_id = ?").bind(eventId).run();
}

/**
 * Adds a participant to the open claim's candidate pool. Returns
 * whether this was a new addition (false if they'd already claimed),
 * so the handler can tell a first-time claimant from a repeat one.
 */
export async function addClaimCandidate(db: D1Database, eventId: number, userId: number): Promise<boolean> {
  const result = await db
    .prepare("INSERT INTO admin_claim_candidates (event_id, user_id) VALUES (?, ?) ON CONFLICT (event_id, user_id) DO NOTHING")
    .bind(eventId, userId)
    .run();
  return result.meta.changes > 0;
}

/**
 * Every participant who has claimed during the current negotiation,
 * with what `pickSuccessor` needs to resolve it the same way `/leave`
 * succession does (see CLAUDE.md "Administrator succession") — trust
 * status and current contribution count, restricted to this pool
 * instead of every other participant.
 */
export async function getClaimCandidates(db: D1Database, eventId: number): Promise<SuccessionCandidate[]> {
  const { results } = await db
    .prepare(
      `SELECT c.user_id AS user_id, t.status AS status, COALESCE(r.cnt, 0) AS report_count
       FROM admin_claim_candidates c
       LEFT JOIN event_trust t ON t.event_id = c.event_id AND t.user_id = c.user_id
       LEFT JOIN (
         SELECT user_id, COUNT(*) AS cnt FROM passcode_reports WHERE event_id = ? GROUP BY user_id
       ) r ON r.user_id = c.user_id
       WHERE c.event_id = ?`
    )
    .bind(eventId, eventId)
    .all<{ user_id: number; status: string | null; report_count: number }>();
  return results.map((r) => ({
    userId: r.user_id,
    trustStatus: r.status as EventTrustStatus | null,
    reportCount: r.report_count,
  }));
}
