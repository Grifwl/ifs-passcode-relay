import type { Context } from "grammy";
import type { Env } from "../env.js";
import { ensureUser } from "../session.js";
import { t } from "../i18n/index.js";
import { getParticipant, listParticipants } from "../db/participants.js";
import { getEventById, closeEvent } from "../db/events.js";
import { getCandidates, getResolutions, getEventTrustMap } from "../db/passcode.js";
import { getUser } from "../db/users.js";
import { parsePattern } from "../domain/pattern.js";
import { buildSlotStates, buildCombinations } from "../domain/passcode.js";
import { escapeHtml } from "../domain/html.js";

export async function handleCloseEvent(ctx: Context, env: Env): Promise<void> {
  const user = await ensureUser(env.DB, ctx.from!.id, ctx.from!.language_code, ctx.from!.username);
  const participant = await getParticipant(env.DB, user.userId);
  const event = participant ? await getEventById(env.DB, participant.eventId) : null;

  if (!event) {
    await ctx.reply(t(user.language, "common.notInEvent"));
    return;
  }
  if (event.createdBy !== user.userId) {
    await ctx.reply(t(user.language, "common.notCreator"));
    return;
  }

  const slots = parsePattern(event.pattern);
  const [resolutions, candidates] = await Promise.all([getResolutions(env.DB, event.id), getCandidates(env.DB, event.id)]);
  const slotStates = buildSlotStates(slots, resolutions, candidates);

  const unresolved = slotStates
    .filter((s) => s.resolvedValue === null && s.candidates.length !== 1)
    .map((s) => s.position);
  if (unresolved.length > 0) {
    await ctx.reply(t(user.language, "closeevent.unresolved", { positions: unresolved.join(", ") }));
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
    const lang = participantUser?.language ?? "en";
    const text = `${escapeHtml(t(lang, "closeevent.finalMessage", { name: event.name }))}\n<code>${escapeHtml(finalCode)}</code>`;
    await ctx.api.sendMessage(p.chatId, text, { parse_mode: "HTML" });
  }

  await ctx.reply(t(user.language, "closeevent.done"));
}
