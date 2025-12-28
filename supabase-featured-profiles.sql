-- =============================================
-- FEATURED PROFILES TABLE
-- This is separate from twitter_profiles (which is for search cache)
-- Run this in Supabase SQL Editor
-- =============================================

CREATE TABLE IF NOT EXISTS featured_profiles (
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
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_featured_profiles_category ON featured_profiles(category);
CREATE INDEX IF NOT EXISTS idx_featured_profiles_order ON featured_profiles(display_order);
CREATE INDEX IF NOT EXISTS idx_featured_profiles_active ON featured_profiles(is_active) WHERE is_active = TRUE;

-- Enable RLS
ALTER TABLE featured_profiles ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Public read featured_profiles" ON featured_profiles;
DROP POLICY IF EXISTS "Insert featured_profiles" ON featured_profiles;
DROP POLICY IF EXISTS "Update featured_profiles" ON featured_profiles;

CREATE POLICY "Public read featured_profiles" ON featured_profiles FOR SELECT USING (true);
CREATE POLICY "Insert featured_profiles" ON featured_profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Update featured_profiles" ON featured_profiles FOR UPDATE USING (true);

SELECT 'featured_profiles table created!' as status;


