/*
# Create tournaments table

1. New Tables
  - `tournaments` - Stores tournament events and brackets
    - `id` (text, primary key)
    - `name` (text)
    - `description` (text)
    - `type` (text)
    - `requirementsData` (jsonb)
    - `prizePool` (numeric)
    - `prizeDistribution` (jsonb)
    - `registrationStart` (timestamptz)
    - `registrationEnd` (timestamptz)
    - `tournamentStart` (timestamptz)
    - `tournamentEnd` (timestamptz)
    - `participantsData` (jsonb)
    - `bracketsData` (jsonb)
    - `status` (text)
    - `category` (text)
    - `tier` (text)

2. Security
  - Enable RLS on `tournaments` table
  - Add policy for viewing tournaments
  - Add policy for admins to manage tournaments
*/

-- Create tournaments table
CREATE TABLE IF NOT EXISTS public.tournaments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL,
  requirementsData JSONB NOT NULL DEFAULT '{}'::jsonb,
  prizePool NUMERIC NOT NULL,
  prizeDistribution JSONB NOT NULL DEFAULT '{}'::jsonb,
  registrationStart TIMESTAMP WITH TIME ZONE NOT NULL,
  registrationEnd TIMESTAMP WITH TIME ZONE NOT NULL,
  tournamentStart TIMESTAMP WITH TIME ZONE NOT NULL,
  tournamentEnd TIMESTAMP WITH TIME ZONE NOT NULL,
  participantsData JSONB NOT NULL DEFAULT '[]'::jsonb,
  bracketsData JSONB NULL,
  status TEXT NOT NULL,
  category TEXT NULL,
  tier TEXT NULL,
  createdAt TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updatedAt TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add indices
CREATE INDEX IF NOT EXISTS idx_tournaments_status ON public.tournaments(status);
CREATE INDEX IF NOT EXISTS idx_tournaments_start ON public.tournaments(tournamentStart);

-- Enable RLS
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Tournaments are viewable by everyone"
  ON public.tournaments
  FOR SELECT
  USING (true);

CREATE POLICY "Admin can insert and update tournaments"
  ON public.tournaments
  FOR ALL
  USING (auth.uid() IN (SELECT walletAddress FROM public.players WHERE statsData->>'role' = 'admin'));

COMMENT ON TABLE public.tournaments IS 'Stores tournament events, participants, and results';