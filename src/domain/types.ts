import type { SupportedLanguage } from "./language.js";

/** Status of an IFS event, controlling whether it still accepts joins and passcode submissions. */
export type EventStatus = "active" | "closed";

/** A Telegram user who has interacted with the bot, independent of event membership. */
export interface User {
  userId: number;
  language: SupportedLanguage;
  /** Telegram @username, refreshed on every interaction; null if the user has none set. */
  username: string | null;
  createdAt: string;
}

/**
 * An Ingress First Saturday event, scoped by a unique join code shared
 * out-of-band (e.g. in a WhatsApp group) by whoever created it.
 */
export interface IfsEvent {
  id: number;
  code: string;
  name: string;
  pattern: string;
  status: EventStatus;
  createdBy: number;
  createdAt: string;
}

/**
 * A Telegram user currently attending exactly one active IFS event.
 * Removed on `/leave`, on `/kick`, or replaced when the agent joins a
 * different event.
 */
export interface Participant {
  userId: number;
  eventId: number;
  chatId: number;
  statusMessageId: number | null;
  joinedAt: string;
}
