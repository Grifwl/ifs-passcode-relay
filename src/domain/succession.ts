import type { EventTrustStatus } from "./trust.js";

/** A participant eligible (or not) to inherit the administrator role, with what /leave's succession rule needs to know about them. */
export interface SuccessionCandidate {
  userId: number;
  /** null means neutral — no `event_trust` row for this participant. */
  trustStatus: EventTrustStatus | null;
  /** How many positions this participant currently has a live report at, for this event. */
  reportCount: number;
}

/**
 * Picks who should inherit the administrator role when the current
 * administrator leaves without having `/promote`d anyone first (see
 * CLAUDE.md "Administrator succession"): trusted participants are
 * preferred over everyone else; within whichever pool applies, the
 * participant with the most contributions wins; a tie is broken at
 * random. Returns null when nobody is eligible — every remaining
 * participant is flagged troll, or there are none left at all — so the
 * caller can close the event as abandoned instead.
 */
export function pickSuccessor(candidates: SuccessionCandidate[]): number | null {
  const trusted = candidates.filter((c) => c.trustStatus === "trusted");
  const pool = trusted.length > 0 ? trusted : candidates.filter((c) => c.trustStatus !== "troll");
  if (pool.length === 0) return null;

  const maxReports = Math.max(...pool.map((c) => c.reportCount));
  const top = pool.filter((c) => c.reportCount === maxReports);
  return top[Math.floor(Math.random() * top.length)]!.userId;
}
