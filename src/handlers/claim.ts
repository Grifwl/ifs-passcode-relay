import type { Context } from "grammy";
import { InlineKeyboard } from "grammy";
import type { Env } from "../env.js";
import { ensureUser } from "../session.js";
import { t } from "../i18n/index.js";
import { getParticipant, touchParticipantActivity } from "../db/participants.js";
import { getEventById, transferAdmin } from "../db/events.js";
import { getTrustStatus, setTrust } from "../db/passcode.js";
import { getUser } from "../db/users.js";
import { getOpenClaim, openClaim, closeClaim, addClaimCandidate, getClaimCandidates, type AdminClaim } from "../db/claims.js";
import { pickSuccessor } from "../domain/succession.js";
import { CLAIM_INACTIVITY_MINUTES, CLAIM_RESOLUTION_MINUTES, isAdminInactiveEnoughToClaim, isClaimResolvable } from "../domain/claim.js";
import { formatDisplayName } from "../domain/displayName.js";
import type { IfsEvent } from "../domain/types.js";

const CALLBACK_PATTERN = /^claimresolve:(accept|keep):(\d+)$/;

/**
 * Resolves an open claim negotiation in favor of the candidate pool
 * (see CLAUDE.md "Administrator succession"), whether triggered by the
 * administrator tapping "Accept" or by the grace period elapsing with
 * no response. Both paths pick the same way and touch the same
 * notification message, so they share this one implementation.
 */
async function resolveClaimWindow(
  ctx: Context,
  env: Env,
  event: IfsEvent,
  claim: AdminClaim,
  reason: "accept" | "timeout"
): Promise<IfsEvent> {
  const candidates = await getClaimCandidates(env.DB, event.id);
  const successorId = pickSuccessor(candidates);
  if (successorId === null) {
    // Defensive only: the negotiation only exists because someone claimed.
    await closeClaim(env.DB, event.id);
    return event;
  }

  const outgoingAdminId = event.adminUserId;
  await transferAdmin(env.DB, event.id, successorId);
  // Mirrors /promote's and /leave succession's own convention — see
  // CLAUDE.md "Administrator succession".
  await setTrust(env.DB, { eventId: event.id, userId: successorId, status: "trusted", setBy: outgoingAdminId });
  // The new administrator's own inactivity clock starts fresh from the
  // handover, so an immediate second claim war can't start against
  // someone who never actually sent anything themselves.
  await touchParticipantActivity(env.DB, successorId);
  await closeClaim(env.DB, event.id);

  const successorUser = await getUser(env.DB, successorId);
  const successorParticipant = await getParticipant(env.DB, successorId);
  if (successorUser && successorParticipant) {
    await ctx.api.sendMessage(successorParticipant.chatId, t(successorUser.language, "claim.becameAdmin", { name: event.name }));
  }

  const outgoingUser = await getUser(env.DB, outgoingAdminId);
  if (outgoingUser) {
    const key = reason === "accept" ? "claim.handedOver" : "claim.handedOverTimeout";
    try {
      await ctx.api.editMessageText(claim.notifyChatId, claim.notifyMessageId, t(outgoingUser.language, key, { name: event.name }));
    } catch {
      // The notification message may already be gone or edited (e.g. a
      // race with "Keep the role") — not fatal, the transfer itself
      // already happened above.
    }
  }

  return (await getEventById(env.DB, event.id))!;
}

export async function handleClaim(ctx: Context, env: Env): Promise<void> {
  const user = await ensureUser(env.DB, ctx.from!.id, ctx.from!.language_code, ctx.from!.username);
  const participant = await getParticipant(env.DB, user.userId);
  if (!participant) {
    await ctx.reply(t(user.language, "common.notInEvent"));
    return;
  }

  let event = await getEventById(env.DB, participant.eventId);
  if (!event || event.status !== "active") {
    await ctx.reply(t(user.language, "common.eventClosed"));
    return;
  }

  if (event.adminUserId === user.userId) {
    await ctx.reply(t(user.language, "claim.cannotSelf"));
    return;
  }

  const trustStatus = await getTrustStatus(env.DB, event.id, user.userId);
  if (trustStatus === "troll") {
    await ctx.reply(t(user.language, "claim.notEligible"));
    return;
  }

  let pending = await getOpenClaim(env.DB, event.id);
  if (pending && isClaimResolvable(pending.initiatedAt)) {
    event = await resolveClaimWindow(ctx, env, event, pending, "timeout");
    pending = null;
    if (event.adminUserId === user.userId) {
      await ctx.reply(t(user.language, "claim.cannotSelf"));
      return;
    }
  }

  if (pending) {
    const added = await addClaimCandidate(env.DB, event.id, user.userId);
    await ctx.reply(t(user.language, added ? "claim.joinedQueue" : "claim.alreadyQueued"));
    return;
  }

  const adminParticipant = await getParticipant(env.DB, event.adminUserId);
  if (!adminParticipant || !isAdminInactiveEnoughToClaim(adminParticipant.lastActiveAt)) {
    await ctx.reply(t(user.language, "claim.adminRecentlyActive", { minutes: CLAIM_INACTIVITY_MINUTES }));
    return;
  }

  const adminUser = await getUser(env.DB, event.adminUserId);
  const adminLang = adminUser?.language ?? "en";
  const claimantName = formatDisplayName(user.username, ctx.from!.first_name);

  const keyboard = new InlineKeyboard()
    .text(t(adminLang, "claim.keepButton"), `claimresolve:keep:${event.id}`)
    .text(t(adminLang, "claim.acceptButton"), `claimresolve:accept:${event.id}`);
  const sent = await ctx.api.sendMessage(
    adminParticipant.chatId,
    t(adminLang, "claim.notifyAdmin", { claimant: claimantName, name: event.name }),
    { reply_markup: keyboard }
  );

  await openClaim(env.DB, { eventId: event.id, notifyChatId: adminParticipant.chatId, notifyMessageId: sent.message_id });
  await addClaimCandidate(env.DB, event.id, user.userId);

  await ctx.reply(t(user.language, "claim.opened", { minutes: CLAIM_RESOLUTION_MINUTES }));
}

export async function handleClaimCallback(ctx: Context, env: Env): Promise<void> {
  const data = ctx.callbackQuery?.data ?? "";
  const match = CALLBACK_PATTERN.exec(data);
  if (!match) {
    await ctx.answerCallbackQuery();
    return;
  }
  const action = match[1] as "accept" | "keep";
  const eventId = Number(match[2]!);

  const user = await ensureUser(env.DB, ctx.from!.id, ctx.from!.language_code, ctx.from!.username);
  const event = await getEventById(env.DB, eventId);
  if (!event || event.status !== "active") {
    await ctx.answerCallbackQuery();
    await ctx.editMessageText(t(user.language, "common.eventClosed"));
    return;
  }
  if (event.adminUserId !== user.userId) {
    await ctx.answerCallbackQuery({ text: t(user.language, "common.notAdmin"), show_alert: true });
    return;
  }

  const claim = await getOpenClaim(env.DB, eventId);
  if (!claim) {
    await ctx.answerCallbackQuery();
    await ctx.editMessageText(t(user.language, "claim.alreadyResolved"));
    return;
  }

  await ctx.answerCallbackQuery();

  if (action === "keep") {
    await closeClaim(env.DB, eventId);
    await ctx.editMessageText(t(user.language, "claim.kept", { name: event.name }));
    return;
  }

  await resolveClaimWindow(ctx, env, event, claim, "accept");
}
