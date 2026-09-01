import { Hono } from "hono";
import { webhookCallback } from "grammy";
import type { Env } from "./env.js";
import { createBot } from "./bot.js";
import { renderLandingPage } from "./landing.js";
import { resolveLanguage } from "./domain/language.js";
import { adminApp } from "./admin/routes.js";

const app = new Hono<{ Bindings: Env }>();

app.route("/admin", adminApp);

app.get("/", (c) => {
  const preferred = c.req.header("Accept-Language")?.split(",")[0]?.trim();
  return c.html(renderLandingPage(resolveLanguage(preferred)));
});

// Browsers request this opportunistically; the actual favicon is
// logo.png (served as a static asset, see wrangler.toml's [assets]).
app.get("/favicon.ico", (c) => c.redirect("/logo.png", 302));

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
