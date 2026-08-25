import type { User } from "../domain/types.js";
import type { SupportedLanguage } from "../domain/language.js";

interface UserRow {
  user_id: number;
  language: string;
  username: string | null;
  created_at: string;
}

function fromRow(row: UserRow): User {
  return {
    userId: row.user_id,
    language: row.language as SupportedLanguage,
    username: row.username,
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

/** Finds a user by their Telegram username (case-insensitive, leading "@" optional). */
export async function getUserByUsername(db: D1Database, username: string): Promise<User | null> {
  const clean = username.replace(/^@/, "");
  const row = await db
    .prepare("SELECT * FROM users WHERE LOWER(username) = LOWER(?)")
    .bind(clean)
    .first<UserRow>();
  return row ? fromRow(row) : null;
}

/**
 * Fetches a user, creating them with the given default language if this
 * is their first interaction with the bot. Also refreshes their
 * username, which can change over time on Telegram.
 */
export async function getOrCreateUser(
  db: D1Database,
  userId: number,
  defaultLanguage: SupportedLanguage,
  username: string | undefined
): Promise<User> {
  const existing = await getUser(db, userId);
  if (existing) {
    if ((username ?? null) !== existing.username) {
      await setUsername(db, userId, username ?? null);
      return { ...existing, username: username ?? null };
    }
    return existing;
  }

  await db
    .prepare("INSERT INTO users (user_id, language, username) VALUES (?, ?, ?) ON CONFLICT (user_id) DO NOTHING")
    .bind(userId, defaultLanguage, username ?? null)
    .run();

  return (
    (await getUser(db, userId)) ?? {
      userId,
      language: defaultLanguage,
      username: username ?? null,
      createdAt: new Date().toISOString(),
    }
  );
}

/** Updates a user's language preference. Not retroactive: only future messages use it. */
export async function setUserLanguage(db: D1Database, userId: number, language: SupportedLanguage): Promise<void> {
  await db.prepare("UPDATE users SET language = ? WHERE user_id = ?").bind(language, userId).run();
}

/** Refreshes a user's stored Telegram username. */
export async function setUsername(db: D1Database, userId: number, username: string | null): Promise<void> {
  await db.prepare("UPDATE users SET username = ? WHERE user_id = ?").bind(username, userId).run();
}
