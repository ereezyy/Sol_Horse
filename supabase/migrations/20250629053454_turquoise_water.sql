/*
# Create Players and Marketplace Tables

1. New Tables
  - `players` - Stores player profiles and game data
  - `marketplace_listings` - Stores marketplace listings for horses and items

2. Security
  - Enable RLS on both tables
  - Add policies for player and listing access control
*/

-- First create players table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.players (
  id TEXT PRIMARY KEY,
  walletAddress TEXT NOT NULL UNIQUE,
  username TEXT NOT NULL,
  profileData JSONB NOT NULL DEFAULT '{}'::jsonb,
  assetsData JSONB NOT NULL DEFAULT '{}'::jsonb,
  statsData JSONB NOT NULL DEFAULT '{}'::jsonb,
  socialData JSONB NOT NULL DEFAULT '{}'::jsonb,
  preferencesData JSONB NOT NULL DEFAULT '{}'::jsonb,
  createdAt TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updatedAt TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index on walletAddress for player lookups
CREATE INDEX IF NOT EXISTS idx_players_wallet ON public.players(walletAddress);

-- Create marketplace_listings table
CREATE TABLE IF NOT EXISTS public.marketplace_listings (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  itemId TEXT NOT NULL,
  sellerId TEXT NOT NULL,
  price NUMERIC NOT NULL,
  currency TEXT NOT NULL,
  negotiable BOOLEAN NOT NULL DEFAULT false,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  imagesData JSONB NOT NULL DEFAULT '[]'::jsonb,
  listedAt TIMESTAMP WITH TIME ZONE NOT NULL,
  expiresAt TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL,
  views INTEGER NOT NULL DEFAULT 0,
  watchersData JSONB NOT NULL DEFAULT '[]'::jsonb,
  createdAt TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updatedAt TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  FOREIGN KEY (sellerId) REFERENCES public.players(id) ON DELETE CASCADE
);

-- Add indices
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_type ON public.marketplace_listings(type);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_status ON public.marketplace_listings(status);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_sellerId ON public.marketplace_listings(sellerId);

-- Enable RLS on players
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;

-- Enable RLS on marketplace_listings
ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;

-- Create policies for players
CREATE POLICY "Players can view all players"
  ON public.players
  FOR SELECT
  USING (true);

-- Fixed policy with proper type casting
CREATE POLICY "Players can update their own data"
  ON public.players
  FOR UPDATE
  USING (auth.uid()::text = walletAddress);

-- Create policies for marketplace listings
CREATE POLICY "Marketplace listings are viewable by everyone"
  ON public.marketplace_listings
  FOR SELECT
  USING (true);

-- Fixed policy with proper type casting
CREATE POLICY "Sellers can insert and update their listings"
  ON public.marketplace_listings
  FOR ALL
  USING (auth.uid()::text IN (SELECT walletAddress FROM public.players WHERE id = sellerId));

COMMENT ON TABLE public.players IS 'Stores player profiles and game data';
COMMENT ON TABLE public.marketplace_listings IS 'Stores marketplace listings for horses and items';