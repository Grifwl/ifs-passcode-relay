import type { Context } from "grammy";
import type { Env } from "../env.js";
import { ensureUser } from "../session.js";
import { t, type SupportedLanguage } from "../i18n/index.js";
import { getParticipant, removeParticipant } from "../db/participants.js";
import { getEventById, transferCreator, closeEvent } from "../db/events.js";
import { getSuccessionCandidates, setTrust } from "../db/passcode.js";
import { getUser } from "../db/users.js";
import { pickSuccessor } from "../domain/succession.js";
import type { IfsEvent } from "../domain/types.js";

/**
 * Handles the departing creator's `/leave` on a still-active event: see
 * CLAUDE.md "Creator succession" for the selection rule. Removing the
 * creator's own participant row is left to the caller, same as the
 * plain-participant path below.
 */
async function handleCreatorLeave(ctx: Context, env: Env, lang: SupportedLanguage, event: IfsEvent): Promise<void> {
  const candidates = await getSuccessionCandidates(env.DB, event.id, event.createdBy);
  await removeParticipant(env.DB, event.createdBy);

  const successorId = pickSuccessor(candidates);
  if (successorId === null) {
    await closeEvent(env.DB, event.id, "abandoned");
    await ctx.reply(t(lang, "leave.closedAbandoned", { name: event.name }));
    return;
  }

  await transferCreator(env.DB, event.id, successorId);
  // Mirrors /promote's own convention of trusting whoever takes over —
  // see CLAUDE.md "Creator succession".
  await setTrust(env.DB, { eventId: event.id, userId: successorId, status: "trusted", setBy: event.createdBy });

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
  if (event && event.status === "active" && event.createdBy === user.userId) {
    await handleCreatorLeave(ctx, env, user.language, event);
    return;
  }

  await removeParticipant(env.DB, user.userId);
  await ctx.reply(t(user.language, "leave.left", { name: event?.name ?? "?" }));
}
