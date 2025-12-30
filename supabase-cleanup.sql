-- =============================================
-- KORU APP - CLEANUP REDUNDANT TABLES
-- Run this in Supabase SQL Editor
-- =============================================

-- Drop old views first (they depend on tables)
DROP VIEW IF EXISTS active_appeals;
DROP VIEW IF EXISTS user_stats;
DROP VIEW IF EXISTS twitter_profile_stats;

-- Drop redundant tables (old naming or now embedded in users)
DROP TABLE IF EXISTS appeal_backers CASCADE;
DROP TABLE IF EXISTS appeals CASCADE;
DROP TABLE IF EXISTS availability_times CASCADE;
DROP TABLE IF EXISTS availability_slots CASCADE;
DROP TABLE IF EXISTS wallets CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;

-- =============================================
-- REMAINING TABLES (what you should have):
-- =============================================
-- users              - All user data + embedded availability & wallets
-- featured_profiles  - Curated profiles for Discover page
-- twitter_profiles   - Cache for Twitter search
-- summons            - Public summon requests
-- summon_backers     - Who backed which summon
-- chats              - Conversations between users
-- messages           - Messages in chats
-- transactions       - Payment history
-- =============================================

SELECT 'Cleanup complete! Removed redundant tables.' as status;



