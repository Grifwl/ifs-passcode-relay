import type { Context } from "grammy";
import type { Env } from "../env.js";
import type { SupportedLanguage } from "../i18n/index.js";
import { ensureUser } from "../session.js";
import { t } from "../i18n/index.js";
import { getParticipant, listParticipants } from "../db/participants.js";
import { getEventById, closeEvent } from "../db/events.js";
import { getCandidates, getResolutions, getEventTrustMap } from "../db/passcode.js";
import { getUser } from "../db/users.js";
import { parsePattern } from "../domain/pattern.js";
import { buildSlotStates, buildCombinations, getUnresolvedPositions } from "../domain/passcode.js";
import { escapeHtml } from "../domain/html.js";
import type { IfsEvent } from "../domain/types.js";

export const CLOSEEVENT_CALLBACK_PREFIX = "closeevent:";

/**
 * Shared core of `/closeevent`, used both by the command itself and by
 * the "close event" button `/resolve`'s walkthrough offers once every
 * position is unambiguous. Blocks (via `reply`) if that's not actually
 * the case anymore — state may have shifted between the button being
 * shown and tapped.
 */
async function closeEventCore(
  ctx: Context,
  env: Env,
  lang: SupportedLanguage,
  event: IfsEvent,
  reply: (text: string) => Promise<unknown>
): Promise<void> {
  const slots = parsePattern(event.pattern);
  const [resolutions, candidates] = await Promise.all([getResolutions(env.DB, event.id), getCandidates(env.DB, event.id)]);
  const slotStates = buildSlotStates(slots, resolutions, candidates);

  const unresolved = getUnresolvedPositions(slotStates);
  if (unresolved.length > 0) {
    await reply(t(lang, "closeevent.unresolved", { positions: unresolved.join(", ") }));
    return;
  }

  const result = buildCombinations(slotStates);
  const finalCode = result.combinations[0]!.code;

  await closeEvent(env.DB, event.id);

  const [participants, trustMap] = await Promise.all([
    listParticipants(env.DB, event.id),
    getEventTrustMap(env.DB, event.id),
  ]);
  for (const p of participants) {
    if (trustMap.get(p.userId) === "troll") continue;
    const participantUser = await getUser(env.DB, p.userId);
    const participantLang = participantUser?.language ?? "en";
    const text = `${escapeHtml(t(participantLang, "closeevent.finalMessage", { name: event.name }))}\n<code>${escapeHtml(finalCode)}</code>`;
    await ctx.api.sendMessage(p.chatId, text, { parse_mode: "HTML" });
  }

  await reply(t(lang, "closeevent.done"));
}

export async function handleCloseEvent(ctx: Context, env: Env): Promise<void> {
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

  await closeEventCore(ctx, env, user.language, event, (text) => ctx.reply(text));
}

/** Handles a tap on the "close event" button attached to `/resolve`'s no-more-conflicts message. */
export async function handleCloseEventCallback(ctx: Context, env: Env): Promise<void> {
  const data = ctx.callbackQuery?.data ?? "";
  const match = /^closeevent:(\d+)$/.exec(data);
  if (!match) {
    await ctx.answerCallbackQuery();
    return;
  }
  const eventId = Number(match[1]!);

  const user = await ensureUser(env.DB, ctx.from!.id, ctx.from!.language_code, ctx.from!.username);
  const event = await getEventById(env.DB, eventId);
  if (!event) {
    await ctx.answerCallbackQuery();
    return;
  }
  if (event.createdBy !== user.userId) {
    await ctx.answerCallbackQuery({ text: t(user.language, "common.notCreator"), show_alert: true });
    return;
  }

  await closeEventCore(ctx, env, user.language, event, (text) => ctx.editMessageText(text));
  await ctx.answerCallbackQuery();
}
