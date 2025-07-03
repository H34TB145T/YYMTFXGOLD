/*
  # FxGold Trading Platform Schema

  1. New Tables
    - `users` - User accounts with authentication and profile data
    - `crypto_assets` - User's cryptocurrency holdings
    - `transactions` - Record of all user transactions
    - `positions` - Futures trading positions
    - `orders` - Buy/sell orders requiring admin approval
    - `otp_codes` - One-time passwords for verification
    - `admin_wallets` - Official wallet addresses for deposits
  
  2. Security
    - Enable RLS on all tables
    - Add policies for data access control
    - Create indexes for performance
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
  is_verified BOOLEAN DEFAULT true,  -- Auto-verified since no email
  balance DECIMAL DEFAULT 1000.00,
  usdt_balance DECIMAL DEFAULT 0.00,
  margin_balance DECIMAL DEFAULT 0.00,
  wallet_address TEXT,
  two_factor_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  last_login TIMESTAMPTZ,
  CONSTRAINT users_role_check CHECK (role IN ('user', 'admin'))
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
  type TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  wallet_address TEXT,
  timestamp TIMESTAMPTZ DEFAULT now(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT transactions_type_check CHECK (type IN ('buy', 'sell', 'deposit', 'withdrawal', 'transfer', 'long', 'short')),
  CONSTRAINT transactions_status_check CHECK (status IN ('pending', 'completed', 'rejected'))
);

-- Create positions table (for futures trading)
CREATE TABLE IF NOT EXISTS positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  coin_id TEXT NOT NULL,
  coin_name TEXT NOT NULL,
  coin_symbol TEXT NOT NULL,
  type TEXT NOT NULL,
  leverage INTEGER NOT NULL,
  size DECIMAL NOT NULL,
  entry_price DECIMAL NOT NULL,
  liquidation_price DECIMAL NOT NULL,
  margin DECIMAL NOT NULL,
  pnl DECIMAL DEFAULT 0.00,
  is_open BOOLEAN DEFAULT true,
  timestamp TIMESTAMPTZ DEFAULT now(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT positions_type_check CHECK (type IN ('long', 'short'))
);

-- Create orders table (for admin approval)
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  coin_id TEXT NOT NULL,
  coin_symbol TEXT NOT NULL,
  amount DECIMAL NOT NULL,
  price DECIMAL NOT NULL,
  total DECIMAL NOT NULL,
  wallet_address TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  admin_id UUID,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT orders_type_check CHECK (type IN ('buy', 'sell', 'long', 'short')),
  CONSTRAINT orders_status_check CHECK (status IN ('pending', 'completed', 'rejected'))
);

-- Create OTP codes table (for fallback verification)
CREATE TABLE IF NOT EXISTS otp_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  otp TEXT NOT NULL,
  type TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT otp_codes_type_check CHECK (type IN ('verification', 'password_reset', '2fa', '2fa_setup'))
);

-- Create admin_wallets table (official wallet addresses)
CREATE TABLE IF NOT EXISTS admin_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cryptocurrency TEXT NOT NULL,
  network TEXT NOT NULL,
  address TEXT NOT NULL,
  memo TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (cryptocurrency, network)
);

-- Insert default admin account (password: password)
INSERT INTO users (
  id, 
  username, 
  email, 
  password, 
  full_name, 
  role, 
  is_verified,
  balance,
  usdt_balance,
  margin_balance
) VALUES (
  '00000000-0000-0000-0000-000000000000', 
  'fxgoldadmin',
  'admin@fxgold.shop',
  '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'FxGold Administrator',
  'admin',
  true,
  0.00,
  0.00,
  0.00
) ON CONFLICT (email) DO NOTHING;

-- Insert your actual admin wallet addresses
INSERT INTO admin_wallets (cryptocurrency, network, address, is_active) VALUES
-- USDT Wallets (Your provided address)
('USDT', 'ERC20', '0x0b1aacd7f24c5dde9df5eb9a4d714b6a634e2f0e', true),
('USDT', 'TRC20', '0x0b1aacd7f24c5dde9df5eb9a4d714b6a634e2f0e', true),
('USDT', 'BEP20', '0x0b1aacd7f24c5dde9df5eb9a4d714b6a634e2f0e', true),

-- Bitcoin Wallet (Your provided address)
('BTC', 'Bitcoin', 'bc1qj4pash8heu35j9s9e4afsq4jfw25und9kkml4w70wezwx3y4gvus558seq', true),

-- Ethereum Wallet (Your provided address)
('ETH', 'Ethereum', '0x0b1aacd7f24c5dde9df5eb9a4d714b6a634e2f0e', true),

-- USDC Wallets (Your provided address)
('USDC', 'ERC20', '0x0b1aacd7f24c5dde9df5eb9a4d714b6a634e2f0e', true),
('USDC', 'BEP20', '0x0b1aacd7f24c5dde9df5eb9a4d714b6a634e2f0e', true)
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_crypto_assets_user_id ON crypto_assets(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_timestamp ON transactions(timestamp);
CREATE INDEX IF NOT EXISTS idx_positions_user_id ON positions(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_admin_wallets_crypto ON admin_wallets(cryptocurrency);
CREATE INDEX IF NOT EXISTS idx_otp_codes_email_type ON otp_codes(email, type);
CREATE INDEX IF NOT EXISTS idx_otp_codes_expires_at ON otp_codes(expires_at);

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
CREATE POLICY "Anyone can read admin wallets" 
  ON admin_wallets FOR SELECT 
  TO public;

CREATE POLICY "Only admins can modify admin wallets" 
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