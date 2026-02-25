-- =============================================
-- ESCROWS TABLE - Links on-chain escrows to app data
-- Run this in your Supabase SQL Editor
-- =============================================

CREATE TABLE IF NOT EXISTS escrows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- On-chain data (source of truth is the blockchain)
  escrow_id BIGINT NOT NULL UNIQUE,  -- On-chain escrow ID (0, 1, 2, ...)
  chain_id INTEGER NOT NULL DEFAULT 84532,  -- 8453 = Base Mainnet, 84532 = Base Sepolia
  
  -- Participants (wallet addresses)
  depositor_address TEXT NOT NULL,  -- Address that created the escrow
  recipient_address TEXT NOT NULL,  -- Address that receives funds
  
  -- Link to app users (optional, for users with accounts)
  depositor_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  recipient_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Amount
  amount DECIMAL(20, 6) NOT NULL,  -- USDC amount (6 decimals)
  
  -- Status (cached from chain, update via webhook or polling)
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending',    -- Created, waiting for recipient to accept
    'accepted',   -- Recipient accepted
    'released',   -- Depositor released funds
    'disputed',   -- Depositor disputed
    'completed',  -- Funds withdrawn
    'cancelled',  -- Cancelled/refunded
    'expired'     -- Accept window passed
  )),
  
  -- Timestamps (from chain events)
  accept_deadline TIMESTAMPTZ,
  dispute_deadline TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  disputed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- Transaction hashes
  create_tx_hash TEXT,
  accept_tx_hash TEXT,
  complete_tx_hash TEXT,
  
  -- Link to chat (if escrow is for a paid chat)
  chat_id UUID REFERENCES chats(id) ON DELETE SET NULL,
  
  -- Additional context
  description TEXT,  -- e.g., "Payment for 30min consultation"
  metadata JSONB,    -- Any extra data
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================

-- Fast lookup by on-chain escrow ID
CREATE UNIQUE INDEX IF NOT EXISTS idx_escrows_escrow_id ON escrows(escrow_id, chain_id);

-- Find escrows by depositor
CREATE INDEX IF NOT EXISTS idx_escrows_depositor_address ON escrows(depositor_address);
CREATE INDEX IF NOT EXISTS idx_escrows_depositor_user_id ON escrows(depositor_user_id);

-- Find escrows by recipient
CREATE INDEX IF NOT EXISTS idx_escrows_recipient_address ON escrows(recipient_address);
CREATE INDEX IF NOT EXISTS idx_escrows_recipient_user_id ON escrows(recipient_user_id);

-- Filter by status
CREATE INDEX IF NOT EXISTS idx_escrows_status ON escrows(status);

-- Find active escrows (pending or accepted)
CREATE INDEX IF NOT EXISTS idx_escrows_active ON escrows(status) 
  WHERE status IN ('pending', 'accepted', 'disputed');

-- Link to chat
CREATE INDEX IF NOT EXISTS idx_escrows_chat_id ON escrows(chat_id);

-- Recent escrows
CREATE INDEX IF NOT EXISTS idx_escrows_created ON escrows(created_at DESC);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

ALTER TABLE escrows ENABLE ROW LEVEL SECURITY;

-- Anyone can view escrows (public blockchain data)
CREATE POLICY "Anyone can view escrows" ON escrows
  FOR SELECT USING (true);

-- Allow insert (from backend/webhooks)
CREATE POLICY "Allow insert escrows" ON escrows
  FOR INSERT WITH CHECK (true);

-- Allow update (from backend/webhooks)
CREATE POLICY "Allow update escrows" ON escrows
  FOR UPDATE USING (true) WITH CHECK (true);

-- =============================================
-- AUTO-UPDATE TRIGGER
-- =============================================

DROP TRIGGER IF EXISTS update_escrows_updated_at ON escrows;
CREATE TRIGGER update_escrows_updated_at
  BEFORE UPDATE ON escrows
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Get escrows for a user (by user_id)
CREATE OR REPLACE FUNCTION get_user_escrows(p_user_id UUID)
RETURNS SETOF escrows AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM escrows
  WHERE depositor_user_id = p_user_id
     OR recipient_user_id = p_user_id
  ORDER BY created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Get escrows for a wallet address
CREATE OR REPLACE FUNCTION get_wallet_escrows(p_address TEXT)
RETURNS SETOF escrows AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM escrows
  WHERE LOWER(depositor_address) = LOWER(p_address)
     OR LOWER(recipient_address) = LOWER(p_address)
  ORDER BY created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Get active escrows needing action
CREATE OR REPLACE FUNCTION get_pending_actions(p_address TEXT)
RETURNS TABLE (
  escrow_id BIGINT,
  action_needed TEXT,
  deadline TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.escrow_id,
    CASE 
      WHEN e.status = 'pending' AND LOWER(e.recipient_address) = LOWER(p_address) THEN 'accept'
      WHEN e.status = 'accepted' AND LOWER(e.recipient_address) = LOWER(p_address) THEN 'withdraw'
      WHEN e.status = 'released' AND LOWER(e.recipient_address) = LOWER(p_address) THEN 'withdraw'
      WHEN e.status = 'pending' AND e.accept_deadline < NOW() AND LOWER(e.depositor_address) = LOWER(p_address) THEN 'refund'
      ELSE NULL
    END as action_needed,
    CASE 
      WHEN e.status = 'pending' THEN e.accept_deadline
      WHEN e.status = 'accepted' THEN e.dispute_deadline
      ELSE NULL
    END as deadline
  FROM escrows e
  WHERE (LOWER(e.depositor_address) = LOWER(p_address) OR LOWER(e.recipient_address) = LOWER(p_address))
    AND e.status IN ('pending', 'accepted', 'released')
  ORDER BY deadline ASC NULLS LAST;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- STATS VIEW
-- =============================================

CREATE OR REPLACE VIEW escrow_stats AS
SELECT 
  COUNT(*) as total_escrows,
  COUNT(*) FILTER (WHERE status = 'completed') as completed_escrows,
  COUNT(*) FILTER (WHERE status = 'pending') as pending_escrows,
  COUNT(*) FILTER (WHERE status = 'disputed') as disputed_escrows,
  COALESCE(SUM(amount), 0) as total_volume,
  COALESCE(SUM(amount) FILTER (WHERE status = 'completed'), 0) as completed_volume
FROM escrows;

-- =============================================
-- DONE!
-- =============================================
SELECT 'Escrows table created successfully!' as status;
