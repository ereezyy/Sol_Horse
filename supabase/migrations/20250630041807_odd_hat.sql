/*
  # Create players table

  1. New Tables
    - `players` - Stores player profile and game data
      - `id` (text, primary key)
      - `walletAddress` (text, unique)
      - `username` (text)
      - Various JSON data fields for player profile, assets, etc.

  2. Security
    - Enable RLS on players table
    - Add policies for players to view/update their own data
*/

-- Create players table
CREATE TABLE IF NOT EXISTS public.players (
  id TEXT PRIMARY KEY,
  walletAddress TEXT UNIQUE NOT NULL,
  username TEXT NOT NULL,
  profileData JSONB NOT NULL DEFAULT '{}'::jsonb,
  assetsData JSONB NOT NULL DEFAULT '{}'::jsonb,
  statsData JSONB NOT NULL DEFAULT '{}'::jsonb,
  socialData JSONB NOT NULL DEFAULT '{}'::jsonb,
  preferencesData JSONB NOT NULL DEFAULT '{}'::jsonb,
  createdAt TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updatedAt TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add indices
CREATE INDEX IF NOT EXISTS idx_players_walletAddress ON public.players(walletAddress);

-- Enable RLS
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;

-- Create policies - Fix the type mismatch between auth.uid() (UUID) and walletAddress (TEXT)
CREATE POLICY "Players can view all players"
  ON public.players
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Players can update their own data"
  ON public.players
  FOR UPDATE
  TO public
  USING ((auth.uid())::text = walletAddress);

COMMENT ON TABLE public.players IS 'Stores player profiles and game data';