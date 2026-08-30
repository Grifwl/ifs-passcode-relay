-- Wipes every table back to empty, for use during manual testing before
-- any real IFS event has run through the bot. Deletes children before
-- parents so it works regardless of whether D1 is enforcing foreign
-- keys, and resets the AUTOINCREMENT counters (events, passcode_reports)
-- so ids restart at 1 too.
--
-- Usage:
--   npm run db:reset:remote   -- the live, deployed database
--   npm run db:reset:local    -- the local `wrangler dev` simulation

DELETE FROM admin_claim_candidates;
DELETE FROM admin_claims;
DELETE FROM passcode_resolutions;
DELETE FROM passcode_reports;
DELETE FROM event_trust;
DELETE FROM known_words;
DELETE FROM pending_newevents;
DELETE FROM participant_history;
DELETE FROM participants;
DELETE FROM events;
DELETE FROM users;
DELETE FROM sqlite_sequence WHERE name IN ('events', 'passcode_reports', 'participant_history');
