/*
  # Fix Transactions Table Publication Issue
  
  1. New Tables
    - None (fixes existing tables)
  2. Changes
    - Makes all operations conditional to avoid errors
    - Fixes the issue with transactions table already being in publication
  3. Security
    - No changes to existing policies
*/

-- Only perform operations if transactions table exists
DO $$ 
BEGIN
  -- Check if the transactions table exists first
  IF EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' AND tablename = 'transactions'
  ) THEN
    -- Ensure indexes exist
    IF NOT EXISTS (
      SELECT 1 FROM pg_indexes 
      WHERE tablename = 'transactions' AND indexname = 'idx_transactions_playerid'
    ) THEN
      CREATE INDEX idx_transactions_playerid ON transactions USING btree (playerid);
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM pg_indexes 
      WHERE tablename = 'transactions' AND indexname = 'idx_transactions_type'
    ) THEN
      CREATE INDEX idx_transactions_type ON transactions USING btree (type);
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM pg_indexes 
      WHERE tablename = 'transactions' AND indexname = 'idx_transactions_timestamp'
    ) THEN
      CREATE INDEX idx_transactions_timestamp ON transactions USING btree (timestamp);
    END IF;
    
    -- Check if foreign key constraint exists
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint 
      WHERE conname = 'transactions_playerid_fkey'
    ) THEN
      ALTER TABLE transactions 
        ADD CONSTRAINT transactions_playerid_fkey 
        FOREIGN KEY (playerid) REFERENCES players(id) ON DELETE CASCADE;
    END IF;
    
    -- Ensure RLS is enabled
    ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
    
    -- Add policies if they don't exist
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'transactions' AND policyname = 'Players can view their own transactions'
    ) THEN
      CREATE POLICY "Players can view their own transactions"
        ON transactions
        FOR SELECT
        TO public
        USING (playerid IN (
          SELECT players.id
          FROM players
          WHERE (players.walletaddress = (current_setting('request.jwt.claims', true)::json ->> 'wallet_address'))
        ));
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'transactions' AND policyname = 'Players can create their own transactions'
    ) THEN
      CREATE POLICY "Players can create their own transactions"
        ON transactions
        FOR INSERT
        TO public
        WITH CHECK (playerid IN (
          SELECT players.id
          FROM players
          WHERE (players.walletaddress = (current_setting('request.jwt.claims', true)::json ->> 'wallet_address'))
        ));
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'transactions' AND policyname = 'Anonymous users can create transactions'
    ) THEN
      CREATE POLICY "Anonymous users can create transactions"
        ON transactions
        FOR INSERT
        TO anon
        WITH CHECK (true);
    END IF;
    
    -- We'll skip any publication related operations since the table is already in the publication
    -- and that was causing the error
  END IF;
END $$;