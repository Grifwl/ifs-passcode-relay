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
  passcode: string;
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
 * Positions still missing a resolution: unresolved and not narrowed down
 * to exactly one live candidate (i.e. still blank, or still genuinely
 * conflicting). Used only as a defensive safety net right before
 * `/verify` finalizes an event — by the time a passcode has matched, every
 * position should already have been resolved as part of that match, so
 * this should always come back empty in practice. A non-empty result
 * here is never itself grounds to close an event: only `/verify`'s
 * store-confirmed match can do that (see CLAUDE.md's "Conflict
 * handling").
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
 * Builds every full-passcode combination implied by the current state: the
 * cross product of each position's live candidates, with resolved and
 * unambiguous positions contributing a single fixed value rather than
 * branching. A combination's "supporter count" is the minimum supporter
 * count among its constituent candidates (its weakest link) — with a
 * single point of disagreement, that's exactly that candidate's own
 * count, which is the common case in practice.
 */
function crossProduct(branchLists: BranchOption[][]): BranchOption[][] {
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
  return combos;
}

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

  const combos = crossProduct(branchLists);

  const scored: Combination[] = combos.map((combo) => {
    const passcode = combo.map((o) => o.value).join("");
    const scoredOptions = combo.filter((o): o is BranchOption & { supporterCount: number } => o.supporterCount !== null);
    if (scoredOptions.length === 0) {
      return { passcode, supporterCount: null, weakestPosition: null, weakestValue: null };
    }
    const weakest = scoredOptions.reduce((min, o) => (o.supporterCount < min.supporterCount ? o : min));
    return {
      passcode,
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

export interface MatchResult {
  status: "match" | "noMatch" | "ambiguous" | "overwhelmed";
  /** Present only when status is "match": every slot's position and matched value. */
  resolutions?: { position: number; value: string }[];
}

/**
 * Matches a full passcode string — confirmed correct by an external
 * source, e.g. accepted at the in-game redeem screen — against every
 * combination implied by the event's current resolutions/candidates, to
 * determine which value each position must have to produce it. Used by
 * `/verify`.
 *
 * Unlike `buildCombinations`, this doesn't cap to `MAX_VARIANTS` or sort
 * by supporter count: the whole point is to settle a disagreement that a
 * supporter-count ranking alone couldn't, so the correct combination may
 * well be the least-supported one. It also doesn't need to segment a
 * word slot's variable-length span by hand — matching against the known
 * candidate strings themselves does that implicitly, since a slot's
 * option list only ever contains values people actually reported.
 */
export function matchPasscode(slots: SlotState[], passcode: string): MatchResult {
  const ordered = [...slots].sort((a, b) => a.position - b.position);
  const branchLists = ordered.map(slotBranches);

  const rawTotal = branchLists.reduce((acc, options) => acc * options.length, 1);
  if (rawTotal > SAFETY_LIMIT) {
    return { status: "overwhelmed" };
  }

  const normalized = passcode.replace(/\s+/g, "").toUpperCase();
  const matches = crossProduct(branchLists).filter((combo) => combo.map((o) => o.value).join("") === normalized);

  if (matches.length === 0) return { status: "noMatch" };
  if (matches.length > 1) return { status: "ambiguous" };

  return {
    status: "match",
    resolutions: matches[0]!.map((o) => ({ position: o.position, value: o.value })),
  };
}
