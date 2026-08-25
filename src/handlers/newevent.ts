import type { Context } from "grammy";
import type { Env } from "../env.js";
import { ensureUser } from "../session.js";
import { t } from "../i18n/index.js";
import { createEvent } from "../db/events.js";
import { DEFAULT_PATTERN, isValidPattern } from "../domain/pattern.js";

export async function handleNewEvent(ctx: Context, env: Env): Promise<void> {
  const user = await ensureUser(env.DB, ctx.from!.id, ctx.from!.language_code, ctx.from!.username);
  const raw = String(ctx.match ?? "").trim();

  if (!raw) {
    await ctx.reply(t(user.language, "newevent.usage", { defaultPattern: DEFAULT_PATTERN }));
    return;
  }

  const parts = raw.split("|");
  const name = (parts[0] ?? "").trim();
  const patternArg = parts[1]?.trim();
  const pattern = patternArg ? patternArg.toUpperCase() : DEFAULT_PATTERN;

  if (!name) {
    await ctx.reply(t(user.language, "newevent.usage", { defaultPattern: DEFAULT_PATTERN }));
    return;
  }
  if (!isValidPattern(pattern)) {
    await ctx.reply(t(user.language, "newevent.invalidPattern"));
    return;
  }

  const event = await createEvent(env.DB, { name, pattern, createdBy: user.userId });
  await ctx.reply(
    t(user.language, "newevent.created", { name: event.name, code: event.code, pattern: event.pattern })
  );
}
