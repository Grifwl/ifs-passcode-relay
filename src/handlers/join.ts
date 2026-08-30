import type { Context } from "grammy";
import { InlineKeyboard } from "grammy";
import type { Env } from "../env.js";
import { ensureUser } from "../session.js";
import { t, type SupportedLanguage } from "../i18n/index.js";
import { getEventByCode, getEventById, reviveAbandonedEvent } from "../db/events.js";
import { getParticipant, joinEvent } from "../db/participants.js";
import { setTrust } from "../db/passcode.js";
import { deliverStatus } from "../services/broadcast.js";
import { runSuccession } from "../services/succession.js";
import type { IfsEvent } from "../domain/types.js";

const CALLBACK_CANCEL = "join:cancel";
const CALLBACK_CONFIRM_PREFIX = "join:confirm:";

/**
 * Whether `event` is eligible for revival by the next `/join`: closed
 * specifically because its administrator departed with nobody eligible
 * to take over (see services/succession.ts), never a `completed` one —
 * that closure follows a store-confirmed `/verify` and is deliberate
 * and final, so it never reopens.
 */
function isRevivable(event: IfsEvent): boolean {
  return event.status === "closed" && event.closedReason === "abandoned";
}

/**
 * If the caller currently belongs to a different event, running this
 * join/switch means departing it — the same kind of departure `/leave`
 * handles, so it must go through the same succession, or the old event
 * would be left "orphaned" (still `active`, administered by someone no
 * longer participating in it). No-op if the caller has no current
 * event, or isn't that event's administrator (see runSuccession).
 */
async function departCurrentEventIfAdmin(ctx: Context, env: Env, lang: SupportedLanguage, userId: number): Promise<void> {
  const current = await getParticipant(env.DB, userId);
  if (!current) return;

  const currentEvent = await getEventById(env.DB, current.eventId);
  if (!currentEvent) return;

  const outcome = await runSuccession(env.DB, ctx.api, currentEvent, userId);
  if (outcome.kind === "closedAbandoned") {
    await ctx.reply(t(lang, "leave.closedAbandoned", { name: currentEvent.name }));
  } else if (outcome.kind === "promoted") {
    const successorName = outcome.successorUsername ? `@${outcome.successorUsername}` : t(lang, "leave.anotherParticipant");
    await ctx.reply(t(lang, "leave.leftPromoted", { name: currentEvent.name, successor: successorName }));
  }
}

/**
 * Joins `userId` to `event`, reviving it under them first if it's an
 * abandoned one (see CLAUDE.md "Reviving an abandoned event" and
 * `isRevivable` above), then reports the outcome and delivers the live
 * status message either way. `switching` only affects which non-revival
 * message is used ("switched" vs "joined") — reviving always reports
 * the same way regardless of whether the caller came from another event.
 */
async function finalizeJoin(
  ctx: Context,
  env: Env,
  lang: SupportedLanguage,
  userId: number,
  chatId: number,
  event: IfsEvent,
  switching: boolean,
  reply: (text: string) => Promise<unknown>
): Promise<void> {
  const revive = isRevivable(event);

  if (revive) {
    await reviveAbandonedEvent(env.DB, event.id, userId);
    // Mirrors /newevent's own creator and /promote's target — see
    // CLAUDE.md "Administrator succession".
    await setTrust(env.DB, { eventId: event.id, userId, status: "trusted", setBy: userId });
  }

  await joinEvent(env.DB, { userId, eventId: event.id, chatId });

  const messageKey = revive ? "join.revived" : switching ? "join.switched" : "join.joined";
  await reply(t(lang, messageKey, { name: event.name }));
  // A participant who joined via a plain code has no reason to already
  // know /sharetext exists (unlike the creator, who gets it automatically
  // — see handleNewEvent), so nudge them once, right after joining.
  await ctx.reply(t(lang, "join.shareHint"));

  const participant = await getParticipant(env.DB, userId);
  if (participant) await deliverStatus(ctx.api, env.DB, event, participant, lang);
}

export async function handleJoin(ctx: Context, env: Env): Promise<void> {
  const user = await ensureUser(env.DB, ctx.from!.id, ctx.from!.language_code, ctx.from!.username);
  const code = String(ctx.match ?? "").trim().toUpperCase();

  if (!code) {
    await ctx.reply(t(user.language, "join.usage"));
    return;
  }

  const event = await getEventByCode(env.DB, code);
  if (!event) {
    await ctx.reply(t(user.language, "common.eventNotFound"));
    return;
  }

  const revivable = isRevivable(event);
  if (event.status !== "active" && !revivable) {
    await ctx.reply(t(user.language, "common.eventClosed"));
    return;
  }

  const current = await getParticipant(env.DB, user.userId);
  if (current?.eventId === event.id) {
    await ctx.reply(t(user.language, "join.alreadyInThisEvent", { name: event.name }));
    return;
  }

  const currentEvent = current ? await getEventById(env.DB, current.eventId) : null;

  // Only ask before switching when leaving an event that's still
  // unresolved (active) — if the caller has no current event, or theirs
  // is already closed, there's nothing meaningful to preserve by asking
  // first; join straight through instead (see CLAUDE.md "Succession on
  // leaving an event").
  if (currentEvent?.status === "active") {
    const keyboard = new InlineKeyboard()
      .text(t(user.language, "join.confirmYesButton"), `${CALLBACK_CONFIRM_PREFIX}${event.id}`)
      .text(t(user.language, "join.confirmNoButton"), CALLBACK_CANCEL);
    await ctx.reply(
      t(user.language, revivable ? "join.confirmSwitchRevive" : "join.confirmSwitch", {
        currentEventName: currentEvent.name,
        newEventName: event.name,
      }),
      { reply_markup: keyboard }
    );
    return;
  }

  await finalizeJoin(ctx, env, user.language, user.userId, ctx.chat!.id, event, false, (text) => ctx.reply(text));
}

export async function handleJoinCallback(ctx: Context, env: Env): Promise<void> {
  const data = ctx.callbackQuery?.data ?? "";
  const user = await ensureUser(env.DB, ctx.from!.id, ctx.from!.language_code, ctx.from!.username);

  if (data === CALLBACK_CANCEL) {
    const current = await getParticipant(env.DB, user.userId);
    const currentEvent = current ? await getEventById(env.DB, current.eventId) : null;
    await ctx.answerCallbackQuery();
    await ctx.editMessageText(t(user.language, "join.cancelled", { name: currentEvent?.name ?? "?" }));
    return;
  }

  if (!data.startsWith(CALLBACK_CONFIRM_PREFIX)) {
    await ctx.answerCallbackQuery();
    return;
  }

  const eventId = Number(data.slice(CALLBACK_CONFIRM_PREFIX.length));
  const event = Number.isFinite(eventId) ? await getEventById(env.DB, eventId) : null;
  if (!event || (event.status !== "active" && !isRevivable(event))) {
    await ctx.answerCallbackQuery();
    await ctx.editMessageText(t(user.language, "common.eventNotFound"));
    return;
  }

  await departCurrentEventIfAdmin(ctx, env, user.language, user.userId);

  await ctx.answerCallbackQuery();
  await finalizeJoin(ctx, env, user.language, user.userId, ctx.chat!.id, event, true, (text) => ctx.editMessageText(text));
}
