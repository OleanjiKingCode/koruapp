-- Notifications table for Koru app
-- Run this in Supabase SQL editor

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('message', 'payment', 'request', 'completed', 'summon_backed', 'summon_created')),
  title TEXT NOT NULL,
  description TEXT,
  read BOOLEAN DEFAULT FALSE,
  link TEXT,
  -- Related user info (for avatar display)
  related_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  related_user_username TEXT,
  related_user_image TEXT,
  -- Extra metadata as JSON
  metadata JSONB DEFAULT '{}',
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(user_id, created_at DESC);

-- Enable Row Level Security
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid()::text = user_id::text);

-- Users can update (mark as read) their own notifications
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Service role can insert notifications (for API)
CREATE POLICY "Service can insert notifications" ON notifications
  FOR INSERT WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_notification_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS trigger_update_notification_updated_at ON notifications;
CREATE TRIGGER trigger_update_notification_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_notification_updated_at();

-- Helper function to create a notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_description TEXT DEFAULT NULL,
  p_link TEXT DEFAULT NULL,
  p_related_user_id UUID DEFAULT NULL,
  p_related_user_username TEXT DEFAULT NULL,
  p_related_user_image TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO notifications (
    user_id, type, title, description, link,
    related_user_id, related_user_username, related_user_image, metadata
  ) VALUES (
    p_user_id, p_type, p_title, p_description, p_link,
    p_related_user_id, p_related_user_username, p_related_user_image, p_metadata
  ) RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to authenticated users (optional, mainly for testing)
GRANT EXECUTE ON FUNCTION create_notification TO authenticated;



