import type { Participant } from "../domain/types.js";

interface ParticipantRow {
  user_id: number;
  event_id: number;
  chat_id: number;
  status_message_id: number | null;
  joined_at: string;
  last_active_at: string;
}

function fromRow(row: ParticipantRow): Participant {
  return {
    userId: row.user_id,
    eventId: row.event_id,
    chatId: row.chat_id,
    statusMessageId: row.status_message_id,
    joinedAt: row.joined_at,
    lastActiveAt: row.last_active_at,
  };
}

/** Fetches the event a user is currently participating in, if any. */
export async function getParticipant(db: D1Database, userId: number): Promise<Participant | null> {
  const row = await db
    .prepare("SELECT * FROM participants WHERE user_id = ?")
    .bind(userId)
    .first<ParticipantRow>();
  return row ? fromRow(row) : null;
}

/**
 * Joins a user to an event, replacing their previous membership if any
 * — an agent attends at most one event at a time. If they were already
 * a participant of a *different* event, that membership is archived to
 * `participant_history` first (see CLAUDE.md "Data model"), so /events
 * can still show it later even though it's about to be overwritten
 * here. Rejoining the same event they're already in archives nothing.
 */
export async function joinEvent(
  db: D1Database,
  params: { userId: number; eventId: number; chatId: number }
): Promise<void> {
  await archivePreviousParticipation(db, params.userId, params.eventId);
  await db
    .prepare(
      `INSERT INTO participants (user_id, event_id, chat_id, status_message_id, last_active_at)
       VALUES (?, ?, ?, NULL, datetime('now'))
       ON CONFLICT (user_id) DO UPDATE SET
         event_id = excluded.event_id,
         chat_id = excluded.chat_id,
         status_message_id = NULL,
         joined_at = datetime('now'),
         last_active_at = datetime('now')`
    )
    .bind(params.userId, params.eventId, params.chatId)
    .run();
}

/** Removes a user's participation row (used by /leave and /kick), archiving it first. */
export async function removeParticipant(db: D1Database, userId: number): Promise<void> {
  await db
    .prepare(
      `INSERT INTO participant_history (event_id, user_id, joined_at)
       SELECT event_id, user_id, joined_at FROM participants WHERE user_id = ?`
    )
    .bind(userId)
    .run();
  await db.prepare("DELETE FROM participants WHERE user_id = ?").bind(userId).run();
}

/** Archives a user's current participation row, if it points at a different event than the one they're about to join. */
async function archivePreviousParticipation(db: D1Database, userId: number, newEventId: number): Promise<void> {
  await db
    .prepare(
      `INSERT INTO participant_history (event_id, user_id, joined_at)
       SELECT event_id, user_id, joined_at FROM participants WHERE user_id = ? AND event_id != ?`
    )
    .bind(userId, newEventId)
    .run();
}

/** Stores the message id of a participant's live-updating status message. */
export async function setStatusMessageId(db: D1Database, userId: number, messageId: number): Promise<void> {
  await db.prepare("UPDATE participants SET status_message_id = ? WHERE user_id = ?").bind(messageId, userId).run();
}

/** Lists every current participant of an event. */
export async function listParticipants(db: D1Database, eventId: number): Promise<Participant[]> {
  const { results } = await db
    .prepare("SELECT * FROM participants WHERE event_id = ?")
    .bind(eventId)
    .all<ParticipantRow>();
  return results.map(fromRow);
}

/**
 * Marks a participant as active right now — called from a bot-wide
 * middleware on every update (message or button tap), and after an
 * admin handover so the new administrator's own inactivity clock
 * starts fresh (see CLAUDE.md "Administrator succession"). A no-op if
 * the user has no participant row.
 */
export async function touchParticipantActivity(db: D1Database, userId: number): Promise<void> {
  await db.prepare("UPDATE participants SET last_active_at = datetime('now') WHERE user_id = ?").bind(userId).run();
}
