import type { Context } from "grammy";
import type { Env } from "../env.js";
import { ensureUser } from "../session.js";
import { t } from "../i18n/index.js";
import { getParticipant } from "../db/participants.js";
import { getEventById } from "../db/events.js";
import { getOwnReport, setResolution } from "../db/passcode.js";
import { getUserByUsername } from "../db/users.js";
import { parsePattern, normalizeValue } from "../domain/pattern.js";
import { broadcastPasscodeUpdate } from "../services/broadcast.js";

export async function handleResolve(ctx: Context, env: Env): Promise<void> {
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

  const parts = String(ctx.match ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length !== 2) {
    await ctx.reply(t(user.language, "resolve.usage"));
    return;
  }

  const position = Number(parts[0]);
  const slots = parsePattern(event.pattern);
  if (!Number.isInteger(position) || position < 1 || position > slots.length) {
    await ctx.reply(t(user.language, "common.invalidPosition", { max: slots.length }));
    return;
  }

  const arg = parts[1]!;
  let value: string;
  if (arg.startsWith("@")) {
    const target = await getUserByUsername(env.DB, arg);
    if (!target) {
      await ctx.reply(t(user.language, "common.userNotFound"));
      return;
    }
    const report = await getOwnReport(env.DB, event.id, position, target.userId);
    if (!report) {
      await ctx.reply(t(user.language, "resolve.userNoReport", { position }));
      return;
    }
    value = report.value;
  } else {
    value = normalizeValue(arg);
  }

  await setResolution(env.DB, { eventId: event.id, position, value, resolvedBy: user.userId });
  await broadcastPasscodeUpdate(ctx.api, env.DB, event);
  await ctx.reply(t(user.language, "resolve.done", { position, value }));
}
