import { minutesSince } from "./time.js";

/** How long the administrator must have been inactive before `/claim` can even open a negotiation. */
export const CLAIM_INACTIVITY_MINUTES = 30;

/** How long the administrator has to respond to a claim notification before it can be forced through. */
export const CLAIM_RESOLUTION_MINUTES = 5;

/** Whether the administrator has been inactive long enough for `/claim` to open a negotiation. */
export function isAdminInactiveEnoughToClaim(adminLastActiveAt: string): boolean {
  return minutesSince(adminLastActiveAt) >= CLAIM_INACTIVITY_MINUTES;
}

/** Whether an open claim negotiation's grace period has elapsed, so the next `/claim` can force it through. */
export function isClaimResolvable(initiatedAt: string): boolean {
  return minutesSince(initiatedAt) >= CLAIM_RESOLUTION_MINUTES;
}
