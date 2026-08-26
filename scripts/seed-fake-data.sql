-- Seeds one fake event, as if created and reported into by other
-- agents, so you can /join TESTER with your own real Telegram account
-- and see /status render discrepancies without needing other testers.
--
-- The three fake users below (negative ids, which no real Telegram
-- account can have) only get passcode_reports rows, never a
-- `participants` row: the live-broadcast code sends a real Telegram
-- message to every participant's chat_id, so a fake chat_id there would
-- make your own /join or /submit fail once it tried to notify them.
-- Restricting them to passcode_reports is enough — /status and the
-- candidate view read straight from that table.
--
-- Fills 10 of the pattern's 11 slots (position 11 is left blank on
-- purpose, so the known/total counter shows it isn't complete yet).
-- Positions 3, 5 and 6 each have two disagreeing values (a majority
-- from the two fake agents, a minority from the fake creator), for
-- exactly 2x2x2 = 8 rendered combinations — comfortably under the
-- 16-variant cap, enough to see supporter counts and the flagged
-- minority name.
--
-- test_agent_b is also flagged 'trusted', so /resolve <position>'s
-- candidate listing shows the trusted-supporter breakdown (e.g. "2 (1)")
-- on positions 3, 5 and 6, where test_agent_b is one of the value's
-- supporters.
--
-- Usage:
--   npm run db:seed:remote   -- the live, deployed database
--   npm run db:seed:local    -- the local `wrangler dev` simulation
-- Run db:reset first if you want a clean slate (this script doesn't
-- delete anything, so it's safe to layer on top of real data too — the
-- code TESTER just needs to not already be in use).
--
-- Each report is its own INSERT with a (SELECT id FROM events WHERE
-- code = 'TESTER') subquery rather than one INSERT ... SELECT ... UNION
-- ALL, since D1 rejects a compound SELECT with this many terms.

INSERT INTO users (user_id, language, username) VALUES
  (-9001, 'en', 'test_creator'),
  (-9002, 'en', 'test_agent_a'),
  (-9003, 'en', 'test_agent_b');

INSERT INTO events (code, name, pattern, status, created_by) VALUES
  ('TESTER', 'Test Event (seeded)', 'XXX99*999XX', 'active', -9001);

INSERT INTO passcode_reports (event_id, position, value, user_id, display_name_snapshot)
  VALUES ((SELECT id FROM events WHERE code = 'TESTER'), 1, 'A', -9002, '@test_agent_a');
INSERT INTO passcode_reports (event_id, position, value, user_id, display_name_snapshot)
  VALUES ((SELECT id FROM events WHERE code = 'TESTER'), 2, 'B', -9002, '@test_agent_a');
INSERT INTO passcode_reports (event_id, position, value, user_id, display_name_snapshot)
  VALUES ((SELECT id FROM events WHERE code = 'TESTER'), 3, 'C', -9002, '@test_agent_a');
INSERT INTO passcode_reports (event_id, position, value, user_id, display_name_snapshot)
  VALUES ((SELECT id FROM events WHERE code = 'TESTER'), 3, 'C', -9003, '@test_agent_b');
INSERT INTO passcode_reports (event_id, position, value, user_id, display_name_snapshot)
  VALUES ((SELECT id FROM events WHERE code = 'TESTER'), 3, 'X', -9001, '@test_creator');
INSERT INTO passcode_reports (event_id, position, value, user_id, display_name_snapshot)
  VALUES ((SELECT id FROM events WHERE code = 'TESTER'), 4, '1', -9002, '@test_agent_a');
INSERT INTO passcode_reports (event_id, position, value, user_id, display_name_snapshot)
  VALUES ((SELECT id FROM events WHERE code = 'TESTER'), 5, '2', -9002, '@test_agent_a');
INSERT INTO passcode_reports (event_id, position, value, user_id, display_name_snapshot)
  VALUES ((SELECT id FROM events WHERE code = 'TESTER'), 5, '2', -9003, '@test_agent_b');
INSERT INTO passcode_reports (event_id, position, value, user_id, display_name_snapshot)
  VALUES ((SELECT id FROM events WHERE code = 'TESTER'), 5, '3', -9001, '@test_creator');
INSERT INTO passcode_reports (event_id, position, value, user_id, display_name_snapshot)
  VALUES ((SELECT id FROM events WHERE code = 'TESTER'), 6, 'GLYPH', -9002, '@test_agent_a');
INSERT INTO passcode_reports (event_id, position, value, user_id, display_name_snapshot)
  VALUES ((SELECT id FROM events WHERE code = 'TESTER'), 6, 'GLYPH', -9003, '@test_agent_b');
INSERT INTO passcode_reports (event_id, position, value, user_id, display_name_snapshot)
  VALUES ((SELECT id FROM events WHERE code = 'TESTER'), 6, 'GLIPH', -9001, '@test_creator');
INSERT INTO passcode_reports (event_id, position, value, user_id, display_name_snapshot)
  VALUES ((SELECT id FROM events WHERE code = 'TESTER'), 7, '4', -9002, '@test_agent_a');
INSERT INTO passcode_reports (event_id, position, value, user_id, display_name_snapshot)
  VALUES ((SELECT id FROM events WHERE code = 'TESTER'), 8, '5', -9002, '@test_agent_a');
INSERT INTO passcode_reports (event_id, position, value, user_id, display_name_snapshot)
  VALUES ((SELECT id FROM events WHERE code = 'TESTER'), 9, '6', -9002, '@test_agent_a');
INSERT INTO passcode_reports (event_id, position, value, user_id, display_name_snapshot)
  VALUES ((SELECT id FROM events WHERE code = 'TESTER'), 10, 'Y', -9002, '@test_agent_a');

INSERT INTO event_trust (event_id, user_id, status, set_by)
  VALUES ((SELECT id FROM events WHERE code = 'TESTER'), -9003, 'trusted', -9001);
