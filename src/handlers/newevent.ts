import type { Context } from "grammy";
import type { Env } from "../env.js";
import { ensureUser } from "../session.js";
import { t } from "../i18n/index.js";
import { createEvent } from "../db/events.js";
import { DEFAULT_PATTERN, isValidPattern } from "../domain/pattern.js";
import { getParticipant, joinEvent } from "../db/participants.js";
import { setTrust } from "../db/passcode.js";
import { deliverStatus } from "../services/broadcast.js";
import { sendShareText } from "./sharetext.js";

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

  const event = await createEvent(env.DB, { name, pattern, adminUserId: user.userId });

  await ctx.reply(
    t(user.language, "newevent.created", { name: event.name, code: event.code, pattern: event.pattern })
  );

  // Sent before the auto-join below, while the creator isn't a
  // participant yet — same as anyone else sharing an event they haven't
  // joined, the code is passed explicitly (see renderShareText). Reuses
  // handleShareText's own sendShareText, so the two commands stay in
  // sync by construction (see CLAUDE.md "Event creation is special").
  await sendShareText(ctx, user.language, event);

  // The creator is also a participant from the moment the event exists —
  // being the organizer doesn't exempt them from hunting portals, and
  // joinEvent already handles replacing any prior membership.
  await joinEvent(env.DB, { userId: user.userId, eventId: event.id, chatId: ctx.chat!.id });

  // The event's creator — now also its administrator — starts out
  // trusted for their own event, as if they'd run /trust on themselves —
  // they're the one everyone else already trusts enough to organize the
  // event in the first place.
  await setTrust(env.DB, { eventId: event.id, userId: user.userId, status: "trusted", setBy: user.userId });

  const participant = await getParticipant(env.DB, user.userId);
  if (participant) await deliverStatus(ctx.api, env.DB, event, participant, user.language);
}
