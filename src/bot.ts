import { Bot } from "grammy";
import type { Env } from "./env.js";
import { handleStart } from "./handlers/start.js";
import { handleHelp } from "./handlers/help.js";
import { handleLanguage } from "./handlers/language.js";
import { handleNewEvent } from "./handlers/newevent.js";
import { handleShareText, handleShareTextCallback } from "./handlers/sharetext.js";
import { handleJoin, handleJoinCallback } from "./handlers/join.js";
import { handleLeave } from "./handlers/leave.js";
import { handleMyEvent } from "./handlers/myevent.js";
import { handleSubmit, handleSubmitCallback } from "./handlers/submit.js";
import { handleStatus } from "./handlers/status.js";
import { handleResolve, handleResolveCallback } from "./handlers/resolve.js";
import { handleUnresolve } from "./handlers/unresolve.js";
import { handleTrust, handleTroll, handleUntrust } from "./handlers/trust.js";
import { handleKick } from "./handlers/kick.js";
import { handlePromote } from "./handlers/promote.js";
import { handleVerify } from "./handlers/verify.js";
import { handleEvents } from "./handlers/events.js";
import { handleClaim, handleClaimCallback } from "./handlers/claim.js";
import { touchParticipantActivity } from "./db/participants.js";

/**
 * Builds a fresh Bot instance bound to this request's environment.
 * Cheap enough to construct per request; Workers has no long-lived
 * process to cache it in between invocations anyway.
 */
export function createBot(env: Env): Bot {
  const bot = new Bot(env.BOT_TOKEN);

  // No bot.catch() here: it only ever fires for long polling (see
  // bot.handleUpdates in grammY's source) and is silently a no-op for
  // webhook mode, which is what this project uses. The real error
  // handling — sanitized logging, so the bot token embedded in
  // BotError.ctx.api never gets dumped raw — lives in src/index.ts's
  // webhook route instead, since that's where handleUpdate()'s
  // rejection actually surfaces.

  // Runs for every update — a command, a plain-text report, or a
  // button tap alike — before any routing below, so /claim's
  // inactivity check always sees a participant's most recent
  // interaction of any kind, not just their commands (see CLAUDE.md
  // "Administrator succession").
  bot.use(async (ctx, next) => {
    if (ctx.from) await touchParticipantActivity(env.DB, ctx.from.id);
    await next();
  });

  bot.command("start", (ctx) => handleStart(ctx, env));
  bot.command("help", (ctx) => handleHelp(ctx, env));
  bot.command("language", (ctx) => handleLanguage(ctx, env));
  bot.command("newevent", (ctx) => handleNewEvent(ctx, env));
  bot.command("sharetext", (ctx) => handleShareText(ctx, env));
  bot.command("join", (ctx) => handleJoin(ctx, env));
  bot.command("leave", (ctx) => handleLeave(ctx, env));
  bot.command("myevent", (ctx) => handleMyEvent(ctx, env));
  bot.command("submit", (ctx) => handleSubmit(ctx, env, String(ctx.match ?? "")));
  bot.command("status", (ctx) => handleStatus(ctx, env));
  bot.command("resolve", (ctx) => handleResolve(ctx, env));
  bot.command("unresolve", (ctx) => handleUnresolve(ctx, env));
  bot.command("trust", (ctx) => handleTrust(ctx, env));
  bot.command("troll", (ctx) => handleTroll(ctx, env));
  bot.command("untrust", (ctx) => handleUntrust(ctx, env));
  bot.command("kick", (ctx) => handleKick(ctx, env));
  bot.command("promote", (ctx) => handlePromote(ctx, env));
  bot.command("verify", (ctx) => handleVerify(ctx, env));
  bot.command("events", (ctx) => handleEvents(ctx, env));
  bot.command("claim", (ctx) => handleClaim(ctx, env));

  // Plain-text "<position> <value>" submissions, for players who'd
  // rather not type /submit every time. Registered after every
  // bot.command(...) above, so it only sees text that didn't match one
  // of them (see domain/submitParser.ts for what counts as a match).
  bot.on("message:text", (ctx) => handleSubmit(ctx, env, ctx.message.text));

  bot.on("callback_query:data", (ctx) => {
    const data = ctx.callbackQuery.data;
    if (data.startsWith("join:")) return handleJoinCallback(ctx, env);
    if (data.startsWith("submit:")) return handleSubmitCallback(ctx, env);
    if (data.startsWith("sharetext:")) return handleShareTextCallback(ctx, env);
    if (data.startsWith("resolve:") || data.startsWith("resolveall:")) return handleResolveCallback(ctx, env);
    if (data.startsWith("claimresolve:")) return handleClaimCallback(ctx, env);
    return ctx.answerCallbackQuery();
  });

  return bot;
}
