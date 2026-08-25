/** The name shown for a report's author: their @username if they have one, else their first name. */
export function formatDisplayName(username: string | null | undefined, firstName: string): string {
  return username ? `@${username}` : firstName;
}
