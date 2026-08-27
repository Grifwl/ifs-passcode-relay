import type { Context } from "grammy";
import type { Env } from "../env.js";
import { ensureUser } from "../session.js";
import { t, type SupportedLanguage } from "../i18n/index.js";
import { getParticipant, removeParticipant, touchParticipantActivity } from "../db/participants.js";
import { getEventById, transferAdmin, closeEvent } from "../db/events.js";
import { getSuccessionCandidates, setTrust } from "../db/passcode.js";
import { getUser } from "../db/users.js";
import { pickSuccessor } from "../domain/succession.js";
import type { IfsEvent } from "../domain/types.js";

/**
 * Handles the departing administrator's `/leave` on a still-active
 * event: see CLAUDE.md "Administrator succession" for the selection
 * rule. Removing the departing administrator's own participant row is
 * left to the caller, same as the plain-participant path below.
 */
async function handleAdminLeave(ctx: Context, env: Env, lang: SupportedLanguage, event: IfsEvent): Promise<void> {
  const candidates = await getSuccessionCandidates(env.DB, event.id, event.adminUserId);
  await removeParticipant(env.DB, event.adminUserId);

  const successorId = pickSuccessor(candidates);
  if (successorId === null) {
    await closeEvent(env.DB, event.id, "abandoned");
    await ctx.reply(t(lang, "leave.closedAbandoned", { name: event.name }));
    return;
  }

  await transferAdmin(env.DB, event.id, successorId);
  // Mirrors /promote's own convention of trusting whoever takes over —
  // see CLAUDE.md "Administrator succession".
  await setTrust(env.DB, { eventId: event.id, userId: successorId, status: "trusted", setBy: event.adminUserId });
  // Starts the new administrator's inactivity clock fresh — see
  // CLAUDE.md "Administrator succession".
  await touchParticipantActivity(env.DB, successorId);

  const successorUser = await getUser(env.DB, successorId);
  const successorName = successorUser?.username ? `@${successorUser.username}` : t(lang, "leave.anotherParticipant");
  await ctx.reply(t(lang, "leave.leftPromoted", { name: event.name, successor: successorName }));

  const successorParticipant = await getParticipant(env.DB, successorId);
  if (successorParticipant && successorUser) {
    await ctx.api.sendMessage(successorParticipant.chatId, t(successorUser.language, "leave.autoPromoted", { name: event.name }));
  }
}

export async function handleLeave(ctx: Context, env: Env): Promise<void> {
  const user = await ensureUser(env.DB, ctx.from!.id, ctx.from!.language_code, ctx.from!.username);
  const participant = await getParticipant(env.DB, user.userId);

  if (!participant) {
    await ctx.reply(t(user.language, "leave.notInEvent"));
    return;
  }

  const event = await getEventById(env.DB, participant.eventId);
  if (event && event.status === "active" && event.adminUserId === user.userId) {
    await handleAdminLeave(ctx, env, user.language, event);
    return;
  }

  await removeParticipant(env.DB, user.userId);
  await ctx.reply(t(user.language, "leave.left", { name: event?.name ?? "?" }));
}
