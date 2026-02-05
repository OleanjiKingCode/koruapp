-- Add reason field documentation to summons backers
-- The reason field stores why someone wants a person on Koru (50 words max)

-- Update the comment to document the reason field
COMMENT ON COLUMN summons.backers IS 'Array of backer objects: {user_id, username, name, profile_image_url, amount, backed_at, reason?}. Reason is optional text (50 words max) explaining why the backer wants this person on Koru.';

-- Example backer object structure with reason:
-- {
--   "user_id": "uuid",
--   "username": "string",
--   "name": "string", 
--   "profile_image_url": "string or null",
--   "amount": 10.00,
--   "backed_at": "2024-01-01T00:00:00Z",
--   "reason": "I want to learn about AI from this expert" (optional, 50 words max)
-- }

SELECT 'Backer reason field documented!' as status;
