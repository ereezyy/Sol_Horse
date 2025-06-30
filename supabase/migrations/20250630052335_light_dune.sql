/*
  # Create bets table

  1. New Tables
    - `bets`
      - `id` (text, primary key)
      - `playerid` (text) - Reference to player
      - `raceid` (text) - Reference to race
      - `horseid` (text) - Reference to horse
      - `type` (text) - Bet type (Win, Place, Show, etc.)
      - `amount` (numeric) - Bet amount
      - `odds` (numeric) - Betting odds
      - `potentialpayout` (numeric) - Potential winnings
      - `status` (text) - Bet status (Active, Won, Lost)
      - `createdat` (timestamp)
      - `updatedat` (timestamp)

  2. Security
    - Enable RLS on `bets` table
    - Add policies for players to manage their own bets
*/

CREATE TABLE IF NOT EXISTS bets (
  id text PRIMARY KEY,
  playerid text NOT NULL,
  raceid text NOT NULL,
  horseid text NOT NULL,
  type text NOT NULL,
  amount numeric NOT NULL,
  odds numeric NOT NULL,
  potentialpayout numeric NOT NULL,
  status text NOT NULL,
  createdat timestamptz DEFAULT now() NOT NULL,
  updatedat timestamptz DEFAULT now() NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_bets_playerid ON bets USING btree (playerid);
CREATE INDEX IF NOT EXISTS idx_bets_raceid ON bets USING btree (raceid);
CREATE INDEX IF NOT EXISTS idx_bets_status ON bets USING btree (status);

-- Add foreign key constraint to players table
ALTER TABLE bets ADD CONSTRAINT bets_playerid_fkey 
  FOREIGN KEY (playerid) REFERENCES players(id) ON DELETE CASCADE;

-- Enable RLS
ALTER TABLE bets ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Players can view all bets"
  ON bets
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Players can manage their own bets"
  ON bets
  FOR ALL
  TO public
  USING (playerid IN (
    SELECT id FROM players 
    WHERE walletaddress = (current_setting('request.jwt.claims', true)::json ->> 'wallet_address')
  ))
  WITH CHECK (playerid IN (
    SELECT id FROM players 
    WHERE walletaddress = (current_setting('request.jwt.claims', true)::json ->> 'wallet_address')
  ));

-- Allow anonymous users to place bets
CREATE POLICY "Anonymous users can place bets"
  ON bets
  FOR INSERT
  TO anon
  WITH CHECK (true);