/*
  # Create transactions table

  1. New Tables
    - `transactions`
      - `id` (text, primary key)
      - `playerid` (text, references players.id)
      - `type` (text)
      - `amount` (numeric)
      - `currency` (text)
      - `relatedid` (text)
      - `description` (text)
      - `timestamp` (timestamptz)
      - `signature` (text)
      - `status` (text)
      - `createdat` (timestamptz)
      - `updatedat` (timestamptz)
  2. Security
    - Enable RLS on `transactions` table
    - Add policies for viewing and creating transactions
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

-- Add foreign key constraint to players table
ALTER TABLE transactions 
  ADD CONSTRAINT transactions_playerid_fkey 
  FOREIGN KEY (playerid) REFERENCES players(id) ON DELETE CASCADE;

-- Enable RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Players can view their own transactions"
  ON transactions
  FOR SELECT
  TO public
  USING (playerid IN (
    SELECT players.id
    FROM players
    WHERE (players.walletaddress = (current_setting('request.jwt.claims', true)::json ->> 'wallet_address'))
  ));

CREATE POLICY "Players can create their own transactions"
  ON transactions
  FOR INSERT
  TO public
  WITH CHECK (playerid IN (
    SELECT players.id
    FROM players
    WHERE (players.walletaddress = (current_setting('request.jwt.claims', true)::json ->> 'wallet_address'))
  ));

CREATE POLICY "Anonymous users can create transactions"
  ON transactions
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Add to realtime publication
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE transactions;
  END IF;
END $$;