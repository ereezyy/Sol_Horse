/*
  # Create races table

  1. New Tables
    - `races`
      - `id` (text, primary key)
      - `name` (text) - Race name
      - `type` (text) - Race type (sprint, endurance, etc.)
      - `surface` (text) - Track surface
      - `distance` (numeric) - Race distance
      - `tier` (text) - Difficulty tier
      - `conditionsdata` (jsonb) - Weather/track conditions
      - `requirementsdata` (jsonb) - Entry requirements
      - `entryfee` (numeric) - Cost to enter
      - `prizepool` (numeric) - Total prize money
      - `prizedistribution` (jsonb) - How prizes are distributed
      - `participantsdata` (jsonb) - Entered horses
      - `maxparticipants` (integer) - Maximum entries
      - `registrationdeadline` (timestamp) - Registration cutoff
      - `racetime` (timestamp) - When race starts
      - `resultsdata` (jsonb) - Race results
      - `status` (text) - Current status
      - `createdat` (timestamp)
      - `updatedat` (timestamp)

  2. Security
    - Enable RLS on `races` table
    - Add policies for public viewing and race management
*/

CREATE TABLE IF NOT EXISTS races (
  id text PRIMARY KEY,
  name text NOT NULL,
  type text NOT NULL,
  surface text NOT NULL,
  distance numeric NOT NULL,
  tier text NOT NULL,
  conditionsdata jsonb DEFAULT '{}'::jsonb NOT NULL,
  requirementsdata jsonb DEFAULT '{}'::jsonb NOT NULL,
  entryfee numeric NOT NULL,
  prizepool numeric NOT NULL,
  prizedistribution jsonb DEFAULT '[]'::jsonb NOT NULL,
  participantsdata jsonb DEFAULT '[]'::jsonb NOT NULL,
  maxparticipants integer NOT NULL,
  registrationdeadline timestamptz NOT NULL,
  racetime timestamptz NOT NULL,
  resultsdata jsonb DEFAULT NULL,
  status text NOT NULL,
  createdat timestamptz DEFAULT now() NOT NULL,
  updatedat timestamptz DEFAULT now() NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_races_status ON races USING btree (status);
CREATE INDEX IF NOT EXISTS idx_races_racetime ON races USING btree (racetime);
CREATE INDEX IF NOT EXISTS idx_races_registration_deadline ON races USING btree (registrationdeadline);

-- Enable RLS
ALTER TABLE races ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Races are viewable by everyone"
  ON races
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "System can manage races"
  ON races
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);