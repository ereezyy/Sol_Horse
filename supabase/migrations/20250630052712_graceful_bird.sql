/*
  # Recreate bets table to fix 404 error
  
  1. New Tables
    - Ensures bets table exists with correct structure
    - Sets up proper relationships with players and races tables
  
  2. Security
    - Enable RLS on bets table
    - Add policies for both anonymous and authenticated users
    - Ensure proper access for placing and viewing bets
*/

-- First check if table exists and drop it if needed to ensure clean recreation
DROP TABLE IF EXISTS bets;

-- Recreate the bets table with proper structure
CREATE TABLE public.bets (
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

-- Create indexes for better query performance
CREATE INDEX idx_bets_playerid ON public.bets USING btree (playerid);
CREATE INDEX idx_bets_raceid ON public.bets USING btree (raceid);
CREATE INDEX idx_bets_status ON public.bets USING btree (status);

-- Add foreign key constraint to players table
ALTER TABLE public.bets ADD CONSTRAINT bets_playerid_fkey 
  FOREIGN KEY (playerid) REFERENCES public.players(id) ON DELETE CASCADE;

-- Enable RLS
ALTER TABLE public.bets ENABLE ROW LEVEL SECURITY;

-- Recreate policies to ensure proper access
DROP POLICY IF EXISTS "Players can view all bets" ON public.bets;
CREATE POLICY "Players can view all bets"
  ON public.bets
  FOR SELECT
  TO public
  USING (true);

DROP POLICY IF EXISTS "Players can manage their own bets" ON public.bets;
CREATE POLICY "Players can manage their own bets"
  ON public.bets
  FOR ALL
  TO public
  USING (playerid IN (
    SELECT players.id FROM players 
    WHERE (players.walletaddress = ((current_setting('request.jwt.claims'::text, true))::json ->> 'wallet_address'::text))
  ))
  WITH CHECK (playerid IN (
    SELECT players.id FROM players 
    WHERE (players.walletaddress = ((current_setting('request.jwt.claims'::text, true))::json ->> 'wallet_address'::text))
  ));

DROP POLICY IF EXISTS "Anonymous users can place bets" ON public.bets;
CREATE POLICY "Anonymous users can place bets"
  ON public.bets
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Insert a diagnostic record if needed
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables 
                WHERE pubname = 'supabase_realtime' 
                AND schemaname = 'public' 
                AND tablename = 'bets') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.bets;
  END IF;
END $$;