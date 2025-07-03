/*
# Create races table

1. New Tables
  - `races` - Stores race events and results
    - `id` (text, primary key)
    - `name` (text)
    - `type` (text)
    - `surface` (text)
    - `distance` (integer)
    - `tier` (text)
    - `conditionsData` (jsonb)
    - `requirementsData` (jsonb)
    - `entryFee` (numeric)
    - `prizePool` (numeric)
    - `prizeDistribution` (jsonb)
    - `participantsData` (jsonb)
    - `maxParticipants` (integer)
    - `registrationDeadline` (timestamptz)
    - `raceTime` (timestamptz)
    - `resultsData` (jsonb)
    - `status` (text)

2. Security
  - Enable RLS on `races` table
  - Add policy for viewing races
  - Add policy for admins to manage races
*/

-- Create races table
CREATE TABLE IF NOT EXISTS public.races (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  surface TEXT NOT NULL,
  distance INTEGER NOT NULL,
  tier TEXT NOT NULL,
  conditionsData JSONB NOT NULL DEFAULT '{}'::jsonb,
  requirementsData JSONB NOT NULL DEFAULT '{}'::jsonb,
  entryFee NUMERIC NOT NULL,
  prizePool NUMERIC NOT NULL,
  prizeDistribution JSONB NOT NULL DEFAULT '[]'::jsonb,
  participantsData JSONB NOT NULL DEFAULT '[]'::jsonb,
  maxParticipants INTEGER NOT NULL,
  registrationDeadline TIMESTAMP WITH TIME ZONE NOT NULL,
  raceTime TIMESTAMP WITH TIME ZONE NOT NULL,
  resultsData JSONB NULL,
  status TEXT NOT NULL,
  createdAt TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updatedAt TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add indices
CREATE INDEX IF NOT EXISTS idx_races_status ON public.races(status);
CREATE INDEX IF NOT EXISTS idx_races_raceTime ON public.races(raceTime);

-- Enable RLS
ALTER TABLE public.races ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Races are viewable by everyone"
  ON public.races
  FOR SELECT
  USING (true);

CREATE POLICY "Admin can insert and update races"
  ON public.races
  FOR ALL
  USING (auth.uid() IN (SELECT walletAddress FROM public.players WHERE statsData->>'role' = 'admin'));

COMMENT ON TABLE public.races IS 'Stores race events and results';