-- Telegram usernames, refreshed on every interaction (see session.ts).
-- Needed so /trust, /troll, /untrust and /kick can resolve a plain
-- "@username" argument to a user id — the bot never sees another
-- participant's messages (everyone talks to it in a separate 1:1 chat),
-- so a Telegram "reply to resolve" mechanism isn't available here.
ALTER TABLE users ADD COLUMN username TEXT;

CREATE INDEX idx_users_username ON users(username);
