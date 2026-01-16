-- =============================================
-- KORU APP - SIMPLIFIED SCHEMA v2
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. UPDATE USERS TABLE (add new columns)
ALTER TABLE users ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS availability JSONB DEFAULT '{"timezone": "UTC", "slots": []}';
ALTER TABLE users ADD COLUMN IF NOT EXISTS connected_wallets JSONB DEFAULT '[]';
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_chats INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_summons_created INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_summons_backed INTEGER DEFAULT 0;

-- Users indexes (create if not exist)
CREATE INDEX IF NOT EXISTS idx_users_twitter_id ON users(twitter_id);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_is_creator ON users(is_creator) WHERE is_creator = TRUE;

-- 2. SUMMONS TABLE (create if not exists)
CREATE TABLE IF NOT EXISTS summons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
  target_twitter_id TEXT NOT NULL,
  target_handle TEXT NOT NULL,
  target_name TEXT,
  target_image TEXT,
  request TEXT NOT NULL,
  amount DECIMAL(10, 2) DEFAULT 0,
  backers_count INTEGER DEFAULT 0,
  total_backed DECIMAL(10, 2) DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled', 'expired')),
  expires_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add columns if summons table exists but missing columns
ALTER TABLE summons ADD COLUMN IF NOT EXISTS total_backed DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE summons ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_summons_creator ON summons(creator_id);
CREATE INDEX IF NOT EXISTS idx_summons_target ON summons(target_twitter_id);
CREATE INDEX IF NOT EXISTS idx_summons_status ON summons(status);

ALTER TABLE summons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read summons" ON summons;
DROP POLICY IF EXISTS "Insert summons" ON summons;
DROP POLICY IF EXISTS "Update summons" ON summons;
CREATE POLICY "Public read summons" ON summons FOR SELECT USING (true);
CREATE POLICY "Insert summons" ON summons FOR INSERT WITH CHECK (true);
CREATE POLICY "Update summons" ON summons FOR UPDATE USING (true);

-- 3. SUMMON BACKERS TABLE
CREATE TABLE IF NOT EXISTS summon_backers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  summon_id UUID REFERENCES summons(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_summon_backers_summon ON summon_backers(summon_id);
CREATE INDEX IF NOT EXISTS idx_summon_backers_user ON summon_backers(user_id);

ALTER TABLE summon_backers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read summon_backers" ON summon_backers;
DROP POLICY IF EXISTS "Insert summon_backers" ON summon_backers;
CREATE POLICY "Public read summon_backers" ON summon_backers FOR SELECT USING (true);
CREATE POLICY "Insert summon_backers" ON summon_backers FOR INSERT WITH CHECK (true);

-- 4. UPDATE CHATS TABLE (add columns to existing table)
-- The chats table already exists with creator_id/responder_id, so we just add new columns
ALTER TABLE chats ADD COLUMN IF NOT EXISTS last_message TEXT;
ALTER TABLE chats ADD COLUMN IF NOT EXISTS last_message_at TIMESTAMPTZ;
ALTER TABLE chats ADD COLUMN IF NOT EXISTS initiator_unread INTEGER DEFAULT 0;
ALTER TABLE chats ADD COLUMN IF NOT EXISTS responder_unread INTEGER DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_chats_status ON chats(status);

ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read chats" ON chats;
DROP POLICY IF EXISTS "Insert chats" ON chats;
DROP POLICY IF EXISTS "Update chats" ON chats;
CREATE POLICY "Public read chats" ON chats FOR SELECT USING (true);
CREATE POLICY "Insert chats" ON chats FOR INSERT WITH CHECK (true);
CREATE POLICY "Update chats" ON chats FOR UPDATE USING (true);

-- 5. MESSAGES TABLE
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_chat ON messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at DESC);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read messages" ON messages;
DROP POLICY IF EXISTS "Insert messages" ON messages;
CREATE POLICY "Public read messages" ON messages FOR SELECT USING (true);
CREATE POLICY "Insert messages" ON messages FOR INSERT WITH CHECK (true);

-- 6. UPDATE TRANSACTIONS TABLE (add columns)
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS chat_id UUID REFERENCES chats(id) ON DELETE SET NULL;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS summon_id UUID REFERENCES summons(id) ON DELETE SET NULL;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS tx_hash TEXT;

CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_created ON transactions(created_at DESC);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read transactions" ON transactions;
DROP POLICY IF EXISTS "Insert transactions" ON transactions;
CREATE POLICY "Public read transactions" ON transactions FOR SELECT USING (true);
CREATE POLICY "Insert transactions" ON transactions FOR INSERT WITH CHECK (true);

-- =============================================
-- SUMMARY
-- =============================================
-- users           - Updated with availability, connected_wallets, stats
-- summons         - Public summon requests
-- summon_backers  - Who backed which summon
-- chats           - Conversations (updated with new columns)
-- messages        - Messages in chats
-- transactions    - Payment history (updated with references)
-- =============================================

SELECT 'Schema v2 updated successfully!' as status;
