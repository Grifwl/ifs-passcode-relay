#!/usr/bin/env node
// Registers the bot's command list with Telegram via the Bot API's
// setMyCommands, so BotFather's manual /setcommands is never needed
// (see CLAUDE.md "Command list"). Run this after adding, removing or
// renaming a bot.command(...) registration in src/bot.ts, keeping the
// list below in sync with those registrations.

import { readFileSync } from "node:fs";

const COMMANDS = [
  { command: "start", description: "Introduction and command list" },
  { command: "help", description: "Show this command list" },
  { command: "language", description: "Set your language (en, ca, es, fr, gl, eu, pt, it, de)" },
  { command: "newevent", description: "Create a new IFS event" },
  { command: "sharetext", description: "Get an invite message to share" },
  { command: "join", description: "Join an event by its code" },
  { command: "leave", description: "Leave your current event" },
  { command: "current", description: "Show your current event, its administrator and participant count" },
  { command: "submit", description: "Report a value: /submit <position> <value>" },
  { command: "status", description: "Show the current state of the passcode" },
  { command: "resolve", description: "Settle a disagreement (administrator)" },
  { command: "unresolve", description: "Reopen a resolved position (administrator)" },
  { command: "trust", description: "Mark a participant as trusted (administrator)" },
  { command: "troll", description: "Exclude a participant's reports (administrator)" },
  { command: "untrust", description: "Clear a participant's trust flag (administrator)" },
  { command: "kick", description: "Remove a participant from the event (administrator)" },
  { command: "promote", description: "Hand the administrator role to another participant (administrator)" },
  { command: "claim", description: "Take over as administrator if the current one has been inactive" },
  { command: "verify", description: "Confirm a store-validated passcode, resolve every position and close the event (administrator)" },
  { command: "events", description: "List every event you've been part of, current or past" },
];

function readBotToken() {
  if (process.env.BOT_TOKEN) return process.env.BOT_TOKEN;
  try {
    const contents = readFileSync(new URL("../.dev.vars", import.meta.url), "utf8");
    const match = contents.match(/^BOT_TOKEN=(.+)$/m);
    if (match) return match[1].trim();
  } catch {
    // .dev.vars doesn't exist; fall through to the error below.
  }
  throw new Error("Set BOT_TOKEN in the environment or in .dev.vars before running this script.");
}

const token = readBotToken();
const response = await fetch(`https://api.telegram.org/bot${token}/setMyCommands`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ commands: COMMANDS }),
});

const result = await response.json();
if (!result.ok) {
  console.error("Failed to set commands:", result);
  process.exit(1);
}
console.log(`Registered ${COMMANDS.length} commands.`);
