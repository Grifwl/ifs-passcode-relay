import { InlineKeyboard } from "grammy";
import { t, SUPPORTED_LANGUAGES, type SupportedLanguage } from "../i18n/index.js";
import type { IfsEvent } from "./types.js";
import { escapeHtml } from "./html.js";
import { BOT_USERNAME } from "./botInfo.js";

/** Prefix for the language-switch buttons attached to `renderShareTextNote`'s message. */
const SHARETEXT_CALLBACK_PREFIX = "sharetext:";
const SHARETEXT_CALLBACK_PATTERN = /^sharetext:(\d+):(en|ca|es|fr)$/;

/**
 * Renders the shareable block of the `/sharetext` invite message: an
 * intro sentence naming the bot by its `@username` and a tap-to-copy
 * `/join` block. This is the part meant to be forwarded or pasted
 * as-is into an external chat, so it deliberately carries nothing
 * meant only for whoever ran the command — see `renderShareTextNote`
 * for that, sent as a separate message precisely so it doesn't tag
 * along if this block gets forwarded on its own.
 *
 * The bot's `@username` doesn't need an explicit `<a>` link: Telegram
 * auto-links any `@username` mention that appears as plain text in a
 * message, the same way `domain/displayName.ts` relies on for
 * participant names, so it's just interpolated like any other text and
 * the whole result can be escaped as one block. This also sidesteps an
 * `<a href="...">` link's other side effect — Telegram renders a link
 * preview card under the message for those, which a plain `@mention`
 * doesn't trigger, keeping the pasted-elsewhere invite text compact.
 *
 * Used both by `/sharetext` itself and by `/newevent`, which sends this
 * automatically right after creating an event — at that point the
 * creator isn't a participant yet either, so the code is always passed
 * explicitly here too.
 *
 * The `/join <code>` block is followed by an italicized hint on tapping
 * it to copy and then tapping the bot's name to send it — on mobile the
 * monospace command doesn't stand out much on its own, so this spells
 * out the two taps needed to actually act on it.
 */
export function renderShareText(lang: SupportedLanguage, event: Pick<IfsEvent, "name" | "code">): string {
  const intro = escapeHtml(t(lang, "sharetext.text", { name: event.name, bot: BOT_USERNAME }));
  const joinCommand = `<code>/join ${escapeHtml(event.code)}</code>`;
  const tapHint = `<i>${escapeHtml(t(lang, "sharetext.tapToCopy"))}</i>`;
  return `${intro}\n\n${joinCommand}\n\n${tapHint}`;
}

/**
 * Renders the follow-up note (sent as its own, italicized message —
 * see `renderShareText`) pointing at the language-switch buttons
 * attached to it by `buildShareTextLanguageKeyboard`. Kept as a
 * separate message for the same reason as before: it shouldn't tag
 * along if the shareable block gets forwarded on its own.
 */
export function renderShareTextNote(lang: SupportedLanguage): string {
  return `<i>${escapeHtml(t(lang, "sharetext.otherLanguages"))}</i>`;
}

/**
 * Builds the inline keyboard attached to `renderShareTextNote`'s
 * message: one button per supported language other than the one the
 * note is currently written in, all on a single row so the keyboard
 * stays compact on a phone screen — labelled with the bare two-letter
 * ISO code (`EN`, `CA`, `ES`, `FR`) rather than the full language name,
 * since only 3 buttons plus their row padding already leaves little
 * width to work with on mobile. Tapping one re-sends the whole invite
 * (shareable block + a fresh note with its own keyboard, this time
 * excluding the newly picked language) in that language — see
 * `handleShareTextCallback`.
 *
 * The event id is encoded directly in each button's `callback_data`
 * (fits the pattern already used for `/submit`'s confirmation buttons,
 * see CLAUDE.md "Confirmation on conflicting or pattern-breaking
 * input") rather than resolved from the tapping user's *current* event
 * at callback time, so a language switch always regenerates the invite
 * for the event this specific note was about — even if the tapper has
 * since left it or joined another one.
 */
export function buildShareTextLanguageKeyboard(lang: SupportedLanguage, eventId: number): InlineKeyboard {
  const keyboard = new InlineKeyboard();
  for (const candidate of SUPPORTED_LANGUAGES) {
    if (candidate === lang) continue;
    keyboard.text(candidate.toUpperCase(), `${SHARETEXT_CALLBACK_PREFIX}${eventId}:${candidate}`);
  }
  return keyboard;
}

/** Parses a share-text language-switch button's `callback_data`, or `null` if it's malformed. */
export function parseShareTextCallback(data: string): { eventId: number; lang: SupportedLanguage } | null {
  const match = SHARETEXT_CALLBACK_PATTERN.exec(data);
  if (!match) return null;
  return { eventId: Number(match[1]), lang: match[2] as SupportedLanguage };
}
