import type { Context } from "grammy";
import type { Env } from "../env.js";
import { ensureUser } from "../session.js";
import { t } from "../i18n/index.js";
import { listEventsCreatedBy } from "../db/events.js";

export async function handleEvents(ctx: Context, env: Env): Promise<void> {
  const user = await ensureUser(env.DB, ctx.from!.id, ctx.from!.language_code, ctx.from!.username);
  const events = await listEventsCreatedBy(env.DB, user.userId);

  if (events.length === 0) {
    await ctx.reply(t(user.language, "events.none"));
    return;
  }

  const items = events.map((e) => t(user.language, "events.itemLine", { name: e.name, code: e.code, status: e.status })).join("\n");
  await ctx.reply(t(user.language, "events.list", { items }));
}
