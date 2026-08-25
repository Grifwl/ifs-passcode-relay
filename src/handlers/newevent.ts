import type { Context } from "grammy";
import type { Env } from "../env.js";
import { ensureUser } from "../session.js";
import { t } from "../i18n/index.js";
import { createEvent } from "../db/events.js";
import { DEFAULT_PATTERN, isValidPattern } from "../domain/pattern.js";
import { getParticipant, joinEvent } from "../db/participants.js";
import { deliverStatus } from "../services/broadcast.js";

export async function handleNewEvent(ctx: Context, env: Env): Promise<void> {
  const user = await ensureUser(env.DB, ctx.from!.id, ctx.from!.language_code, ctx.from!.username);
  const raw = String(ctx.match ?? "").trim();

  if (!raw) {
    await ctx.reply(t(user.language, "newevent.usage", { defaultPattern: DEFAULT_PATTERN }));
    return;
  }

  const parts = raw.split("|");
  const name = (parts[0] ?? "").trim();
  const patternArg = parts[1]?.trim();
  const pattern = patternArg ? patternArg.toUpperCase() : DEFAULT_PATTERN;

  if (!name) {
    await ctx.reply(t(user.language, "newevent.usage", { defaultPattern: DEFAULT_PATTERN }));
    return;
  }
  if (!isValidPattern(pattern)) {
    await ctx.reply(t(user.language, "newevent.invalidPattern"));
    return;
  }

  const event = await createEvent(env.DB, { name, pattern, createdBy: user.userId });

  // The creator is also a participant from the moment the event exists —
  // being the organizer doesn't exempt them from hunting portals, and
  // joinEvent already handles replacing any prior membership.
  await joinEvent(env.DB, { userId: user.userId, eventId: event.id, chatId: ctx.chat!.id });
  await ctx.reply(
    t(user.language, "newevent.created", { name: event.name, code: event.code, pattern: event.pattern })
  );

  const participant = await getParticipant(env.DB, user.userId);
  if (participant) await deliverStatus(ctx.api, env.DB, event, participant, user.language);
}
