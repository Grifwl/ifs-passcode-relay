import type { Context } from "grammy";
import type { Env } from "../env.js";
import { ensureUser } from "../session.js";
import { t } from "../i18n/index.js";
import { getParticipant } from "../db/participants.js";
import { getEventById } from "../db/events.js";

export async function handleMyEvent(ctx: Context, env: Env): Promise<void> {
  const user = await ensureUser(env.DB, ctx.from!.id, ctx.from!.language_code);
  const participant = await getParticipant(env.DB, user.userId);
  const event = participant ? await getEventById(env.DB, participant.eventId) : null;

  if (!event) {
    await ctx.reply(t(user.language, "myevent.notInEvent"));
    return;
  }

  await ctx.reply(t(user.language, "myevent.info", { name: event.name, code: event.code, pattern: event.pattern }));
}
