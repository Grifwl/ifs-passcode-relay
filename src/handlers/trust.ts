import type { Context } from "grammy";
import type { Env } from "../env.js";
import { ensureUser } from "../session.js";
import { t, type MessageKey } from "../i18n/index.js";
import { getParticipant } from "../db/participants.js";
import { getEventById } from "../db/events.js";
import { getUserByUsername } from "../db/users.js";
import { setTrust, clearTrust } from "../db/passcode.js";
import type { EventTrustStatus } from "../domain/trust.js";
import type { IfsEvent } from "../domain/types.js";

/** Resolves the "creator acting on a participant" preamble shared by /trust, /troll, /untrust and /kick. */
export async function resolveCreatorAction(
  ctx: Context,
  env: Env,
  usageKey: MessageKey
): Promise<{
  event: IfsEvent;
  actingUserId: number;
  targetUserId: number;
  targetName: string;
  lang: Awaited<ReturnType<typeof ensureUser>>["language"];
} | null> {
  const user = await ensureUser(env.DB, ctx.from!.id, ctx.from!.language_code, ctx.from!.username);
  const participant = await getParticipant(env.DB, user.userId);
  const event = participant ? await getEventById(env.DB, participant.eventId) : null;

  if (!event) {
    await ctx.reply(t(user.language, "common.notInEvent"));
    return null;
  }
  if (event.createdBy !== user.userId) {
    await ctx.reply(t(user.language, "common.notCreator"));
    return null;
  }

  const arg = String(ctx.match ?? "").trim();
  if (!arg) {
    await ctx.reply(t(user.language, usageKey));
    return null;
  }

  const target = await getUserByUsername(env.DB, arg);
  if (!target) {
    await ctx.reply(t(user.language, "common.userNotFound"));
    return null;
  }

  return {
    event,
    actingUserId: user.userId,
    targetUserId: target.userId,
    targetName: arg.startsWith("@") ? arg : `@${arg}`,
    lang: user.language,
  };
}

async function applyTrust(ctx: Context, env: Env, status: EventTrustStatus, usageKey: MessageKey, doneKey: MessageKey): Promise<void> {
  const resolved = await resolveCreatorAction(ctx, env, usageKey);
  if (!resolved) return;
  const { event, actingUserId, targetUserId, targetName, lang } = resolved;

  await setTrust(env.DB, { eventId: event.id, userId: targetUserId, status, setBy: actingUserId });
  await ctx.reply(t(lang, doneKey, { name: targetName }));
}

export async function handleTrust(ctx: Context, env: Env): Promise<void> {
  await applyTrust(ctx, env, "trusted", "trust.usage", "trust.done");
}

export async function handleTroll(ctx: Context, env: Env): Promise<void> {
  await applyTrust(ctx, env, "troll", "troll.usage", "troll.done");
}

export async function handleUntrust(ctx: Context, env: Env): Promise<void> {
  const resolved = await resolveCreatorAction(ctx, env, "untrust.usage");
  if (!resolved) return;
  const { event, targetUserId, targetName, lang } = resolved;

  await clearTrust(env.DB, event.id, targetUserId);
  await ctx.reply(t(lang, "untrust.done", { name: targetName }));
}
