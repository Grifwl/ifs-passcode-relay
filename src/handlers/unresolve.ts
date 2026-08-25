import type { Context } from "grammy";
import type { Env } from "../env.js";
import { ensureUser } from "../session.js";
import { t } from "../i18n/index.js";
import { getParticipant } from "../db/participants.js";
import { getEventById } from "../db/events.js";
import { getResolutions, clearResolution } from "../db/passcode.js";
import { parsePattern } from "../domain/pattern.js";
import { broadcastPasscodeUpdate } from "../services/broadcast.js";

export async function handleUnresolve(ctx: Context, env: Env): Promise<void> {
  const user = await ensureUser(env.DB, ctx.from!.id, ctx.from!.language_code, ctx.from!.username);
  const participant = await getParticipant(env.DB, user.userId);
  const event = participant ? await getEventById(env.DB, participant.eventId) : null;

  if (!event) {
    await ctx.reply(t(user.language, "common.notInEvent"));
    return;
  }
  if (event.createdBy !== user.userId) {
    await ctx.reply(t(user.language, "common.notCreator"));
    return;
  }

  const arg = String(ctx.match ?? "").trim();
  const position = Number(arg);
  const slots = parsePattern(event.pattern);
  if (!arg || !Number.isInteger(position) || position < 1 || position > slots.length) {
    await ctx.reply(t(user.language, "unresolve.usage"));
    return;
  }

  const resolutions = await getResolutions(env.DB, event.id);
  if (!resolutions.some((r) => r.position === position)) {
    await ctx.reply(t(user.language, "unresolve.notResolved", { position }));
    return;
  }

  await clearResolution(env.DB, event.id, position);
  await broadcastPasscodeUpdate(ctx.api, env.DB, event);
  await ctx.reply(t(user.language, "unresolve.done", { position }));
}
