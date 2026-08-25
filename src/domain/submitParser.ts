export interface ParsedSubmission {
  position: number;
  value: string;
}

/**
 * Parses a free-form submission like "5 A", "6: CIPHER" or "7-3" into a
 * position and a value. Returns null if the text doesn't look like a
 * submission at all (this is also how the bot tells a submission
 * attempt apart from ordinary chat text, see bot.ts).
 */
export function parseSubmissionText(text: string): ParsedSubmission | null {
  const match = /^\s*(\d+)\s*[:\-).]?\s*(\S+)\s*$/.exec(text);
  if (!match) return null;
  const position = Number(match[1]!);
  const value = match[2]!;
  return { position, value };
}
