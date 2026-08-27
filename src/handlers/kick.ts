import type { Context } from "grammy";
import type { Env } from "../env.js";
import { t } from "../i18n/index.js";
import { getParticipant, removeParticipant } from "../db/participants.js";
import { resolveAdminAction } from "./trust.js";

export async function handleKick(ctx: Context, env: Env): Promise<void> {
  const resolved = await resolveAdminAction(ctx, env, "kick.usage");
  if (!resolved) return;
  const { event, targetUserId, targetName, lang } = resolved;

  const targetParticipant = await getParticipant(env.DB, targetUserId);
  if (!targetParticipant || targetParticipant.eventId !== event.id) {
    await ctx.reply(t(lang, "kick.notInEvent", { name: targetName }));
    return;
  }

  await removeParticipant(env.DB, targetUserId);
  await ctx.reply(t(lang, "kick.done", { name: targetName }));
}
