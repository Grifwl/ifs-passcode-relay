import type { Env } from "../env.js";

/** Cookie name for the admin dashboard's session token. */
export const SESSION_COOKIE = "ifs_admin_session";

/** How long a login stays valid before the dashboard asks for the password again. */
export const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

async function hmacHex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return [...new Uint8Array(signature)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Constant-time comparison, safe here because both inputs are always
 * 64-character hex digests of a SHA-256 HMAC — the length check itself
 * leaks nothing input-dependent, unlike comparing raw, variable-length
 * secrets.
 */
function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/**
 * Checks a submitted password against `env.ADMIN_DASHBOARD_PASSWORD`.
 * Both sides are HMAC'd with the session secret before comparing, so the
 * comparison always runs over two fixed-length digests rather than the
 * raw passwords — this keeps a naive string comparison's early-exit
 * timing from leaking the real password's length.
 */
export async function verifyAdminPassword(env: Env, submitted: string): Promise<boolean> {
  const [a, b] = await Promise.all([
    hmacHex(env.ADMIN_SESSION_SECRET, submitted),
    hmacHex(env.ADMIN_SESSION_SECRET, env.ADMIN_DASHBOARD_PASSWORD),
  ]);
  return timingSafeEqualHex(a, b);
}

/** Creates a signed, time-limited session token for the admin dashboard cookie. */
export async function createSessionToken(env: Env): Promise<string> {
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const signature = await hmacHex(env.ADMIN_SESSION_SECRET, String(expiresAt));
  return `${expiresAt}.${signature}`;
}

/** Verifies a session token from the dashboard cookie: signature and expiry. */
export async function verifySessionToken(env: Env, token: string | undefined | null): Promise<boolean> {
  if (!token) return false;
  const [expiresAtStr, signature] = token.split(".");
  if (!expiresAtStr || !signature) return false;
  const expiresAt = Number(expiresAtStr);
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return false;
  const expected = await hmacHex(env.ADMIN_SESSION_SECRET, expiresAtStr);
  return timingSafeEqualHex(signature, expected);
}
