import type { Api } from "grammy";
import type { IfsEvent } from "../domain/types.js";
import { pickSuccessor } from "../domain/succession.js";
import { getSuccessionCandidates, setTrust } from "../db/passcode.js";
import { closeEvent, transferAdmin } from "../db/events.js";
import { getParticipant, touchParticipantActivity } from "../db/participants.js";
import { getUser } from "../db/users.js";
import { t } from "../i18n/index.js";

export type SuccessionOutcome =
  | { kind: "notApplicable" }
  | { kind: "closedAbandoned" }
  | { kind: "promoted"; successorId: number; successorUsername: string | null };

/**
 * Runs administrator succession for `event` on behalf of
 * `departingUserId`, who is about to stop being one of its
 * participants — whether via `/leave`, or implicitly by switching to a
 * different event through `/newevent` or an accepted `/join` switch.
 * See CLAUDE.md "Administrator succession": the selection rule (trusted
 * preferred, then most contributions, random tie-break) is the same
 * regardless of *why* the administrator is leaving — without this, an
 * event whose administrator moves on by creating or joining another one
 * would be left "orphaned": still `active`, with an `admin_user_id`
 * pointing at someone no longer participating in it, and nobody able to
 * take over.
 *
 * A no-op (`notApplicable`) if `departingUserId` doesn't currently
 * administer `event`, or `event` is already closed. Does not touch
 * `departingUserId`'s own `participants` row — callers differ on what
 * happens to it (deleted outright by `/leave`, replaced by the row
 * `/newevent`/`/join` are about to insert), so that stays their
 * responsibility.
 */
export async function runSuccession(
  db: D1Database,
  api: Api,
  event: IfsEvent,
  departingUserId: number
): Promise<SuccessionOutcome> {
  if (event.status !== "active" || event.adminUserId !== departingUserId) {
    return { kind: "notApplicable" };
  }

  const candidates = await getSuccessionCandidates(db, event.id, departingUserId);
  const successorId = pickSuccessor(candidates);

  if (successorId === null) {
    await closeEvent(db, event.id, "abandoned");
    return { kind: "closedAbandoned" };
  }

  await transferAdmin(db, event.id, successorId);
  // Mirrors /promote's own convention of trusting whoever takes over —
  // see CLAUDE.md "Administrator succession".
  await setTrust(db, { eventId: event.id, userId: successorId, status: "trusted", setBy: departingUserId });
  // Starts the new administrator's inactivity clock fresh — see
  // CLAUDE.md "Administrator succession".
  await touchParticipantActivity(db, successorId);

  const successorUser = await getUser(db, successorId);
  if (successorUser) {
    const successorParticipant = await getParticipant(db, successorId);
    if (successorParticipant) {
      await api.sendMessage(successorParticipant.chatId, t(successorUser.language, "leave.autoPromoted", { name: event.name }));
    }
  }

  return { kind: "promoted", successorId, successorUsername: successorUser?.username ?? null };
}
