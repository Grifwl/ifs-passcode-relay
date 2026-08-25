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
  return handleUpdate(c);
});

export default app;
