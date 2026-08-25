import type { Context } from "grammy";
import type { Env } from "../env.js";
import { ensureUser } from "../session.js";
import { t } from "../i18n/index.js";
import { getParticipant, removeParticipant } from "../db/participants.js";
import { getEventById } from "../db/events.js";

export async function handleLeave(ctx: Context, env: Env): Promise<void> {
  const user = await ensureUser(env.DB, ctx.from!.id, ctx.from!.language_code, ctx.from!.username);
  const participant = await getParticipant(env.DB, user.userId);

  if (!participant) {
    await ctx.reply(t(user.language, "leave.notInEvent"));
    return;
  }

  const event = await getEventById(env.DB, participant.eventId);
  await removeParticipant(env.DB, user.userId);
  await ctx.reply(t(user.language, "leave.left", { name: event?.name ?? "?" }));
}
