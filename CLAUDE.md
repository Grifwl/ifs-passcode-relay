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
- **HTTP routing**: [Hono](https://hono.dev). `POST /telegram/webhook` is
  the bot; `GET /` serves the public landing page (`src/landing.ts`),
  language-negotiated from the `Accept-Language` header via the same
  `resolveLanguage()` used for Telegram users; `GET /favicon.ico`
  redirects to `/logo.png`.
- **Static assets**: `public/` (currently just `logo.png`, used as the
  landing page's header image and favicon) is served directly by
  Cloudflare via `wrangler.toml`'s `[assets]` block — any request whose
  path matches a file there never reaches the Worker's `fetch` handler
  at all, so routes like `/` stay fully dynamic.
- **Database**: Cloudflare D1 (managed SQLite), accessed through the `DB`
  binding declared in `wrangler.toml`. All state lives in D1 — a Worker
  invocation must not rely on in-memory state surviving between requests.
- **Domain**: `ifspasscoderelay.grifwl.blue`, mapped to the Worker as a
  Custom Domain declared directly in `wrangler.toml`'s `routes`
  (`custom_domain = true`). Since the `grifwl.blue` zone is on the same
  Cloudflare account used to deploy, `wrangler deploy` provisions the
  DNS record and certificate on its own — no dashboard step needed.
- **Command list**: registered from application code via the Bot API's
  `setMyCommands` (grammY exposes this as `bot.api.setMyCommands(...)`),
  not through BotFather's `/setcommands` — call it once on startup/deploy
  so it can never drift from what the handlers actually implement.
- **Secrets**: `BOT_TOKEN` is set with `wrangler secret put BOT_TOKEN` in
  production; for local development it goes in `.dev.vars` (gitignored).
- **Webhook verification**: `setWebhook` is called with a random
  `secret_token`, also stored as the `TELEGRAM_WEBHOOK_SECRET` secret.
  Telegram echoes it back on every update as the
  `X-Telegram-Bot-Api-Secret-Token` header; the webhook handler must
  reject any request where it doesn't match before doing anything else,
  since the endpoint is otherwise a public, unauthenticated URL. See
  `README.md`'s setup guide for the exact commands.

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
  (`active`|`closed`), `created_by` (user id), `created_at`. Only `code`
  is unique — `name` is not, so running `/newevent` twice with the exact
  same name is expected to succeed and simply produces two independent
  events with two different join codes, not a conflict. Since the name
  is the only thing participants see when deciding which code to join,
  it should be specific enough to tell same-named IFS events apart —
  e.g. include the event's year and month, as in `Barcelona 2026-08`
  rather than a bare `Barcelona` that collides with every other
  Barcelona IFS ever run.
- **`participants`** — an agent currently attending exactly one event.
  Row is deleted on `/leave`, on `/kick`, or replaced when the agent joins
  a different event.
  `user_id` (PK), `event_id`, `chat_id`, `status_message_id` (id of the
  live-updating status message edited on every passcode change),
  `joined_at`.
- **`passcode_reports`** — log of every accepted submission (including
  deliberate duplicates from two different agents disagreeing, created
  via the confirmation prompt below), append-only with exactly one
  exception: a user's own prior row at a position is deleted when they
  later correct that same position (see "Self-correction vs.
  disagreeing with someone else"). This is the source of truth;
  everything else is derived from it.
  `id` (PK), `event_id`, `position` (slot index), `value`, `user_id`,
  `display_name_snapshot`, `created_at`.
- **`passcode_candidates`** — a **SQL view**, not a stored table: distinct
  values reported for a position, aggregated live from
  `passcode_reports`, **excluding** reports from users currently flagged
  `troll` for that event (see Trust below). Computed on every read rather
  than maintained incrementally on write, since report volumes are small
  enough that this can't meaningfully cost anything, and it removes an
  entire class of bugs where a maintained aggregate silently drifts from
  its source of truth.
  Columns: `event_id`, `position`, `value`, `supporter_count` (distinct
  non-troll users who reported it), `trusted_count` (of those, how many
  are flagged `trusted` for the event), `last_reported_at`.
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

Calling `/resolve <position>` with no value or `@user` instead lists
that position's current candidates (from `passcode_candidates`) with
each one's supporter count, ordered most- to least-supported, and
attaches one inline button per candidate in that same order so the
creator can resolve with a tap instead of retyping the value. If the
position has no candidates yet, the bot says so and shows no buttons.
Alongside the total supporter count, a candidate whose supporters
include at least one participant flagged `trusted` for the event also
shows how many of them are trusted (e.g. `5 (2)` for 5 total
supporters, 2 of them trusted) — both in the listing text and on the
button label — so the creator can weigh a value backed by trusted
agents over an equally-supported one that isn't, without having to
cross-reference `/trust` status by hand. This is `/trust`'s only
functional effect on `/resolve` beyond the `@user` convenience already
described above; it never causes automatic resolution.
Since `passcode_candidates` doesn't take resolution status into
account, this also works on an already-resolved position, letting the
creator switch it to a different reported value without an
`/unresolve` round-trip first. The button's `callback_data` carries the
event id, position and value directly (`resolve:<eventId>:<position>:
<value>`, mirroring `/submit`'s confirmation buttons) and re-checks
that the tapper is still the event's creator before acting, since the
button persists in the chat after being sent.

Calling `/resolve` with **no arguments at all** starts a walkthrough of
every position genuinely in disagreement — unresolved *and* with more
than one live candidate, not merely unfilled (see
`domain/passcode.ts`'s `getConflictingPositions`). It sends the same
candidate-listing message as `/resolve <position>` for the first such
position (lowest position number first), but with its buttons tagged
`resolveall:<eventId>:<position>:<value>` instead of `resolve:...`.
Resolving via one of those buttons immediately sends the next
position still in disagreement the same way, and so on, until none are
left, at which point the bot says so instead of sending another
candidate listing. There is no stored "which position are we up to"
state for this — each step recomputes the current conflict list from
D1 from scratch, so it stays correct even if new reports arrive
mid-walkthrough (a position resolved this way, or newly reported into
by someone else, simply won't reappear in the next recomputation). If
there is nothing in disagreement when `/resolve` is run bare, it says
so immediately instead of listing anything.

Whenever that "nothing in disagreement" message is the one shown —
either immediately, because `/resolve` found no conflicts to begin
with, or as the last step of a walkthrough that just resolved the
final one — the bot additionally checks whether the event is fully
ready to close: every position resolved, or reduced to exactly one
live candidate (the same condition `/closeevent` itself enforces, see
`domain/passcode.ts`'s `getUnresolvedPositions`). If so, the message
carries one extra inline button that closes the event right there,
running the exact same logic as `/closeevent` (see
`handlers/closeevent.ts`'s shared core, invoked from both the command
and this button's callback, tagged `closeevent:<eventId>`). This is a
convenience only — it changes nothing about when a position counts as
resolved or how `/closeevent` itself behaves when run as a command.

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
ABC12GLYPH345XY
```
👥 5

```
ABC12GLIPH345XY
```
👥 1 — @suspicious_agent ⚠️

### Self-correction vs. disagreeing with someone else

Before anything else, a submission is checked against **that same
user's own** most recent report at that position, if any:

- If it's identical, it's a no-op (nothing written, a short
  acknowledgement is enough).
- If it **differs**, this is treated as the agent fixing their own
  mistake, not a new disagreement: no confirmation is needed for this
  reason, their previous report(s) at that position are **deleted**, and
  the new value is inserted in their place. `passcode_reports` is
  therefore append-only with exactly one exception — a user's own prior
  row at a position is removed when they later correct that same
  position.
  If their old value was the only thing keeping that position in
  disagreement (e.g. they were the sole supporter of a minority
  candidate), the disagreement disappears immediately as a side effect —
  the event's creator does **not** need to `/resolve` it.
  The acknowledgement for a self-correction names **both** the new value
  and the one it replaced, so an agent who corrects the wrong position by
  mistake can immediately undo it by resubmitting the previous value
  shown back to them, without having to remember it themselves.

Only once this self-correction case doesn't apply (i.e. the user has no
prior report at that position, or is resubmitting the same value someone
*else* already reported) do the confirmation rules below kick in.

### Removing your own report

Sending just a position with **no value** — either the bare
`<position>` shorthand or `/submit <position>` with nothing after it —
removes the caller's own most recent report at that position, if one
exists, instead of recording anything. This covers two situations a
plain resubmission can't: reporting to the wrong position by mistake
(the fix above already lets you overwrite a position you *did* mean to
report to, but not un-report one you didn't), and simply not knowing a
position's value yet and wanting it to stop showing your guess as a
candidate.

The removal is unconditional — no Sí/No confirmation, unlike the
conflict/type-mismatch cases above — since it only ever touches the
caller's own report. The acknowledgement names the value that was
removed, the same way a self-correction's acknowledgement names the
value it replaced, so removing the wrong position by mistake is itself
undoable by resubmitting that value. If the caller has no report at that
position, the bot says so instead. Removing a report from an already
**resolved** position doesn't touch the resolution — resolutions and
reports are independent, so the position stays resolved to whatever
`/resolve` last set, and other participants' own reports there, if any,
are unaffected.

### Confirmation on conflicting or pattern-breaking input

A submission triggers a Sí/No inline-keyboard confirmation (via callback
query, not a stored "pending" row — the event id, position and value fit
directly in the button's `callback_data`) whenever either is true:

- **The position already has a different value reported by someone
  else.** Confirming adds the new value as an additional candidate — it
  does **not** replace the other person's, since resolving a genuine
  disagreement between two different agents is the event creator's call
  via `/resolve`, not something either agent can override unilaterally
  the way a self-correction can.
- **The value's shape doesn't match its slot's expected type** (a digit
  where the pattern expects a letter, or vice versa). This is a soft
  check only: confirming still accepts the value as-is, in case the
  pattern itself is the thing that's wrong, not the report. This check
  applies regardless of whether the submission is a self-correction.

Declining (No) discards the submission entirely — nothing is written to
`passcode_reports`. Both conditions can apply to the same submission at
once; the confirmation message names whichever apply.

## Trust & moderation

The event's creator can mark a participant's trust status with
`/trust <user>` (trusted), `/troll <user>` (discard their contributions)
or `/untrust <user>` (back to neutral/default), writing `event_trust`.

- **`troll`** excludes that user's reports from `passcode_candidates` and
  variant generation immediately, since the view reads `event_trust` live
  on every query (and restores them just as immediately on `/untrust`).
  This is a pure exclusion,
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
  different event, even one run by the same creator, with one
  exception: the creator of an event is automatically marked `trusted`
  for that event of their own, by `/newevent` itself (see
  Internationalization's "Event creation is special").
- **`trusted`** does **not** bulk-accept anything and must not trigger
  any automatic resolution. It is purely an advisory signal (surfaced in
  the candidate listing, see Rendering combinations, and in `/resolve`'s
  candidate listing, see Conflict handling) that this participant has
  generally been reliable — the creator still evaluates and resolves
  position by position, since the same trusted agent can be right about
  one position and wrong about another. Its functional effects are: (1)
  `/resolve <position> @user` lets the creator point at a specific
  report instead of retyping its value, equally usable for any
  participant, trusted or not; and (2) `/resolve`'s candidate listing
  additionally breaks down each candidate's supporter count by how many
  of them are trusted, letting the creator weigh trusted backing when
  two candidates are otherwise equally supported.

Trust status and event membership remain separate concerns: marking
someone `troll` silences broadcasts to them and discounts their reports,
but leaves their `participants` row in place, so they still occupy their
one-event-at-a-time slot until they `/leave` or the creator explicitly
`/kick`s them. `/kick <user>` is the only thing that actually removes
someone from `participants` (freeing their slot and blocking further
submissions, since submitting requires being a current participant) — a
creator who wants a troll gone entirely, not just silenced, calls both
commands.

## Creator succession

An event has exactly one creator at a time (`events.created_by`), and
only that person can run any of the creator-only commands above, plus
`/resolve`, `/unresolve` and `/closeevent`. `/promote <user>` transfers
this role outright: the target must already be a participant of the
same event, becomes the new `created_by`, and is marked `trusted` for
the event exactly as `/newevent` marks its own creator (see Trust &
moderation) — the same reasoning applies, since whoever the previous
creator hands the role to is, by that act, someone they trust enough to
run the event. The previous creator's own trust flag is left untouched
either way, and they remain a participant like anyone else; nothing
about `/promote` requires them to also `/leave`. There is no
confirmation prompt, unlike `/submit`'s Sí/No flow — the action is
reversible in practice, since the new creator can simply `/promote` the
role back. Both the old and new creator are notified: the caller gets a
direct reply, and the newly promoted user gets a separate message
naming the event, sent to their own chat, in their own language.

This is the first of three planned tools for keeping an event
recoverable even if its creator becomes unavailable — `/promote` lets a
creator hand off deliberately before stepping away. Still to design:
what happens when the creator runs `/leave` without having promoted
anyone first, and how another participant can claim the role if the
creator goes silent instead of leaving outright.

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

A participant can pull the live view back down themselves at any time
by running `/status` (or `/code`): rather than sending a disconnected,
one-off snapshot, it sends a brand new message and re-points
`participants.status_message_id` at it, so every future live update
edits *that* message from then on. The old message is left as it was
(now just a stale snapshot) and stops being touched. This is what makes
`/status` useful mid-event even for someone who already has a live
status message — it doesn't just show the state, it relocates where
future updates land.

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

Event creation is special: right after creating the event and *before*
auto-joining the creator to it, `/newevent` automatically sends the
**shareable join text** (meant to be pasted into an external group chat)
in the creator's own language. That automatic message always names the
code explicitly, since at that point the creator isn't a participant
yet. `/newevent` also marks the creator `trusted` for the event it just
created, as if they had run `/trust` on themselves — the same person
everyone else already trusts enough to organize the event starts out
with their reports counted as trusted in `/resolve`'s candidate
listing, with no separate step required.

The share text can be regenerated later, in a different language,
via `/sharetext [code] [lang]` — `[lang]` defaults to the caller's own
language, and `[code]` defaults to the caller's *current* event once
they have one (a bare `/sharetext` or `/sharetext <lang>` both resolve
the code that way). This is why share-text rendering
(`domain/shareText.ts`) is a separate, callable operation, not just a
side effect baked into `/newevent`'s handler — `/newevent` calls the
same functions `/sharetext` does.

The share text is actually sent as **two separate messages**, both from
`/sharetext` and from `/newevent`'s automatic copy: the shareable block
itself (bot mention + `/join` code, followed by an italicized hint on
tapping the code to copy it and then tapping the bot's name to send
it), meant to be forwarded or pasted as-is, followed by a second,
italicized note message. Keeping the language note in its own message
means it doesn't tag along if the first message is forwarded on its
own — it's for whoever ran the command, not for whoever they share the
invite with.

The note message carries an inline keyboard with one button per
supported language other than the one it's currently written in, all
on a single row and each labelled with the bare two-letter ISO code
(`EN`, `CA`, `ES`, `FR`) rather than the full language name, so the
keyboard stays compact on a phone screen. This exists because typing
out `/sharetext <lang>` is easy on desktop, where Tab-completing a
suggested command just fills the input box, but
awkward on mobile, where tapping a suggested command sends it
immediately with no room left to add a parameter — a real problem for
an outdoor, phone-only event like IFS. Tapping a button re-sends the
whole invite (shareable block + a fresh note, now excluding that
language) via the same `sendShareText` function `/sharetext` and
`/newevent` already call, in the picked language. The event id travels
directly in the button's `callback_data` (see the `/submit` confirmation
buttons above for the same convention) rather than being resolved from
the tapper's *current* event, so a language switch always regenerates
the invite for the event the tapped note was actually about — even if
the tapper has since left it or joined another one.

A participant who joins via a plain `/join <code>` doesn't get the
share text automatically the way the creator does — they get a lighter
nudge instead, right after joining, pointing them at `/sharetext` (with
no code and no language mentioned) in case they want to help spread the
word too.

## Command reference (developer-facing)

| Command | Who | Purpose |
|---|---|---|
| `/start`, `/help` | anyone | Onboarding / command list. |
| `/language <code>` | anyone | Set own interface language. |
| `/newevent <name> [\| <pattern>]` | anyone | Create an event (default pattern `XXX99*999XX`); auto-sends the shareable join text, then joins the creator and marks them trusted. |
| `/sharetext [code] [lang]` | anyone | (Re)generate the shareable join text — `code` defaults to your current event, `lang` to your own. |
| `/join <code>` | anyone | Join an event (confirmation prompt if already in one). |
| `/leave` | participant | Leave the current event. |
| `/myevent` | anyone | Show current event/role. |
| `<position> <value>` or `/submit <position> <value>` | participant | Report a slot's value; may trigger a Sí/No confirmation (see Conflict handling). |
| `<position>` alone or `/submit <position>` (no value) | participant | Remove your own report at that position, if any; no confirmation, the response names the value removed. |
| `/status`, `/code` | participant | On-demand snapshot (progress + variant code blocks/conflicts); also relocates the live-update target to this new message. |
| `/resolve <position> [<value \| @user>]` | creator | Fix the canonical value for a position, optionally by pointing at who reported it; with no value, lists current candidates as tap-to-resolve buttons. |
| `/resolve` (no arguments) | creator | Walk through every position still in disagreement, one at a time, resolving each via its buttons before moving to the next; once none are left, offers a button to close the event if every position also has a settled value. |
| `/unresolve <position>` | creator | Reopen a resolved position. |
| `/trust <user>` | creator | Flag a participant as trusted. |
| `/troll <user>` | creator | Discard a participant's contributions from candidates and stop sending them live/final updates, for this event only. |
| `/untrust <user>` | creator | Clear a participant's trust flag back to neutral. |
| `/kick <user>` | creator | Remove a participant from the event. |
| `/promote <user>` | creator | Hand the creator role to another participant, who must already be in the event; marks them trusted the same way `/newevent` does for its own creator. |
| `/closeevent` | creator | Requires every position to be unambiguous (resolved, or with exactly one live candidate — not blank, not still conflicting); pushes a **new** message (not an edit) with the final passcode to every participant and freezes the event. |
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
- Never log a raw grammY `BotError` or `Context` (e.g. `console.error(err)`):
  `Context.api` carries the bot token in plain text, so dumping the
  whole object leaks it into Worker logs. Log a sanitized summary
  instead — just `err.message` (a plain string), never the error object
  itself. Note `bot.catch(...)` is **not** the place to do this: it only
  fires for long polling (see `Bot.handleUpdates` vs. `Bot.handleUpdate`
  in grammY's source) and is silently inert in webhook mode. For a
  webhook-based bot like this one, wrap the call to the
  `webhookCallback(...)`-produced handler in `src/index.ts`'s route in a
  try/catch instead — that's where `handleUpdate()`'s rejection actually
  surfaces — and still return 200 from the catch branch so Telegram
  doesn't retry the same failing update forever.
- D1 schema changes go through `wrangler d1 migrations` files under
  `migrations/`, never hand-edited against a live database.
- `scripts/reset-db.sql` (`npm run db:reset:local` / `:remote`) wipes
  every table for manual testing before real events exist; keep this
  only usable pre-launch, not as a general-purpose prod reset tool.
  `scripts/seed-fake-data.sql` (`npm run db:seed:local` / `:remote`)
  inserts a `TESTER` event with fake reports (including a few
  disagreeing positions) so a real account can `/join TESTER` and see
  `/status` render discrepancies solo. Its fake users (negative ids)
  deliberately get no `participants` row — see the script's own comment
  for why a fake `chat_id` there would break real participants' live
  updates.
- **Any change to the bot's user-facing behavior** — a new command, a
  changed command signature, a changed flow, a changed rule around
  confirmations/trust/resolution/etc. — must be reflected in the same
  change: every README (`README.md`, `README.ca.md`, `README.es.md`,
  `README.fr.md`) **and** the landing page (`src/landing.ts`). None of
  these are optional follow-ups; a behavior change isn't done until all
  of them agree with the code.

## Status

Deployed and live at `@ifs_relay_bot`, running on the
`ifspasscoderelay.grifwl.blue` Worker described above. Every command in
the "Command reference" table is implemented. See `README.md` for the
setup guide (now fully completed for this deployment) if standing up
another instance.
