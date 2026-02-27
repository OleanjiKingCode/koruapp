-- =============================================
-- WAITLIST TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS waitlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  twitter_handle TEXT NOT NULL,
  email TEXT NOT NULL,
  dream_conversation TEXT,
  heard_from TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Prevent duplicate signups
CREATE UNIQUE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(email);
CREATE UNIQUE INDEX IF NOT EXISTS idx_waitlist_twitter_handle ON waitlist(twitter_handle);

-- For admin queries / export
CREATE INDEX IF NOT EXISTS idx_waitlist_created_at ON waitlist(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_waitlist_heard_from ON waitlist(heard_from);

-- Enable RLS
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Allow public insert only, no public read/update/delete
CREATE POLICY "Allow public waitlist insert" ON waitlist
  FOR INSERT WITH CHECK (true);
