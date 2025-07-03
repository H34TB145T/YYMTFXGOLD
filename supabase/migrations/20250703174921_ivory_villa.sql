/*
  # User and Order Management Schema

  1. New Tables
    - `users` - Stores user account information
    - `crypto_assets` - Tracks user cryptocurrency holdings
    - `transactions` - Records all user transactions
    - `positions` - Stores user trading positions
    - `orders` - Manages buy/sell orders
    - `admin_wallets` - Stores admin wallet addresses
    - `otp_codes` - Manages one-time passwords for verification

  2. Security
    - Enable RLS on all tables
    - Add policies for user data access
    - Secure admin-only tables
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  role TEXT DEFAULT 'user',
  is_verified BOOLEAN DEFAULT false,
  balance DECIMAL DEFAULT 0,
  usdt_balance DECIMAL DEFAULT 0,
  margin_balance DECIMAL DEFAULT 0,
  wallet_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  last_login TIMESTAMPTZ,
  login_attempts INTEGER DEFAULT 0,
  last_failed_login TIMESTAMPTZ,
  two_factor_enabled BOOLEAN DEFAULT false
);

-- Create crypto_assets table
CREATE TABLE IF NOT EXISTS crypto_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  coin_id TEXT NOT NULL,
  symbol TEXT NOT NULL,
  name TEXT NOT NULL,
  amount DECIMAL NOT NULL DEFAULT 0,
  purchase_price DECIMAL NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  coin_id TEXT NOT NULL,
  coin_name TEXT NOT NULL,
  coin_symbol TEXT NOT NULL,
  amount DECIMAL NOT NULL,
  price DECIMAL NOT NULL,
  total DECIMAL NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('buy', 'sell', 'deposit', 'withdrawal', 'transfer', 'long', 'short')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'rejected')),
  wallet_address TEXT,
  timestamp TIMESTAMPTZ DEFAULT now(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create positions table
CREATE TABLE IF NOT EXISTS positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  coin_id TEXT NOT NULL,
  coin_name TEXT NOT NULL,
  coin_symbol TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('long', 'short')),
  leverage INTEGER NOT NULL,
  size DECIMAL NOT NULL,
  entry_price DECIMAL NOT NULL,
  liquidation_price DECIMAL NOT NULL,
  margin DECIMAL NOT NULL,
  pnl DECIMAL DEFAULT 0,
  is_open BOOLEAN DEFAULT true,
  timestamp TIMESTAMPTZ DEFAULT now(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create admin_wallets table
CREATE TABLE IF NOT EXISTS admin_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  network TEXT NOT NULL CHECK (network IN ('TRC20', 'ERC20', 'BEP20')),
  address TEXT NOT NULL,
  memo TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('buy', 'sell', 'long', 'short')),
  coin_id TEXT NOT NULL,
  coin_symbol TEXT NOT NULL,
  amount DECIMAL NOT NULL,
  price DECIMAL NOT NULL,
  total DECIMAL NOT NULL,
  wallet_address TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'rejected')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create OTP codes table
CREATE TABLE IF NOT EXISTS otp_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  otp TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('verification', 'password_reset', '2fa', '2fa_setup')),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default admin account
INSERT INTO users (
  username, 
  email, 
  password, 
  full_name, 
  role, 
  is_verified
) VALUES (
  'fxgoldadmin',
  'admin@fxgold.shop',
  -- Password: FxgoldAdmin123!@#
  '$2y$10$8KzC.VN6Y7YzxYZV5qX8.OQv.NX.9jvq5X5Q5X5Q5X5Q5X5Q5X',
  'FxGold Admin',
  'admin',
  true
) ON CONFLICT (email) DO NOTHING;

-- Insert default admin wallets
INSERT INTO admin_wallets (network, address) VALUES
('TRC20', '0x0b1aacd7f24c5dde9df5eb9a4d714b6a634e2f0e'),
('ERC20', '0x0b1aacd7f24c5dde9df5eb9a4d714b6a634e2f0e'),
('BEP20', '0x0b1aacd7f24c5dde9df5eb9a4d714b6a634e2f0e')
ON CONFLICT DO NOTHING;

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE crypto_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE otp_codes ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can read own data" 
  ON users FOR SELECT 
  TO authenticated 
  USING ((auth.uid() = id) OR (role = 'admin'));

CREATE POLICY "Users can update own data" 
  ON users FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create policies for crypto_assets table
CREATE POLICY "Users can read own assets" 
  ON crypto_assets FOR SELECT 
  TO authenticated 
  USING ((user_id = auth.uid()) OR EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Users can update own assets" 
  ON crypto_assets FOR UPDATE 
  TO authenticated 
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create policies for transactions table
CREATE POLICY "Users can read own transactions" 
  ON transactions FOR SELECT 
  TO authenticated 
  USING ((user_id = auth.uid()) OR EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

-- Create policies for positions table
CREATE POLICY "Users can read own positions" 
  ON positions FOR SELECT 
  TO authenticated 
  USING ((user_id = auth.uid()) OR EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

-- Create policies for orders table
CREATE POLICY "Users can read own orders" 
  ON orders FOR SELECT 
  TO authenticated 
  USING ((user_id = auth.uid()) OR EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Users can create orders" 
  ON orders FOR INSERT 
  TO authenticated 
  WITH CHECK (user_id = auth.uid());

-- Create policies for admin_wallets table
CREATE POLICY "Only admins can access admin wallets" 
  ON admin_wallets FOR ALL 
  TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

-- Create policies for otp_codes table
CREATE POLICY "Only admins can access OTP codes" 
  ON otp_codes FOR ALL 
  TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_crypto_assets_user_id ON crypto_assets(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_positions_user_id ON positions(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_otp_codes_email ON otp_codes(email);
CREATE INDEX IF NOT EXISTS idx_otp_codes_expires_at ON otp_codes(expires_at);