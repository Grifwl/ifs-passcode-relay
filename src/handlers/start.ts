import type { Context } from "grammy";
import type { Env } from "../env.js";
import { ensureUser } from "../session.js";
import { t } from "../i18n/index.js";

export async function handleStart(ctx: Context, env: Env): Promise<void> {
  const user = await ensureUser(env.DB, ctx.from!.id, ctx.from!.language_code);
  await ctx.reply(t(user.language, "start.welcome"));
}
