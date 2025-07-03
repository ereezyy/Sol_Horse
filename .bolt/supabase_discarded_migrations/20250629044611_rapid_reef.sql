/*
# Create horses table

1. New Tables
  - `horses` - Stores horse NFT data
    - `id` (text, primary key)
    - `tokenId` (text)
    - `name` (text)
    - `geneticsData` (jsonb)
    - `statsData` (jsonb)
    - `breedingData` (jsonb)
    - `trainingData` (jsonb)
    - `appearanceData` (jsonb)
    - `loreData` (jsonb)
    - `owner` (text, references players.walletAddress)
    - `isForSale` (boolean)
    - `price` (numeric)
    - `isForLease` (boolean)
    - `leaseTermsData` (jsonb)

2. Security
  - Enable RLS on `horses` table
  - Add policy for viewing horses
  - Add policy for owners to update their horses
*/

-- Create horses table
CREATE TABLE IF NOT EXISTS public.horses (
  id TEXT PRIMARY KEY,
  tokenId TEXT,
  name TEXT NOT NULL,
  geneticsData JSONB NOT NULL DEFAULT '{}'::jsonb,
  statsData JSONB NOT NULL DEFAULT '{}'::jsonb,
  breedingData JSONB NOT NULL DEFAULT '{}'::jsonb,
  trainingData JSONB NOT NULL DEFAULT '{}'::jsonb,
  appearanceData JSONB NOT NULL DEFAULT '{}'::jsonb,
  loreData JSONB NOT NULL DEFAULT '{}'::jsonb,
  owner TEXT NOT NULL,
  isForSale BOOLEAN NOT NULL DEFAULT false,
  price NUMERIC NULL,
  isForLease BOOLEAN NOT NULL DEFAULT false,
  leaseTermsData JSONB NULL,
  createdAt TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updatedAt TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  FOREIGN KEY (owner) REFERENCES public.players(walletAddress) ON DELETE CASCADE
);

-- Add indices
CREATE INDEX IF NOT EXISTS idx_horses_owner ON public.horses(owner);
CREATE INDEX IF NOT EXISTS idx_horses_tokenId ON public.horses(tokenId);
CREATE INDEX IF NOT EXISTS idx_horses_isForSale ON public.horses(isForSale);

-- Enable RLS
ALTER TABLE public.horses ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Horses are viewable by everyone"
  ON public.horses
  FOR SELECT
  USING (true);

CREATE POLICY "Owners can update their horses"
  ON public.horses
  FOR UPDATE
  USING (auth.uid() = owner);

CREATE POLICY "Owners can delete their horses"
  ON public.horses
  FOR DELETE
  USING (auth.uid() = owner);

COMMENT ON TABLE public.horses IS 'Stores horse NFT data including genetics and performance stats';