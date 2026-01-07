-- Add tags JSONB column to summons table
-- Structure: {"web3": 5, "tech": 3, "personal": 2} where values are the count of backers who selected each tag

ALTER TABLE summons ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '{}';

-- Create index for querying tags
CREATE INDEX IF NOT EXISTS idx_summons_tags ON summons USING gin(tags);

-- Update comment
COMMENT ON COLUMN summons.tags IS 'Tag counts from backers - key is tag name, value is count of backers who selected it';

SELECT 'Tags column added to summons table!' as status;

