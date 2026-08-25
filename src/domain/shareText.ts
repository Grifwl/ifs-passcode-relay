import { t, type SupportedLanguage } from "../i18n/index.js";
import type { IfsEvent } from "./types.js";
import { escapeHtml } from "./html.js";
import { BOT_URL, BOT_USERNAME } from "./botInfo.js";

/**
 * Renders the `/sharetext` invite message: an intro sentence in the
 * target language naming the bot as a tap-to-open link, a tap-to-copy
 * `/join` block, and a trailer explaining how to regenerate the same
 * message in a different language. That trailer always names the code
 * explicitly — the rendered text is meant to be pasted into an external
 * chat, and whoever reads it there isn't a participant yet, so there's
 * no "current event" for them to default to (see `handleShareText`).
 *
 * The event name is escaped before being interpolated into the
 * template rather than escaping the template's own output afterwards —
 * escaping the whole result would also have to be applied to the `link`
 * param, which must stay raw HTML, so each dynamic piece is escaped at
 * the point it's built instead (same approach as `renderStatusMessage`
 * escaping `names` before interpolation).
 *
 * Used both by `/sharetext` itself and by `/newevent`, which sends this
 * automatically right after creating an event — at that point the
 * creator isn't a participant yet either, so the code is always passed
 * explicitly here too.
 */
export function renderShareText(lang: SupportedLanguage, event: Pick<IfsEvent, "name" | "code">): string {
  const link = `<a href="${BOT_URL}">${escapeHtml(BOT_USERNAME)}</a>`;
  const intro = t(lang, "sharetext.text", { name: escapeHtml(event.name), link });
  const joinCommand = `<code>/join ${escapeHtml(event.code)}</code>`;
  // Unlike `intro`, this template has no raw-HTML param to preserve — it
  // has a literal "<lang>"/"<idioma>"/"<langue>" placeholder in its
  // static text, which Telegram's HTML parser would otherwise choke on
  // as an unrecognized tag, so the whole rendered string is escaped.
  const otherLanguages = escapeHtml(t(lang, "sharetext.otherLanguages", { code: event.code }));
  return `${intro}\n\n${joinCommand}\n\n${otherLanguages}`;
}
