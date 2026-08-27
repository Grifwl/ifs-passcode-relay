import type { Slot } from "./pattern.js";
import type { CandidateRow, ResolutionRow } from "../db/passcode.js";

const PLACEHOLDER = "_";
const MAX_VARIANTS = 16;
/** Hard safety cap on the raw cross product before capping/sorting, so a
 * flood of conflicting reports can't make this computation blow up. */
const SAFETY_LIMIT = 2000;

export interface SlotState {
  position: number;
  resolvedValue: string | null;
  candidates: CandidateRow[];
}

interface BranchOption {
  position: number;
  value: string;
  /** Supporter count when this option is a real (unresolved, ambiguous) candidate; null otherwise. */
  supporterCount: number | null;
}

export interface Combination {
  code: string;
  /** null when nothing about this combination is in dispute (no candidates were scored). */
  supporterCount: number | null;
  weakestPosition: number | null;
  weakestValue: string | null;
}

export interface BuildResult {
  combinations: Combination[];
  /** How many additional combinations exist beyond the ones returned (0 if none). */
  truncatedCount: number;
  /** True if there is at least one position with more than one live candidate. */
  hasConflict: boolean;
  /** True if the number of raw combinations was too large to even enumerate; combinations is empty in that case. */
  overwhelmed: boolean;
  /** How many slots are still fully blank (no resolution and no candidates at all). */
  missingCount: number;
  totalSlots: number;
}

/** Combines a pattern's slots with an event's resolutions and live candidates into per-slot state. */
export function buildSlotStates(slots: Slot[], resolutions: ResolutionRow[], candidates: CandidateRow[]): SlotState[] {
  const resolutionMap = new Map(resolutions.map((r) => [r.position, r.value]));
  const candidatesByPosition = new Map<number, CandidateRow[]>();
  for (const c of candidates) {
    const list = candidatesByPosition.get(c.position) ?? [];
    list.push(c);
    candidatesByPosition.set(c.position, list);
  }

  return slots.map((slot) => ({
    position: slot.position,
    resolvedValue: resolutionMap.get(slot.position) ?? null,
    candidates: candidatesByPosition.get(slot.position) ?? [],
  }));
}

/**
 * Positions still unresolved with more than one live candidate — i.e.
 * genuinely "in disagreement" rather than merely unfilled — in ascending
 * position order. Used by the `/resolve` walkthrough (no arguments) to
 * find what still needs the administrator's attention.
 */
export function getConflictingPositions(slots: SlotState[]): number[] {
  return slots
    .filter((s) => s.resolvedValue === null && s.candidates.length > 1)
    .map((s) => s.position)
    .sort((a, b) => a - b);
}

/**
 * Positions that are not yet ready for `/closeevent`: unresolved and not
 * narrowed down to exactly one live candidate (i.e. still blank, or still
 * genuinely conflicting). Empty means every position is unambiguous and
 * the event can be closed. Shared between `/closeevent` (which blocks on
 * this) and `/resolve`'s walkthrough (which uses it to decide whether to
 * offer a "close event" button once no conflicts remain).
 */
export function getUnresolvedPositions(slots: SlotState[]): number[] {
  return slots
    .filter((s) => s.resolvedValue === null && s.candidates.length !== 1)
    .map((s) => s.position)
    .sort((a, b) => a - b);
}

function slotBranches(slot: SlotState): BranchOption[] {
  if (slot.resolvedValue !== null) {
    return [{ position: slot.position, value: slot.resolvedValue, supporterCount: null }];
  }
  if (slot.candidates.length === 0) {
    return [{ position: slot.position, value: PLACEHOLDER, supporterCount: null }];
  }
  if (slot.candidates.length === 1) {
    const only = slot.candidates[0]!;
    return [{ position: slot.position, value: only.value, supporterCount: null }];
  }
  return slot.candidates.map((c) => ({ position: slot.position, value: c.value, supporterCount: c.supporterCount }));
}

/**
 * Builds every full-code combination implied by the current state: the
 * cross product of each position's live candidates, with resolved and
 * unambiguous positions contributing a single fixed value rather than
 * branching. A combination's "supporter count" is the minimum supporter
 * count among its constituent candidates (its weakest link) — with a
 * single point of disagreement, that's exactly that candidate's own
 * count, which is the common case in practice.
 */
export function buildCombinations(slots: SlotState[]): BuildResult {
  const ordered = [...slots].sort((a, b) => a.position - b.position);
  const branchLists = ordered.map(slotBranches);

  const hasConflict = branchLists.some((options) => options.length > 1);
  const missingCount = ordered.filter((s) => s.resolvedValue === null && s.candidates.length === 0).length;
  const totalSlots = ordered.length;

  const rawTotal = branchLists.reduce((acc, options) => acc * options.length, 1);
  if (rawTotal > SAFETY_LIMIT) {
    return {
      combinations: [],
      truncatedCount: rawTotal,
      hasConflict,
      overwhelmed: true,
      missingCount,
      totalSlots,
    };
  }

  let combos: BranchOption[][] = [[]];
  for (const options of branchLists) {
    const next: BranchOption[][] = [];
    for (const combo of combos) {
      for (const option of options) {
        next.push([...combo, option]);
      }
    }
    combos = next;
  }

  const scored: Combination[] = combos.map((combo) => {
    const code = combo.map((o) => o.value).join("");
    const scoredOptions = combo.filter((o): o is BranchOption & { supporterCount: number } => o.supporterCount !== null);
    if (scoredOptions.length === 0) {
      return { code, supporterCount: null, weakestPosition: null, weakestValue: null };
    }
    const weakest = scoredOptions.reduce((min, o) => (o.supporterCount < min.supporterCount ? o : min));
    return {
      code,
      supporterCount: weakest.supporterCount,
      weakestPosition: weakest.position,
      weakestValue: weakest.value,
    };
  });

  scored.sort((a, b) => (b.supporterCount ?? Number.POSITIVE_INFINITY) - (a.supporterCount ?? Number.POSITIVE_INFINITY));

  const truncatedCount = Math.max(0, scored.length - MAX_VARIANTS);
  const combinations = scored.slice(0, MAX_VARIANTS);

  return { combinations, truncatedCount, hasConflict, overwhelmed: false, missingCount, totalSlots };
}
