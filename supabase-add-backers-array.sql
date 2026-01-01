-- Add backers array to summons table
-- This stores backer info directly in the summons table for easier access

-- Add the backers JSONB array column
ALTER TABLE summons ADD COLUMN IF NOT EXISTS backers JSONB DEFAULT '[]';

-- Example backer object structure:
-- {
--   "user_id": "uuid",
--   "username": "string",
--   "name": "string", 
--   "profile_image_url": "string or null",
--   "amount": 10.00,
--   "backed_at": "2024-01-01T00:00:00Z"
-- }

-- Create index for querying backers
CREATE INDEX IF NOT EXISTS idx_summons_backers ON summons USING gin(backers);

-- Update comment
COMMENT ON COLUMN summons.backers IS 'Array of backer objects with user info and pledge amounts';

SELECT 'Backers array column added to summons table!' as status;

