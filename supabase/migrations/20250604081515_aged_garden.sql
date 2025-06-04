-- Enable strict mode and UTF-8
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  password VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  is_verified BOOLEAN DEFAULT false,
  verification_token VARCHAR(255),
  reset_token VARCHAR(255),
  reset_token_expires DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_login TIMESTAMP NULL,
  login_attempts INT DEFAULT 0,
  last_failed_login TIMESTAMP NULL,
  wallet_address VARCHAR(255),
  two_factor_enabled BOOLEAN DEFAULT false,
  two_factor_secret VARCHAR(255)
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  type ENUM('buy', 'sell') NOT NULL,
  crypto_type VARCHAR(10) NOT NULL,
  amount DECIMAL(18, 8) NOT NULL,
  price_usd DECIMAL(18, 2) NOT NULL,
  price_mmk DECIMAL(18, 2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  payment_screenshot_url VARCHAR(255),
  wallet_address VARCHAR(255),
  memo TEXT,
  bank_account_name VARCHAR(255),
  transaction_id VARCHAR(255),
  status ENUM('pending', 'processing', 'completed', 'rejected') DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  admin_id VARCHAR(36),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (admin_id) REFERENCES users(id)
);

-- Create payment_methods table
CREATE TABLE IF NOT EXISTS payment_methods (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  display_name VARCHAR(100) NOT NULL,
  qr_code_url VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
  id VARCHAR(36) PRIMARY KEY,
  key_name VARCHAR(50) NOT NULL UNIQUE,
  value JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36),
  action VARCHAR(255) NOT NULL,
  details JSON,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Insert default payment methods
INSERT INTO payment_methods (id, name, display_name) VALUES
  (UUID(), 'kpay', 'KPay'),
  (UUID(), 'ayapay', 'AYA Pay'),
  (UUID(), 'wavepay', 'WAVE Pay');

-- Insert default settings
INSERT INTO settings (id, key_name, value) VALUES
  (UUID(), 'fees', '{"transfer": 0, "profit_margin": 5}'),
  (UUID(), 'features', '{"registration_enabled": true, "email_verification_required": true}'),
  (UUID(), 'supported_cryptocurrencies', '["BTC", "ETH", "USDT"]');

SET FOREIGN_KEY_CHECKS = 1;