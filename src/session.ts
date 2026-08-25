import { getOrCreateUser } from "./db/users.js";
import { resolveLanguage } from "./domain/language.js";
import type { User } from "./domain/types.js";

/**
 * Fetches the bot's record for a Telegram user, lazily creating it on
 * first contact with their language defaulted from Telegram's own
 * `language_code` (falling back to English if it isn't supported), and
 * keeping their stored username fresh on every interaction.
 */
export async function ensureUser(
  db: D1Database,
  telegramUserId: number,
  telegramLanguageCode: string | undefined,
  telegramUsername: string | undefined
): Promise<User> {
  return getOrCreateUser(db, telegramUserId, resolveLanguage(telegramLanguageCode), telegramUsername);
}
