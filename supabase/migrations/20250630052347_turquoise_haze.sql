/*
  # Create tournaments table

  1. New Tables
    - `tournaments`
      - `id` (text, primary key)
      - `name` (text) - Tournament name
      - `description` (text) - Tournament description
      - `type` (text) - Tournament type
      - `requirementsdata` (jsonb) - Entry requirements
      - `prizepool` (numeric) - Total prize pool
      - `prizedistribution` (jsonb) - Prize distribution
      - `registrationstart` (timestamp) - Registration opens
      - `registrationend` (timestamp) - Registration closes
      - `tournamentstart` (timestamp) - Tournament begins
      - `tournamentend` (timestamp) - Tournament ends
      - `participantsdata` (jsonb) - Participants list
      - `bracketsdata` (jsonb) - Tournament brackets
      - `status` (text) - Tournament status
      - `category` (text) - Tournament category
      - `tier` (text) - Tournament tier
      - `createdat` (timestamp)
      - `updatedat` (timestamp)

  2. Security
    - Enable RLS on `tournaments` table
    - Add policies for public viewing and tournament management
*/

CREATE TABLE IF NOT EXISTS tournaments (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  type text NOT NULL,
  requirementsdata jsonb DEFAULT '{}'::jsonb NOT NULL,
  prizepool numeric NOT NULL,
  prizedistribution jsonb DEFAULT '[]'::jsonb NOT NULL,
  registrationstart timestamptz NOT NULL,
  registrationend timestamptz NOT NULL,
  tournamentstart timestamptz NOT NULL,
  tournamentend timestamptz NOT NULL,
  participantsdata jsonb DEFAULT '[]'::jsonb NOT NULL,
  bracketsdata jsonb DEFAULT NULL,
  status text NOT NULL,
  category text DEFAULT NULL,
  tier text DEFAULT NULL,
  createdat timestamptz DEFAULT now() NOT NULL,
  updatedat timestamptz DEFAULT now() NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_tournaments_status ON tournaments USING btree (status);
CREATE INDEX IF NOT EXISTS idx_tournaments_type ON tournaments USING btree (type);
CREATE INDEX IF NOT EXISTS idx_tournaments_registration_end ON tournaments USING btree (registrationend);

-- Enable RLS
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Tournaments are viewable by everyone"
  ON tournaments
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "System can manage tournaments"
  ON tournaments
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);