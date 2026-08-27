import type { Context } from "grammy";
import type { Env } from "../env.js";
import { ensureUser } from "../session.js";
import { t } from "../i18n/index.js";
import { getParticipant } from "../db/participants.js";
import { getEventById } from "../db/events.js";
import { getCandidates, getResolutions, setResolution } from "../db/passcode.js";
import { parsePattern } from "../domain/pattern.js";
import { buildSlotStates, matchCode } from "../domain/passcode.js";
import { closeEventCore } from "./closeevent.js";

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
 * resolves every position accordingly and immediately closes the event,
 * the same way `/closeevent` itself would once nothing is left
 * unresolved, since a store-confirmed code leaves nothing further to
 * decide (see CLAUDE.md's "Conflict handling").
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
  await closeEventCore(ctx, env, user.language, event, (text) => ctx.reply(text));
}
