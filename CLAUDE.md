# ifs-passcode-relay

Telegram bot that lets attendees of an *Ingress First Saturday* (IFS) event
collaboratively assemble a redeemable in-game passcode in real time, by
reporting the character they found at each position of a portal-derived
code.

This file documents project-specific architecture and conventions for
whoever (human or Claude) works on this codebase. Global conventions
(commit style, docstrings, Git Flow, etc.) live in the user's global
`CLAUDE.md` and always apply on top of what's written here.

## Domain context

Ingress First Saturday is a recurring in-person Ingress event. During it,
players are shown images of a set of portals; visiting each one in the
field and inspecting its media yields one character. Concatenating the
characters in the right order produces a passcode redeemable in the game
store for an IFS item pack.

Several IFS events can be running at the same time (different cities,
different dates), each with its own passcode. A Telegram user (an
"agent") can be actively contributing to at most one event at a time.

## Platform

- **Runtime**: Cloudflare Workers. No long-running process — Telegram
  delivers updates via **webhook**, not polling.
- **Bot framework**: [grammY](https://grammy.dev), using its Cloudflare
  Workers adapter (`webhookCallback(bot, "cloudflare-mod")`).
- **HTTP routing**: [Hono](https://hono.dev), minimal — the only real
  route is the webhook endpoint; a health-check route may be added.
- **Database**: Cloudflare D1 (managed SQLite), accessed through the `DB`
  binding declared in `wrangler.toml`. All state lives in D1 — a Worker
  invocation must not rely on in-memory state surviving between requests.
- **Domain**: a subdomain of `grifwl.blue` (exact subdomain TBD) is
  mapped to the Worker via a route in `wrangler.toml`.
- **Secrets**: `BOT_TOKEN` is set with `wrangler secret put BOT_TOKEN` in
  production; for local development it goes in `.dev.vars` (gitignored).

## Data model (D1)

- **`users`** — one row per Telegram user who has ever interacted with the
  bot, independent of event membership.
  `user_id` (PK, Telegram id), `language` (`en`|`ca`|`es`|`fr`),
  `created_at`.
- **`events`** — an IFS event.
  `id` (PK), `code` (unique short join code, e.g. `7KPQ2M`), `name`,
  `length` (number of positions in the passcode), `status`
  (`active`|`closed`), `created_by` (user id), `created_at`.
- **`participants`** — an agent currently attending exactly one event.
  Row is deleted on `/leave`, on `/kick`, or replaced when the agent joins
  a different event.
  `user_id` (PK), `event_id`, `chat_id`, `status_message_id` (id of the
  live-updating status message edited on every passcode change),
  `joined_at`.
- **`passcode_candidates`** — every distinct value ever reported for a
  position, kept (not overwritten) so that disagreements are visible
  instead of silently lost.
  `event_id`, `position`, `value`, `report_count`, `last_reported_by`,
  `last_reported_at`. Primary key: `(event_id, position, value)`.
- **`passcode_resolutions`** — the canonical value for a position, set
  explicitly by the event's creator once they're confident which
  candidate is correct. While a position has no resolution, all of its
  candidates are considered live and feed into the variant listing
  described below.
  `event_id`, `position`, `value`, `resolved_by`, `resolved_at`. Primary
  key: `(event_id, position)`.

## Conflict handling

Submissions are **never overwritten**: if two agents report different
values for the same position, both are kept as candidates. The passcode
is therefore not always a single string — it is the cross product of the
candidate sets of every unresolved position (resolved positions
contribute exactly one fixed character).

The event creator resolves a disagreement with `/resolve <position>
<value>`, which fixes that position's character and removes it from the
combinatorial expansion; `/unresolve <position>` reopens it. This command
doubles as the position-locking moderation tool — there is no separate
"lock" command, since resolving *is* locking.

Because the live status message (edited in place on every change, see
below) is required to list full candidate codes rather than a compact
per-position marker, the number of unresolved positions with more than
one candidate must be kept from exploding combinatorially in the
rendered message. Implementation must cap the number of rendered variants
(suggested cap: 16); beyond the cap, render a summary instead (event
progress + which positions are still in conflict) and prompt the creator
to `/resolve` some of them, rather than printing an unreadable wall of
codes.

## Live updates

When an agent joins an event, the bot sends them a status message and
stores its `message_id` in `participants.status_message_id`. Every time
the passcode state changes (a new candidate, a resolution), the bot edits
that same message for every current participant of the event instead of
sending a new message — this is what keeps the chat usable during an
hour-long event with dozens of reports.

## Internationalization

Every user has an independent, persistent language preference
(`users.language`), defaulting to their Telegram `language_code` when it
is one of the supported languages (`en`, `ca`, `es`, `fr`), else `en`.
`/language <code>` changes it. The change is **not retroactive**: already
sent messages are left as they were; only messages sent after the change
use the new language.

Bot text lives in a small translation catalog keyed by message id and
language, e.g. `t("event.created", lang, { code, length })`. Every
user-facing string must go through it — no hardcoded language in handler
code.

Event creation is special: the confirmation shown to the creator uses
their own language, but the **shareable join text** (meant to be pasted
into an external group chat) can be generated in a different language via
`/sharetext <code> [lang]`, defaulting to the caller's own language when
omitted. This is why share-text generation must be a separate, callable
operation, not just a side effect of `/newevent`.

## Command reference (developer-facing)

| Command | Who | Purpose |
|---|---|---|
| `/start`, `/help` | anyone | Onboarding / command list. |
| `/language <code>` | anyone | Set own interface language. |
| `/newevent <name> \| <length>` | anyone | Create an event, get its join code. |
| `/sharetext <code> [lang]` | anyone | (Re)generate the shareable join text. |
| `/join <code>` | anyone | Join an event (confirmation prompt if already in one). |
| `/leave` | participant | Leave the current event. |
| `/myevent` | anyone | Show current event/role. |
| `<position> <value>` or `/submit <position> <value>` | participant | Report a character. |
| `/status`, `/code` | participant | On-demand snapshot (progress + variants/conflicts). |
| `/resolve <position> <value>` | creator | Fix the canonical value for a position. |
| `/unresolve <position>` | creator | Reopen a resolved position. |
| `/kick <user>` | creator | Remove a participant from the event. |
| `/closeevent` | creator | Freeze the event and broadcast the final result. |
| `/events` | anyone | List events the caller created. |

## Conventions specific to this project

- TypeScript, strict mode. Module system matches whatever `wrangler`
  expects for Workers (ESM).
- All D1 access goes through a small repository module per table — no
  raw SQL scattered across command handlers.
- Command handlers stay thin: parse input, call the repository/service
  layer, call `t(...)` for output. Business logic (conflict expansion,
  variant capping, language fallback) lives in dedicated, unit-testable
  functions, not inline in handlers.
- D1 schema changes go through `wrangler d1 migrations` files under
  `migrations/`, never hand-edited against a live database.

## Status

Design phase complete. No application code has been written yet — see
`README.md` for the current project status and setup instructions once
they exist.
