import type { Context } from "grammy";
import type { Env } from "../env.js";
import { ensureUser } from "../session.js";
import { t, type MessageKey } from "../i18n/index.js";
import { getParticipant } from "../db/participants.js";
import { getEventById } from "../db/events.js";
import { getUserByUsername, getUser } from "../db/users.js";
import { setTrust, clearTrust, getTrustStatus } from "../db/passcode.js";
import { deliverStatus } from "../services/broadcast.js";
import type { EventTrustStatus } from "../domain/trust.js";
import type { IfsEvent } from "../domain/types.js";

/** Resolves the "administrator acting on a participant" preamble shared by /trust, /troll, /untrust, /kick and /promote. */
export async function resolveAdminAction(
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
  if (event.adminUserId !== user.userId) {
    await ctx.reply(t(user.language, "common.notAdmin"));
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
  const resolved = await resolveAdminAction(ctx, env, usageKey);
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
  const resolved = await resolveAdminAction(ctx, env, "untrust.usage");
  if (!resolved) return;
  const { event, targetUserId, targetName, lang } = resolved;

  const wasTroll = (await getTrustStatus(env.DB, event.id, targetUserId)) === "troll";
  await clearTrust(env.DB, event.id, targetUserId);
  await ctx.reply(t(lang, "untrust.done", { name: targetName }));

  // A troll's status message was frozen the whole time they were
  // flagged (see CLAUDE.md "Live updates"), so without this they'd only
  // start seeing changes from here on, not everything they missed.
  // /untrust catches them up once, immediately, with a single refresh
  // to the current state — it doesn't replay each missed update.
  if (wasTroll) {
    const targetParticipant = await getParticipant(env.DB, targetUserId);
    if (targetParticipant && targetParticipant.eventId === event.id) {
      const targetUser = await getUser(env.DB, targetUserId);
      await deliverStatus(ctx.api, env.DB, event, targetParticipant, targetUser?.language ?? "en");
    }
  }
}
