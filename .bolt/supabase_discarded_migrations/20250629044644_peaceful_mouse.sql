/*
# Create guilds table

1. New Tables
  - `guilds` - Stores player guilds
    - `id` (text, primary key)
    - `name` (text)
    - `description` (text)
    - `founderId` (text, references players.id)
    - `membersData` (jsonb)
    - `statsData` (jsonb)
    - `featuresData` (jsonb)
    - `requirementsData` (jsonb)

2. Security
  - Enable RLS on `guilds` table
  - Add policy for viewing guilds
  - Add policy for founders to update guilds
  - Add policy for players to create guilds
*/

-- Create guilds table
CREATE TABLE IF NOT EXISTS public.guilds (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  founderId TEXT NOT NULL,
  membersData JSONB NOT NULL DEFAULT '[]'::jsonb,
  statsData JSONB NOT NULL DEFAULT '{}'::jsonb,
  featuresData JSONB NOT NULL DEFAULT '{}'::jsonb,
  requirementsData JSONB NOT NULL DEFAULT '{}'::jsonb,
  createdAt TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updatedAt TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  FOREIGN KEY (founderId) REFERENCES public.players(id) ON DELETE CASCADE
);

-- Add indices
CREATE INDEX IF NOT EXISTS idx_guilds_founderId ON public.guilds(founderId);
CREATE INDEX IF NOT EXISTS idx_guilds_name ON public.guilds(name);

-- Enable RLS
ALTER TABLE public.guilds ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Guilds are viewable by everyone"
  ON public.guilds
  FOR SELECT
  USING (true);

CREATE POLICY "Founders can update their guilds"
  ON public.guilds
  FOR UPDATE
  USING (auth.uid() IN (SELECT walletAddress FROM public.players WHERE id = founderId));

CREATE POLICY "Players can create guilds"
  ON public.guilds
  FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT walletAddress FROM public.players WHERE id = founderId));

COMMENT ON TABLE public.guilds IS 'Stores player guilds and their information';