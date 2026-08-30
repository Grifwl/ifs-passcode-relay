import type { Context } from "grammy";
import { InlineKeyboard } from "grammy";
import type { Env } from "../env.js";
import { ensureUser } from "../session.js";
import { t, type SupportedLanguage } from "../i18n/index.js";
import { createEvent, getEventById } from "../db/events.js";
import { DEFAULT_PATTERN, isValidPattern } from "../domain/pattern.js";
import { getParticipant, joinEvent } from "../db/participants.js";
import { setTrust } from "../db/passcode.js";
import { deliverStatus } from "../services/broadcast.js";
import { runSuccession } from "../services/succession.js";
import { getPendingNewEvent, setPendingNewEvent, clearPendingNewEvent } from "../db/pendingNewEvents.js";
import { sendShareText } from "./sharetext.js";

const CALLBACK_CONFIRM = "newevent:confirm";
const CALLBACK_CANCEL = "newevent:cancel";

/**
 * Creates `name`/`pattern`'s event and finishes onboarding its creator:
 * reply, share text, succession on any event they left behind if it was
 * still active and they administered it (see services/succession.ts,
 * a no-op otherwise), auto-join, trust, live status. Shared by the
 * direct path below (nothing active to leave) and the confirmed-callback
 * path (the caller just agreed to leave an active one).
 */
async function createAndOnboard(
  ctx: Context,
  env: Env,
  lang: SupportedLanguage,
  userId: number,
  chatId: number,
  name: string,
  pattern: string
): Promise<void> {
  const event = await createEvent(env.DB, { name, pattern, adminUserId: userId });

  await ctx.reply(t(lang, "newevent.created", { name: event.name, code: event.code, pattern: event.pattern }));

  // Sent before the auto-join below, while the creator isn't a
  // participant yet — same as anyone else sharing an event they haven't
  // joined, the code is passed explicitly (see renderShareText). Reuses
  // handleShareText's own sendShareText, so the two commands stay in
  // sync by construction (see CLAUDE.md "Event creation is special").
  await sendShareText(ctx, lang, event);

  // joinEvent (below) replaces any prior membership outright — but if
  // the creator administered that previous event, silently dropping
  // them would leave it "orphaned": still active, with an admin_user_id
  // pointing at someone no longer participating. By the time we get
  // here, either there was nothing active to leave, or the caller just
  // confirmed leaving one — either way this must go through the same
  // succession /leave uses (a no-op if the previous event wasn't active
  // or wasn't theirs to administer) — see CLAUDE.md "Succession on
  // leaving an event".
  const previousParticipant = await getParticipant(env.DB, userId);
  if (previousParticipant) {
    const previousEvent = await getEventById(env.DB, previousParticipant.eventId);
    if (previousEvent) {
      const outcome = await runSuccession(env.DB, ctx.api, previousEvent, userId);
      if (outcome.kind === "closedAbandoned") {
        await ctx.reply(t(lang, "leave.closedAbandoned", { name: previousEvent.name }));
      } else if (outcome.kind === "promoted") {
        const successorName = outcome.successorUsername
          ? `@${outcome.successorUsername}`
          : t(lang, "leave.anotherParticipant");
        await ctx.reply(t(lang, "leave.leftPromoted", { name: previousEvent.name, successor: successorName }));
      }
    }
  }

  // The creator is also a participant from the moment the event exists —
  // being the organizer doesn't exempt them from hunting portals, and
  // joinEvent already handles replacing any prior membership.
  await joinEvent(env.DB, { userId, eventId: event.id, chatId });

  // The event's creator — now also its administrator — starts out
  // trusted for their own event, as if they'd run /trust on themselves —
  // they're the one everyone else already trusts enough to organize the
  // event in the first place.
  await setTrust(env.DB, { eventId: event.id, userId, status: "trusted", setBy: userId });

  const participant = await getParticipant(env.DB, userId);
  if (participant) await deliverStatus(ctx.api, env.DB, event, participant, lang);
}

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

  const currentParticipant = await getParticipant(env.DB, user.userId);
  const currentEvent = currentParticipant ? await getEventById(env.DB, currentParticipant.eventId) : null;

  // Only ask before creating when leaving an event that's still
  // unresolved (active) — regardless of whether the caller administers
  // it or not (see CLAUDE.md "Succession on leaving an event"). No
  // current event, or one that's already closed, means there's nothing
  // meaningful to preserve by asking first — same rule /join uses.
  if (currentEvent?.status === "active") {
    await setPendingNewEvent(env.DB, { userId: user.userId, name, pattern });
    const keyboard = new InlineKeyboard()
      .text(t(user.language, "newevent.confirmYesButton"), CALLBACK_CONFIRM)
      .text(t(user.language, "newevent.confirmNoButton"), CALLBACK_CANCEL);
    await ctx.reply(t(user.language, "newevent.confirmLeaveUnresolved", { currentEventName: currentEvent.name }), {
      reply_markup: keyboard,
    });
    return;
  }

  await createAndOnboard(ctx, env, user.language, user.userId, ctx.chat!.id, name, pattern);
}

export async function handleNewEventCallback(ctx: Context, env: Env): Promise<void> {
  const data = ctx.callbackQuery?.data ?? "";
  const user = await ensureUser(env.DB, ctx.from!.id, ctx.from!.language_code, ctx.from!.username);

  if (data === CALLBACK_CANCEL) {
    await clearPendingNewEvent(env.DB, user.userId);
    await ctx.answerCallbackQuery();
    await ctx.editMessageText(t(user.language, "newevent.cancelled"));
    return;
  }

  if (data !== CALLBACK_CONFIRM) {
    await ctx.answerCallbackQuery();
    return;
  }

  const pending = await getPendingNewEvent(env.DB, user.userId);
  if (!pending) {
    await ctx.answerCallbackQuery();
    await ctx.editMessageText(t(user.language, "newevent.expired"));
    return;
  }

  await clearPendingNewEvent(env.DB, user.userId);
  await ctx.answerCallbackQuery();
  await ctx.editMessageText(t(user.language, "newevent.confirmed"));
  await createAndOnboard(ctx, env, user.language, user.userId, ctx.chat!.id, pending.name, pending.pattern);
}
