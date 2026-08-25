/**
 * Cloudflare Workers bindings and secrets available to every request, as
 * declared in `wrangler.toml` and via `wrangler secret put` / `.dev.vars`.
 */
export interface Env {
  DB: D1Database;
  BOT_TOKEN: string;
  TELEGRAM_WEBHOOK_SECRET: string;
}
