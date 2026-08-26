import { t, type SupportedLanguage } from "../i18n/index.js";
import type { IfsEvent } from "./types.js";
import { escapeHtml } from "./html.js";
import { BOT_USERNAME } from "./botInfo.js";

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
  return `${intro}\n\n${joinCommand}\n${tapHint}`;
}

/**
 * Renders the follow-up note (sent as its own, italicized message —
 * see `renderShareText`) explaining how to regenerate the invite text
 * in another language. It deliberately omits the event code: whoever
 * ran `/sharetext` — or is reading `/newevent`'s automatic copy — is
 * necessarily a participant of that event by the time they'd act on
 * this note (the creator via the auto-join right after, anyone else
 * because sharing an event assumes being in it), so a bare
 * `/sharetext <lang>` already resolves to it via their current event
 * (see `handleShareText`).
 */
export function renderShareTextNote(lang: SupportedLanguage): string {
  return `<i>${escapeHtml(t(lang, "sharetext.otherLanguages"))}</i>`;
}
