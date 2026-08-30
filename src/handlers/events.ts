import type { Context } from "grammy";
import type { Env } from "../env.js";
import { ensureUser } from "../session.js";
import { t } from "../i18n/index.js";
import { listEventsParticipatedIn } from "../db/events.js";

export async function handleEvents(ctx: Context, env: Env): Promise<void> {
  const user = await ensureUser(env.DB, ctx.from!.id, ctx.from!.language_code, ctx.from!.username);
  const entries = await listEventsParticipatedIn(env.DB, user.userId);

  if (entries.length === 0) {
    await ctx.reply(t(user.language, "events.none"));
    return;
  }

  const items = entries
    .map((entry) =>
      t(user.language, "events.itemLine", {
        name: entry.event.name,
        code: entry.event.code,
        status: entry.event.status,
        reason: entry.event.closedReason,
        isCurrent: entry.isCurrent,
        isAdmin: entry.event.adminUserId === user.userId,
      })
    )
    .join("\n");
  await ctx.reply(t(user.language, "events.list", { items }));
}
