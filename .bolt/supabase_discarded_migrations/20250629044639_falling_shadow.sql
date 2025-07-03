/*
# Create transactions table

1. New Tables
  - `transactions` - Stores financial transactions
    - `id` (text, primary key)
    - `playerId` (text, references players.id)
    - `type` (text)
    - `amount` (numeric)
    - `currency` (text)
    - `relatedId` (text)
    - `description` (text)
    - `timestamp` (timestamptz)
    - `signature` (text)
    - `status` (text)

2. Security
  - Enable RLS on `transactions` table
  - Add policy for players to view their own transactions
  - Add policy for system to insert transactions
*/

-- Create transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
  id TEXT PRIMARY KEY,
  playerId TEXT NOT NULL,
  type TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL,
  relatedId TEXT NULL,
  description TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  signature TEXT NULL,
  status TEXT NOT NULL,
  createdAt TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updatedAt TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  FOREIGN KEY (playerId) REFERENCES public.players(id) ON DELETE CASCADE
);

-- Add indices
CREATE INDEX IF NOT EXISTS idx_transactions_playerId ON public.transactions(playerId);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(type);

-- Enable RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Players can view their own transactions"
  ON public.transactions
  FOR SELECT
  USING (auth.uid() IN (SELECT walletAddress FROM public.players WHERE id = playerId));

CREATE POLICY "System can insert transactions"
  ON public.transactions
  FOR INSERT
  WITH CHECK (true);

COMMENT ON TABLE public.transactions IS 'Stores financial transactions for players';