import type { Context } from "grammy";
import type { Env } from "../env.js";
import type { IfsEvent } from "../domain/types.js";
import type { SupportedLanguage } from "../domain/language.js";
import { ensureUser } from "../session.js";
import { t, isSupportedLanguage } from "../i18n/index.js";
import { getEventByCode, getEventById } from "../db/events.js";
import { getParticipant } from "../db/participants.js";
import {
  renderShareText,
  renderShareTextNote,
  buildShareTextLanguageKeyboard,
  parseShareTextCallback,
} from "../domain/shareText.js";

/**
 * Sends the full `/sharetext` invite — the shareable block, then the
 * "other languages" note with its language-switch buttons attached —
 * in `lang`. Shared by the `/sharetext` command, `/newevent`'s
 * automatic copy, and `handleShareTextCallback` (a language button
 * re-runs this in the picked language rather than editing anything in
 * place), so all three stay in sync by construction.
 */
export async function sendShareText(
  ctx: Context,
  lang: SupportedLanguage,
  event: Pick<IfsEvent, "id" | "name" | "code">
): Promise<void> {
  const keyboard = buildShareTextLanguageKeyboard(lang, event.id);
  await ctx.reply(renderShareText(lang, event), { parse_mode: "HTML" });
  await ctx.reply(renderShareTextNote(lang), { parse_mode: "HTML", reply_markup: keyboard });
}

export async function handleShareText(ctx: Context, env: Env): Promise<void> {
  const user = await ensureUser(env.DB, ctx.from!.id, ctx.from!.language_code, ctx.from!.username);
  const parts = String(ctx.match ?? "").trim().split(/\s+/).filter(Boolean);

  // Event codes are always 6 characters (see domain/codeGen.ts) and
  // language codes always 2, so a lone argument is unambiguous: /sharetext
  // <lang> means "my current event, in this language", while a second
  // argument always means the first one is an explicit event code. This
  // is a length check, not a isSupportedLanguage() check — an
  // unsupported-but-2-character value (e.g. "ru") must still land in the
  // [lang] slot so it hits the "invalid language" error below, instead
  // of being looked up as an event code and reported as not found.
  let codeArg = parts[0];
  let langArg = parts[1];
  if (codeArg && !langArg && codeArg.length === 2) {
    langArg = codeArg;
    codeArg = undefined;
  }

  let lang = user.language;
  if (langArg) {
    const normalized = langArg.toLowerCase();
    if (!isSupportedLanguage(normalized)) {
      await ctx.reply(t(user.language, "language.invalid", { code: normalized }));
      return;
    }
    lang = normalized;
  }

  let event: IfsEvent | null;
  if (codeArg) {
    event = await getEventByCode(env.DB, codeArg);
    if (!event) {
      await ctx.reply(t(user.language, "common.eventNotFound"));
      return;
    }
  } else {
    const participant = await getParticipant(env.DB, user.userId);
    event = participant ? await getEventById(env.DB, participant.eventId) : null;
    if (!event) {
      await ctx.reply(t(user.language, "sharetext.noCurrentEvent"));
      return;
    }
  }

  if (event.status !== "active") {
    await ctx.reply(t(user.language, "common.eventClosed"));
    return;
  }

  // Two separate messages: the shareable block above is meant to be
  // forwarded as-is, and the language note below is meant to stay with
  // whoever ran this command — sending it separately means a plain
  // Telegram forward of the first message won't drag the note along.
  await sendShareText(ctx, lang, event);
}

/**
 * Handles a tap on one of `buildShareTextLanguageKeyboard`'s buttons.
 * The event id travels in the button's own `callback_data` (see that
 * function's doc comment), so this doesn't depend on the tapper's
 * *current* event the way a bare `/sharetext <lang>` does — it always
 * regenerates the invite for the event the tapped note was about.
 */
export async function handleShareTextCallback(ctx: Context, env: Env): Promise<void> {
  const parsed = parseShareTextCallback(ctx.callbackQuery?.data ?? "");
  if (!parsed) {
    await ctx.answerCallbackQuery();
    return;
  }

  const user = await ensureUser(env.DB, ctx.from!.id, ctx.from!.language_code, ctx.from!.username);
  const event = await getEventById(env.DB, parsed.eventId);
  if (!event || event.status !== "active") {
    await ctx.answerCallbackQuery();
    await ctx.reply(t(user.language, "common.eventClosed"));
    return;
  }

  await ctx.answerCallbackQuery();
  await sendShareText(ctx, parsed.lang, event);
}
