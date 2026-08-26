import type { Api } from "grammy";
import { listParticipants, setStatusMessageId } from "../db/participants.js";
import { getEventTrustMap } from "../db/passcode.js";
import { getUser } from "../db/users.js";
import type { IfsEvent, Participant } from "../domain/types.js";
import type { SupportedLanguage } from "../i18n/index.js";
import { renderStatus } from "./passcodeView.js";

/**
 * Sends or updates one participant's live status message: edits the
 * message stored in `participants.status_message_id` if there is one,
 * otherwise sends a fresh message and records its id. `api` is
 * whatever the calling handler already has as `ctx.api`.
 */
export async function deliverStatus(
  api: Api,
  db: D1Database,
  event: IfsEvent,
  participant: Participant,
  lang: SupportedLanguage
): Promise<void> {
  const text = await renderStatus(db, event, lang);

  if (participant.statusMessageId) {
    try {
      await api.editMessageText(participant.chatId, participant.statusMessageId, text, { parse_mode: "HTML" });
    } catch {
      // Telegram errors on a no-op edit (identical text) or a deleted
      // message; neither is worth surfacing anywhere.
    }
    return;
  }

  const sent = await api.sendMessage(participant.chatId, text, { parse_mode: "HTML" });
  await setStatusMessageId(db, participant.userId, sent.message_id);
}

/**
 * Sends a brand-new status message and makes it the new live-update
 * target for this participant, replacing whatever message id was
 * stored before. Used by `/status` so a participant can pull the live
 * view back down to the bottom of their chat once the original message
 * has scrolled out of easy reach, instead of being stuck editing a
 * message buried far above.
 */
export async function refreshStatusMessage(
  api: Api,
  db: D1Database,
  event: IfsEvent,
  participant: Participant,
  lang: SupportedLanguage
): Promise<void> {
  const text = await renderStatus(db, event, lang);
  const sent = await api.sendMessage(participant.chatId, text, { parse_mode: "HTML" });
  await setStatusMessageId(db, participant.userId, sent.message_id);
}

/**
 * Updates every current participant's live status message after the
 * passcode state changes, skipping anyone currently flagged `troll` for
 * this event (see CLAUDE.md "Live updates" and "Trust & moderation").
 */
export async function broadcastPasscodeUpdate(api: Api, db: D1Database, event: IfsEvent): Promise<void> {
  const [participants, trustMap] = await Promise.all([listParticipants(db, event.id), getEventTrustMap(db, event.id)]);

  for (const participant of participants) {
    if (trustMap.get(participant.userId) === "troll") continue;
    const user = await getUser(db, participant.userId);
    await deliverStatus(api, db, event, participant, user?.language ?? "en");
  }
}
