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
