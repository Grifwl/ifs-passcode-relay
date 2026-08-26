import type { Context } from "grammy";
import { InlineKeyboard } from "grammy";
import type { Env } from "../env.js";
import type { SupportedLanguage } from "../i18n/index.js";
import { ensureUser } from "../session.js";
import { t } from "../i18n/index.js";
import { getParticipant } from "../db/participants.js";
import { getEventById } from "../db/events.js";
import { getCandidates, getCandidatesAtPosition, getOwnReport, getResolutions, setResolution } from "../db/passcode.js";
import { getUserByUsername } from "../db/users.js";
import { parsePattern, normalizeValue } from "../domain/pattern.js";
import { buildSlotStates, getConflictingPositions, getUnresolvedPositions } from "../domain/passcode.js";
import { broadcastPasscodeUpdate } from "../services/broadcast.js";
import { CLOSEEVENT_CALLBACK_PREFIX } from "./closeevent.js";
import type { CandidateRow } from "../db/passcode.js";
import type { IfsEvent } from "../domain/types.js";

const CALLBACK_PREFIX = "resolve:";
const CALLBACK_ALL_PREFIX = "resolveall:";

interface RenderOptions {
  /** Which callback prefix the buttons use — plain "resolve:" for a one-off lookup, "resolveall:" to keep the walkthrough going after a tap. */
  callbackPrefix: string;
  /** When set, the header reports this as "N positions still in disagreement" instead of just naming the position (used by the walkthrough). */
  conflictCount?: number;
}

/** Builds the candidate-listing message + one button per candidate, most-supported first (left to right). */
function renderCandidates(
  lang: SupportedLanguage,
  event: IfsEvent,
  position: number,
  candidates: CandidateRow[],
  opts: RenderOptions
) {
  const sorted = [...candidates].sort((a, b) => b.supporterCount - a.supporterCount || a.value.localeCompare(b.value));

  if (sorted.length === 0) {
    return { text: t(lang, "resolve.noCandidates", { position }), keyboard: undefined };
  }

  const header =
    opts.conflictCount !== undefined
      ? t(lang, "resolve.allHeader", { count: opts.conflictCount, position })
      : t(lang, "resolve.candidatesHeader", { position });

  const hasTrusted = sorted.some((c) => c.trustedCount > 0);
  const lines = [
    header,
    ...sorted.map((c) =>
      t(lang, "resolve.candidateLine", { value: c.value, count: c.supporterCount, trustedCount: c.trustedCount })
    ),
    ...(hasTrusted ? [t(lang, "resolve.trustedLegend")] : []),
    "",
    t(lang, "resolve.candidatesPrompt"),
  ];

  const keyboard = new InlineKeyboard();
  for (const c of sorted) {
    const label = c.trustedCount > 0 ? `${c.value} (${c.supporterCount} · ${c.trustedCount}✓)` : `${c.value} (${c.supporterCount})`;
    keyboard.text(label, `${opts.callbackPrefix}${event.id}:${position}:${c.value}`);
  }

  return { text: lines.join("\n"), keyboard };
}

/**
 * Sends the next step of the `/resolve` walkthrough: the first position
 * still in genuine disagreement (unresolved, more than one live
 * candidate), with resolveall-tagged buttons so resolving it — see
 * `handleResolveCallback` — chains straight into the following one. Once
 * none are left, says so instead. Positions are recomputed fresh from D1
 * on every call rather than tracked in any stored "queue" state, so this
 * naturally stays correct even if new reports come in mid-walkthrough.
 */
async function sendConflictWalkthroughStep(ctx: Context, env: Env, lang: SupportedLanguage, event: IfsEvent): Promise<void> {
  const slots = parsePattern(event.pattern);
  const [resolutions, candidates] = await Promise.all([
    getResolutions(env.DB, event.id),
    getCandidates(env.DB, event.id),
  ]);
  const slotStates = buildSlotStates(slots, resolutions, candidates);
  const conflicting = getConflictingPositions(slotStates);

  if (conflicting.length === 0) {
    const readyToClose = getUnresolvedPositions(slotStates).length === 0;
    const keyboard = readyToClose
      ? new InlineKeyboard().text(t(lang, "resolve.closeEventButton"), `${CLOSEEVENT_CALLBACK_PREFIX}${event.id}`)
      : undefined;
    await ctx.reply(t(lang, "resolve.allDone"), keyboard ? { reply_markup: keyboard } : undefined);
    return;
  }

  const position = conflicting[0]!;
  const positionCandidates = slotStates.find((s) => s.position === position)!.candidates;
  const { text, keyboard } = renderCandidates(lang, event, position, positionCandidates, {
    callbackPrefix: CALLBACK_ALL_PREFIX,
    conflictCount: conflicting.length,
  });
  await ctx.reply(text, keyboard ? { reply_markup: keyboard } : undefined);
}

async function resolveAndReply(
  ctx: Context,
  env: Env,
  lang: SupportedLanguage,
  event: IfsEvent,
  position: number,
  value: string,
  resolvedBy: number,
  reply: (text: string) => Promise<unknown>
): Promise<void> {
  await setResolution(env.DB, { eventId: event.id, position, value, resolvedBy });
  await broadcastPasscodeUpdate(ctx.api, env.DB, event);
  await reply(t(lang, "resolve.done", { position, value }));
}

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
  if (parts.length > 2) {
    await ctx.reply(t(user.language, "resolve.usage"));
    return;
  }

  if (parts.length === 0) {
    await sendConflictWalkthroughStep(ctx, env, user.language, event);
    return;
  }

  const position = Number(parts[0]);
  const slots = parsePattern(event.pattern);
  if (!Number.isInteger(position) || position < 1 || position > slots.length) {
    await ctx.reply(t(user.language, "common.invalidPosition", { max: slots.length }));
    return;
  }

  if (parts.length === 1) {
    const candidates = await getCandidatesAtPosition(env.DB, event.id, position);
    const { text, keyboard } = renderCandidates(user.language, event, position, candidates, {
      callbackPrefix: CALLBACK_PREFIX,
    });
    await ctx.reply(text, keyboard ? { reply_markup: keyboard } : undefined);
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

  await resolveAndReply(ctx, env, user.language, event, position, value, user.userId, (text) => ctx.reply(text));
}

export async function handleResolveCallback(ctx: Context, env: Env): Promise<void> {
  const data = ctx.callbackQuery?.data ?? "";
  const user = await ensureUser(env.DB, ctx.from!.id, ctx.from!.language_code, ctx.from!.username);

  const match = /^(resolve|resolveall):(\d+):(\d+):([A-Za-z0-9]+)$/.exec(data);
  if (!match) {
    await ctx.answerCallbackQuery();
    return;
  }
  const chained = match[1] === "resolveall";
  const eventId = Number(match[2]!);
  const position = Number(match[3]!);
  const value = match[4]!;

  const event = await getEventById(env.DB, eventId);
  if (!event) {
    await ctx.answerCallbackQuery();
    return;
  }
  if (event.createdBy !== user.userId) {
    await ctx.answerCallbackQuery({ text: t(user.language, "common.notCreator"), show_alert: true });
    return;
  }

  await resolveAndReply(ctx, env, user.language, event, position, value, user.userId, (text) =>
    ctx.editMessageText(text)
  );
  await ctx.answerCallbackQuery();

  if (chained) {
    await sendConflictWalkthroughStep(ctx, env, user.language, event);
  }
}
