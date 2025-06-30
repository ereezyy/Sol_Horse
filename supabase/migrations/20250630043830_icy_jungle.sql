/*
  # Fix Type Casting in RLS Policies

  1. Changes
     - Ensures all policies correctly cast auth.uid() (UUID) to text when comparing with text columns
     - Adds proper type casting to existing policies if needed
     - Double-checks existing policies for proper security rules
  
  2. Security
     - Maintains intended access control rules with correct type casting
     - Ensures policies work as expected with Supabase Auth
*/

-- Fix any potential type casting issues in players table policies
DROP POLICY IF EXISTS "Players can update their own data" ON public.players;
CREATE POLICY "Players can update their own data"
  ON public.players
  FOR UPDATE
  TO public
  USING ((auth.uid())::text = walletAddress);

-- Fix any potential type casting issues in marketplace_listings table policies
DROP POLICY IF EXISTS "Sellers can insert and update their listings" ON public.marketplace_listings;
CREATE POLICY "Sellers can insert and update their listings"
  ON public.marketplace_listings
  FOR ALL
  TO public
  USING ((auth.uid())::text IN (
    SELECT players.walletAddress
    FROM players
    WHERE players.id = marketplace_listings.sellerId
  ));

-- Double check existing policies
DO $$ 
BEGIN
  -- Verify players table has the correct policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'players' AND policyname = 'Players can view all players'
  ) THEN
    CREATE POLICY "Players can view all players"
      ON public.players
      FOR SELECT
      TO public
      USING (true);
  END IF;

  -- Verify marketplace_listings table has the correct policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'marketplace_listings' AND policyname = 'Marketplace listings are viewable by everyone'
  ) THEN
    CREATE POLICY "Marketplace listings are viewable by everyone"
      ON public.marketplace_listings
      FOR SELECT
      TO public
      USING (true);
  END IF;
END $$;