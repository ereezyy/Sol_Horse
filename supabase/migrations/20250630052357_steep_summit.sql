/*
  # Create transactions table

  1. New Tables
    - `transactions`
      - `id` (text, primary key)
      - `playerid` (text) - Reference to player
      - `type` (text) - Transaction type
      - `amount` (numeric) - Transaction amount
      - `currency` (text) - Currency type
      - `relatedid` (text) - Related entity ID
      - `description` (text) - Transaction description
      - `timestamp` (timestamp) - Transaction time
      - `signature` (text) - Blockchain signature
      - `status` (text) - Transaction status
      - `createdat` (timestamp)
      - `updatedat` (timestamp)

  2. Security
    - Enable RLS on `transactions` table
    - Add policies for players to view their own transactions
*/

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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_transactions_playerid ON transactions USING btree (playerid);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions USING btree (type);
CREATE INDEX IF NOT EXISTS idx_transactions_timestamp ON transactions USING btree (timestamp);

-- Add foreign key constraint to players table
ALTER TABLE transactions ADD CONSTRAINT transactions_playerid_fkey 
  FOREIGN KEY (playerid) REFERENCES players(id) ON DELETE CASCADE;

-- Enable RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Players can view their own transactions"
  ON transactions
  FOR SELECT
  TO public
  USING (playerid IN (
    SELECT id FROM players 
    WHERE walletaddress = (current_setting('request.jwt.claims', true)::json ->> 'wallet_address')
  ));

CREATE POLICY "Players can create their own transactions"
  ON transactions
  FOR INSERT
  TO public
  WITH CHECK (playerid IN (
    SELECT id FROM players 
    WHERE walletaddress = (current_setting('request.jwt.claims', true)::json ->> 'wallet_address')
  ));

-- Allow anonymous users to create transactions
CREATE POLICY "Anonymous users can create transactions"
  ON transactions
  FOR INSERT
  TO anon
  WITH CHECK (true);