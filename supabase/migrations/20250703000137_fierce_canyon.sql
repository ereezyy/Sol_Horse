/*
# Initial Schema Setup

1. New Tables
   - `players` - Stores player profiles and game data
   - `horses` - Stores horse NFTs and their attributes
   - `marketplace_listings` - Marketplace for buying/selling horses and items
   - `transactions` - Records all financial transactions
   - `races` - Stores race events information
   - `bets` - Records betting activity
   - `guilds` - Stores guild information
   - `tournaments` - Tournament data
   - `training_sessions` - Horse training records
   - `breeding_records` - Breeding history and results
   - `notifications` - User notifications

2. Security
   - Enable Row Level Security on all tables
   - Set up appropriate access policies
*/

-- Players Table
CREATE TABLE IF NOT EXISTS players (
  id text PRIMARY KEY,
  walletaddress text UNIQUE NOT NULL,
  username text NOT NULL,
  profiledata jsonb NOT NULL DEFAULT '{}'::jsonb,
  assetsdata jsonb NOT NULL DEFAULT '{}'::jsonb,
  statsdata jsonb NOT NULL DEFAULT '{}'::jsonb,
  socialdata jsonb NOT NULL DEFAULT '{}'::jsonb,
  preferencesdata jsonb NOT NULL DEFAULT '{}'::jsonb,
  createdat timestamptz NOT NULL DEFAULT now(),
  updatedat timestamptz NOT NULL DEFAULT now()
);

-- Horses Table
CREATE TABLE IF NOT EXISTS horses (
  id text PRIMARY KEY,
  tokenid text UNIQUE NOT NULL,
  name text NOT NULL,
  geneticsdata jsonb NOT NULL DEFAULT '{}'::jsonb,
  statsdata jsonb NOT NULL DEFAULT '{}'::jsonb,
  breedingdata jsonb NOT NULL DEFAULT '{}'::jsonb,
  trainingdata jsonb NOT NULL DEFAULT '{}'::jsonb,
  appearancedata jsonb NOT NULL DEFAULT '{}'::jsonb,
  loredata jsonb NOT NULL DEFAULT '{}'::jsonb,
  owner text NOT NULL,
  isforsale boolean NOT NULL DEFAULT false,
  price numeric,
  isforlease boolean NOT NULL DEFAULT false,
  leasetermsdata jsonb,
  createdat timestamptz NOT NULL DEFAULT now(),
  updatedat timestamptz NOT NULL DEFAULT now()
);

-- Marketplace Listings Table
CREATE TABLE IF NOT EXISTS marketplace_listings (
  id text PRIMARY KEY,
  type text NOT NULL,
  itemid text NOT NULL,
  sellerid text NOT NULL,
  price numeric NOT NULL,
  currency text NOT NULL,
  negotiable boolean NOT NULL DEFAULT false,
  title text NOT NULL,
  description text NOT NULL,
  imagesdata jsonb NOT NULL DEFAULT '[]'::jsonb,
  listedat timestamptz NOT NULL,
  expiresat timestamptz NOT NULL,
  status text NOT NULL,
  views integer NOT NULL DEFAULT 0,
  watchersdata jsonb NOT NULL DEFAULT '[]'::jsonb,
  createdat timestamptz NOT NULL DEFAULT now(),
  updatedat timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (sellerid) REFERENCES players(id) ON DELETE CASCADE
);

-- Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
  id text PRIMARY KEY,
  playerid text NOT NULL,
  type text NOT NULL,
  amount numeric NOT NULL,
  currency text NOT NULL,
  relatedid text,
  description text NOT NULL,
  timestamp timestamptz NOT NULL,
  signature text,
  status text NOT NULL,
  createdat timestamptz NOT NULL DEFAULT now(),
  updatedat timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (playerid) REFERENCES players(id) ON DELETE CASCADE
);

-- Races Table
CREATE TABLE IF NOT EXISTS races (
  id text PRIMARY KEY,
  name text NOT NULL,
  type text NOT NULL,
  surface text NOT NULL,
  distance numeric NOT NULL,
  tier text NOT NULL,
  conditionsdata jsonb NOT NULL DEFAULT '{}'::jsonb,
  requirementsdata jsonb NOT NULL DEFAULT '{}'::jsonb,
  entryfee numeric NOT NULL,
  prizepool numeric NOT NULL,
  prizedistribution jsonb NOT NULL DEFAULT '[]'::jsonb,
  participantsdata jsonb NOT NULL DEFAULT '[]'::jsonb,
  maxparticipants integer NOT NULL,
  registrationdeadline timestamptz NOT NULL,
  racetime timestamptz NOT NULL,
  resultsdata jsonb,
  status text NOT NULL,
  createdat timestamptz NOT NULL DEFAULT now(),
  updatedat timestamptz NOT NULL DEFAULT now()
);

-- Bets Table
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
  createdat timestamptz NOT NULL DEFAULT now(),
  updatedat timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (playerid) REFERENCES players(id) ON DELETE CASCADE
);

-- Guilds Table
CREATE TABLE IF NOT EXISTS guilds (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  founderid text NOT NULL,
  membersdata jsonb NOT NULL DEFAULT '[]'::jsonb,
  statsdata jsonb NOT NULL DEFAULT '{}'::jsonb,
  featuresdata jsonb NOT NULL DEFAULT '{}'::jsonb,
  requirementsdata jsonb NOT NULL DEFAULT '{}'::jsonb,
  createdat timestamptz NOT NULL DEFAULT now(),
  updatedat timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (founderid) REFERENCES players(id) ON DELETE CASCADE
);

-- Tournaments Table
CREATE TABLE IF NOT EXISTS tournaments (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  type text NOT NULL,
  requirementsdata jsonb NOT NULL DEFAULT '{}'::jsonb,
  prizepool numeric NOT NULL,
  prizedistribution jsonb NOT NULL DEFAULT '[]'::jsonb,
  registrationstart timestamptz NOT NULL,
  registrationend timestamptz NOT NULL,
  tournamentstart timestamptz NOT NULL,
  tournamentend timestamptz NOT NULL,
  participantsdata jsonb NOT NULL DEFAULT '[]'::jsonb,
  bracketsdata jsonb,
  status text NOT NULL,
  category text,
  tier text,
  createdat timestamptz NOT NULL DEFAULT now(),
  updatedat timestamptz NOT NULL DEFAULT now()
);

-- Training Sessions Table
CREATE TABLE IF NOT EXISTS training_sessions (
  id text PRIMARY KEY,
  horseid text NOT NULL,
  programid text NOT NULL,
  starttime timestamptz NOT NULL,
  endtime timestamptz NOT NULL,
  status text NOT NULL,
  resultsdata jsonb,
  createdat timestamptz NOT NULL DEFAULT now(),
  updatedat timestamptz NOT NULL DEFAULT now()
);

-- Breeding Records Table
CREATE TABLE IF NOT EXISTS breeding_records (
  id text PRIMARY KEY,
  mareid text NOT NULL,
  stallionid text NOT NULL,
  offspringid text,
  success boolean NOT NULL,
  cost numeric NOT NULL,
  timestamp timestamptz NOT NULL,
  geneticsdata jsonb,
  createdat timestamptz NOT NULL DEFAULT now(),
  updatedat timestamptz NOT NULL DEFAULT now()
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id text PRIMARY KEY,
  playerid text NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  timestamp timestamptz NOT NULL,
  read boolean NOT NULL DEFAULT false,
  actionurl text,
  createdat timestamptz NOT NULL DEFAULT now(),
  updatedat timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (playerid) REFERENCES players(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_players_wallet ON players USING btree (walletaddress);
CREATE INDEX IF NOT EXISTS idx_horses_owner ON horses USING btree (owner);
CREATE INDEX IF NOT EXISTS idx_horses_for_sale ON horses USING btree (isforsale) WHERE (isforsale = true);
CREATE INDEX IF NOT EXISTS idx_horses_for_lease ON horses USING btree (isforlease) WHERE (isforlease = true);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_sellerid ON marketplace_listings USING btree (sellerid);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_type ON marketplace_listings USING btree (type);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_status ON marketplace_listings USING btree (status);
CREATE INDEX IF NOT EXISTS idx_transactions_playerid ON transactions USING btree (playerid);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions USING btree (type);
CREATE INDEX IF NOT EXISTS idx_transactions_timestamp ON transactions USING btree (timestamp);
CREATE INDEX IF NOT EXISTS idx_races_status ON races USING btree (status);
CREATE INDEX IF NOT EXISTS idx_races_racetime ON races USING btree (racetime);
CREATE INDEX IF NOT EXISTS idx_races_registration_deadline ON races USING btree (registrationdeadline);
CREATE INDEX IF NOT EXISTS idx_bets_playerid ON bets USING btree (playerid);
CREATE INDEX IF NOT EXISTS idx_bets_raceid ON bets USING btree (raceid);
CREATE INDEX IF NOT EXISTS idx_bets_status ON bets USING btree (status);
CREATE INDEX IF NOT EXISTS idx_guilds_founderid ON guilds USING btree (founderid);
CREATE INDEX IF NOT EXISTS idx_tournaments_status ON tournaments USING btree (status);
CREATE INDEX IF NOT EXISTS idx_tournaments_type ON tournaments USING btree (type);
CREATE INDEX IF NOT EXISTS idx_tournaments_registration_end ON tournaments USING btree (registrationend);
CREATE INDEX IF NOT EXISTS idx_training_sessions_horseid ON training_sessions USING btree (horseid);
CREATE INDEX IF NOT EXISTS idx_training_sessions_status ON training_sessions USING btree (status);
CREATE INDEX IF NOT EXISTS idx_breeding_records_mareid ON breeding_records USING btree (mareid);
CREATE INDEX IF NOT EXISTS idx_breeding_records_stallionid ON breeding_records USING btree (stallionid);
CREATE INDEX IF NOT EXISTS idx_breeding_records_timestamp ON breeding_records USING btree (timestamp);
CREATE INDEX IF NOT EXISTS idx_notifications_playerid ON notifications USING btree (playerid);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications USING btree (read);
CREATE INDEX IF NOT EXISTS idx_notifications_timestamp ON notifications USING btree (timestamp);

-- Enable Row Level Security
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE horses ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE races ENABLE ROW LEVEL SECURITY;
ALTER TABLE bets ENABLE ROW LEVEL SECURITY;
ALTER TABLE guilds ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE breeding_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Players policies
CREATE POLICY "Players can view all players" ON players
  FOR SELECT USING (true);

CREATE POLICY "Players can update their own data" ON players
  FOR UPDATE USING (
    CASE
      WHEN role() = 'anon' THEN true
      WHEN role() = 'authenticated' THEN (uid())::text = walletaddress
      ELSE false
    END
  );

CREATE POLICY "Users can create their own player records" ON players
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Horses policies
CREATE POLICY "Horses are viewable by everyone" ON horses
  FOR SELECT USING (true);

CREATE POLICY "Owners can manage their horses" ON horses
  FOR ALL USING (owner = (current_setting('request.jwt.claims', true))::json->>'wallet_address');

CREATE POLICY "Users can create horses" ON horses
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Marketplace listings policies
CREATE POLICY "Marketplace listings are viewable by everyone" ON marketplace_listings
  FOR SELECT USING (true);

CREATE POLICY "Sellers can insert and update their listings" ON marketplace_listings
  FOR ALL USING (
    (uid())::text IN (
      SELECT walletaddress FROM players WHERE players.id = marketplace_listings.sellerid
    )
  );

-- Transactions policies
CREATE POLICY "Players can view their own transactions" ON transactions
  FOR SELECT USING (
    playerid IN (
      SELECT id FROM players WHERE players.walletaddress = (current_setting('request.jwt.claims', true))::json->>'wallet_address'
    )
  );

CREATE POLICY "Players can create their own transactions" ON transactions
  FOR INSERT TO public
  WITH CHECK (
    playerid IN (
      SELECT id FROM players WHERE players.walletaddress = (current_setting('request.jwt.claims', true))::json->>'wallet_address'
    )
  );

CREATE POLICY "Anonymous users can create transactions" ON transactions
  FOR INSERT TO anon
  WITH CHECK (true);

-- Races policies
CREATE POLICY "Races are viewable by everyone" ON races
  FOR SELECT USING (true);

CREATE POLICY "System can manage races" ON races
  FOR ALL TO anon, authenticated
  WITH CHECK (true);

-- Bets policies
CREATE POLICY "Players can view all bets" ON bets
  FOR SELECT USING (true);

CREATE POLICY "Players can manage their own bets" ON bets
  FOR ALL USING (
    playerid IN (
      SELECT id FROM players WHERE players.walletaddress = (current_setting('request.jwt.claims', true))::json->>'wallet_address'
    )
  );

CREATE POLICY "Anonymous users can place bets" ON bets
  FOR INSERT TO anon
  WITH CHECK (true);

-- Guilds policies
CREATE POLICY "Guilds are viewable by everyone" ON guilds
  FOR SELECT USING (true);

CREATE POLICY "Guild founders and members can manage guilds" ON guilds
  FOR ALL USING (true);

-- Tournaments policies
CREATE POLICY "Tournaments are viewable by everyone" ON tournaments
  FOR SELECT USING (true);

CREATE POLICY "System can manage tournaments" ON tournaments
  FOR ALL TO anon, authenticated
  WITH CHECK (true);

-- Training sessions policies
CREATE POLICY "Training sessions are viewable by horse owners" ON training_sessions
  FOR SELECT USING (
    horseid IN (
      SELECT id FROM horses WHERE horses.owner = (current_setting('request.jwt.claims', true))::json->>'wallet_address'
    )
  );

CREATE POLICY "Horse owners can manage training sessions" ON training_sessions
  FOR ALL USING (
    horseid IN (
      SELECT id FROM horses WHERE horses.owner = (current_setting('request.jwt.claims', true))::json->>'wallet_address'
    )
  );

CREATE POLICY "Anonymous users can create training sessions" ON training_sessions
  FOR INSERT TO anon
  WITH CHECK (true);

-- Breeding records policies
CREATE POLICY "Breeding records are viewable by horse owners" ON breeding_records
  FOR SELECT USING (
    mareid IN (
      SELECT id FROM horses WHERE horses.owner = (current_setting('request.jwt.claims', true))::json->>'wallet_address'
    )
    OR stallionid IN (
      SELECT id FROM horses WHERE horses.owner = (current_setting('request.jwt.claims', true))::json->>'wallet_address'
    )
  );

CREATE POLICY "Horse owners can create breeding records" ON breeding_records
  FOR INSERT TO public
  WITH CHECK (true);

CREATE POLICY "Anonymous users can create breeding records" ON breeding_records
  FOR INSERT TO anon
  WITH CHECK (true);

-- Notifications policies
CREATE POLICY "Players can view their own notifications" ON notifications
  FOR SELECT USING (
    playerid IN (
      SELECT id FROM players WHERE players.walletaddress = (current_setting('request.jwt.claims', true))::json->>'wallet_address'
    )
  );

CREATE POLICY "Players can update their own notifications" ON notifications
  FOR UPDATE USING (
    playerid IN (
      SELECT id FROM players WHERE players.walletaddress = (current_setting('request.jwt.claims', true))::json->>'wallet_address'
    )
  );

CREATE POLICY "System can create notifications" ON notifications
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);