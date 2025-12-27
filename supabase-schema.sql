-- Supabase SQL Schema for Twitter Profile Caching
-- Run this in your Supabase SQL Editor to create the necessary table

-- Create the twitter_profiles table
CREATE TABLE IF NOT EXISTS twitter_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  twitter_id TEXT UNIQUE NOT NULL,
  username TEXT NOT NULL,
  name TEXT NOT NULL,
  bio TEXT,
  profile_image_url TEXT,
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT FALSE,
  location TEXT,
  banner_url TEXT,
  statuses_count INTEGER DEFAULT 0,
  professional_type TEXT,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_twitter_profiles_username ON twitter_profiles(username);
CREATE INDEX IF NOT EXISTS idx_twitter_profiles_name ON twitter_profiles USING gin(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_twitter_profiles_followers ON twitter_profiles(followers_count DESC);
CREATE INDEX IF NOT EXISTS idx_twitter_profiles_updated ON twitter_profiles(updated_at DESC);

-- Create a GIN index for full-text search on username, name, and bio
CREATE INDEX IF NOT EXISTS idx_twitter_profiles_search ON twitter_profiles 
USING gin(to_tsvector('english', COALESCE(username, '') || ' ' || COALESCE(name, '') || ' ' || COALESCE(bio, '')));

-- Enable Row Level Security (RLS)
ALTER TABLE twitter_profiles ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows anyone to read profiles (public read)
CREATE POLICY "Allow public read access" ON twitter_profiles
  FOR SELECT
  USING (true);

-- Create a policy that allows insert/update (for server-side caching)
-- Note: In production, you might want to restrict this to service role only
CREATE POLICY "Allow insert" ON twitter_profiles
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow update" ON twitter_profiles
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at on row updates
DROP TRIGGER IF EXISTS update_twitter_profiles_updated_at ON twitter_profiles;
CREATE TRIGGER update_twitter_profiles_updated_at
  BEFORE UPDATE ON twitter_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Optional: Create a view for search statistics
CREATE OR REPLACE VIEW twitter_profile_stats AS
SELECT 
  COUNT(*) as total_profiles,
  COUNT(CASE WHEN verified THEN 1 END) as verified_profiles,
  AVG(followers_count)::INTEGER as avg_followers,
  MAX(followers_count) as max_followers,
  MIN(updated_at) as oldest_cache,
  MAX(updated_at) as newest_cache
FROM twitter_profiles;

-- Helper function to search profiles (optional, can use directly in app)
CREATE OR REPLACE FUNCTION search_twitter_profiles(search_query TEXT, result_limit INTEGER DEFAULT 20)
RETURNS SETOF twitter_profiles AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM twitter_profiles
  WHERE 
    username ILIKE '%' || search_query || '%'
    OR name ILIKE '%' || search_query || '%'
    OR bio ILIKE '%' || search_query || '%'
  ORDER BY followers_count DESC
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- USERS TABLE - For authenticated users
-- =============================================

-- Users table for storing authenticated users
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  twitter_id TEXT UNIQUE NOT NULL,
  username TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  profile_image_url TEXT,
  bio TEXT,
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  is_creator BOOLEAN DEFAULT FALSE,
  price_per_message DECIMAL(10, 2) DEFAULT 0,
  total_earnings DECIMAL(12, 2) DEFAULT 0,
  response_time_hours INTEGER DEFAULT 24,
  last_login_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for users
CREATE INDEX IF NOT EXISTS idx_users_twitter_id ON users(twitter_id);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_is_creator ON users(is_creator) WHERE is_creator = true;

-- Enable RLS for users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policies for users
CREATE POLICY "Allow public read access to users" ON users
  FOR SELECT USING (true);

CREATE POLICY "Allow insert users" ON users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update users" ON users
  FOR UPDATE USING (true) WITH CHECK (true);

-- Auto-update updated_at trigger for users
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- WALLETS TABLE - Connected wallets for users
-- =============================================

CREATE TABLE IF NOT EXISTS wallets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  address TEXT NOT NULL,
  chain TEXT DEFAULT 'ethereum', -- ethereum, polygon, base, solana, etc.
  is_primary BOOLEAN DEFAULT FALSE,
  label TEXT, -- e.g., "Main Wallet", "Trading Wallet"
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, address, chain)
);

-- Indexes for wallets
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_wallets_address ON wallets(address);

-- Enable RLS
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own wallets" ON wallets
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own wallets" ON wallets
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own wallets" ON wallets
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Users can delete their own wallets" ON wallets
  FOR DELETE USING (true);

-- Trigger
DROP TRIGGER IF EXISTS update_wallets_updated_at ON wallets;
CREATE TRIGGER update_wallets_updated_at
  BEFORE UPDATE ON wallets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- APPEALS TABLE - Public appeals to reach someone
-- =============================================

CREATE TABLE IF NOT EXISTS appeals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_twitter_id TEXT NOT NULL, -- Twitter ID of the person being appealed to
  target_username TEXT NOT NULL,
  target_name TEXT NOT NULL,
  target_profile_image TEXT,
  title TEXT,
  message TEXT NOT NULL,
  pledged_amount DECIMAL(12, 2) DEFAULT 0, -- Total pledged by all backers
  goal_amount DECIMAL(12, 2), -- Optional goal
  backers_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'successful', 'expired', 'cancelled')),
  expires_at TIMESTAMPTZ,
  successful_at TIMESTAMPTZ, -- When the target responded
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for appeals
CREATE INDEX IF NOT EXISTS idx_appeals_creator_id ON appeals(creator_id);
CREATE INDEX IF NOT EXISTS idx_appeals_target_twitter_id ON appeals(target_twitter_id);
CREATE INDEX IF NOT EXISTS idx_appeals_status ON appeals(status);
CREATE INDEX IF NOT EXISTS idx_appeals_pledged ON appeals(pledged_amount DESC);
CREATE INDEX IF NOT EXISTS idx_appeals_created ON appeals(created_at DESC);

-- Enable RLS
ALTER TABLE appeals ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view appeals" ON appeals
  FOR SELECT USING (true);

CREATE POLICY "Users can create appeals" ON appeals
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Creators can update their appeals" ON appeals
  FOR UPDATE USING (true) WITH CHECK (true);

-- Trigger
DROP TRIGGER IF EXISTS update_appeals_updated_at ON appeals;
CREATE TRIGGER update_appeals_updated_at
  BEFORE UPDATE ON appeals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- APPEAL_BACKERS TABLE - Users backing an appeal
-- =============================================

CREATE TABLE IF NOT EXISTS appeal_backers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  appeal_id UUID NOT NULL REFERENCES appeals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(12, 2) NOT NULL,
  message TEXT,
  is_anonymous BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'pledged' CHECK (status IN ('pledged', 'paid', 'refunded')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(appeal_id, user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_appeal_backers_appeal_id ON appeal_backers(appeal_id);
CREATE INDEX IF NOT EXISTS idx_appeal_backers_user_id ON appeal_backers(user_id);

-- Enable RLS
ALTER TABLE appeal_backers ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view non-anonymous backers" ON appeal_backers
  FOR SELECT USING (true);

CREATE POLICY "Users can back appeals" ON appeal_backers
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own backing" ON appeal_backers
  FOR UPDATE USING (true) WITH CHECK (true);

-- Trigger
DROP TRIGGER IF EXISTS update_appeal_backers_updated_at ON appeal_backers;
CREATE TRIGGER update_appeal_backers_updated_at
  BEFORE UPDATE ON appeal_backers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- CHATS TABLE - Conversations between users
-- =============================================

CREATE TABLE IF NOT EXISTS chats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- Person who initiated/paid
  creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- Person being paid for their time
  appeal_id UUID REFERENCES appeals(id) ON DELETE SET NULL, -- Optional link to appeal
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'expired', 'refunded', 'cancelled')),
  amount DECIMAL(12, 2) NOT NULL, -- Amount paid for this chat
  slot_name TEXT, -- e.g., "Quick Chat", "Deep Dive"
  slot_duration INTEGER, -- Duration in minutes
  deadline_at TIMESTAMPTZ, -- When the creator must respond by
  completed_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_chats_requester_id ON chats(requester_id);
CREATE INDEX IF NOT EXISTS idx_chats_creator_id ON chats(creator_id);
CREATE INDEX IF NOT EXISTS idx_chats_status ON chats(status);
CREATE INDEX IF NOT EXISTS idx_chats_created ON chats(created_at DESC);

-- Enable RLS
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own chats" ON chats
  FOR SELECT USING (true);

CREATE POLICY "Users can create chats" ON chats
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Participants can update chats" ON chats
  FOR UPDATE USING (true) WITH CHECK (true);

-- Trigger
DROP TRIGGER IF EXISTS update_chats_updated_at ON chats;
CREATE TRIGGER update_chats_updated_at
  BEFORE UPDATE ON chats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- MESSAGES TABLE - Messages within chats
-- =============================================

CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  content_type TEXT DEFAULT 'text' CHECK (content_type IN ('text', 'image', 'file', 'system')),
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages(chat_id, is_read) WHERE is_read = FALSE;

-- Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Chat participants can view messages" ON messages
  FOR SELECT USING (true);

CREATE POLICY "Chat participants can send messages" ON messages
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Senders can update their messages" ON messages
  FOR UPDATE USING (true) WITH CHECK (true);

-- =============================================
-- TRANSACTIONS TABLE - Payment history
-- =============================================

CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('payment', 'refund', 'withdrawal', 'deposit', 'earning', 'pledge')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  amount DECIMAL(12, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  -- Related entities
  chat_id UUID REFERENCES chats(id) ON DELETE SET NULL,
  appeal_id UUID REFERENCES appeals(id) ON DELETE SET NULL,
  wallet_id UUID REFERENCES wallets(id) ON DELETE SET NULL,
  -- Counterparty
  counterparty_id UUID REFERENCES users(id) ON DELETE SET NULL,
  counterparty_name TEXT,
  -- Payment details
  payment_method TEXT, -- 'card', 'crypto', 'balance'
  payment_provider TEXT, -- 'stripe', 'coinbase', etc.
  external_id TEXT, -- ID from payment provider
  -- Metadata
  description TEXT,
  metadata JSONB,
  -- Timestamps
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_chat_id ON transactions(chat_id);
CREATE INDEX IF NOT EXISTS idx_transactions_appeal_id ON transactions(appeal_id);

-- Enable RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own transactions" ON transactions
  FOR SELECT USING (true);

CREATE POLICY "System can create transactions" ON transactions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update transactions" ON transactions
  FOR UPDATE USING (true) WITH CHECK (true);

-- Trigger
DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions;
CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- AVAILABILITY_SLOTS TABLE - Creator availability
-- =============================================

CREATE TABLE IF NOT EXISTS availability_slots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- e.g., "Quick Chat", "Deep Dive"
  description TEXT,
  duration INTEGER NOT NULL, -- Duration in minutes
  price DECIMAL(10, 2) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  max_bookings_per_day INTEGER DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_availability_slots_user_id ON availability_slots(user_id);
CREATE INDEX IF NOT EXISTS idx_availability_slots_active ON availability_slots(is_active) WHERE is_active = TRUE;

-- Enable RLS
ALTER TABLE availability_slots ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view active slots" ON availability_slots
  FOR SELECT USING (true);

CREATE POLICY "Users can create their own slots" ON availability_slots
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own slots" ON availability_slots
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Users can delete their own slots" ON availability_slots
  FOR DELETE USING (true);

-- Trigger
DROP TRIGGER IF EXISTS update_availability_slots_updated_at ON availability_slots;
CREATE TRIGGER update_availability_slots_updated_at
  BEFORE UPDATE ON availability_slots
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- AVAILABILITY_TIMES TABLE - Specific available times
-- =============================================

CREATE TABLE IF NOT EXISTS availability_times (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slot_id UUID NOT NULL REFERENCES availability_slots(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0 = Sunday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_availability_times_slot_id ON availability_times(slot_id);
CREATE INDEX IF NOT EXISTS idx_availability_times_day ON availability_times(day_of_week);

-- Enable RLS
ALTER TABLE availability_times ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view availability times" ON availability_times
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their availability times" ON availability_times
  FOR ALL USING (true) WITH CHECK (true);

-- =============================================
-- NOTIFICATIONS TABLE - User notifications
-- =============================================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'chat_message', 'appeal_update', 'payment', 'system'
  title TEXT NOT NULL,
  body TEXT,
  data JSONB, -- Additional data like chat_id, appeal_id, etc.
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (true);

CREATE POLICY "System can create notifications" ON notifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (true) WITH CHECK (true);

-- =============================================
-- HELPER VIEWS
-- =============================================

-- User stats view
CREATE OR REPLACE VIEW user_stats AS
SELECT 
  u.id as user_id,
  u.username,
  COUNT(DISTINCT c.id) FILTER (WHERE c.creator_id = u.id) as chats_as_creator,
  COUNT(DISTINCT c.id) FILTER (WHERE c.requester_id = u.id) as chats_as_requester,
  COUNT(DISTINCT a.id) as appeals_created,
  COALESCE(SUM(t.amount) FILTER (WHERE t.type = 'earning' AND t.status = 'completed'), 0) as total_earned,
  COALESCE(SUM(t.amount) FILTER (WHERE t.type = 'payment' AND t.status = 'completed'), 0) as total_spent
FROM users u
LEFT JOIN chats c ON c.creator_id = u.id OR c.requester_id = u.id
LEFT JOIN appeals a ON a.creator_id = u.id
LEFT JOIN transactions t ON t.user_id = u.id
GROUP BY u.id, u.username;

-- Active appeals view
CREATE OR REPLACE VIEW active_appeals AS
SELECT 
  a.*,
  u.username as creator_username,
  u.name as creator_name,
  u.profile_image_url as creator_image
FROM appeals a
JOIN users u ON u.id = a.creator_id
WHERE a.status = 'active'
ORDER BY a.pledged_amount DESC, a.created_at DESC;
