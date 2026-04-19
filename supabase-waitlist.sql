-- =============================================
-- WAITLIST TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS waitlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  twitter_handle TEXT,
  whatsapp_number TEXT,
  email TEXT NOT NULL,
  dream_conversation TEXT,
  heard_from TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- For existing databases, run:
--   ALTER TABLE waitlist ALTER COLUMN twitter_handle DROP NOT NULL;
--   ALTER TABLE waitlist ADD COLUMN IF NOT EXISTS whatsapp_number TEXT;

-- Prevent duplicate signups (partial index skips NULL twitter_handle rows)
CREATE UNIQUE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(email);
CREATE UNIQUE INDEX IF NOT EXISTS idx_waitlist_twitter_handle
  ON waitlist(twitter_handle)
  WHERE twitter_handle IS NOT NULL;

-- For admin queries / export
CREATE INDEX IF NOT EXISTS idx_waitlist_created_at ON waitlist(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_waitlist_heard_from ON waitlist(heard_from);

-- Enable RLS
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Allow public insert (for signups)
CREATE POLICY "Allow public waitlist insert" ON waitlist
  FOR INSERT WITH CHECK (true);

-- Allow public select (needed for duplicate checking via anon key)
CREATE POLICY "Allow public waitlist select" ON waitlist
  FOR SELECT USING (true);
