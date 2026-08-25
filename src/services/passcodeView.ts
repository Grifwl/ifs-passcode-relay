import { getCandidates, getResolutions, getSupporters } from "../db/passcode.js";
import { buildSlotStates, buildCombinations, type Combination } from "../domain/passcode.js";
import { parsePattern } from "../domain/pattern.js";
import { renderStatusMessage } from "../domain/render.js";
import type { IfsEvent } from "../domain/types.js";
import type { SupportedLanguage } from "../i18n/index.js";

/**
 * Fetches an event's current passcode state and renders it in the given
 * language, fetching supporter names only for the combinations that
 * need them (see domain/render.ts).
 */
export async function renderStatus(db: D1Database, event: IfsEvent, lang: SupportedLanguage): Promise<string> {
  const slots = parsePattern(event.pattern);
  const [resolutions, candidates] = await Promise.all([getResolutions(db, event.id), getCandidates(db, event.id)]);
  const slotStates = buildSlotStates(slots, resolutions, candidates);
  const result = buildCombinations(slotStates);

  const maxSupport = result.combinations.reduce(
    (max, c) => (c.supporterCount !== null && c.supporterCount > max ? c.supporterCount : max),
    Number.NEGATIVE_INFINITY
  );

  const namesByKey = new Map<string, string[]>();
  for (const combo of result.combinations) {
    if (
      combo.supporterCount !== null &&
      combo.supporterCount !== maxSupport &&
      combo.weakestPosition !== null &&
      combo.weakestValue !== null
    ) {
      const key = `${combo.weakestPosition}:${combo.weakestValue}`;
      if (!namesByKey.has(key)) {
        const supporters = await getSupporters(db, event.id, combo.weakestPosition, combo.weakestValue);
        namesByKey.set(
          key,
          supporters.map((s) => s.displayName)
        );
      }
    }
  }

  const lookup = (combo: Combination): string[] | null => {
    if (combo.supporterCount === null || combo.supporterCount === maxSupport) return null;
    if (combo.weakestPosition === null || combo.weakestValue === null) return null;
    return namesByKey.get(`${combo.weakestPosition}:${combo.weakestValue}`) ?? null;
  };

  return renderStatusMessage(lang, event, result, lookup);
}
