/*
# Create marketplace listings table

1. New Tables
  - `marketplace_listings` - Stores items for sale
    - `id` (text, primary key)
    - `type` (text)
    - `itemId` (text)
    - `sellerId` (text, references players.id)
    - `price` (numeric)
    - `currency` (text)
    - `negotiable` (boolean)
    - `title` (text)
    - `description` (text)
    - `imagesData` (jsonb)
    - `listedAt` (timestamptz)
    - `expiresAt` (timestamptz)
    - `status` (text)
    - `views` (integer)
    - `watchersData` (jsonb)

2. Security
  - Enable RLS on `marketplace_listings` table
  - Add policy for viewing listings
  - Add policy for sellers to manage their listings
*/

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

-- Enable RLS
ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Marketplace listings are viewable by everyone"
  ON public.marketplace_listings
  FOR SELECT
  USING (true);

CREATE POLICY "Sellers can insert and update their listings"
  ON public.marketplace_listings
  FOR ALL
  USING (auth.uid() IN (SELECT walletAddress FROM public.players WHERE id = sellerId));

COMMENT ON TABLE public.marketplace_listings IS 'Stores marketplace listings for horses and items';