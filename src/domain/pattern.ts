/** The default passcode pattern used when an event's administrator doesn't override it. */
export const DEFAULT_PATTERN = "XXX99*999XX";

/** A single slot of a passcode pattern: one letter, one digit, or one whole word. */
export type SlotType = "letter" | "digit" | "word";

export interface Slot {
  /** 1-based slot index, as used everywhere a "position" is reported (submissions, /resolve, ...). */
  position: number;
  type: SlotType;
}

const TOKEN_TO_TYPE: Record<string, SlotType> = {
  X: "letter",
  "9": "digit",
  "*": "word",
};

/** Whether a pattern string contains only `X`, `9` and `*`, and at least one slot. */
export function isValidPattern(pattern: string): boolean {
  return pattern.length > 0 && /^[X9*]+$/.test(pattern);
}

/**
 * Parses a pattern string (e.g. `"XXX99*999XX"`) into its ordered slots.
 * A word slot (`*`) still occupies exactly one slot/position, even though
 * its value is multiple characters.
 *
 * @throws if the pattern contains characters other than `X`, `9`, `*`.
 */
export function parsePattern(pattern: string): Slot[] {
  if (!isValidPattern(pattern)) {
    throw new Error(`Invalid pattern: "${pattern}"`);
  }
  return [...pattern].map((token, index) => ({
    position: index + 1,
    type: TOKEN_TO_TYPE[token]!,
  }));
}

/**
 * Whether a submitted value's shape matches what a slot expects. This is
 * a soft check by design (see CLAUDE.md "Confirmation on conflicting or
 * pattern-breaking input") — callers still accept the value if the agent
 * confirms, in case the pattern itself was configured wrong.
 */
export function valueMatchesSlotType(value: string, type: SlotType): boolean {
  switch (type) {
    case "letter":
      return /^[A-Za-z]$/.test(value);
    case "digit":
      return /^[0-9]$/.test(value);
    case "word":
      return /^[A-Za-z]+$/.test(value);
  }
}

/** Normalizes a submitted value for storage/display: always upper case. */
export function normalizeValue(value: string): string {
  return value.toUpperCase();
}
