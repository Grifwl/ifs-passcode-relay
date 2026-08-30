-- Support for /newevent's leave-confirmation: when the caller currently
-- belongs to a still-active (unresolved) event, creating a new one must
-- ask first instead of silently leaving the old one — see CLAUDE.md
-- "Succession on leaving an event". Declining aborts the creation
-- entirely, so the event itself can't be created until confirmed; this
-- table holds the not-yet-created event's name/pattern in the meantime,
-- since a Telegram inline button's callback_data (64 bytes) can't
-- reliably fit an arbitrary event name.
--
-- Keyed by user_id: at most one pending creation per caller, the same
-- way a participant belongs to at most one event at a time. A repeat
-- /newevent while one is already pending simply replaces it.
CREATE TABLE pending_newevents (
  user_id INTEGER PRIMARY KEY REFERENCES users(user_id),
  name TEXT NOT NULL,
  pattern TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
