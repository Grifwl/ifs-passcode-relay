-- Adds a trusted-supporter breakdown to passcode_candidates, so /resolve
-- can call out how many of a value's supporters are flagged 'trusted'
-- for the event, alongside the existing total. Views can't be altered
-- in place, so this drops and recreates it with the same troll
-- exclusion as before plus a new trusted_count column.
DROP VIEW passcode_candidates;

CREATE VIEW passcode_candidates AS
SELECT
  r.event_id AS event_id,
  r.position AS position,
  r.value AS value,
  COUNT(DISTINCT r.user_id) AS supporter_count,
  COUNT(DISTINCT CASE WHEN t2.status = 'trusted' THEN r.user_id END) AS trusted_count,
  MAX(r.created_at) AS last_reported_at
FROM passcode_reports r
LEFT JOIN event_trust t2
  ON t2.event_id = r.event_id AND t2.user_id = r.user_id AND t2.status = 'trusted'
WHERE NOT EXISTS (
  SELECT 1 FROM event_trust t
  WHERE t.event_id = r.event_id
    AND t.user_id = r.user_id
    AND t.status = 'troll'
)
GROUP BY r.event_id, r.position, r.value;
