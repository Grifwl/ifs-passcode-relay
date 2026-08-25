import type { Context } from "grammy";
import type { Env } from "../env.js";
import { ensureUser } from "../session.js";
import { t, resolveLanguage } from "../i18n/index.js";
import { getEventByCode } from "../db/events.js";

export async function handleShareText(ctx: Context, env: Env): Promise<void> {
  const user = await ensureUser(env.DB, ctx.from!.id, ctx.from!.language_code);
  const parts = String(ctx.match ?? "").trim().split(/\s+/).filter(Boolean);
  const code = parts[0];

  if (!code) {
    await ctx.reply(t(user.language, "sharetext.usage"));
    return;
  }

  const lang = parts[1] ? resolveLanguage(parts[1]) : user.language;
  const event = await getEventByCode(env.DB, code);
  if (!event) {
    await ctx.reply(t(user.language, "common.eventNotFound"));
    return;
  }

  await ctx.reply(t(lang, "sharetext.text", { name: event.name, code: event.code }));
}
