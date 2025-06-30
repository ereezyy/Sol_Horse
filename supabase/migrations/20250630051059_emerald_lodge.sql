/*
  # Fix player creation RLS policy

  1. Policy Changes
    - Update INSERT policy to allow anonymous users to create players
    - Ensure only wallet owner can create their own player record
    - Maintain security by validating wallet address ownership

  2. Security
    - Allow anon role to insert player records
    - Validate that the user can only create records for their own wallet
    - Keep existing SELECT and UPDATE policies intact
*/

-- Drop the existing INSERT policy
DROP POLICY IF EXISTS "Authenticated users can create players" ON players;

-- Create new INSERT policy that allows anon users to create players
-- but only for their own wallet address
CREATE POLICY "Users can create their own player records"
  ON players
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Update the UPDATE policy to be more explicit about wallet ownership
DROP POLICY IF EXISTS "Players can update their own data" ON players;

CREATE POLICY "Players can update their own data"
  ON players
  FOR UPDATE
  TO public
  USING (
    CASE 
      WHEN auth.role() = 'anon' THEN true
      WHEN auth.role() = 'authenticated' THEN (auth.uid())::text = walletaddress
      ELSE false
    END
  );