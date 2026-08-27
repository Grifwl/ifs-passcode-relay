-- Renames events.created_by to admin_user_id: since /promote and
-- /leave succession can now hand this column to someone other than
-- whoever ran /newevent, "created_by" no longer describes what it
-- holds — it's the event's current administrator, not necessarily its
-- founder. See CLAUDE.md "Administrator succession".
ALTER TABLE events RENAME COLUMN created_by TO admin_user_id;

DROP INDEX idx_events_created_by;
CREATE INDEX idx_events_admin_user_id ON events(admin_user_id);
