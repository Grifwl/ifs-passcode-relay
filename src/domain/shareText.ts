import { t, type SupportedLanguage } from "../i18n/index.js";
import type { IfsEvent } from "./types.js";
import { escapeHtml } from "./html.js";
import { BOT_USERNAME } from "./botInfo.js";

/**
 * Renders the `/sharetext` invite message: an intro sentence in the
 * target language naming the bot by its `@username`, a tap-to-copy
 * `/join` block, and a trailer explaining how to regenerate the same
 * message in a different language. That trailer always names the code
 * explicitly — the rendered text is meant to be pasted into an external
 * chat, and whoever reads it there isn't a participant yet, so there's
 * no "current event" for them to default to (see `handleShareText`).
 *
 * The bot's `@username` doesn't need an explicit `<a>` link: Telegram
 * auto-links any `@username` mention that appears as plain text in a
 * message, the same way `domain/displayName.ts` relies on for
 * participant names, so it's just interpolated like any other text and
 * the whole result can be escaped as one block.
 *
 * Used both by `/sharetext` itself and by `/newevent`, which sends this
 * automatically right after creating an event — at that point the
 * creator isn't a participant yet either, so the code is always passed
 * explicitly here too.
 */
export function renderShareText(lang: SupportedLanguage, event: Pick<IfsEvent, "name" | "code">): string {
  const intro = escapeHtml(t(lang, "sharetext.text", { name: event.name, bot: BOT_USERNAME }));
  const joinCommand = `<code>/join ${escapeHtml(event.code)}</code>`;
  const otherLanguages = escapeHtml(t(lang, "sharetext.otherLanguages", { code: event.code }));
  return `${intro}\n\n${joinCommand}\n\n${otherLanguages}`;
}
