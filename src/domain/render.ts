import { t, type SupportedLanguage } from "../i18n/index.js";
import type { IfsEvent } from "./types.js";
import type { BuildResult, Combination } from "./passcode.js";
import { escapeHtml } from "./html.js";

/**
 * Renders the live/on-demand status message (see CLAUDE.md "Rendering
 * combinations"): a header line, then one monospace code block per
 * live combination, each annotated with its supporter count and — for
 * every combination that isn't (tied for) the best-supported one — the
 * names behind its weakest constituent.
 *
 * `supporterNames` is a synchronous lookup so this function stays pure;
 * the caller (see src/services/passcodeView.ts) is responsible for
 * fetching names ahead of time.
 */
export function renderStatusMessage(
  lang: SupportedLanguage,
  event: IfsEvent,
  result: BuildResult,
  supporterNames: (combo: Combination) => string[] | null
): string {
  const known = result.totalSlots - result.missingCount;
  const lines: string[] = [
    escapeHtml(t(lang, "status.header", { name: event.name, known, total: result.totalSlots })),
    "",
  ];

  if (result.overwhelmed) {
    lines.push(t(lang, "status.tooManyVariants", { count: result.truncatedCount }));
    return lines.join("\n");
  }

  for (const combo of result.combinations) {
    lines.push(`<code>${escapeHtml(combo.passcode)}</code>`);
    if (combo.supporterCount !== null) {
      const names = supporterNames(combo);
      if (names && names.length > 0) {
        lines.push(
          t(lang, "status.supportedBy", { count: combo.supporterCount, names: escapeHtml(names.join(", ")) })
        );
      } else {
        lines.push(t(lang, "status.supportCount", { count: combo.supporterCount }));
      }
    }
    lines.push("");
  }

  if (result.truncatedCount > 0) {
    lines.push(t(lang, "status.moreVariants", { count: result.truncatedCount }));
  }

  return lines.join("\n").trim();
}
