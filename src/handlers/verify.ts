import type { Context } from "grammy";
import type { Env } from "../env.js";
import type { SupportedLanguage } from "../i18n/index.js";
import { ensureUser } from "../session.js";
import { t } from "../i18n/index.js";
import { getParticipant, listParticipants } from "../db/participants.js";
import { getEventById, closeEvent } from "../db/events.js";
import { getCandidates, getEventTrustMap, getResolutions, setResolution } from "../db/passcode.js";
import { getUser } from "../db/users.js";
import { parsePattern } from "../domain/pattern.js";
import { buildSlotStates, buildCombinations, getUnresolvedPositions, matchCode } from "../domain/passcode.js";
import { escapeHtml } from "../domain/html.js";
import type { IfsEvent } from "../domain/types.js";

/**
 * Resolves every position from a store-confirmed code and closes the
 * event as `completed`, sending the final passcode to every participant
 * as a brand new message (except anyone flagged `troll`). This is the
 * only path that can complete-close an event: unlike a mere consensus
 * among reporters (everyone happening to report the same value), a
 * successful `/verify` means the administrator actually copied a
 * candidate code, pasted it into the game's redeem screen, and had the
 * game itself confirm it — which is the only thing that can catch every
 * participant being systematically wrong about the same position (e.g.
 * misreading a portal's glyph). `getUnresolvedPositions` is checked here
 * only as a defensive safety net; `matchCode` having returned "match"
 * already means a resolution was just written for every position.
 */
async function closeVerifiedEvent(
  ctx: Context,
  env: Env,
  lang: SupportedLanguage,
  event: IfsEvent
): Promise<void> {
  const slots = parsePattern(event.pattern);
  const [resolutions, candidates] = await Promise.all([getResolutions(env.DB, event.id), getCandidates(env.DB, event.id)]);
  const slotStates = buildSlotStates(slots, resolutions, candidates);

  const unresolved = getUnresolvedPositions(slotStates);
  if (unresolved.length > 0) {
    await ctx.reply(t(lang, "verify.stillUnresolved", { positions: unresolved.join(", ") }));
    return;
  }

  const result = buildCombinations(slotStates);
  const finalCode = result.combinations[0]!.code;

  await closeEvent(env.DB, event.id);

  const [participants, trustMap] = await Promise.all([
    listParticipants(env.DB, event.id),
    getEventTrustMap(env.DB, event.id),
  ]);
  for (const p of participants) {
    if (trustMap.get(p.userId) === "troll") continue;
    const participantUser = await getUser(env.DB, p.userId);
    const participantLang = participantUser?.language ?? "en";
    const text = `${escapeHtml(t(participantLang, "verify.finalMessage", { name: event.name }))}\n<code>${escapeHtml(finalCode)}</code>`;
    await ctx.api.sendMessage(p.chatId, text, { parse_mode: "HTML" });
  }

  await ctx.reply(t(lang, "verify.closed"));
}

/**
 * `/verify <code>` lets the event's administrator paste the exact code
 * that was just confirmed correct at the game's redeem screen. Since
 * that string can only have been copied from one of the combinations
 * implied by the event's current reports (a resolved position
 * contributing its fixed value, an unresolved one each of its live
 * candidates), matching it against every such combination determines,
 * for every position at once, which reported value was the right one
 * — including positions with more than one candidate, which a
 * supporter-count ranking alone can't settle. A successful match
 * resolves every position accordingly and immediately closes the event
 * (see `closeVerifiedEvent` above and CLAUDE.md's "Conflict handling") —
 * this is the only way an event can be completed, precisely because it
 * requires the administrator to have actually tested the code in-game
 * rather than merely trusting reporter consensus.
 */
export async function handleVerify(ctx: Context, env: Env): Promise<void> {
  const user = await ensureUser(env.DB, ctx.from!.id, ctx.from!.language_code, ctx.from!.username);
  const participant = await getParticipant(env.DB, user.userId);
  const event = participant ? await getEventById(env.DB, participant.eventId) : null;

  if (!event) {
    await ctx.reply(t(user.language, "common.notInEvent"));
    return;
  }
  if (event.adminUserId !== user.userId) {
    await ctx.reply(t(user.language, "common.notAdmin"));
    return;
  }

  const code = String(ctx.match ?? "").trim();
  if (!code) {
    await ctx.reply(t(user.language, "verify.usage"));
    return;
  }

  const slots = parsePattern(event.pattern);
  const [resolutions, candidates] = await Promise.all([
    getResolutions(env.DB, event.id),
    getCandidates(env.DB, event.id),
  ]);
  const slotStates = buildSlotStates(slots, resolutions, candidates);

  const result = matchCode(slotStates, code);

  switch (result.status) {
    case "overwhelmed":
      await ctx.reply(t(user.language, "verify.overwhelmed"));
      return;
    case "noMatch":
      await ctx.reply(t(user.language, "verify.noMatch"));
      return;
    case "ambiguous":
      await ctx.reply(t(user.language, "verify.ambiguous"));
      return;
    case "match":
      break;
  }

  await Promise.all(
    result.resolutions!.map((r) =>
      setResolution(env.DB, { eventId: event.id, position: r.position, value: r.value, resolvedBy: user.userId })
    )
  );

  await ctx.reply(t(user.language, "verify.matched"));
  await closeVerifiedEvent(ctx, env, user.language, event);
}
