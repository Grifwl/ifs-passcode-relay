import type { Context } from "grammy";
import type { Env } from "../env.js";
import { ensureUser } from "../session.js";
import { t } from "../i18n/index.js";
import { getParticipant, listParticipants } from "../db/participants.js";
import { getEventById } from "../db/events.js";
import { getUser } from "../db/users.js";

export async function handleCurrent(ctx: Context, env: Env): Promise<void> {
  const user = await ensureUser(env.DB, ctx.from!.id, ctx.from!.language_code, ctx.from!.username);
  const participant = await getParticipant(env.DB, user.userId);
  const event = participant ? await getEventById(env.DB, participant.eventId) : null;

  if (!event) {
    await ctx.reply(t(user.language, "current.notInEvent"));
    return;
  }

  const [participants, admin] = await Promise.all([
    listParticipants(env.DB, event.id),
    getUser(env.DB, event.adminUserId),
  ]);

  const isAdmin = event.adminUserId === user.userId;
  const adminName = admin?.username ? `@${admin.username}` : t(user.language, "current.adminNoUsername");
  const adminDisplay = adminName + (isAdmin ? t(user.language, "current.you") : "");

  await ctx.reply(
    t(user.language, "current.info", {
      name: event.name,
      code: event.code,
      pattern: event.pattern,
      participantCount: participants.length,
      admin: adminDisplay,
    })
  );
}
