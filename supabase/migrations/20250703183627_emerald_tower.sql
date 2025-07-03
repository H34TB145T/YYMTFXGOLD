/*
  # FxGold Trading Platform Schema

  1. New Tables
    - `users` - User accounts and profiles
    - `crypto_assets` - User's cryptocurrency holdings
    - `transactions` - Record of all buy/sell transactions
    - `positions` - Futures trading positions
    - `orders` - Buy/sell orders
    - `payment_methods` - Available payment methods
    - `admin_settings` - Platform configuration
    - `admin_wallets` - Admin wallet addresses
    - `otp_codes` - One-time passwords for verification
    - `audit_logs` - Security audit trail

  2. Security
    - Row Level Security (RLS) enabled on all tables
    - Policies for user data access
    - Admin-only tables protected
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  is_verified BOOLEAN DEFAULT FALSE,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  last_login TIMESTAMPTZ,
  login_attempts INTEGER DEFAULT 0,
  last_failed_login TIMESTAMPTZ,
  wallet_address TEXT,
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  balance DECIMAL
);

-- Enable RLS on users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can read own data
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING ((uid() = id) OR (is_admin = true));

-- Users can update own data
CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (uid() = id)
  WITH CHECK (uid() = id);

-- Crypto assets table
CREATE TABLE IF NOT EXISTS crypto_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  coin_id TEXT NOT NULL,
  symbol TEXT NOT NULL,
  name TEXT NOT NULL,
  amount DECIMAL NOT NULL,
  purchase_price DECIMAL NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, coin_id)
);

-- Enable RLS on crypto_assets
ALTER TABLE crypto_assets ENABLE ROW LEVEL SECURITY;

-- Users can read own assets
CREATE POLICY "Users can read own assets"
  ON crypto_assets
  FOR SELECT
  TO authenticated
  USING ((user_id = uid()) OR (EXISTS (
    SELECT 1 FROM users WHERE users.id = uid() AND users.is_admin = true
  )));

-- Users can update own assets
CREATE POLICY "Users can update own assets"
  ON crypto_assets
  FOR ALL
  TO authenticated
  USING (user_id = uid())
  WITH CHECK (user_id = uid());

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  coin_id TEXT NOT NULL,
  coin_name TEXT NOT NULL,
  coin_symbol TEXT NOT NULL,
  amount DECIMAL NOT NULL,
  price DECIMAL NOT NULL,
  total DECIMAL NOT NULL,
  type TEXT NOT NULL,
  status TEXT DEFAULT 'completed',
  wallet_address TEXT,
  timestamp TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT transactions_type_check CHECK (type IN ('buy', 'sell', 'deposit', 'withdrawal', 'transfer', 'long', 'short')),
  CONSTRAINT transactions_status_check CHECK (status IN ('pending', 'completed', 'rejected'))
);

-- Enable RLS on transactions
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Users can read own transactions
CREATE POLICY "Users can read own transactions"
  ON transactions
  FOR SELECT
  TO authenticated
  USING ((user_id = uid()) OR (EXISTS (
    SELECT 1 FROM users WHERE users.id = uid() AND users.is_admin = true
  )));

-- Positions table (for futures trading)
CREATE TABLE IF NOT EXISTS positions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  coin_id TEXT NOT NULL,
  coin_name TEXT NOT NULL,
  coin_symbol TEXT NOT NULL,
  type TEXT NOT NULL,
  leverage INTEGER NOT NULL,
  size DECIMAL NOT NULL,
  entry_price DECIMAL NOT NULL,
  liquidation_price DECIMAL NOT NULL,
  margin DECIMAL NOT NULL,
  pnl DECIMAL DEFAULT 0,
  is_open BOOLEAN DEFAULT TRUE,
  timestamp TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT positions_type_check CHECK (type IN ('long', 'short'))
);

-- Enable RLS on positions
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;

-- Users can read own positions
CREATE POLICY "Users can read own positions"
  ON positions
  FOR SELECT
  TO authenticated
  USING ((user_id = uid()) OR (EXISTS (
    SELECT 1 FROM users WHERE users.id = uid() AND users.is_admin = true
  )));

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  type TEXT NOT NULL,
  crypto_type TEXT NOT NULL,
  amount DECIMAL NOT NULL,
  price_usd DECIMAL NOT NULL,
  price_mmk DECIMAL NOT NULL,
  payment_method TEXT NOT NULL,
  payment_screenshot_url TEXT,
  wallet_address TEXT,
  memo TEXT,
  bank_account_name TEXT,
  transaction_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  admin_id UUID REFERENCES users(id),
  CONSTRAINT orders_type_check CHECK (type IN ('buy', 'sell')),
  CONSTRAINT orders_status_check CHECK (status IN ('pending', 'processing', 'completed', 'rejected'))
);

-- Enable RLS on orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Users can create orders
CREATE POLICY "Users can create orders"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = uid());

-- Users can read own orders
CREATE POLICY "Users can read own orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING ((user_id = uid()) OR (EXISTS (
    SELECT 1 FROM users WHERE users.id = uid() AND users.is_admin = true
  )));

-- Payment methods table
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  qr_code_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on payment_methods
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

-- Anyone can read active payment methods
CREATE POLICY "Anyone can read active payment methods"
  ON payment_methods
  FOR SELECT
  TO public
  USING (is_active = true);

-- Admin settings table
CREATE TABLE IF NOT EXISTS admin_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on admin_settings
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can access settings
CREATE POLICY "Only admins can access settings"
  ON admin_settings
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users WHERE users.id = uid() AND users.is_admin = true
  ));

-- Admin wallets table
CREATE TABLE IF NOT EXISTS admin_wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  crypto TEXT NOT NULL,
  network TEXT NOT NULL,
  address TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(crypto, network)
);

-- Enable RLS on admin_wallets
ALTER TABLE admin_wallets ENABLE ROW LEVEL SECURITY;

-- Anyone can read active admin wallets
CREATE POLICY "Anyone can read active admin wallets"
  ON admin_wallets
  FOR SELECT
  TO public
  USING (is_active = true);

-- OTP codes table
CREATE TABLE IF NOT EXISTS otp_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  otp TEXT NOT NULL,
  type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  CONSTRAINT otp_codes_type_check CHECK (type IN ('verification', 'password_reset', '2fa', '2fa_setup'))
);

-- Enable RLS on otp_codes
ALTER TABLE otp_codes ENABLE ROW LEVEL SECURITY;

-- Only admins can access OTP codes
CREATE POLICY "Only admins can access OTP codes"
  ON otp_codes
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users WHERE users.id = uid() AND users.is_admin = true
  ));

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on audit_logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can read audit logs
CREATE POLICY "Only admins can read audit logs"
  ON audit_logs
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users WHERE users.id = uid() AND users.is_admin = true
  ));

-- Insert default admin user
INSERT INTO users (id, email, full_name, role, is_verified, is_admin)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'admin@fxgold.shop',
  'FxGold Admin',
  'admin',
  TRUE,
  TRUE
)
ON CONFLICT (email) DO NOTHING;

-- Insert default payment methods
INSERT INTO payment_methods (name, display_name)
VALUES 
  ('usdt_trc20', 'USDT (TRC20)'),
  ('usdt_erc20', 'USDT (ERC20)'),
  ('usdt_bep20', 'USDT (BEP20)'),
  ('bitcoin', 'Bitcoin (BTC)'),
  ('ethereum', 'Ethereum (ETH)')
ON CONFLICT (name) DO NOTHING;

-- Insert default admin wallets
INSERT INTO admin_wallets (crypto, network, address)
VALUES 
  ('USDT', 'TRC20', '0x0b1aacd7f24c5dde9df5eb9a4d714b6a634e2f0e'),
  ('USDT', 'ERC20', '0x0b1aacd7f24c5dde9df5eb9a4d714b6a634e2f0e'),
  ('USDT', 'BEP20', '0x0b1aacd7f24c5dde9df5eb9a4d714b6a634e2f0e'),
  ('BTC', 'Bitcoin', 'bc1qj4pash8heu35j9s9e4afsq4jfw25und9kkml4w70wezwx3y4gvus558seq'),
  ('ETH', 'Ethereum', '0x0b1aacd7f24c5dde9df5eb9a4d714b6a634e2f0e')
ON CONFLICT (crypto, network) DO NOTHING;

-- Insert default admin settings
INSERT INTO admin_settings (key, value)
VALUES 
  ('trading_fees', '{"spot": 0.01, "futures": 0.02}'),
  ('withdrawal_fees', '{"USDT_TRC20": 1, "USDT_ERC20": 15, "USDT_BEP20": 0.5, "BTC": 0.0005, "ETH": 0.005}'),
  ('min_deposit', '{"USDT": 10, "BTC": 0.0005, "ETH": 0.01}'),
  ('min_withdrawal', '{"USDT": 20, "BTC": 0.001, "ETH": 0.02}')
ON CONFLICT (key) DO NOTHING;