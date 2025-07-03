/*
  # Admin Settings and Payment Methods

  1. New Tables
    - `admin_settings` - Stores admin configuration settings
    - `payment_methods` - Manages available payment methods

  2. Security
    - Enable RLS on all tables
    - Add policies for admin-only access
*/

-- Create admin_settings table
CREATE TABLE IF NOT EXISTS admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create payment_methods table
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  qr_code_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default payment methods
INSERT INTO payment_methods (name, display_name) VALUES
  ('kpay', 'KPay'),
  ('ayapay', 'AYA Pay'),
  ('wavepay', 'WAVE Pay')
ON CONFLICT (name) DO NOTHING;

-- Insert default settings
INSERT INTO admin_settings (key, value) VALUES
  ('fees', '{"transfer": 0, "profit_margin": 5}'),
  ('features', '{"registration_enabled": true, "email_verification_required": true}'),
  ('supported_cryptocurrencies', '["BTC", "ETH", "USDT"]')
ON CONFLICT (key) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

-- Create policies for admin_settings table
CREATE POLICY "Only admins can access settings" 
  ON admin_settings FOR ALL 
  TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

-- Create policies for payment_methods table
CREATE POLICY "Anyone can read active payment methods" 
  ON payment_methods FOR SELECT 
  TO public 
  USING (is_active = true);

CREATE POLICY "Only admins can modify payment methods" 
  ON payment_methods FOR ALL 
  TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_admin_settings_key ON admin_settings(key);
CREATE INDEX IF NOT EXISTS idx_payment_methods_name ON payment_methods(name);