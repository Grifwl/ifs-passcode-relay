import type { Context } from "grammy";
import { InlineKeyboard } from "grammy";
import type { Env } from "../env.js";
import { ensureUser } from "../session.js";
import { t } from "../i18n/index.js";
import { getEventByCode, getEventById } from "../db/events.js";
import { getParticipant, joinEvent } from "../db/participants.js";

const CALLBACK_CANCEL = "join:cancel";
const CALLBACK_CONFIRM_PREFIX = "join:confirm:";

export async function handleJoin(ctx: Context, env: Env): Promise<void> {
  const user = await ensureUser(env.DB, ctx.from!.id, ctx.from!.language_code);
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
  if (event.status !== "active") {
    await ctx.reply(t(user.language, "common.eventClosed"));
    return;
  }

  const current = await getParticipant(env.DB, user.userId);
  if (current?.eventId === event.id) {
    await ctx.reply(t(user.language, "join.alreadyInThisEvent", { name: event.name }));
    return;
  }

  if (current) {
    const currentEvent = await getEventById(env.DB, current.eventId);
    const keyboard = new InlineKeyboard()
      .text(t(user.language, "join.confirmYesButton"), `${CALLBACK_CONFIRM_PREFIX}${event.id}`)
      .text(t(user.language, "join.confirmNoButton"), CALLBACK_CANCEL);
    await ctx.reply(
      t(user.language, "join.confirmSwitch", {
        currentEventName: currentEvent?.name ?? "?",
        newEventName: event.name,
      }),
      { reply_markup: keyboard }
    );
    return;
  }

  await joinEvent(env.DB, { userId: user.userId, eventId: event.id, chatId: ctx.chat!.id });
  await ctx.reply(t(user.language, "join.joined", { name: event.name }));
}

export async function handleJoinCallback(ctx: Context, env: Env): Promise<void> {
  const data = ctx.callbackQuery?.data ?? "";
  const user = await ensureUser(env.DB, ctx.from!.id, ctx.from!.language_code);

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
  if (!event || event.status !== "active") {
    await ctx.answerCallbackQuery();
    await ctx.editMessageText(t(user.language, "common.eventNotFound"));
    return;
  }

  await joinEvent(env.DB, { userId: user.userId, eventId: event.id, chatId: ctx.chat!.id });
  await ctx.answerCallbackQuery();
  await ctx.editMessageText(t(user.language, "join.switched", { name: event.name }));
}
