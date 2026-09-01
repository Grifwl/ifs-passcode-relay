/**
 * Cloudflare Workers bindings and secrets available to every request, as
 * declared in `wrangler.toml` and via `wrangler secret put` / `.dev.vars`.
 */
export interface Env {
  DB: D1Database;
  BOT_TOKEN: string;
  TELEGRAM_WEBHOOK_SECRET: string;
  /** Login password for the private, read-only admin dashboard at /admin. */
  ADMIN_DASHBOARD_PASSWORD: string;
  /** Random key used to sign the admin dashboard's session cookie (see src/admin/auth.ts). */
  ADMIN_SESSION_SECRET: string;
}
