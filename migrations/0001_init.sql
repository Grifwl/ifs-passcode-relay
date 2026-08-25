-- Initial schema. See CLAUDE.md "Data model (D1)" for the full design
-- rationale behind each table.

CREATE TABLE users (
  user_id INTEGER PRIMARY KEY,
  language TEXT NOT NULL DEFAULT 'en',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  pattern TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed')),
  created_by INTEGER NOT NULL REFERENCES users(user_id),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_events_created_by ON events(created_by);

-- An agent attends at most one event at a time, hence user_id as the
-- primary key: joining a new event overwrites the previous row.
CREATE TABLE participants (
  user_id INTEGER PRIMARY KEY REFERENCES users(user_id),
  event_id INTEGER NOT NULL REFERENCES events(id),
  chat_id INTEGER NOT NULL,
  status_message_id INTEGER,
  joined_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_participants_event ON participants(event_id);

-- Append-only log of every accepted submission. This is the source of
-- truth; passcode_candidates (below) is derived from it, never written
-- to directly.
CREATE TABLE passcode_reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id INTEGER NOT NULL REFERENCES events(id),
  position INTEGER NOT NULL,
  value TEXT NOT NULL,
  user_id INTEGER NOT NULL REFERENCES users(user_id),
  display_name_snapshot TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_reports_event_position ON passcode_reports(event_id, position);

CREATE TABLE passcode_resolutions (
  event_id INTEGER NOT NULL REFERENCES events(id),
  position INTEGER NOT NULL,
  value TEXT NOT NULL,
  resolved_by INTEGER NOT NULL REFERENCES users(user_id),
  resolved_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (event_id, position)
);

CREATE TABLE event_trust (
  event_id INTEGER NOT NULL REFERENCES events(id),
  user_id INTEGER NOT NULL REFERENCES users(user_id),
  status TEXT NOT NULL CHECK (status IN ('trusted', 'troll')),
  set_by INTEGER NOT NULL REFERENCES users(user_id),
  set_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (event_id, user_id)
);

CREATE TABLE known_words (
  word TEXT PRIMARY KEY,
  first_used_in_event_id INTEGER REFERENCES events(id),
  first_used_at TEXT NOT NULL DEFAULT (datetime('now')),
  use_count INTEGER NOT NULL DEFAULT 1
);

-- Distinct candidate values per position, excluding reports from users
-- currently flagged 'troll' for that event. A view rather than a stored
-- table: with report volumes this small, recomputing on read is simpler
-- and cannot drift out of sync the way a manually maintained aggregate
-- could.
CREATE VIEW passcode_candidates AS
SELECT
  r.event_id AS event_id,
  r.position AS position,
  r.value AS value,
  COUNT(DISTINCT r.user_id) AS supporter_count,
  MAX(r.created_at) AS last_reported_at
FROM passcode_reports r
WHERE NOT EXISTS (
  SELECT 1 FROM event_trust t
  WHERE t.event_id = r.event_id
    AND t.user_id = r.user_id
    AND t.status = 'troll'
)
GROUP BY r.event_id, r.position, r.value;
