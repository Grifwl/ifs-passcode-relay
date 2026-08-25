import { Hono } from "hono";
import { webhookCallback } from "grammy";
import type { Env } from "./env.js";
import { createBot } from "./bot.js";

const app = new Hono<{ Bindings: Env }>();

app.get("/", (c) => c.text("ifs-passcode-relay is running"));

app.post("/telegram/webhook", async (c) => {
  const bot = createBot(c.env);
  const handleUpdate = webhookCallback(bot, "hono", {
    secretToken: c.env.TELEGRAM_WEBHOOK_SECRET,
  });
  try {
    return await handleUpdate(c);
  } catch (err) {
    // grammY's `bot.catch()` only fires for long polling, never for
    // webhook mode (bot.handleUpdate() just rethrows a BotError) — this
    // try/catch is the actual place errors land here. BotError wraps
    // the full Context, whose .api carries the bot token in plain text,
    // so only ever log `.message` (a plain string), never the error
    // object itself: Hono's default error handling would otherwise
    // print it raw once rethrown. Still return 200 so Telegram doesn't
    // retry the same failing update forever.
    const message = err instanceof Error ? err.message : String(err);
    console.error(`Webhook update failed: ${message}`);
    return c.body(null, 200);
  }
});

export default app;
