/*
  # Create horses table

  1. New Tables
    - `horses`
      - `id` (text, primary key)
      - `tokenid` (text, unique)
      - `name` (text)
      - `geneticsdata` (jsonb) - Horse genetics information
      - `statsdata` (jsonb) - Performance stats
      - `breedingdata` (jsonb) - Breeding information
      - `trainingdata` (jsonb) - Training records
      - `appearancedata` (jsonb) - Visual appearance data
      - `loredata` (jsonb) - Background story
      - `owner` (text) - Owner wallet address
      - `isforsale` (boolean) - Marketplace status
      - `price` (numeric) - Sale price
      - `isforlease` (boolean) - Lease availability
      - `leasetermsdata` (jsonb) - Lease terms
      - `createdat` (timestamp)
      - `updatedat` (timestamp)

  2. Security
    - Enable RLS on `horses` table
    - Add policies for public viewing and owner management
*/

CREATE TABLE IF NOT EXISTS horses (
  id text PRIMARY KEY,
  tokenid text UNIQUE NOT NULL,
  name text NOT NULL,
  geneticsdata jsonb DEFAULT '{}'::jsonb NOT NULL,
  statsdata jsonb DEFAULT '{}'::jsonb NOT NULL,
  breedingdata jsonb DEFAULT '{}'::jsonb NOT NULL,
  trainingdata jsonb DEFAULT '{}'::jsonb NOT NULL,
  appearancedata jsonb DEFAULT '{}'::jsonb NOT NULL,
  loredata jsonb DEFAULT '{}'::jsonb NOT NULL,
  owner text NOT NULL,
  isforsale boolean DEFAULT false NOT NULL,
  price numeric DEFAULT NULL,
  isforlease boolean DEFAULT false NOT NULL,
  leasetermsdata jsonb DEFAULT NULL,
  createdat timestamptz DEFAULT now() NOT NULL,
  updatedat timestamptz DEFAULT now() NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_horses_owner ON horses USING btree (owner);
CREATE INDEX IF NOT EXISTS idx_horses_for_sale ON horses USING btree (isforsale) WHERE isforsale = true;
CREATE INDEX IF NOT EXISTS idx_horses_for_lease ON horses USING btree (isforlease) WHERE isforlease = true;

-- Enable RLS
ALTER TABLE horses ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Horses are viewable by everyone"
  ON horses
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Owners can manage their horses"
  ON horses
  FOR ALL
  TO public
  USING (owner = (current_setting('request.jwt.claims', true)::json ->> 'wallet_address'))
  WITH CHECK (owner = (current_setting('request.jwt.claims', true)::json ->> 'wallet_address'));

-- Allow anonymous and authenticated users to create horses
CREATE POLICY "Users can create horses"
  ON horses
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);