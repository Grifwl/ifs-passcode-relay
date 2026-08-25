<!-- Languages: English | [Català](README.ca.md) | [Castellano](README.es.md) | [Français](README.fr.md) -->

# IFS Passcode Relay

A Telegram bot that lets attendees of an **Ingress First Saturday (IFS)**
event collaboratively assemble the event's redeemable passcode in real
time.

**Languages:** English · [Català](README.ca.md) · [Castellano](README.es.md) · [Français](README.fr.md)

## What is this?

Ingress First Saturday is a recurring in-person event for the mobile game
[Ingress](https://ingress.com). During it, players are given the images of
a set of portals; visiting each one in the field and inspecting its media
reveals one character. Concatenating the characters in the right order
produces a passcode redeemable in the in-game store for an IFS item pack.

Several IFS events can be happening at once, each with its own passcode.
This bot lets everyone attending a specific IFS report the character they
found and the position it belongs to, and keeps a live, shared view of
the code as it fills in — no more manually collecting screenshots in a
group chat.

## How it works, from a player's perspective

1. Whoever organizes the passcode relay for a given IFS creates an event
   with `/newevent` and gets a short join code to share with attendees
   (e.g. in a WhatsApp group). By default, the passcode is expected to
   follow the pattern `XXX99*999XX` (three letters, two digits, one
   whole word, three digits, two letters) — the creator can set a
   different pattern if that IFS uses another shape.
2. Each attendee sends `/join <code>` to the bot. An agent can only be
   actively contributing to one event at a time.
3. When you find a value, you just send its position and value: `6
   CIPHER` reports that position 6 (the word) is `CIPHER`; `7 3` reports
   that position 7 is the digit `3`. No need to remember a command.
   Letters are shown in upper case, but you can type them however you
   want.
4. The bot keeps a single message per participant up to date with the
   current state of the code, editing it in place every time someone
   reports something new — it does not spam the chat with a new message
   per report.
5. If two people report different values for the same position, both are
   kept: the bot shows every resulting full-code possibility in its own
   easy-to-copy block, with how many people back each one — and, for the
   least-backed ones, who reported them, so the event's creator can spot
   a mistake or a troll. If what you send doesn't match the expected
   position, or contradicts what's already there, the bot asks you to
   confirm before recording it.
6. The event's creator settles a disagreement with `/resolve`, and can
   mark a participant as trusted or as a troll if needed. Marking
   someone a troll, for that event only, discards the rest of their
   reports and stops sending them further updates — including the final
   passcode when the event closes.
7. When the event is over, its creator closes it with `/closeevent`,
   which sends the final passcode as a **new** message to every
   participant — not just an edit — so nobody misses it even if they
   weren't actively following along.

### Command reference

| Command | Who can use it | What it does |
|---|---|---|
| `/start`, `/help` | anyone | Introduction and command list. |
| `/language <code>` | anyone | Set your own language (`en`, `ca`, `es`, `fr`). |
| `/newevent <name> [\| <pattern>]` | anyone | Create a new IFS event and get its join code. |
| `/sharetext <code> [lang]` | anyone | Get ready-to-paste text inviting people to join, optionally in a different language than your own. |
| `/join <code>` | anyone | Join an event. |
| `/leave` | participant | Leave your current event. |
| `/myevent` | anyone | Show which event you're in, if any. |
| `<position> <value>` (or `/submit <position> <value>`) | participant | Report the value found at a position. |
| `/status` (or `/code`) | participant | Show the current state of the code on demand. |
| `/resolve <position> <value \| @user>` | event creator | Pick the correct value when there's a disagreement. |
| `/unresolve <position>` | event creator | Reopen a resolved position. |
| `/trust <user>` | event creator | Flag a participant as trusted. |
| `/troll <user>` | event creator | Discard a participant's reports and stop updating them (this event only). |
| `/untrust <user>` | event creator | Clear a participant's trust flag. |
| `/kick <user>` | event creator | Remove a participant from the event. |
| `/closeevent` | event creator | Freeze the event and announce the final code to everyone. |
| `/events` | anyone | List the events you've created. |

Every player sees the bot's messages in their own language, set once with
`/language` and remembered from then on.

## Project status

This project is currently in the **design phase**. The interaction model
described above is finalized, but no application code has been written
yet. See [`CLAUDE.md`](CLAUDE.md) for the full technical design (data
model, conflict-resolution algorithm, i18n architecture) once you're
looking to contribute.

## Architecture (planned)

- **Runtime:** Cloudflare Workers, receiving Telegram updates via
  webhook.
- **Bot framework:** [grammY](https://grammy.dev).
- **Database:** [Cloudflare D1](https://developers.cloudflare.com/d1/).
- **Language:** TypeScript.
- **Domain:** a subdomain of `grifwl.blue` (to be decided).

## Setup guide

These are one-time steps to stand up the bot infrastructure — done once
for the whole project, not once per IFS event. Steps 1, 3 and 4 don't
require the application code to exist; steps 2 and 5 need a deployed
Worker, so they come last once implementation starts.

### 1. Create the Telegram bot

1. Open a chat with [@BotFather](https://t.me/BotFather) on Telegram.
2. Send `/newbot`, choose a display name and a unique username ending in
   `bot` (e.g. `IfsPasscodeRelayBot`).
3. BotFather replies with a **bot token** — treat it like a password
   (whoever has it can send messages as the bot). It's stored as a
   Cloudflare secret in step 4 below, never committed to this repo.
4. Still talking to BotFather, set up the bot's public profile:
   - `/setuserpic` — upload a profile picture.
   - `/setdescription` — the long description shown on the bot's empty
     chat screen, before anyone has talked to it.
   - `/setabouttext` — the short bio shown on its profile page.
   - `/setcommands` — paste the command list (see the reference table
     above) so Telegram autocompletes them while typing; keep this in
     sync whenever a command is added or removed.
   - `/setjoingroups` → *Disable*. The bot is built around private 1:1
     chats — each participant's live status message is edited in place,
     which only makes sense in a chat with just them and the bot — so
     group usage stays off.

### 2. Create the Cloudflare Worker and D1 database

Requires a Cloudflare account with the `grifwl.blue` zone already added,
and [wrangler](https://developers.cloudflare.com/workers/wrangler/)
installed (`npm install -g wrangler`, or use `npx wrangler`).

1. `wrangler login` to authenticate the CLI.
2. `wrangler d1 create ifs-passcode-relay` creates the D1 database and
   prints a `database_id` — keep it, it goes into `wrangler.toml`'s
   `[[d1_databases]]` binding (named `DB`) once the code exists.
3. Once the application skeleton exists, `wrangler deploy` publishes the
   Worker for the first time.

### 3. Assign the subdomain

1. In the Cloudflare dashboard, under the `grifwl.blue` zone, add the
   chosen subdomain (e.g. `ifs.grifwl.blue` — exact name still to be
   decided) as a [Custom
   Domain](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)
   for the Worker (preferred over a plain Worker Route).
2. Equivalently, this can be declared in `wrangler.toml` with a `routes`
   entry using `custom_domain = true` for that hostname, applied on the
   next `wrangler deploy`.

### 4. Publish the bot token as a secret

1. `wrangler secret put BOT_TOKEN` and paste the token from step 1 when
   prompted — this stores it encrypted on Cloudflare, exposed to the
   Worker as `env.BOT_TOKEN`, and never committed to the repo.
2. For local development, put the same value in `.dev.vars` (already
   gitignored) as `BOT_TOKEN=...`.
3. Also generate a random string to use as a webhook secret (e.g.
   `openssl rand -hex 32`) and store it the same way, as
   `TELEGRAM_WEBHOOK_SECRET` — the Worker uses it to reject any request
   that isn't actually from Telegram (see step 5).

### 5. Point Telegram at the Worker (webhook)

Once the Worker is deployed and reachable at its public URL:

```sh
curl "https://api.telegram.org/bot<BOT_TOKEN>/setWebhook?url=https://<subdomain>/telegram/webhook&secret_token=<TELEGRAM_WEBHOOK_SECRET>"
```

Telegram then includes that same secret in an
`X-Telegram-Bot-Api-Secret-Token` header on every update it delivers;
the Worker must check it matches before processing anything, and reject
the request otherwise — this is what stops anyone else from POSTing fake
updates to the public webhook URL. Verify the webhook is registered
with:

```sh
curl "https://api.telegram.org/bot<BOT_TOKEN>/getWebhookInfo"
```

## License

MIT.
