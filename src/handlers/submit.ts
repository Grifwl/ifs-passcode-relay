import type { Context } from "grammy";
import { InlineKeyboard } from "grammy";
import type { Env } from "../env.js";
import { ensureUser } from "../session.js";
import { t } from "../i18n/index.js";
import { getParticipant } from "../db/participants.js";
import { getEventById } from "../db/events.js";
import {
  getOtherCandidateValues,
  getOwnReport,
  getResolutions,
  deleteOwnReports,
  insertReport,
  recordKnownWord,
} from "../db/passcode.js";
import { parsePattern, valueMatchesSlotType, normalizeValue } from "../domain/pattern.js";
import { parseSubmissionText } from "../domain/submitParser.js";
import { formatDisplayName } from "../domain/displayName.js";
import { broadcastPasscodeUpdate } from "../services/broadcast.js";
import type { IfsEvent } from "../domain/types.js";

const CALLBACK_CANCEL = "submit:cancel";
const CALLBACK_CONFIRM_PREFIX = "submit:confirm:";
const VALUE_PATTERN = /^[A-Za-z0-9]+$/;

async function recordAndBroadcast(
  ctx: Context,
  env: Env,
  event: IfsEvent,
  position: number,
  value: string,
  displayName: string,
  userId: number
): Promise<void> {
  await deleteOwnReports(env.DB, event.id, position, userId);
  await insertReport(env.DB, { eventId: event.id, position, value, userId, displayName });

  const slot = parsePattern(event.pattern)[position - 1]!;
  if (slot.type === "word") await recordKnownWord(env.DB, value, event.id);

  await broadcastPasscodeUpdate(ctx.api, env.DB, event);
}

/** Shared by both the `/submit` command and plain-text "<position> <value>" messages. */
export async function handleSubmit(ctx: Context, env: Env, rawText: string): Promise<void> {
  const user = await ensureUser(env.DB, ctx.from!.id, ctx.from!.language_code, ctx.from!.username);

  const parsed = parseSubmissionText(rawText);
  if (!parsed || !VALUE_PATTERN.test(parsed.value)) {
    await ctx.reply(t(user.language, "submit.usage"));
    return;
  }

  const participant = await getParticipant(env.DB, user.userId);
  if (!participant) {
    await ctx.reply(t(user.language, "common.notInEvent"));
    return;
  }
  const event = await getEventById(env.DB, participant.eventId);
  if (!event || event.status !== "active") {
    await ctx.reply(t(user.language, "common.eventClosed"));
    return;
  }

  const slots = parsePattern(event.pattern);
  if (parsed.position < 1 || parsed.position > slots.length) {
    await ctx.reply(t(user.language, "common.invalidPosition", { max: slots.length }));
    return;
  }

  const value = normalizeValue(parsed.value);
  const displayName = formatDisplayName(user.username, ctx.from!.first_name);

  const resolutions = await getResolutions(env.DB, event.id);
  const resolution = resolutions.find((r) => r.position === parsed.position);
  if (resolution) {
    await insertReport(env.DB, { eventId: event.id, position: parsed.position, value, userId: user.userId, displayName });
    await ctx.reply(t(user.language, "submit.positionResolvedNotice", { position: parsed.position, value: resolution.value }));
    return;
  }

  const own = await getOwnReport(env.DB, event.id, parsed.position, user.userId);
  if (own && own.value === value) {
    await ctx.reply(t(user.language, "submit.alreadyRecorded", { position: parsed.position, value }));
    return;
  }

  const slot = slots[parsed.position - 1]!;
  // A self-correction (own !== null here, since the "identical value"
  // case already returned above) never triggers the conflict check,
  // regardless of what anyone else reported — see CLAUDE.md
  // "Self-correction vs. disagreeing with someone else".
  const othersValues = own ? [] : await getOtherCandidateValues(env.DB, event.id, parsed.position, user.userId);
  const conflict = othersValues.length > 0 && !othersValues.includes(value);
  const typeMismatch = !valueMatchesSlotType(value, slot.type);

  if (conflict || typeMismatch) {
    const messages: string[] = [];
    if (conflict) {
      messages.push(
        t(user.language, "submit.confirmOtherConflict", { position: parsed.position, existing: othersValues.join(", "), value })
      );
    }
    if (typeMismatch) {
      messages.push(
        t(user.language, "submit.confirmTypeMismatch", {
          position: parsed.position,
          expected: t(user.language, `slotType.${slot.type}`),
          value,
        })
      );
    }
    const keyboard = new InlineKeyboard()
      .text(t(user.language, "submit.confirmYesButton"), `${CALLBACK_CONFIRM_PREFIX}${event.id}:${parsed.position}:${value}`)
      .text(t(user.language, "submit.confirmNoButton"), CALLBACK_CANCEL);
    await ctx.reply(messages.join("\n"), { reply_markup: keyboard });
    return;
  }

  await recordAndBroadcast(ctx, env, event, parsed.position, value, displayName, user.userId);
  await ctx.reply(
    t(user.language, own ? "submit.selfCorrected" : "submit.recorded", { position: parsed.position, value })
  );
}

export async function handleSubmitCallback(ctx: Context, env: Env): Promise<void> {
  const data = ctx.callbackQuery?.data ?? "";
  const user = await ensureUser(env.DB, ctx.from!.id, ctx.from!.language_code, ctx.from!.username);

  if (data === CALLBACK_CANCEL) {
    await ctx.answerCallbackQuery();
    await ctx.editMessageText(t(user.language, "submit.cancelled"));
    return;
  }

  const match = /^submit:confirm:(\d+):(\d+):([A-Za-z0-9]+)$/.exec(data);
  if (!match) {
    await ctx.answerCallbackQuery();
    return;
  }
  const eventId = Number(match[1]!);
  const position = Number(match[2]!);
  const value = match[3]!;

  const event = await getEventById(env.DB, eventId);
  if (!event || event.status !== "active") {
    await ctx.answerCallbackQuery();
    await ctx.editMessageText(t(user.language, "common.eventClosed"));
    return;
  }

  const displayName = formatDisplayName(user.username, ctx.from!.first_name);
  const own = await getOwnReport(env.DB, event.id, position, user.userId);
  await recordAndBroadcast(ctx, env, event, position, value, displayName, user.userId);

  await ctx.answerCallbackQuery();
  await ctx.editMessageText(t(user.language, own ? "submit.selfCorrected" : "submit.recorded", { position, value }));
}
