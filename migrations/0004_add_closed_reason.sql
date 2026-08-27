-- Distinguishes a normal /closeevent completion from /leave auto-
-- closing an event whose administrator left with no eligible successor
-- left to take over (see CLAUDE.md "Administrator succession"). NULL
-- while the event is still active.
ALTER TABLE events ADD COLUMN closed_reason TEXT
  CHECK (closed_reason IN ('completed', 'abandoned') OR closed_reason IS NULL);
