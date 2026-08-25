import { Bot } from "grammy";
import type { Env } from "./env.js";
import { handleStart } from "./handlers/start.js";
import { handleHelp } from "./handlers/help.js";
import { handleLanguage } from "./handlers/language.js";
import { handleNewEvent } from "./handlers/newevent.js";
import { handleShareText } from "./handlers/sharetext.js";
import { handleJoin, handleJoinCallback } from "./handlers/join.js";
import { handleLeave } from "./handlers/leave.js";
import { handleMyEvent } from "./handlers/myevent.js";

/**
 * Builds a fresh Bot instance bound to this request's environment.
 * Cheap enough to construct per request; Workers has no long-lived
 * process to cache it in between invocations anyway.
 */
export function createBot(env: Env): Bot {
  const bot = new Bot(env.BOT_TOKEN);

  // Log only a sanitized summary, never the raw BotError: grammY's error
  // object embeds the full Context, and Context.api holds the bot token
  // in plain text — dumping it (e.g. `console.error(err)`) would leak
  // the token into Worker logs.
  bot.catch((err) => {
    const message = err.error instanceof Error ? err.error.message : String(err.error);
    console.error(`Unhandled bot error (update ${err.ctx.update.update_id}): ${message}`);
  });

  bot.command("start", (ctx) => handleStart(ctx, env));
  bot.command("help", (ctx) => handleHelp(ctx, env));
  bot.command("language", (ctx) => handleLanguage(ctx, env));
  bot.command("newevent", (ctx) => handleNewEvent(ctx, env));
  bot.command("sharetext", (ctx) => handleShareText(ctx, env));
  bot.command("join", (ctx) => handleJoin(ctx, env));
  bot.command("leave", (ctx) => handleLeave(ctx, env));
  bot.command("myevent", (ctx) => handleMyEvent(ctx, env));

  bot.on("callback_query:data", (ctx) => {
    if (ctx.callbackQuery.data.startsWith("join:")) return handleJoinCallback(ctx, env);
    return ctx.answerCallbackQuery();
  });

  return bot;
}
