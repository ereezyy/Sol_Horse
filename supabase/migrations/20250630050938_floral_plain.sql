/*
  # Fix players table INSERT policy

  1. Security
    - Add INSERT policy for players table to allow authenticated users to create player records
    - This resolves the RLS violation when creating new players

  The policy allows any authenticated user to insert a new player record, which is appropriate
  for a gaming application where users need to create their player profiles.
*/

-- Add INSERT policy for players table
CREATE POLICY "Authenticated users can create players"
  ON players
  FOR INSERT
  TO authenticated
  WITH CHECK (true);