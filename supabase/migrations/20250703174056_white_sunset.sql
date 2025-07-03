/*
  # Database Schema for FxGold Trading Platform

  1. New Tables
    - `users` - Stores user account information
    - `orders` - Tracks cryptocurrency buy/sell orders
    - `payment_methods` - Available payment methods
    - `settings` - System configuration settings
    - `audit_logs` - Activity logging for security

  2. Security
    - Password hashing
    - Email verification
    - Two-factor authentication support
    - Audit logging
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  is_verified BOOLEAN DEFAULT false,
  verification_token TEXT,
  reset_token TEXT,
  reset_token_expires TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_login TIMESTAMP WITH TIME ZONE,
  login_attempts INTEGER DEFAULT 0,
  last_failed_login TIMESTAMP WITH TIME ZONE,
  wallet_address TEXT,
  two_factor_enabled BOOLEAN DEFAULT false,
  two_factor_secret TEXT,
  
  -- Add constraint to validate role values
  CONSTRAINT users_role_check CHECK (role IN ('user', 'admin'))
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  crypto_type TEXT NOT NULL,
  amount DECIMAL(18, 8) NOT NULL,
  price_usd DECIMAL(18, 2) NOT NULL,
  price_mmk DECIMAL(18, 2) NOT NULL,
  payment_method TEXT NOT NULL,
  payment_screenshot_url TEXT,
  wallet_address TEXT,
  memo TEXT,
  bank_account_name TEXT,
  transaction_id TEXT,
  status TEXT DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  admin_id UUID,
  
  -- Add foreign key constraints
  CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT orders_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES users(id),
  
  -- Add constraints to validate type and status values
  CONSTRAINT orders_type_check CHECK (type IN ('buy', 'sell')),
  CONSTRAINT orders_status_check CHECK (status IN ('pending', 'processing', 'completed', 'rejected'))
);

-- Create payment_methods table
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  qr_code_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY,
  key_name TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY,
  user_id UUID,
  action TEXT NOT NULL,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Add foreign key constraint
  CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Insert default payment methods
INSERT INTO payment_methods (id, name, display_name) VALUES
  (gen_random_uuid(), 'kpay', 'KPay'),
  (gen_random_uuid(), 'ayapay', 'AYA Pay'),
  (gen_random_uuid(), 'wavepay', 'WAVE Pay');

-- Insert default settings
INSERT INTO settings (id, key_name, value) VALUES
  (gen_random_uuid(), 'fees', '{"transfer": 0, "profit_margin": 5}'),
  (gen_random_uuid(), 'features', '{"registration_enabled": true, "email_verification_required": true}'),
  (gen_random_uuid(), 'supported_cryptocurrencies', '["BTC", "ETH", "USDT"]');

-- Enable row level security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can read own data" 
  ON users 
  FOR SELECT 
  TO authenticated 
  USING (auth.uid() = id OR (SELECT is_admin FROM users WHERE id = auth.uid()));

-- Create policies for orders table
CREATE POLICY "Users can create orders" 
  ON orders 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can read own orders" 
  ON orders 
  FOR SELECT 
  TO authenticated 
  USING (user_id = auth.uid() OR (SELECT is_admin FROM users WHERE id = auth.uid()));

-- Create policies for payment_methods table
CREATE POLICY "Anyone can read active payment methods" 
  ON payment_methods 
  FOR SELECT 
  TO public 
  USING (is_active = true);

-- Create policies for settings table
CREATE POLICY "Only admins can access settings" 
  ON settings 
  FOR ALL 
  TO authenticated 
  USING ((SELECT is_admin FROM users WHERE id = auth.uid()));

-- Create policies for audit_logs table
CREATE POLICY "Only admins can read audit logs" 
  ON audit_logs 
  FOR SELECT 
  TO authenticated 
  USING ((SELECT is_admin FROM users WHERE id = auth.uid()));