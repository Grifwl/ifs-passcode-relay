import type { Context } from "grammy";
import type { Env } from "../env.js";
import { t } from "../i18n/index.js";
import { getParticipant } from "../db/participants.js";
import { transferAdmin } from "../db/events.js";
import { getUser } from "../db/users.js";
import { setTrust } from "../db/passcode.js";
import { resolveAdminAction } from "./trust.js";

export async function handlePromote(ctx: Context, env: Env): Promise<void> {
  const resolved = await resolveAdminAction(ctx, env, "promote.usage");
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

  await transferAdmin(env.DB, event.id, targetUserId);
  // The new administrator starts out trusted for their own event, the
  // same way /newevent flags its own administrator — mirrors that
  // convention rather than leaving the previous administrator's trust
  // flag untouched, since trust status stays independent of the
  // administrator role otherwise (see CLAUDE.md "Trust & moderation").
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
