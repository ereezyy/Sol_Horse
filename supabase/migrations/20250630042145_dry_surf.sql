/*
  # Create marketplace_listings table
  
  1. New Tables
    - `marketplace_listings`: Stores marketplace listings for horses and items
      - `id` (text, primary key)
      - `type` (text)
      - `itemId` (text)
      - `sellerId` (text, foreign key to players)
      - `price` (numeric)
      - Plus additional metadata fields
  
  2. Security
    - Enable RLS on marketplace_listings table
    - Add policies for:
      - Public viewing of all listings
      - Sellers can manage their own listings
  
  3. Foreign Keys & Indices
    - Foreign key from sellerId to players(id)
    - Indices for common query filters
*/

-- Create marketplace listings table
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
  updatedAt TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add foreign key to players
ALTER TABLE public.marketplace_listings 
  ADD CONSTRAINT marketplace_listings_sellerid_fkey 
  FOREIGN KEY (sellerId) REFERENCES public.players(id) ON DELETE CASCADE;

-- Add indices for better query performance
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_type ON public.marketplace_listings(type);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_status ON public.marketplace_listings(status);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_sellerid ON public.marketplace_listings(sellerId);

-- Enable RLS
ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;

-- Create policies with proper type casting
CREATE POLICY "Marketplace listings are viewable by everyone"
  ON public.marketplace_listings
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Sellers can insert and update their listings"
  ON public.marketplace_listings
  FOR ALL
  TO public
  USING ((auth.uid())::text IN (
    SELECT players.walletAddress
    FROM players
    WHERE players.id = marketplace_listings.sellerId
  ));

COMMENT ON TABLE public.marketplace_listings IS 'Stores marketplace listings for horses and items';