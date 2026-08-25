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

## Passcode pattern

A passcode is not an arbitrary string of characters — it follows a
**pattern** made of typed slots:

- `X` — one letter (`A`-`Z`).
- `9` — one digit (`0`-`9`).
- `*` — one whole word, drawn from a growing vocabulary of known words
  (see below). Unlike `X`/`9`, a word slot's value is multiple
  characters, but it still occupies exactly **one position/slot** in the
  numbering used everywhere else in the bot (submissions, `/resolve`,
  etc.).

The default pattern is `XXX99*999XX`, which expands to 11 slots:

```
slot:   1  2  3  4  5  6       7  8  9  10 11
type:   X  X  X  9  9  *       9  9  9  X  X
```

Slot 6 is the whole word; slot 7 is the first digit *after* the word, not
the 7th character of the string. This slot-based numbering (not raw
character index) is what participants use when they report a value.

An event's creator can override the pattern at creation time
(`/newevent <name> | <pattern>`); it must be a non-empty string made only
of `X`, `9` and `*`. Validation of a *submitted value*'s type against its
slot is a soft check, not a hard block — see "Confirmation on conflicting
or pattern-breaking input" below, since the pattern itself might have
been configured wrong and the bot should not make it impossible to
recover from that.

### Known words

Word-slot values are matched case-insensitively against a global,
cross-event `known_words` table that starts empty and grows organically:
the first time a word is reported it is stored (uppercased) and reused
as a suggestion from then on; there is no closed vocabulary to maintain
by hand, though a seed list can be bulk-imported via a migration if one
is ever supplied.

## Data model (D1)

- **`users`** — one row per Telegram user who has ever interacted with the
  bot, independent of event membership.
  `user_id` (PK, Telegram id), `language` (`en`|`ca`|`es`|`fr`),
  `created_at`.
- **`events`** — an IFS event.
  `id` (PK), `code` (unique short join code, e.g. `7KPQ2M`), `name`,
  `pattern` (e.g. `XXX99*999XX`, see above), `status`
  (`active`|`closed`), `created_by` (user id), `created_at`.
- **`participants`** — an agent currently attending exactly one event.
  Row is deleted on `/leave`, on `/kick`, or replaced when the agent joins
  a different event.
  `user_id` (PK), `event_id`, `chat_id`, `status_message_id` (id of the
  live-updating status message edited on every passcode change),
  `joined_at`.
- **`passcode_reports`** — append-only log of every accepted submission
  (including deliberate duplicates created via the confirmation prompt,
  see below). This is the source of truth; everything else is derived
  from it.
  `id` (PK), `event_id`, `position` (slot index), `value`, `user_id`,
  `display_name_snapshot`, `created_at`.
- **`passcode_candidates`** — distinct values reported for a position,
  aggregated from `passcode_reports`, **excluding** reports from users
  currently flagged as `troll` for that event (see Trust below). Kept
  (never overwritten) so disagreements stay visible instead of being
  silently lost.
  `event_id`, `position`, `value`, `supporter_count` (distinct
  non-troll users who reported it), `last_reported_at`. Primary key:
  `(event_id, position, value)`. Recomputed from `passcode_reports`
  whenever a report is added or a user's trust status changes.
- **`passcode_resolutions`** — the canonical value for a position, set
  explicitly by the event's creator once they're confident which
  candidate is correct. While a position has no resolution, all of its
  candidates are considered live and feed into the variant listing
  described below.
  `event_id`, `position`, `value`, `resolved_by`, `resolved_at`. Primary
  key: `(event_id, position)`.
- **`event_trust`** — per-event trust flag on a participant, set by the
  event's creator (see Trust below).
  `event_id`, `user_id`, `status` (`trusted`|`troll`), `set_by`,
  `set_at`. Primary key: `(event_id, user_id)`. Not cleared by `/kick` —
  kicking stops future submissions, trust status independently controls
  whether past/future reports count in `passcode_candidates`.
- **`known_words`** — global vocabulary for `*` slots, shared across all
  events.
  `word` (PK, uppercased), `first_used_in_event_id`, `first_used_at`,
  `use_count`.

## Conflict handling

Submissions are **never overwritten**: if two agents report different
values for the same position, both are kept as candidates. The passcode
is therefore not always a single string — it is the cross product of the
candidate sets of every unresolved position (resolved positions
contribute exactly one fixed value).

The event creator resolves a disagreement with `/resolve <position>
<value>` (or `/resolve <position> @user`, using the value that
participant reported), which fixes that position's value and removes it
from the combinatorial expansion; `/unresolve <position>` reopens it.
This command doubles as the position-locking moderation tool — there is
no separate "lock" command, since resolving *is* locking.

Because the number of unresolved positions with more than one candidate
must be kept from exploding combinatorially in the rendered message,
implementation must cap the number of rendered variants (suggested cap:
16); beyond the cap, render a summary instead (event progress + which
positions are still in conflict) and prompt the creator to `/resolve`
some of them, rather than printing an unreadable wall of codes.

### Rendering combinations

Every distinct full-code combination (one value per slot, taken from
each position's candidates) is rendered in its own Telegram monospace
code block, so it can be tap-to-copied on mobile directly into the
in-game redeem screen — "fixed-size block" here means a consistent
monospaced format, not that every combination is padded to equal
character width (word slots vary in length). Each block is annotated
with the number of distinct supporters behind it; for the least-supported
combinations, the supporters' display names are also shown, so the
event's creator can spot a likely troll or a known-reliable agent and
act on it (see Trust below). Example shape:

```
ABC12CIPHER345XY
```
👥 5

```
ABC12CYPHER345XY
```
👥 1 — @suspicious_agent ⚠️

### Confirmation on conflicting or pattern-breaking input

A submission triggers a Sí/No inline-keyboard confirmation (via callback
query, not a stored "pending" row — the event id, position and value fit
directly in the button's `callback_data`) whenever either is true:

- **The position already has a different value** recorded (from anyone,
  including the same participant correcting themselves). Confirming adds
  the new value as an additional candidate — it does **not** replace the
  old one, since the pattern-7 rule below relies on being able to keep
  operating even on an event whose pattern was set up wrong.
- **The value's shape doesn't match its slot's expected type** (a digit
  where the pattern expects a letter, or vice versa). This is a soft
  check only: confirming still accepts the value as-is, in case the
  pattern itself is the thing that's wrong, not the report.

Declining (No) discards the submission entirely — nothing is written to
`passcode_reports`. Both conditions can apply to the same submission at
once; the confirmation message names whichever apply.

## Trust & moderation

The event's creator can mark a participant's trust status with
`/trust <user>` (trusted), `/troll <user>` (discard their contributions)
or `/untrust <user>` (back to neutral/default), writing `event_trust`.

- **`troll`** immediately recomputes `passcode_candidates`, excluding
  that user's reports from candidates and variant generation from that
  point on (and restoring them on `/untrust`). This is a pure exclusion,
  not a negative assertion: a troll's report is just left out of
  consideration, it does **not** mark the value they reported as wrong,
  since a troll can still happen to report a correct value by chance. A
  troll keeps their `participants` row (they are not implicitly kicked,
  see below) and can still technically send reports, but from the
  moment they're flagged: they stop being included in the live
  status-message broadcast (their own message is simply left un-edited
  from then on) and they are skipped when `/closeevent` pushes the final
  passcode to everyone — a troll gets neither further live updates nor
  the final result. `/untrust` reverses all of this (candidates,
  broadcasts) going forward, but does not retroactively resend broadcasts
  that were skipped while they were flagged.
  This status is scoped to a single `(event_id, user_id)` pair in
  `event_trust` — it never carries over to another event, past or
  future; the same agent starts neutral every time they join a
  different event, even one run by the same creator.
- **`trusted`** does **not** bulk-accept anything and must not trigger
  any automatic resolution. It is purely an advisory signal (surfaced in
  the candidate listing, see Rendering combinations) that this
  participant has generally been reliable — the creator still evaluates
  and resolves position by position, since the same trusted agent can be
  right about one position and wrong about another. Its only functional
  effect is convenience: `/resolve <position> @user` lets the creator
  point at a specific report instead of retyping its value, and is
  equally usable for any participant, trusted or not.

Trust status and event membership remain separate concerns: marking
someone `troll` silences broadcasts to them and discounts their reports,
but leaves their `participants` row in place, so they still occupy their
one-event-at-a-time slot until they `/leave` or the creator explicitly
`/kick`s them. `/kick <user>` is the only thing that actually removes
someone from `participants` (freeing their slot and blocking further
submissions, since submitting requires being a current participant) — a
creator who wants a troll gone entirely, not just silenced, calls both
commands.

## Live updates

When an agent joins an event, the bot sends them a status message and
stores its `message_id` in `participants.status_message_id`. Every time
the passcode state changes (a new candidate, a resolution), the bot edits
that same message for every current participant of the event **except
those currently flagged `troll`**, who are skipped entirely — this is
what keeps the chat usable during an hour-long event with dozens of
reports, and what makes a `troll` flag actually silence someone instead
of just being a note in a database.

This in-place edit is not a reliable way to make sure everyone actually
*sees* the final passcode, though: in a 1:1 chat, every report a
participant sends is itself a new outgoing message, which pushes the
bot's single edited status message further up their own scrollback each
time — an active participant can easily bury it without noticing. For
that reason, `/closeevent` sends a brand new message to every
participant instead of editing — again except anyone flagged `troll`,
who receives neither this nor any further live update.

## Internationalization

Every user has an independent, persistent language preference
(`users.language`), defaulting to their Telegram `language_code` when it
is one of the supported languages (`en`, `ca`, `es`, `fr`), else `en`.
`/language <code>` changes it. The change is **not retroactive**: already
sent messages are left as they were; only messages sent after the change
use the new language.

Bot text lives in a small translation catalog keyed by message id and
language, e.g. `t("event.created", lang, { code, pattern })`. Every
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
| `/newevent <name> [\| <pattern>]` | anyone | Create an event (default pattern `XXX99*999XX`), get its join code. |
| `/sharetext <code> [lang]` | anyone | (Re)generate the shareable join text. |
| `/join <code>` | anyone | Join an event (confirmation prompt if already in one). |
| `/leave` | participant | Leave the current event. |
| `/myevent` | anyone | Show current event/role. |
| `<position> <value>` or `/submit <position> <value>` | participant | Report a slot's value; may trigger a Sí/No confirmation (see Conflict handling). |
| `/status`, `/code` | participant | On-demand snapshot (progress + variant code blocks/conflicts). |
| `/resolve <position> <value \| @user>` | creator | Fix the canonical value for a position, optionally by pointing at who reported it. |
| `/unresolve <position>` | creator | Reopen a resolved position. |
| `/trust <user>` | creator | Flag a participant as trusted. |
| `/troll <user>` | creator | Discard a participant's contributions from candidates and stop sending them live/final updates, for this event only. |
| `/untrust <user>` | creator | Clear a participant's trust flag back to neutral. |
| `/kick <user>` | creator | Remove a participant from the event. |
| `/closeevent` | creator | Requires every position resolved; pushes a **new** message (not an edit) with the final passcode to every participant and freezes the event. |
| `/events` | anyone | List events the caller created. |

Letters and word slots are always **displayed uppercase**; input is
accepted in any case and normalized on the way in.

## Conventions specific to this project

- TypeScript, strict mode. Module system matches whatever `wrangler`
  expects for Workers (ESM).
- All D1 access goes through a small repository module per table — no
  raw SQL scattered across command handlers.
- Command handlers stay thin: parse input, call the repository/service
  layer, call `t(...)` for output. Business logic (pattern parsing,
  conflict expansion, variant capping, trust filtering, language
  fallback) lives in dedicated, unit-testable functions, not inline in
  handlers.
- D1 schema changes go through `wrangler d1 migrations` files under
  `migrations/`, never hand-edited against a live database.

## Status

Design phase complete. No application code has been written yet — see
`README.md` for the current project status and setup instructions once
they exist.
