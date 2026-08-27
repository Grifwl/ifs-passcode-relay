-- Support for /claim (see CLAUDE.md "Administrator succession"):
-- letting a participant take over as administrator if the current one
-- has gone quiet, without them having to /leave first.

-- Tracks when a participant last interacted with the bot at all (any
-- message or button tap), touched by a bot-wide middleware in bot.ts.
-- This is what /claim measures the current administrator's inactivity
-- against. SQLite's ALTER TABLE ADD COLUMN rejects a non-constant
-- default like datetime('now'), so this backfills existing rows with a
-- follow-up UPDATE instead; application code (joinEvent, the activity
-- middleware) always sets a real timestamp explicitly on every future
-- write, so the column's own default never actually matters after this.
ALTER TABLE participants ADD COLUMN last_active_at TEXT NOT NULL DEFAULT '1970-01-01 00:00:00';
UPDATE participants SET last_active_at = datetime('now');

-- At most one open claim negotiation per event at a time. Created by
-- the first /claim once the administrator is confirmed inactive;
-- notify_chat_id/notify_message_id point at the Accept/Keep message
-- sent to the administrator, so it can be edited in place once the
-- claim resolves.
CREATE TABLE admin_claims (
  event_id INTEGER PRIMARY KEY REFERENCES events(id),
  initiated_at TEXT NOT NULL DEFAULT (datetime('now')),
  notify_chat_id INTEGER NOT NULL,
  notify_message_id INTEGER NOT NULL
);

-- Every participant who has run /claim during the currently open
-- negotiation for an event. Resolved the same way /leave picks a
-- successor (trusted preferred, then most contributions, random
-- tie-break), but restricted to this pool.
CREATE TABLE admin_claim_candidates (
  event_id INTEGER NOT NULL REFERENCES admin_claims(event_id),
  user_id INTEGER NOT NULL REFERENCES users(user_id),
  claimed_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (event_id, user_id)
);
