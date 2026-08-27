import type { Context } from "grammy";
import type { Env } from "../env.js";
import { t } from "../i18n/index.js";
import { getParticipant } from "../db/participants.js";
import { transferCreator } from "../db/events.js";
import { getUser } from "../db/users.js";
import { setTrust } from "../db/passcode.js";
import { resolveCreatorAction } from "./trust.js";

export async function handlePromote(ctx: Context, env: Env): Promise<void> {
  const resolved = await resolveCreatorAction(ctx, env, "promote.usage");
  if (!resolved) return;
  const { event, actingUserId, targetUserId, targetName, lang } = resolved;

  if (targetUserId === actingUserId) {
    await ctx.reply(t(lang, "promote.cannotSelf"));
    return;
  }

  const targetParticipant = await getParticipant(env.DB, targetUserId);
  if (!targetParticipant || targetParticipant.eventId !== event.id) {
    await ctx.reply(t(lang, "promote.notParticipant", { name: targetName }));
    return;
  }

  await transferCreator(env.DB, event.id, targetUserId);
  // The new creator starts out trusted for their own event, the same
  // way /newevent flags its creator — mirrors that convention rather
  // than leaving the previous creator's trust flag untouched, since
  // trust status stays independent of the creator role otherwise (see
  // CLAUDE.md "Trust & moderation").
  await setTrust(env.DB, { eventId: event.id, userId: targetUserId, status: "trusted", setBy: actingUserId });

  await ctx.reply(t(lang, "promote.done", { name: targetName }));

  const targetUser = await getUser(env.DB, targetUserId);
  if (targetUser) {
    await ctx.api.sendMessage(
      targetParticipant.chatId,
      t(targetUser.language, "promote.youAreNow", { name: event.name })
    );
  }
}
