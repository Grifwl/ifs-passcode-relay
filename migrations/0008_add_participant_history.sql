-- Support for /events listing every event a user has ever *participated*
-- in, not just the ones they currently administer. `participants` only
-- ever holds a user's *current* membership row (replaced on every
-- /join or /newevent switch, deleted on /leave or /kick — see CLAUDE.md
-- "Data model"), so on its own it can't answer "what have I been part
-- of before". This table is the append-only trail that fills that gap:
-- a row is archived here whenever a participant row is about to be
-- deleted or overwritten (see db/participants.ts's `removeParticipant`
-- and `joinEvent`), independent of whether that event is later closed,
-- abandoned, or revived.
CREATE TABLE participant_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id INTEGER NOT NULL REFERENCES events(id),
  user_id INTEGER NOT NULL REFERENCES users(user_id),
  joined_at TEXT NOT NULL,
  left_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_participant_history_user ON participant_history(user_id);
CREATE INDEX idx_participant_history_event ON participant_history(event_id);
