import type { Participant } from "../domain/types.js";

interface ParticipantRow {
  user_id: number;
  event_id: number;
  chat_id: number;
  status_message_id: number | null;
  joined_at: string;
}

function fromRow(row: ParticipantRow): Participant {
  return {
    userId: row.user_id,
    eventId: row.event_id,
    chatId: row.chat_id,
    statusMessageId: row.status_message_id,
    joinedAt: row.joined_at,
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
 * — an agent attends at most one event at a time.
 */
export async function joinEvent(
  db: D1Database,
  params: { userId: number; eventId: number; chatId: number }
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO participants (user_id, event_id, chat_id, status_message_id)
       VALUES (?, ?, ?, NULL)
       ON CONFLICT (user_id) DO UPDATE SET
         event_id = excluded.event_id,
         chat_id = excluded.chat_id,
         status_message_id = NULL,
         joined_at = datetime('now')`
    )
    .bind(params.userId, params.eventId, params.chatId)
    .run();
}

/** Removes a user's participation row (used by /leave and /kick). */
export async function removeParticipant(db: D1Database, userId: number): Promise<void> {
  await db.prepare("DELETE FROM participants WHERE user_id = ?").bind(userId).run();
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
