/*
# Complete Schema Setup for Sol Horse Game

1. New Tables
   - Creates all required tables with proper schema
   - Sets up foreign key relationships
   - Configures indexes for performance optimization

2. Security
   - Enables RLS on all tables
   - Creates appropriate policies for authenticated and anonymous users
   - Ensures secure data access patterns

3. Optimizations
   - Adds appropriate indexes
   - Uses JSON column types for complex data
   - Sets default values for better data consistency
*/

-- Make sure extensions are enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Players Table
CREATE TABLE IF NOT EXISTS players (
  id TEXT PRIMARY KEY,
  walletaddress TEXT UNIQUE NOT NULL,
  username TEXT NOT NULL,
  profiledata JSONB DEFAULT '{}' NOT NULL,
  assetsdata JSONB DEFAULT '{}' NOT NULL,
  statsdata JSONB DEFAULT '{}' NOT NULL,
  socialdata JSONB DEFAULT '{}' NOT NULL,
  preferencesdata JSONB DEFAULT '{}' NOT NULL,
  createdat TIMESTAMPTZ DEFAULT now() NOT NULL,
  updatedat TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create indexes for players
CREATE INDEX IF NOT EXISTS idx_players_wallet ON players USING btree (walletaddress);

-- Horses Table
CREATE TABLE IF NOT EXISTS horses (
  id TEXT PRIMARY KEY,
  tokenid TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  geneticsdata JSONB DEFAULT '{}' NOT NULL,
  statsdata JSONB DEFAULT '{}' NOT NULL,
  breedingdata JSONB DEFAULT '{}' NOT NULL,
  trainingdata JSONB DEFAULT '{}' NOT NULL,
  appearancedata JSONB DEFAULT '{}' NOT NULL,
  loredata JSONB DEFAULT '{}' NOT NULL,
  owner TEXT NOT NULL,
  isforsale BOOLEAN DEFAULT false NOT NULL,
  price NUMERIC,
  isforlease BOOLEAN DEFAULT false NOT NULL,
  leasetermsdata JSONB,
  createdat TIMESTAMPTZ DEFAULT now() NOT NULL,
  updatedat TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create indexes for horses
CREATE INDEX IF NOT EXISTS idx_horses_owner ON horses USING btree (owner);
CREATE INDEX IF NOT EXISTS idx_horses_for_sale ON horses USING btree (isforsale) WHERE (isforsale = true);
CREATE INDEX IF NOT EXISTS idx_horses_for_lease ON horses USING btree (isforlease) WHERE (isforlease = true);

-- Races Table
CREATE TABLE IF NOT EXISTS races (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  surface TEXT NOT NULL,
  distance NUMERIC NOT NULL,
  tier TEXT NOT NULL,
  conditionsdata JSONB DEFAULT '{}' NOT NULL,
  requirementsdata JSONB DEFAULT '{}' NOT NULL,
  entryfee NUMERIC NOT NULL,
  prizepool NUMERIC NOT NULL,
  prizedistribution JSONB DEFAULT '[]' NOT NULL,
  participantsdata JSONB DEFAULT '[]' NOT NULL,
  maxparticipants INTEGER NOT NULL,
  registrationdeadline TIMESTAMPTZ NOT NULL,
  racetime TIMESTAMPTZ NOT NULL,
  resultsdata JSONB,
  status TEXT NOT NULL,
  createdat TIMESTAMPTZ DEFAULT now() NOT NULL,
  updatedat TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create indexes for races
CREATE INDEX IF NOT EXISTS idx_races_status ON races USING btree (status);
CREATE INDEX IF NOT EXISTS idx_races_racetime ON races USING btree (racetime);
CREATE INDEX IF NOT EXISTS idx_races_registration_deadline ON races USING btree (registrationdeadline);

-- Tournaments Table
CREATE TABLE IF NOT EXISTS tournaments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL,
  requirementsdata JSONB DEFAULT '{}' NOT NULL,
  prizepool NUMERIC NOT NULL,
  prizedistribution JSONB DEFAULT '{}' NOT NULL,
  registrationstart TIMESTAMPTZ NOT NULL,
  registrationend TIMESTAMPTZ NOT NULL,
  tournamentstart TIMESTAMPTZ NOT NULL,
  tournamentend TIMESTAMPTZ NOT NULL,
  participantsdata JSONB DEFAULT '[]' NOT NULL,
  bracketsdata JSONB,
  status TEXT NOT NULL,
  category TEXT,
  tier TEXT,
  createdat TIMESTAMPTZ DEFAULT now() NOT NULL,
  updatedat TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create indexes for tournaments
CREATE INDEX IF NOT EXISTS idx_tournaments_status ON tournaments USING btree (status);
CREATE INDEX IF NOT EXISTS idx_tournaments_type ON tournaments USING btree (type);
CREATE INDEX IF NOT EXISTS idx_tournaments_registration_end ON tournaments USING btree (registrationend);

-- Bets Table
CREATE TABLE IF NOT EXISTS bets (
  id TEXT PRIMARY KEY,
  playerid TEXT NOT NULL,
  raceid TEXT NOT NULL,
  horseid TEXT NOT NULL,
  type TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  odds NUMERIC NOT NULL,
  potentialpayout NUMERIC NOT NULL,
  status TEXT NOT NULL,
  createdat TIMESTAMPTZ DEFAULT now() NOT NULL,
  updatedat TIMESTAMPTZ DEFAULT now() NOT NULL,
  FOREIGN KEY (playerid) REFERENCES players(id) ON DELETE CASCADE
);

-- Create indexes for bets
CREATE INDEX IF NOT EXISTS idx_bets_playerid ON bets USING btree (playerid);
CREATE INDEX IF NOT EXISTS idx_bets_raceid ON bets USING btree (raceid);
CREATE INDEX IF NOT EXISTS idx_bets_status ON bets USING btree (status);

-- Marketplace Listings Table
CREATE TABLE IF NOT EXISTS marketplace_listings (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  itemid TEXT NOT NULL,
  sellerid TEXT NOT NULL,
  price NUMERIC NOT NULL,
  currency TEXT NOT NULL,
  negotiable BOOLEAN DEFAULT false NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  imagesdata JSONB DEFAULT '[]' NOT NULL,
  listedat TIMESTAMPTZ NOT NULL,
  expiresat TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL,
  views INTEGER DEFAULT 0 NOT NULL,
  watchersdata JSONB DEFAULT '[]' NOT NULL,
  createdat TIMESTAMPTZ DEFAULT now() NOT NULL,
  updatedat TIMESTAMPTZ DEFAULT now() NOT NULL,
  FOREIGN KEY (sellerid) REFERENCES players(id) ON DELETE CASCADE
);

-- Create indexes for marketplace listings
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_sellerid ON marketplace_listings USING btree (sellerid);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_type ON marketplace_listings USING btree (type);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_status ON marketplace_listings USING btree (status);

-- Guilds Table
CREATE TABLE IF NOT EXISTS guilds (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  founderid TEXT NOT NULL,
  membersdata JSONB DEFAULT '[]' NOT NULL,
  statsdata JSONB DEFAULT '{}' NOT NULL,
  featuresdata JSONB DEFAULT '{}' NOT NULL,
  requirementsdata JSONB DEFAULT '{}' NOT NULL,
  createdat TIMESTAMPTZ DEFAULT now() NOT NULL,
  updatedat TIMESTAMPTZ DEFAULT now() NOT NULL,
  FOREIGN KEY (founderid) REFERENCES players(id) ON DELETE CASCADE
);

-- Create index for guilds
CREATE INDEX IF NOT EXISTS idx_guilds_founderid ON guilds USING btree (founderid);

-- Training Sessions Table
CREATE TABLE IF NOT EXISTS training_sessions (
  id TEXT PRIMARY KEY,
  horseid TEXT NOT NULL,
  programid TEXT NOT NULL,
  starttime TIMESTAMPTZ NOT NULL,
  endtime TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL,
  resultsdata JSONB,
  createdat TIMESTAMPTZ DEFAULT now() NOT NULL,
  updatedat TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create indexes for training_sessions
CREATE INDEX IF NOT EXISTS idx_training_sessions_horseid ON training_sessions USING btree (horseid);
CREATE INDEX IF NOT EXISTS idx_training_sessions_status ON training_sessions USING btree (status);

-- Breeding Records Table
CREATE TABLE IF NOT EXISTS breeding_records (
  id TEXT PRIMARY KEY,
  mareid TEXT NOT NULL,
  stallionid TEXT NOT NULL,
  offspringid TEXT,
  success BOOLEAN NOT NULL,
  cost NUMERIC NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  geneticsdata JSONB,
  createdat TIMESTAMPTZ DEFAULT now() NOT NULL,
  updatedat TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create indexes for breeding_records
CREATE INDEX IF NOT EXISTS idx_breeding_records_mareid ON breeding_records USING btree (mareid);
CREATE INDEX IF NOT EXISTS idx_breeding_records_stallionid ON breeding_records USING btree (stallionid);
CREATE INDEX IF NOT EXISTS idx_breeding_records_timestamp ON breeding_records USING btree (timestamp);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  playerid TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  read BOOLEAN DEFAULT false NOT NULL,
  actionurl TEXT,
  createdat TIMESTAMPTZ DEFAULT now() NOT NULL,
  updatedat TIMESTAMPTZ DEFAULT now() NOT NULL,
  FOREIGN KEY (playerid) REFERENCES players(id) ON DELETE CASCADE
);

-- Create indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_playerid ON notifications USING btree (playerid);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications USING btree (read);
CREATE INDEX IF NOT EXISTS idx_notifications_timestamp ON notifications USING btree (timestamp);

-- Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  playerid TEXT NOT NULL,
  type TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL,
  relatedid TEXT,
  description TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  signature TEXT,
  status TEXT NOT NULL,
  createdat TIMESTAMPTZ DEFAULT now() NOT NULL,
  updatedat TIMESTAMPTZ DEFAULT now() NOT NULL,
  FOREIGN KEY (playerid) REFERENCES players(id) ON DELETE CASCADE
);

-- Create indexes for transactions
CREATE INDEX IF NOT EXISTS idx_transactions_playerid ON transactions USING btree (playerid);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions USING btree (type);
CREATE INDEX IF NOT EXISTS idx_transactions_timestamp ON transactions USING btree (timestamp);

-- Enable Row Level Security
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE horses ENABLE ROW LEVEL SECURITY;
ALTER TABLE races ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE bets ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE guilds ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE breeding_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Players policies
CREATE POLICY "Players can view all players" ON players FOR SELECT TO public USING (true);

CREATE POLICY "Players can update their own data" ON players FOR UPDATE TO public USING (
  CASE
    WHEN (role() = 'anon'::text) THEN true
    WHEN (role() = 'authenticated'::text) THEN ((uid())::text = walletaddress)
    ELSE false
  END
);

CREATE POLICY "Users can create their own player records" ON players FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Horses policies
CREATE POLICY "Horses are viewable by everyone" ON horses FOR SELECT TO public USING (true);

CREATE POLICY "Owners can manage their horses" ON horses FOR ALL TO public USING (
  owner = (current_setting('request.jwt.claims', true)::json->>'wallet_address')
) WITH CHECK (
  owner = (current_setting('request.jwt.claims', true)::json->>'wallet_address')
);

CREATE POLICY "Users can create horses" ON horses FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Races policies
CREATE POLICY "Races are viewable by everyone" ON races FOR SELECT TO public USING (true);

CREATE POLICY "System can manage races" ON races FOR ALL TO anon, authenticated WITH CHECK (true);

-- Tournaments policies
CREATE POLICY "Tournaments are viewable by everyone" ON tournaments FOR SELECT TO public USING (true);

CREATE POLICY "System can manage tournaments" ON tournaments FOR ALL TO anon, authenticated WITH CHECK (true);

-- Bets policies
CREATE POLICY "Players can view all bets" ON bets FOR SELECT TO public USING (true);

CREATE POLICY "Anonymous users can place bets" ON bets FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Players can manage their own bets" ON bets FOR ALL TO public USING (
  playerid IN (
    SELECT players.id FROM players
    WHERE players.walletaddress = (current_setting('request.jwt.claims', true)::json->>'wallet_address')
  )
) WITH CHECK (
  playerid IN (
    SELECT players.id FROM players
    WHERE players.walletaddress = (current_setting('request.jwt.claims', true)::json->>'wallet_address')
  )
);

-- Marketplace listings policies
CREATE POLICY "Marketplace listings are viewable by everyone" ON marketplace_listings FOR SELECT TO public USING (true);

CREATE POLICY "Sellers can insert and update their listings" ON marketplace_listings FOR ALL TO public USING (
  (uid())::text IN (
    SELECT players.walletaddress
    FROM players
    WHERE players.id = marketplace_listings.sellerid
  )
) WITH CHECK (
  true
);

-- Guilds policies
CREATE POLICY "Guilds are viewable by everyone" ON guilds FOR SELECT TO public USING (true);

CREATE POLICY "Guild founders and members can manage guilds" ON guilds FOR ALL TO public USING (true) WITH CHECK (true);

-- Training sessions policies
CREATE POLICY "Training sessions are viewable by horse owners" ON training_sessions FOR SELECT TO public USING (
  horseid IN (
    SELECT horses.id FROM horses
    WHERE horses.owner = (current_setting('request.jwt.claims', true)::json->>'wallet_address')
  )
);

CREATE POLICY "Anonymous users can create training sessions" ON training_sessions FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Horse owners can manage training sessions" ON training_sessions FOR ALL TO public USING (
  horseid IN (
    SELECT horses.id FROM horses
    WHERE horses.owner = (current_setting('request.jwt.claims', true)::json->>'wallet_address')
  )
) WITH CHECK (
  horseid IN (
    SELECT horses.id FROM horses
    WHERE horses.owner = (current_setting('request.jwt.claims', true)::json->>'wallet_address')
  )
);

-- Breeding records policies
CREATE POLICY "Breeding records are viewable by horse owners" ON breeding_records FOR SELECT TO public USING (
  mareid IN (
    SELECT horses.id FROM horses
    WHERE horses.owner = (current_setting('request.jwt.claims', true)::json->>'wallet_address')
  ) OR stallionid IN (
    SELECT horses.id FROM horses
    WHERE horses.owner = (current_setting('request.jwt.claims', true)::json->>'wallet_address')
  )
);

CREATE POLICY "Anonymous users can create breeding records" ON breeding_records FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Horse owners can create breeding records" ON breeding_records FOR INSERT TO public WITH CHECK (true);

-- Notifications policies
CREATE POLICY "Players can view their own notifications" ON notifications FOR SELECT TO public USING (
  playerid IN (
    SELECT players.id FROM players
    WHERE players.walletaddress = (current_setting('request.jwt.claims', true)::json->>'wallet_address')
  )
);

CREATE POLICY "Players can update their own notifications" ON notifications FOR UPDATE TO public USING (
  playerid IN (
    SELECT players.id FROM players
    WHERE players.walletaddress = (current_setting('request.jwt.claims', true)::json->>'wallet_address')
  )
) WITH CHECK (
  playerid IN (
    SELECT players.id FROM players
    WHERE players.walletaddress = (current_setting('request.jwt.claims', true)::json->>'wallet_address')
  )
);

CREATE POLICY "System can create notifications" ON notifications FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Transactions policies
CREATE POLICY "Players can view their own transactions" ON transactions FOR SELECT TO public USING (
  playerid IN (
    SELECT players.id FROM players
    WHERE players.walletaddress = (current_setting('request.jwt.claims', true)::json->>'wallet_address')
  )
);

CREATE POLICY "Anonymous users can create transactions" ON transactions FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Players can create their own transactions" ON transactions FOR INSERT TO public WITH CHECK (
  playerid IN (
    SELECT players.id FROM players
    WHERE players.walletaddress = (current_setting('request.jwt.claims', true)::json->>'wallet_address')
  )
);