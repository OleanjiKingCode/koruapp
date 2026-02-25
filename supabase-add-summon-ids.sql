-- Migration: Add summon_ids JSONB column to users table
-- This stores { backed_ids: string[], targeted_ids: string[] }
-- so we can look up a user's summons without scanning the summons table.

ALTER TABLE users
ADD COLUMN IF NOT EXISTS summon_ids JSONB DEFAULT '{"backed_ids":[],"targeted_ids":[]}'::jsonb;

-- Backfill: populate backed_ids from the backers JSONB array on summons
-- For each active summon, find users in the backers array and add the summon id
UPDATE users u
SET summon_ids = jsonb_set(
  COALESCE(u.summon_ids, '{"backed_ids":[],"targeted_ids":[]}'::jsonb),
  '{backed_ids}',
  COALESCE(
    (
      SELECT jsonb_agg(DISTINCT s.id::text)
      FROM summons s,
           jsonb_array_elements(s.backers) AS backer
      WHERE backer->>'user_id' = u.id::text
    ),
    '[]'::jsonb
  )
)
WHERE EXISTS (
  SELECT 1
  FROM summons s,
       jsonb_array_elements(s.backers) AS backer
  WHERE backer->>'user_id' = u.id::text
);

-- Backfill: populate targeted_ids from summons where user is the target
-- Match by twitter_id or username (target_handle)
UPDATE users u
SET summon_ids = jsonb_set(
  COALESCE(u.summon_ids, '{"backed_ids":[],"targeted_ids":[]}'::jsonb),
  '{targeted_ids}',
  COALESCE(
    (
      SELECT jsonb_agg(DISTINCT s.id::text)
      FROM summons s
      WHERE s.target_twitter_id = u.twitter_id
         OR s.target_handle = u.username
    ),
    '[]'::jsonb
  )
)
WHERE EXISTS (
  SELECT 1
  FROM summons s
  WHERE s.target_twitter_id = u.twitter_id
     OR s.target_handle = u.username
);

-- Index for faster JSONB queries on summon_ids
CREATE INDEX IF NOT EXISTS idx_users_summon_ids ON users USING GIN (summon_ids);
