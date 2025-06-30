/*
  # Transaction System Schema

  1. New Tables
     - `transactions`: Stores all financial transactions in the system
       - `id` (text, primary key): Unique transaction identifier
       - `playerid` (text): Foreign key to players table
       - `type` (text): Transaction type (e.g., bet_placed, race_winnings)
       - `amount` (numeric): Transaction amount
       - `currency` (text): Currency type (TURF, SOL)
       - Various metadata fields

  2. Security
     - Enable RLS on the transactions table
     - Add policies for transaction management and visibility
*/

-- Create transactions table if it doesn't exist
CREATE TABLE IF NOT EXISTS transactions (
  id text PRIMARY KEY,
  playerid text NOT NULL,
  type text NOT NULL,
  amount numeric NOT NULL,
  currency text NOT NULL,
  relatedid text DEFAULT NULL,
  description text NOT NULL,
  timestamp timestamptz NOT NULL,
  signature text DEFAULT NULL,
  status text NOT NULL,
  createdat timestamptz DEFAULT now() NOT NULL,
  updatedat timestamptz DEFAULT now() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_transactions_playerid ON transactions USING btree (playerid);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions USING btree (type);
CREATE INDEX IF NOT EXISTS idx_transactions_timestamp ON transactions USING btree (timestamp);

-- Add foreign key constraint only if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'transactions_playerid_fkey'
  ) THEN
    ALTER TABLE transactions 
      ADD CONSTRAINT transactions_playerid_fkey 
      FOREIGN KEY (playerid) REFERENCES players(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Enable RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Add policies if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy 
    WHERE polname = 'Players can view their own transactions'
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
    SELECT 1 FROM pg_policy 
    WHERE polname = 'Players can create their own transactions'
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
    SELECT 1 FROM pg_policy 
    WHERE polname = 'Anonymous users can create transactions'
  ) THEN
    CREATE POLICY "Anonymous users can create transactions"
      ON transactions
      FOR INSERT
      TO anon
      WITH CHECK (true);
  END IF;
END $$;

-- Add to realtime publication
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE transactions;
  END IF;
END $$;