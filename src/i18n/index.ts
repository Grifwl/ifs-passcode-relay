import { catalogs, type MessageKey } from "./catalog.js";
import type { SupportedLanguage } from "../domain/language.js";

export type { MessageKey } from "./catalog.js";
export { SUPPORTED_LANGUAGES, resolveLanguage, type SupportedLanguage } from "../domain/language.js";

/**
 * Renders a user-facing message in the given language. Every string the
 * bot sends must go through this function — no hardcoded language in
 * handler code (see CLAUDE.md "Internationalization").
 */
export function t(
  lang: SupportedLanguage,
  key: MessageKey,
  params: Record<string, string | number> = {}
): string {
  return catalogs[lang][key](params);
}
