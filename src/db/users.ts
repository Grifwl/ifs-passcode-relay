import type { User } from "../domain/types.js";
import type { SupportedLanguage } from "../domain/language.js";

interface UserRow {
  user_id: number;
  language: string;
  created_at: string;
}

function fromRow(row: UserRow): User {
  return {
    userId: row.user_id,
    language: row.language as SupportedLanguage,
    createdAt: row.created_at,
  };
}

/** Fetches a user by Telegram id, or null if they've never interacted with the bot. */
export async function getUser(db: D1Database, userId: number): Promise<User | null> {
  const row = await db
    .prepare("SELECT * FROM users WHERE user_id = ?")
    .bind(userId)
    .first<UserRow>();
  return row ? fromRow(row) : null;
}

/**
 * Fetches a user, creating them with the given default language if this
 * is their first interaction with the bot.
 */
export async function getOrCreateUser(
  db: D1Database,
  userId: number,
  defaultLanguage: SupportedLanguage
): Promise<User> {
  const existing = await getUser(db, userId);
  if (existing) return existing;

  await db
    .prepare("INSERT INTO users (user_id, language) VALUES (?, ?) ON CONFLICT (user_id) DO NOTHING")
    .bind(userId, defaultLanguage)
    .run();

  return (await getUser(db, userId)) ?? { userId, language: defaultLanguage, createdAt: new Date().toISOString() };
}

/** Updates a user's language preference. Not retroactive: only future messages use it. */
export async function setUserLanguage(db: D1Database, userId: number, language: SupportedLanguage): Promise<void> {
  await db.prepare("UPDATE users SET language = ? WHERE user_id = ?").bind(language, userId).run();
}
