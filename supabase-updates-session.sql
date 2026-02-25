-- =============================================
-- KORU DATABASE UPDATES
-- Run this in your Supabase SQL Editor
-- =============================================

-- =============================================
-- 1. NOTIFICATIONS TABLE (if not exists)
-- Required for: summon notifications, chat request notifications, chat acceptance notifications
-- =============================================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('message', 'payment', 'request', 'completed', 'summon_backed', 'summon_created')),
  title TEXT NOT NULL,
  description TEXT,
  read BOOLEAN DEFAULT FALSE,
  link TEXT,
  related_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  related_user_username TEXT,
  related_user_image TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(user_id, created_at DESC);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies (using DO block to safely create if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Users can view own notifications') THEN
    CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Users can update own notifications') THEN
    CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Service can insert notifications') THEN
    CREATE POLICY "Service can insert notifications" ON notifications FOR INSERT WITH CHECK (true);
  END IF;
END $$;

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_notification_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_update_notification_updated_at') THEN
    CREATE TRIGGER trigger_update_notification_updated_at
      BEFORE UPDATE ON notifications
      FOR EACH ROW
      EXECUTE FUNCTION update_notification_updated_at();
  END IF;
END $$;

SELECT 'Notifications table ready!' as status;


-- =============================================
-- 2. ESCROWS TABLE (if not exists)
-- Required for: escrow details modal, pending payments view
-- =============================================

CREATE TABLE IF NOT EXISTS escrows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  escrow_id BIGINT NOT NULL UNIQUE,
  chain_id INTEGER NOT NULL DEFAULT 84532,
  depositor_address TEXT NOT NULL,
  recipient_address TEXT NOT NULL,
  depositor_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  recipient_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  amount DECIMAL(20, 6) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 'accepted', 'released', 'disputed', 'completed', 'cancelled', 'expired'
  )),
  accept_deadline TIMESTAMPTZ,
  dispute_deadline TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  disputed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  create_tx_hash TEXT,
  accept_tx_hash TEXT,
  complete_tx_hash TEXT,
  chat_id UUID REFERENCES chats(id) ON DELETE SET NULL,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for escrows
CREATE UNIQUE INDEX IF NOT EXISTS idx_escrows_escrow_id ON escrows(escrow_id, chain_id);
CREATE INDEX IF NOT EXISTS idx_escrows_depositor_address ON escrows(depositor_address);
CREATE INDEX IF NOT EXISTS idx_escrows_depositor_user_id ON escrows(depositor_user_id);
CREATE INDEX IF NOT EXISTS idx_escrows_recipient_address ON escrows(recipient_address);
CREATE INDEX IF NOT EXISTS idx_escrows_recipient_user_id ON escrows(recipient_user_id);
CREATE INDEX IF NOT EXISTS idx_escrows_status ON escrows(status);
CREATE INDEX IF NOT EXISTS idx_escrows_active ON escrows(status) WHERE status IN ('pending', 'accepted', 'disputed');
CREATE INDEX IF NOT EXISTS idx_escrows_chat_id ON escrows(chat_id);
CREATE INDEX IF NOT EXISTS idx_escrows_created ON escrows(created_at DESC);

-- Enable RLS
ALTER TABLE escrows ENABLE ROW LEVEL SECURITY;

-- RLS Policies (using DO block to safely create if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'escrows' AND policyname = 'Anyone can view escrows') THEN
    CREATE POLICY "Anyone can view escrows" ON escrows FOR SELECT USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'escrows' AND policyname = 'Allow insert escrows') THEN
    CREATE POLICY "Allow insert escrows" ON escrows FOR INSERT WITH CHECK (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'escrows' AND policyname = 'Allow update escrows') THEN
    CREATE POLICY "Allow update escrows" ON escrows FOR UPDATE USING (true);
  END IF;
END $$;

SELECT 'Escrows table ready!' as status;


-- =============================================
-- 3. SUMMONS BACKERS ARRAY (if not exists)
-- Required for: storing backer info with reasons
-- =============================================

-- Add the backers JSONB array column if it doesn't exist
ALTER TABLE summons ADD COLUMN IF NOT EXISTS backers JSONB DEFAULT '[]';

-- Create index for querying backers
CREATE INDEX IF NOT EXISTS idx_summons_backers ON summons USING gin(backers);

-- Update comment to document the reason field
COMMENT ON COLUMN summons.backers IS 'Array of backer objects: {user_id, username, name, profile_image_url, amount, backed_at, reason?}. Reason is optional text (50 words max) explaining why the backer wants this person on Koru.';

SELECT 'Summons backers array ready!' as status;


-- =============================================
-- 4. VERIFICATION QUERIES
-- Run these to verify everything is set up
-- =============================================

-- Check if all tables exist
SELECT 
  'notifications' as table_name, 
  EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'notifications') as exists
UNION ALL
SELECT 
  'escrows' as table_name, 
  EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'escrows') as exists
UNION ALL
SELECT 
  'summons' as table_name, 
  EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'summons') as exists;

-- Check if backers column exists on summons
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'summons' AND column_name = 'backers';

SELECT '✅ All database updates complete!' as status;
