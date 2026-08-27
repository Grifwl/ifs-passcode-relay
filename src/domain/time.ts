/**
 * Minutes elapsed since a D1 `datetime('now')` timestamp (e.g.
 * `"2026-08-27 10:15:03"`, space-separated, always UTC). D1 doesn't
 * append a "Z", so `Date.parse` would otherwise read it as local time
 * — swapping in "T" and appending "Z" forces correct UTC parsing.
 */
export function minutesSince(timestamp: string): number {
  const iso = `${timestamp.replace(" ", "T")}Z`;
  return (Date.now() - Date.parse(iso)) / 60_000;
}
