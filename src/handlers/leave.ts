import type { Context } from "grammy";
import type { Env } from "../env.js";
import { ensureUser } from "../session.js";
import { t, type SupportedLanguage } from "../i18n/index.js";
import { getParticipant, removeParticipant } from "../db/participants.js";
import { getEventById } from "../db/events.js";
import { runSuccession } from "../services/succession.js";
import type { IfsEvent } from "../domain/types.js";

/**
 * Handles the departing administrator's `/leave` on a still-active
 * event: see CLAUDE.md "Administrator succession" for the selection
 * rule. Removing the departing administrator's own participant row is
 * left to the caller, same as the plain-participant path below.
 */
async function handleAdminLeave(ctx: Context, env: Env, lang: SupportedLanguage, event: IfsEvent): Promise<void> {
  const outcome = await runSuccession(env.DB, ctx.api, event, event.adminUserId);
  await removeParticipant(env.DB, event.adminUserId);

  if (outcome.kind === "closedAbandoned") {
    await ctx.reply(t(lang, "leave.closedAbandoned", { name: event.name }));
  } else if (outcome.kind === "promoted") {
    const successorName = outcome.successorUsername ? `@${outcome.successorUsername}` : t(lang, "leave.anotherParticipant");
    await ctx.reply(t(lang, "leave.leftPromoted", { name: event.name, successor: successorName }));
  }
}

export async function handleLeave(ctx: Context, env: Env): Promise<void> {
  const user = await ensureUser(env.DB, ctx.from!.id, ctx.from!.language_code, ctx.from!.username);
  const participant = await getParticipant(env.DB, user.userId);

  if (!participant) {
    await ctx.reply(t(user.language, "leave.notInEvent"));
    return;
  }

  const event = await getEventById(env.DB, participant.eventId);
  if (event && event.status === "active" && event.adminUserId === user.userId) {
    await handleAdminLeave(ctx, env, user.language, event);
    return;
  }

  await removeParticipant(env.DB, user.userId);
  await ctx.reply(t(user.language, "leave.left", { name: event?.name ?? "?" }));
}
