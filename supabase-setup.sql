-- =============================================
-- KORU APP - SUPABASE SETUP SCRIPT
-- Copy this entire file and run in Supabase SQL Editor
-- =============================================

-- 1. CREATE TWITTER PROFILES TABLE
CREATE TABLE IF NOT EXISTS twitter_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  twitter_id TEXT UNIQUE NOT NULL,
  username TEXT NOT NULL,
  name TEXT NOT NULL,
  bio TEXT,
  profile_image_url TEXT,
  banner_url TEXT,
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT FALSE,
  location TEXT,
  statuses_count INTEGER DEFAULT 0,
  professional_type TEXT,
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  is_featured BOOLEAN DEFAULT FALSE,
  featured_order INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ADD COLUMNS IF THEY DON'T EXIST (for existing tables)
ALTER TABLE twitter_profiles ADD COLUMN IF NOT EXISTS banner_url TEXT;
ALTER TABLE twitter_profiles ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE twitter_profiles ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;
ALTER TABLE twitter_profiles ADD COLUMN IF NOT EXISTS featured_order INTEGER;
ALTER TABLE twitter_profiles ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE twitter_profiles ADD COLUMN IF NOT EXISTS professional_type TEXT;
ALTER TABLE twitter_profiles ADD COLUMN IF NOT EXISTS statuses_count INTEGER DEFAULT 0;
ALTER TABLE twitter_profiles ADD COLUMN IF NOT EXISTS location TEXT;

-- 3. CREATE INDEXES (after columns exist)
CREATE INDEX IF NOT EXISTS idx_twitter_profiles_username ON twitter_profiles(username);
CREATE INDEX IF NOT EXISTS idx_twitter_profiles_followers ON twitter_profiles(followers_count DESC);
CREATE INDEX IF NOT EXISTS idx_twitter_profiles_featured ON twitter_profiles(is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_twitter_profiles_category ON twitter_profiles(category);

-- 4. ENABLE RLS
ALTER TABLE twitter_profiles ENABLE ROW LEVEL SECURITY;

-- 5. DROP EXISTING POLICIES (if any)
DROP POLICY IF EXISTS "Allow public read access" ON twitter_profiles;
DROP POLICY IF EXISTS "Allow insert" ON twitter_profiles;
DROP POLICY IF EXISTS "Allow update" ON twitter_profiles;

-- 6. CREATE RLS POLICIES
CREATE POLICY "Allow public read access" ON twitter_profiles
  FOR SELECT USING (true);

CREATE POLICY "Allow insert" ON twitter_profiles
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update" ON twitter_profiles
  FOR UPDATE USING (true) WITH CHECK (true);

-- 7. CREATE USERS TABLE
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
  total_earnings DECIMAL(10, 2) DEFAULT 0,
  response_time_hours INTEGER DEFAULT 24,
  tags TEXT[] DEFAULT '{}',
  balance DECIMAL(10, 2) DEFAULT 0,
  pending_balance DECIMAL(10, 2) DEFAULT 0,
  total_withdrawn DECIMAL(10, 2) DEFAULT 0,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. ADD COLUMNS TO USERS IF THEY DON'T EXIST
ALTER TABLE users ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE users ADD COLUMN IF NOT EXISTS balance DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS pending_balance DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_withdrawn DECIMAL(10, 2) DEFAULT 0;

-- 9. USERS INDEXES
CREATE INDEX IF NOT EXISTS idx_users_twitter_id ON users(twitter_id);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- 10. USERS RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read all profiles" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

CREATE POLICY "Users can read all profiles" ON users
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (true) WITH CHECK (true);

-- 11. SUMMONS TABLE
CREATE TABLE IF NOT EXISTS summons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID REFERENCES users(id),
  target_twitter_id TEXT NOT NULL,
  target_handle TEXT NOT NULL,
  target_name TEXT,
  target_image TEXT,
  request TEXT NOT NULL,
  amount DECIMAL(10, 2) DEFAULT 0,
  backers_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled', 'expired')),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. SUMMON BACKERS TABLE
CREATE TABLE IF NOT EXISTS summon_backers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  summon_id UUID REFERENCES summons(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  amount DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. CHATS TABLE
CREATE TABLE IF NOT EXISTS chats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID REFERENCES users(id),
  responder_id UUID REFERENCES users(id),
  amount DECIMAL(10, 2) DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'refunded', 'expired')),
  deadline TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. MESSAGES TABLE
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id),
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'payment', 'refund', 'earning')),
  amount DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
  description TEXT,
  reference_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. WALLETS TABLE
CREATE TABLE IF NOT EXISTS wallets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  address TEXT NOT NULL,
  chain TEXT DEFAULT 'ethereum',
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. ENABLE RLS ON ALL TABLES
ALTER TABLE summons ENABLE ROW LEVEL SECURITY;
ALTER TABLE summon_backers ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;

-- 18. DROP OLD POLICIES IF EXIST
DROP POLICY IF EXISTS "Public read summons" ON summons;
DROP POLICY IF EXISTS "Public read summon_backers" ON summon_backers;
DROP POLICY IF EXISTS "Public read chats" ON chats;
DROP POLICY IF EXISTS "Public read messages" ON messages;
DROP POLICY IF EXISTS "Public read transactions" ON transactions;
DROP POLICY IF EXISTS "Public read wallets" ON wallets;
DROP POLICY IF EXISTS "Insert summons" ON summons;
DROP POLICY IF EXISTS "Update summons" ON summons;
DROP POLICY IF EXISTS "Insert summon_backers" ON summon_backers;
DROP POLICY IF EXISTS "Insert chats" ON chats;
DROP POLICY IF EXISTS "Update chats" ON chats;
DROP POLICY IF EXISTS "Insert messages" ON messages;
DROP POLICY IF EXISTS "Insert transactions" ON transactions;
DROP POLICY IF EXISTS "Insert wallets" ON wallets;
DROP POLICY IF EXISTS "Update wallets" ON wallets;

-- 19. CREATE PUBLIC READ POLICIES
CREATE POLICY "Public read summons" ON summons FOR SELECT USING (true);
CREATE POLICY "Public read summon_backers" ON summon_backers FOR SELECT USING (true);
CREATE POLICY "Public read chats" ON chats FOR SELECT USING (true);
CREATE POLICY "Public read messages" ON messages FOR SELECT USING (true);
CREATE POLICY "Public read transactions" ON transactions FOR SELECT USING (true);
CREATE POLICY "Public read wallets" ON wallets FOR SELECT USING (true);

-- 20. CREATE INSERT/UPDATE POLICIES
CREATE POLICY "Insert summons" ON summons FOR INSERT WITH CHECK (true);
CREATE POLICY "Update summons" ON summons FOR UPDATE USING (true);
CREATE POLICY "Insert summon_backers" ON summon_backers FOR INSERT WITH CHECK (true);
CREATE POLICY "Insert chats" ON chats FOR INSERT WITH CHECK (true);
CREATE POLICY "Update chats" ON chats FOR UPDATE USING (true);
CREATE POLICY "Insert messages" ON messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Insert transactions" ON transactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Insert wallets" ON wallets FOR INSERT WITH CHECK (true);
CREATE POLICY "Update wallets" ON wallets FOR UPDATE USING (true);

-- DONE! 
SELECT 'Setup complete! Tables: twitter_profiles, users, summons, summon_backers, chats, messages, transactions, wallets' as status;
