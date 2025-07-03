/*
# Create bets table

1. New Tables
  - `bets` - Stores player bets on races
    - `id` (text, primary key)
    - `playerId` (text, references players.id)
    - `raceId` (text, references races.id)
    - `horseId` (text, references horses.id)
    - `type` (text)
    - `amount` (numeric)
    - `odds` (numeric)
    - `potentialPayout` (numeric)
    - `status` (text)

2. Security
  - Enable RLS on `bets` table
  - Add policy for players to view their own bets
  - Add policy for players to place bets
*/

-- Create bets table
CREATE TABLE IF NOT EXISTS public.bets (
  id TEXT PRIMARY KEY,
  playerId TEXT NOT NULL,
  raceId TEXT NOT NULL,
  horseId TEXT NOT NULL,
  type TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  odds NUMERIC NOT NULL,
  potentialPayout NUMERIC NOT NULL,
  status TEXT NOT NULL,
  createdAt TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updatedAt TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  FOREIGN KEY (playerId) REFERENCES public.players(id) ON DELETE CASCADE,
  FOREIGN KEY (raceId) REFERENCES public.races(id) ON DELETE CASCADE,
  FOREIGN KEY (horseId) REFERENCES public.horses(id) ON DELETE CASCADE
);

-- Add indices
CREATE INDEX IF NOT EXISTS idx_bets_playerId ON public.bets(playerId);
CREATE INDEX IF NOT EXISTS idx_bets_raceId ON public.bets(raceId);

-- Enable RLS
ALTER TABLE public.bets ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Players can view their own bets"
  ON public.bets
  FOR SELECT
  USING (auth.uid() IN (SELECT walletAddress FROM public.players WHERE id = playerId));

CREATE POLICY "Players can insert their own bets"
  ON public.bets
  FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT walletAddress FROM public.players WHERE id = playerId));

COMMENT ON TABLE public.bets IS 'Stores player bets on races';