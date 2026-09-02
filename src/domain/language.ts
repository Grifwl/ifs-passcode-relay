/** Languages the bot can speak to a user in. */
export const SUPPORTED_LANGUAGES = ["en", "ca", "es", "fr", "gl", "eu"] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

/**
 * Resolves a free-form language code (a `/language` argument, or
 * Telegram's `from.language_code`) to one of the bot's supported
 * languages, falling back to English when it isn't one.
 *
 * @param code - A BCP-47-ish language code, e.g. "ca", "es-ES", or undefined.
 */
export function resolveLanguage(code: string | undefined): SupportedLanguage {
  if (!code) return "en";
  const primary = code.toLowerCase().split("-")[0] ?? code.toLowerCase();
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(primary)
    ? (primary as SupportedLanguage)
    : "en";
}

/** Type guard for whether a free-form string is one of the bot's supported language codes. */
export function isSupportedLanguage(code: string): code is SupportedLanguage {
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(code);
}
