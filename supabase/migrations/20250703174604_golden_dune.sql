/*
  # Database schema for FxGold Trading Platform

  1. New Tables
    - `crypto_assets` - Stores user cryptocurrency holdings
    - `transactions` - Records all user transactions
    - `positions` - Tracks user trading positions
    - `admin_wallets` - Stores admin wallet addresses
    - `orders` - Manages user buy/sell orders
    - `otp_codes` - Stores one-time passwords for verification
  
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create crypto_assets table
CREATE TABLE IF NOT EXISTS crypto_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  coin_id TEXT NOT NULL,
  symbol TEXT NOT NULL,
  name TEXT NOT NULL,
  amount DECIMAL(18, 8) NOT NULL DEFAULT 0,
  purchase_price DECIMAL(18, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  coin_id TEXT NOT NULL,
  coin_name TEXT NOT NULL,
  coin_symbol TEXT NOT NULL,
  amount DECIMAL(18, 8) NOT NULL,
  price DECIMAL(18, 2) NOT NULL,
  total DECIMAL(18, 2) NOT NULL,
  type TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  wallet_address TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT transactions_type_check CHECK (type IN ('buy', 'sell', 'deposit', 'withdrawal', 'transfer', 'long', 'short')),
  CONSTRAINT transactions_status_check CHECK (status IN ('pending', 'completed', 'rejected'))
);

-- Create positions table
CREATE TABLE IF NOT EXISTS positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  coin_id TEXT NOT NULL,
  coin_name TEXT NOT NULL,
  coin_symbol TEXT NOT NULL,
  type TEXT NOT NULL,
  leverage INTEGER NOT NULL,
  size DECIMAL(18, 8) NOT NULL,
  entry_price DECIMAL(18, 2) NOT NULL,
  liquidation_price DECIMAL(18, 2) NOT NULL,
  margin DECIMAL(18, 8) NOT NULL,
  pnl DECIMAL(18, 2) DEFAULT 0,
  is_open BOOLEAN DEFAULT true,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT positions_type_check CHECK (type IN ('long', 'short'))
);

-- Create admin_wallets table
CREATE TABLE IF NOT EXISTS admin_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  network TEXT NOT NULL,
  address TEXT NOT NULL,
  memo TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT admin_wallets_network_check CHECK (network IN ('TRC20', 'ERC20', 'BEP20'))
);

-- Create otp_codes table
CREATE TABLE IF NOT EXISTS otp_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  otp TEXT NOT NULL,
  type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  CONSTRAINT otp_codes_type_check CHECK (type IN ('verification', 'password_reset', '2fa', '2fa_setup'))
);

-- Insert default admin wallets
INSERT INTO admin_wallets (network, address) VALUES
  ('TRC20', '0x0b1aacd7f24c5dde9df5eb9a4d714b6a634e2f0e'),
  ('ERC20', '0x0b1aacd7f24c5dde9df5eb9a4d714b6a634e2f0e'),
  ('BEP20', '0x0b1aacd7f24c5dde9df5eb9a4d714b6a634e2f0e');

-- Enable row level security
ALTER TABLE crypto_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE otp_codes ENABLE ROW LEVEL SECURITY;

-- Create policies for crypto_assets table
CREATE POLICY "Users can read own crypto assets" 
  ON crypto_assets 
  FOR SELECT 
  TO authenticated 
  USING (user_id = auth.uid() OR (SELECT role FROM users WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Users can insert own crypto assets" 
  ON crypto_assets 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own crypto assets" 
  ON crypto_assets 
  FOR UPDATE 
  TO authenticated 
  USING (user_id = auth.uid());

-- Create policies for transactions table
CREATE POLICY "Users can read own transactions" 
  ON transactions 
  FOR SELECT 
  TO authenticated 
  USING (user_id = auth.uid() OR (SELECT role FROM users WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Users can insert own transactions" 
  ON transactions 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (user_id = auth.uid());

-- Create policies for positions table
CREATE POLICY "Users can read own positions" 
  ON positions 
  FOR SELECT 
  TO authenticated 
  USING (user_id = auth.uid() OR (SELECT role FROM users WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Users can insert own positions" 
  ON positions 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own positions" 
  ON positions 
  FOR UPDATE 
  TO authenticated 
  USING (user_id = auth.uid());

-- Create policies for admin_wallets table
CREATE POLICY "Anyone can read admin wallets" 
  ON admin_wallets 
  FOR SELECT 
  TO public;

CREATE POLICY "Only admins can modify admin wallets" 
  ON admin_wallets 
  FOR ALL 
  TO authenticated 
  USING ((SELECT role FROM users WHERE id = auth.uid()) = 'admin');

-- Create policies for otp_codes table
CREATE POLICY "Users can read own OTP codes" 
  ON otp_codes 
  FOR SELECT 
  TO authenticated 
  USING (email = (SELECT email FROM users WHERE id = auth.uid()));

-- Add columns to users table if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'username') THEN
    ALTER TABLE users ADD COLUMN username TEXT UNIQUE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'balance') THEN
    ALTER TABLE users ADD COLUMN balance DECIMAL(18, 2) DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'usdt_balance') THEN
    ALTER TABLE users ADD COLUMN usdt_balance DECIMAL(18, 8) DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'margin_balance') THEN
    ALTER TABLE users ADD COLUMN margin_balance DECIMAL(18, 8) DEFAULT 0;
  END IF;
END $$;