export interface ParsedSubmission {
  position: number;
  /**
   * Null when the text is a bare "<position>" with no value attached —
   * a request to remove the caller's own report at that position (see
   * handleSubmit), not to record one.
   */
  value: string | null;
}

/**
 * Parses a free-form submission like "5 A", "6: GLYPH", "7-3" or a bare
 * "5" into a position and an optional value. Returns null if the text
 * doesn't look like a submission at all (this is also how the bot tells
 * a submission attempt apart from ordinary chat text, see bot.ts).
 */
export function parseSubmissionText(text: string): ParsedSubmission | null {
  const match = /^\s*(\d+)\s*[:\-).]?\s*(\S+)?\s*$/.exec(text);
  if (!match) return null;
  const position = Number(match[1]!);
  const value = match[2] ?? null;
  return { position, value };
}
