/*
  # Connection Test Migration

  1. Create a simple test table
    - `connection_test` table to verify database connectivity
  2. Security
    - Enable RLS for the table 
    - Create policy for authenticated users
*/

-- Create a simple test table to verify connection
CREATE TABLE IF NOT EXISTS connection_test (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE connection_test ENABLE ROW LEVEL SECURITY;

-- Create policy allowing any authenticated user to read the table
CREATE POLICY "Anyone can read connection test" 
  ON connection_test
  FOR SELECT
  TO public
  USING (true);

-- Create policy allowing only authenticated users to insert
CREATE POLICY "Authenticated users can insert into connection test" 
  ON connection_test
  FOR INSERT
  TO authenticated
  WITH CHECK (true);
  
-- Insert test message
INSERT INTO connection_test (message)
VALUES ('Connection successful! Supabase is properly configured.');