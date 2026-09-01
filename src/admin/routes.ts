import { Hono } from "hono";
import type { MiddlewareHandler } from "hono";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import type { Env } from "../env.js";
import { SESSION_COOKIE, SESSION_TTL_MS, createSessionToken, verifyAdminPassword, verifySessionToken } from "./auth.js";
import { fetchGlobalTables, fetchEventTables } from "./tables.js";
import { renderLoginPage, renderDashboardShell } from "./dashboardPage.js";

/** Rejects any request without a valid, unexpired session cookie. */
const requireAuth: MiddlewareHandler<{ Bindings: Env }> = async (c, next) => {
  const token = getCookie(c, SESSION_COOKIE);
  if (!(await verifySessionToken(c.env, token))) {
    if (c.req.path.startsWith("/admin/api/")) return c.json({ error: "unauthorized" }, 401);
    return c.redirect("/admin/login");
  }
  await next();
};

export const adminApp = new Hono<{ Bindings: Env }>();

adminApp.get("/login", (c) => c.html(renderLoginPage()));

adminApp.post("/login", async (c) => {
  const body = await c.req.parseBody();
  const password = typeof body.password === "string" ? body.password : "";
  const ok = password.length > 0 && (await verifyAdminPassword(c.env, password));
  if (!ok) {
    // A small fixed delay blunts naive brute-forcing without needing any
    // stored attempt-counting state, which a stateless Worker doesn't
    // have a good place to keep anyway.
    await new Promise((resolve) => setTimeout(resolve, 300));
    return c.html(renderLoginPage(true), 401);
  }

  const token = await createSessionToken(c.env);
  setCookie(c, SESSION_COOKIE, token, {
    httpOnly: true,
    // Only actually enforced over HTTPS, which is all production ever
    // is (the custom domain has no plain-HTTP route) — conditional so
    // the cookie still round-trips under `wrangler dev`'s plain-HTTP
    // localhost, which browsers refuse to send a Secure cookie back to.
    secure: new URL(c.req.url).protocol === "https:",
    sameSite: "Strict",
    path: "/admin",
    maxAge: SESSION_TTL_MS / 1000,
  });
  return c.redirect("/admin");
});

adminApp.post("/logout", (c) => {
  deleteCookie(c, SESSION_COOKIE, { path: "/admin" });
  return c.redirect("/admin/login");
});

adminApp.get("/", requireAuth, (c) => c.html(renderDashboardShell()));

adminApp.get("/api/data", requireAuth, async (c) => {
  const eventParam = c.req.query("event");
  const eventId = eventParam && /^\d+$/.test(eventParam) ? Number(eventParam) : null;

  const [global, eventTables] = await Promise.all([
    fetchGlobalTables(c.env.DB),
    eventId != null ? fetchEventTables(c.env.DB, eventId) : Promise.resolve(null),
  ]);

  return c.json({ global, eventTables, selectedEvent: eventId });
});

export default adminApp;
