/*
  # Create supporting tables

  1. New Tables
    - `guilds` - Player guilds/organizations
    - `training_sessions` - Horse training records
    - `breeding_records` - Breeding history
    - `notifications` - Player notifications

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for each table
*/

-- Guilds table
CREATE TABLE IF NOT EXISTS guilds (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  founderid text NOT NULL,
  membersdata jsonb DEFAULT '[]'::jsonb NOT NULL,
  statsdata jsonb DEFAULT '{}'::jsonb NOT NULL,
  featuresdata jsonb DEFAULT '{}'::jsonb NOT NULL,
  requirementsdata jsonb DEFAULT '{}'::jsonb NOT NULL,
  createdat timestamptz DEFAULT now() NOT NULL,
  updatedat timestamptz DEFAULT now() NOT NULL
);

-- Add foreign key constraint
ALTER TABLE guilds ADD CONSTRAINT guilds_founderid_fkey 
  FOREIGN KEY (founderid) REFERENCES players(id) ON DELETE CASCADE;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_guilds_founderid ON guilds USING btree (founderid);

-- Enable RLS
ALTER TABLE guilds ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Guilds are viewable by everyone"
  ON guilds
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Guild founders and members can manage guilds"
  ON guilds
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Training sessions table
CREATE TABLE IF NOT EXISTS training_sessions (
  id text PRIMARY KEY,
  horseid text NOT NULL,
  programid text NOT NULL,
  starttime timestamptz NOT NULL,
  endtime timestamptz NOT NULL,
  status text NOT NULL,
  resultsdata jsonb DEFAULT NULL,
  createdat timestamptz DEFAULT now() NOT NULL,
  updatedat timestamptz DEFAULT now() NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_training_sessions_horseid ON training_sessions USING btree (horseid);
CREATE INDEX IF NOT EXISTS idx_training_sessions_status ON training_sessions USING btree (status);

-- Enable RLS
ALTER TABLE training_sessions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Training sessions are viewable by horse owners"
  ON training_sessions
  FOR SELECT
  TO public
  USING (horseid IN (
    SELECT id FROM horses 
    WHERE owner = (current_setting('request.jwt.claims', true)::json ->> 'wallet_address')
  ));

CREATE POLICY "Horse owners can manage training sessions"
  ON training_sessions
  FOR ALL
  TO public
  USING (horseid IN (
    SELECT id FROM horses 
    WHERE owner = (current_setting('request.jwt.claims', true)::json ->> 'wallet_address')
  ))
  WITH CHECK (horseid IN (
    SELECT id FROM horses 
    WHERE owner = (current_setting('request.jwt.claims', true)::json ->> 'wallet_address')
  ));

-- Allow anonymous users to create training sessions
CREATE POLICY "Anonymous users can create training sessions"
  ON training_sessions
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Breeding records table
CREATE TABLE IF NOT EXISTS breeding_records (
  id text PRIMARY KEY,
  mareid text NOT NULL,
  stallionid text NOT NULL,
  offspringid text DEFAULT NULL,
  success boolean NOT NULL,
  cost numeric NOT NULL,
  timestamp timestamptz NOT NULL,
  geneticsdata jsonb DEFAULT NULL,
  createdat timestamptz DEFAULT now() NOT NULL,
  updatedat timestamptz DEFAULT now() NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_breeding_records_mareid ON breeding_records USING btree (mareid);
CREATE INDEX IF NOT EXISTS idx_breeding_records_stallionid ON breeding_records USING btree (stallionid);
CREATE INDEX IF NOT EXISTS idx_breeding_records_timestamp ON breeding_records USING btree (timestamp);

-- Enable RLS
ALTER TABLE breeding_records ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Breeding records are viewable by horse owners"
  ON breeding_records
  FOR SELECT
  TO public
  USING (
    mareid IN (
      SELECT id FROM horses 
      WHERE owner = (current_setting('request.jwt.claims', true)::json ->> 'wallet_address')
    ) OR
    stallionid IN (
      SELECT id FROM horses 
      WHERE owner = (current_setting('request.jwt.claims', true)::json ->> 'wallet_address')
    )
  );

CREATE POLICY "Horse owners can create breeding records"
  ON breeding_records
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow anonymous users to create breeding records
CREATE POLICY "Anonymous users can create breeding records"
  ON breeding_records
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id text PRIMARY KEY,
  playerid text NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  timestamp timestamptz NOT NULL,
  read boolean DEFAULT false NOT NULL,
  actionurl text DEFAULT NULL,
  createdat timestamptz DEFAULT now() NOT NULL,
  updatedat timestamptz DEFAULT now() NOT NULL
);

-- Add foreign key constraint
ALTER TABLE notifications ADD CONSTRAINT notifications_playerid_fkey 
  FOREIGN KEY (playerid) REFERENCES players(id) ON DELETE CASCADE;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_notifications_playerid ON notifications USING btree (playerid);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications USING btree (read);
CREATE INDEX IF NOT EXISTS idx_notifications_timestamp ON notifications USING btree (timestamp);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Players can view their own notifications"
  ON notifications
  FOR SELECT
  TO public
  USING (playerid IN (
    SELECT id FROM players 
    WHERE walletaddress = (current_setting('request.jwt.claims', true)::json ->> 'wallet_address')
  ));

CREATE POLICY "Players can update their own notifications"
  ON notifications
  FOR UPDATE
  TO public
  USING (playerid IN (
    SELECT id FROM players 
    WHERE walletaddress = (current_setting('request.jwt.claims', true)::json ->> 'wallet_address')
  ))
  WITH CHECK (playerid IN (
    SELECT id FROM players 
    WHERE walletaddress = (current_setting('request.jwt.claims', true)::json ->> 'wallet_address')
  ));

CREATE POLICY "System can create notifications"
  ON notifications
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);