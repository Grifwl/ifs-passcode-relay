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
   (e.g. in a WhatsApp group) — the bot immediately sends a ready-to-paste
   invite message with that code, and the creator is joined to the event
   automatically, since being the organizer doesn't exempt them from
   hunting portals too. The creator also starts out flagged trusted for
   their own event, the same way `/trust` would flag anyone else. By
   default, the passcode is expected to follow
   the pattern `XXX99*999XX` (three letters, two digits, one whole word,
   three digits, two letters) — the creator can set a different pattern
   if that IFS uses another shape. The event's name doesn't need to be
   unique: running `/newevent` twice with the exact same name is not an
   error, it just creates two separate events with two different join
   codes. Since attendees only see the name when picking which code to
   join, make it specific enough to tell same-named IFS events apart —
   e.g. `/newevent Barcelona 2026-08`, including the year and month,
   rather than a bare `/newevent Barcelona` that collides with every
   other Barcelona IFS.
2. Every other attendee sends `/join <code>` to the bot, which also
   nudges them to run `/sharetext` themselves in case they want to help
   spread the word too. An agent can only be actively contributing to
   one event at a time.
3. When you find a value, you just send its position and value: `6
   CIPHER` reports that position 6 (the word) is `CIPHER`; `7 3` reports
   that position 7 is the digit `3`. No need to remember a command.
   Letters are shown in upper case, but you can type them however you
   want.
4. The bot keeps a single message per participant up to date with the
   current state of the code, editing it in place every time someone
   reports something new — it does not spam the chat with a new message
   per report.
5. If two different people report different values for the same
   position, both are kept: the bot shows every resulting full-code
   possibility in its own easy-to-copy block, with how many people back
   each one — and, for the least-backed ones, who reported them, so the
   event's creator can spot a mistake or a troll. If what you send
   doesn't match the expected position, or contradicts what someone
   *else* already reported, the bot asks you to confirm before recording
   it. Correcting your **own** earlier report is different: no
   confirmation needed, your previous value there is simply replaced —
   and if that was the only thing keeping a position in disagreement,
   the disagreement resolves itself right away.
6. The event's creator settles a disagreement with `/resolve <position>
   <value>` — or, run as just `/resolve <position>`, the bot lists the
   values reported for that position with how many people back each
   one — and, if any of those supporters is flagged trusted, how many
   of them are — and shows a button per value (most-backed first) to
   resolve it with a single tap. Running bare `/resolve`, with no arguments,
   instead walks through every position still in disagreement one at a
   time: resolve the one shown via its buttons and the bot immediately
   sends the next, until it reports there are no more left. The creator
   can also mark a participant as trusted or as a troll if needed. Marking
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
| `/newevent <name> [\| <pattern>]` | anyone | Create a new IFS event and get its join code; joins you automatically and flags you trusted for it. |
| `/sharetext [code] [lang]` | anyone | Get ready-to-paste text inviting people to join. `code` defaults to your current event, `lang` to your own — sent automatically once by `/newevent` already. |
| `/join <code>` | anyone | Join an event. |
| `/leave` | participant | Leave your current event. |
| `/myevent` | anyone | Show which event you're in, if any. |
| `<position> <value>` (or `/submit <position> <value>`) | participant | Report the value found at a position. |
| `/status` (or `/code`) | participant | Show the current state of the code on demand. |
| `/resolve <position> [<value \| @user>]` | event creator | Pick the correct value when there's a disagreement; with no value, lists reported values (with trusted-supporter breakdown) as tap-to-resolve buttons. |
| `/resolve` (no arguments) | event creator | Walk through every position still in disagreement, one at a time. |
| `/unresolve <position>` | event creator | Reopen a resolved position. |
| `/trust <user>` | event creator | Flag a participant as trusted, so their support is called out in `/resolve`'s candidate listing. |
| `/troll <user>` | event creator | Discard a participant's reports and stop updating them (this event only). |
| `/untrust <user>` | event creator | Clear a participant's trust flag. |
| `/kick <user>` | event creator | Remove a participant from the event. |
| `/closeevent` | event creator | Freeze the event and announce the final code to everyone. |
| `/events` | anyone | List the events you've created. |

Every player sees the bot's messages in their own language, set once with
`/language` and remembered from then on.

## Project status

**Live**, at [`@ifs_relay_bot`](https://t.me/ifs_relay_bot) on Telegram.
Every command described above is implemented and deployed. See
[`CLAUDE.md`](CLAUDE.md) for the full technical design (data model,
conflict-resolution algorithm, i18n architecture) if you're looking to
contribute.

## Architecture

- **Runtime:** Cloudflare Workers, receiving Telegram updates via
  webhook.
- **Bot framework:** [grammY](https://grammy.dev).
- **Database:** [Cloudflare D1](https://developers.cloudflare.com/d1/).
- **Language:** TypeScript.
- **Domain:** `ifspasscoderelay.grifwl.blue`.

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
   - `/setjoingroups` → *Disable*. The bot is built around private 1:1
     chats — each participant's live status message is edited in place,
     which only makes sense in a chat with just them and the bot — so
     group usage stays off.

   There's no need for `/setcommands`: the bot registers its own command
   list straight from the code via the Bot API's `setMyCommands`, so
   Telegram shows autocomplete suggestions automatically and they can
   never drift out of sync with a manually maintained BotFather list.

#### Suggested description & about text

Set the English version first with `/setdescription` and `/setabouttext`
— it's what BotFather falls back to for any Telegram client language the
bot doesn't have a translation for. Then, from the same menus, add the
`ca`/`es`/`fr` versions below as per-language descriptions.

| Language | `/setdescription` (long) | `/setabouttext` (short) |
|---|---|---|
| `en` | Collaboratively build your Ingress First Saturday event's redeemable passcode in real time. Report the character you found and its position — the bot keeps everyone's code in sync, flags disagreements, and announces the final result. Available in English, Català, Castellano and Français. Send /help to start, or /newevent to create one for your IFS. | Real-time collaborative passcode relay for Ingress First Saturday events. |
| `ca` | Construeix en temps real, de manera col·laborativa, el passcode bescanviable del teu esdeveniment Ingress First Saturday. Reporta el caràcter que has trobat i la seva posició — el bot manté el codi sincronitzat per a tothom, marca les discrepàncies i anuncia el resultat final. Disponible en català, anglès, castellà i francès. Envia /help per començar, o /newevent per crear-ne un pel teu IFS. | Relleu col·laboratiu en temps real del passcode d'un Ingress First Saturday. |
| `es` | Construye en tiempo real, de forma colaborativa, el passcode canjeable de tu evento Ingress First Saturday. Reporta el carácter que has encontrado y su posición — el bot mantiene el código sincronizado para todos, marca las discrepancias y anuncia el resultado final. Disponible en español, inglés, catalán y francés. Envía /help para empezar, o /newevent para crear uno para tu IFS. | Relevo colaborativo en tiempo real del passcode de un Ingress First Saturday. |
| `fr` | Construisez en temps réel, de façon collaborative, le passcode échangeable de votre événement Ingress First Saturday. Signalez le caractère trouvé et sa position — le bot garde le code synchronisé pour tout le monde, signale les désaccords et annonce le résultat final. Disponible en français, anglais, catalan et espagnol. Envoyez /help pour commencer, ou /newevent pour en créer un pour votre IFS. | Relais collaboratif en temps réel du passcode d'un Ingress First Saturday. |

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

The bot lives at **`ifspasscoderelay.grifwl.blue`**. Since the
`grifwl.blue` zone is already on the same Cloudflare account used to
deploy, this needs no manual dashboard step — declare it as a [Custom
Domain](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)
directly in `wrangler.toml`:

```toml
routes = [
  { pattern = "ifspasscoderelay.grifwl.blue", custom_domain = true }
]
```

`wrangler deploy` then provisions the DNS record and TLS certificate for
it automatically. The dashboard is only needed as a fallback if the zone
ever needs manual attention (e.g. it turns out to live on a different
Cloudflare account than the one `wrangler` is logged into).

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
curl "https://api.telegram.org/bot<BOT_TOKEN>/setWebhook?url=https://ifspasscoderelay.grifwl.blue/telegram/webhook&secret_token=<TELEGRAM_WEBHOOK_SECRET>"
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
