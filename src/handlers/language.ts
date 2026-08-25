import type { Context } from "grammy";
import type { Env } from "../env.js";
import { ensureUser } from "../session.js";
import { t, SUPPORTED_LANGUAGES, type SupportedLanguage } from "../i18n/index.js";
import { setUserLanguage } from "../db/users.js";

function isSupportedLanguage(code: string): code is SupportedLanguage {
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(code);
}

export async function handleLanguage(ctx: Context, env: Env): Promise<void> {
  const user = await ensureUser(env.DB, ctx.from!.id, ctx.from!.language_code, ctx.from!.username);
  const arg = String(ctx.match ?? "").trim().toLowerCase();

  if (!arg) {
    await ctx.reply(t(user.language, "language.usage"));
    return;
  }
  if (!isSupportedLanguage(arg)) {
    await ctx.reply(t(user.language, "language.invalid", { code: arg }));
    return;
  }

  await setUserLanguage(env.DB, user.userId, arg);
  await ctx.reply(t(arg, "language.set"));
}
