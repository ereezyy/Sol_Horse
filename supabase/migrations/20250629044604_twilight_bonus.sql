/*
# Create players table

1. New Tables
  - `players` - Stores player profile and game data
    - `id` (text, primary key)
    - `walletAddress` (text, unique)
    - `username` (text)
    - `profileData` (jsonb)
    - `assetsData` (jsonb)
    - `statsData` (jsonb)
    - `socialData` (jsonb) 
    - `preferencesData` (jsonb)

2. Security
  - Enable RLS on `players` table
  - Add policy for authenticated users to read their own data
  - Add policy for authenticated users to update their own data
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

-- Create policies
CREATE POLICY "Players can view their own data"
  ON public.players
  FOR SELECT
  USING (auth.uid() = walletAddress);

CREATE POLICY "Players can update their own data"
  ON public.players
  FOR UPDATE
  USING (auth.uid() = walletAddress);

COMMENT ON TABLE public.players IS 'Stores player profile and game data';