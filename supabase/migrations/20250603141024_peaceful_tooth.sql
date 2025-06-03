/*
  # Initial Schema Setup for Crypto Exchange

  1. New Tables
    - users
      - Basic user information and authentication
      - Email verification status
      - Role-based access control
    - orders
      - Tracks buy/sell orders
      - Payment information
      - Order status and admin actions
    - payment_methods
      - Available payment methods (KPay, AYA Pay, etc)
      - Associated QR codes and settings
    - admin_settings
      - System configuration
      - Fee structures
      - API toggles
    - audit_logs
      - Track all system actions
      - User and admin activity logging

  2. Security
    - Enable RLS on all tables
    - Set up appropriate access policies
    - Secure admin-only tables
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  is_verified BOOLEAN DEFAULT false,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ,
  login_attempts INTEGER DEFAULT 0,
  last_failed_login TIMESTAMPTZ,
  wallet_address TEXT,
  two_factor_enabled BOOLEAN DEFAULT false
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id),
  type TEXT NOT NULL CHECK (type IN ('buy', 'sell')),
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
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'rejected')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  admin_id uuid REFERENCES users(id)
);

-- Create payment_methods table
CREATE TABLE IF NOT EXISTS payment_methods (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  qr_code_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create admin_settings table
CREATE TABLE IF NOT EXISTS admin_settings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id),
  action TEXT NOT NULL,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can read own data" ON users
  FOR SELECT TO authenticated
  USING (auth.uid() = id OR is_admin = true);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create policies for orders table
CREATE POLICY "Users can read own orders" ON orders
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true
  ));

CREATE POLICY "Users can create orders" ON orders
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Create policies for payment_methods table
CREATE POLICY "Anyone can read active payment methods" ON payment_methods
  FOR SELECT
  USING (is_active = true);

-- Create policies for admin_settings table
CREATE POLICY "Only admins can access settings" ON admin_settings
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true
  ));

-- Create policies for audit_logs table
CREATE POLICY "Only admins can read audit logs" ON audit_logs
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true
  ));

-- Insert default payment methods
INSERT INTO payment_methods (name, display_name) VALUES
  ('kpay', 'KPay'),
  ('ayapay', 'AYA Pay'),
  ('wavepay', 'WAVE Pay')
ON CONFLICT (name) DO NOTHING;

-- Insert default admin settings
INSERT INTO admin_settings (key, value) VALUES
  ('fees', '{"transfer": 0, "profit_margin": 5}'),
  ('features', '{"registration_enabled": true, "email_verification_required": true}'),
  ('supported_cryptocurrencies', '["BTC", "ETH", "USDT"]')
ON CONFLICT (key) DO NOTHING;