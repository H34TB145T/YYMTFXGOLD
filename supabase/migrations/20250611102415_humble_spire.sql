/*
  # FxGold Trading Platform - Complete Database Setup
  
  This script sets up the complete database structure for the FxGold trading platform
  including all tables, admin accounts, and wallet addresses.
  
  1. New Tables
    - users (with admin account)
    - crypto_assets (user cryptocurrency holdings)
    - transactions (all trading activities)
    - positions (futures trading positions)
    - orders (pending orders for admin approval)
    - otp_codes (email verification codes)
    - admin_wallets (official wallet addresses)
    
  2. Default Data
    - Admin account with credentials
    - Real admin wallet addresses for all supported cryptocurrencies
    - Default settings and configurations
*/

-- Set up database encoding
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role ENUM('user', 'admin') DEFAULT 'user',
  is_verified BOOLEAN DEFAULT false,
  balance DECIMAL(18, 2) DEFAULT 1000.00,
  usdt_balance DECIMAL(18, 8) DEFAULT 0.00000000,
  margin_balance DECIMAL(18, 8) DEFAULT 0.00000000,
  wallet_address VARCHAR(255),
  two_factor_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_login TIMESTAMP NULL
);

-- Create crypto_assets table
CREATE TABLE IF NOT EXISTS crypto_assets (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  coin_id VARCHAR(50) NOT NULL,
  symbol VARCHAR(10) NOT NULL,
  name VARCHAR(100) NOT NULL,
  amount DECIMAL(18, 8) NOT NULL DEFAULT 0.00000000,
  purchase_price DECIMAL(18, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  coin_id VARCHAR(50) NOT NULL,
  coin_name VARCHAR(100) NOT NULL,
  coin_symbol VARCHAR(10) NOT NULL,
  amount DECIMAL(18, 8) NOT NULL,
  price DECIMAL(18, 2) NOT NULL,
  total DECIMAL(18, 2) NOT NULL,
  type ENUM('buy', 'sell', 'deposit', 'withdrawal', 'transfer', 'long', 'short') NOT NULL,
  status ENUM('pending', 'completed', 'rejected') DEFAULT 'pending',
  wallet_address VARCHAR(255),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create positions table (for futures trading)
CREATE TABLE IF NOT EXISTS positions (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  coin_id VARCHAR(50) NOT NULL,
  coin_name VARCHAR(100) NOT NULL,
  coin_symbol VARCHAR(10) NOT NULL,
  type ENUM('long', 'short') NOT NULL,
  leverage INT NOT NULL,
  size DECIMAL(18, 8) NOT NULL,
  entry_price DECIMAL(18, 2) NOT NULL,
  liquidation_price DECIMAL(18, 2) NOT NULL,
  margin DECIMAL(18, 8) NOT NULL,
  pnl DECIMAL(18, 2) DEFAULT 0.00,
  is_open BOOLEAN DEFAULT true,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create orders table (for admin approval)
CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  type ENUM('buy', 'sell', 'long', 'short') NOT NULL,
  coin_id VARCHAR(50) NOT NULL,
  coin_symbol VARCHAR(10) NOT NULL,
  amount DECIMAL(18, 8) NOT NULL,
  price DECIMAL(18, 2) NOT NULL,
  total DECIMAL(18, 2) NOT NULL,
  wallet_address VARCHAR(255) NOT NULL,
  status ENUM('pending', 'completed', 'rejected') DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  admin_id VARCHAR(36),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Create OTP codes table (for email verification)
CREATE TABLE IF NOT EXISTS otp_codes (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  otp VARCHAR(10) NOT NULL,
  type ENUM('verification', 'password_reset', '2fa', '2fa_setup') NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email_type (email, type),
  INDEX idx_expires_at (expires_at)
);

-- Create admin_wallets table (official wallet addresses)
CREATE TABLE IF NOT EXISTS admin_wallets (
  id VARCHAR(36) PRIMARY KEY,
  cryptocurrency VARCHAR(10) NOT NULL,
  network VARCHAR(20) NOT NULL,
  address VARCHAR(255) NOT NULL,
  memo VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_crypto_network (cryptocurrency, network)
);

-- Insert default admin account
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
  'admin-fxgold-2024', 
  'fxgoldadmin',
  'admin@fxgold.shop',
  '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: password
  'FxGold Administrator',
  'admin',
  true,
  0.00,
  0.00000000,
  0.00000000
) ON DUPLICATE KEY UPDATE
  email = VALUES(email),
  full_name = VALUES(full_name);

-- Insert admin wallet addresses
INSERT INTO admin_wallets (id, cryptocurrency, network, address, is_active) VALUES
-- USDT Wallets
('wallet-usdt-erc20', 'USDT', 'ERC20', '0x0b1aacd7f24c5dde9df5eb9a4d714b6a634e2f0e', true),
('wallet-usdt-trc20', 'USDT', 'TRC20', '0x0b1aacd7f24c5dde9df5eb9a4d714b6a634e2f0e', true),
('wallet-usdt-bep20', 'USDT', 'BEP20', '0x0b1aacd7f24c5dde9df5eb9a4d714b6a634e2f0e', true),

-- Bitcoin Wallet
('wallet-btc-main', 'BTC', 'Bitcoin', 'bc1qj4pash8heu35j9s9e4afsq4jfw25und9kkml4w70wezwx3y4gvus558seq', true),

-- Ethereum Wallet
('wallet-eth-main', 'ETH', 'Ethereum', '0x0b1aacd7f24c5dde9df5eb9a4d714b6a634e2f0e', true),

-- USDC Wallets
('wallet-usdc-erc20', 'USDC', 'ERC20', '0x0b1aacd7f24c5dde9df5eb9a4d714b6a634e2f0e', true),
('wallet-usdc-bep20', 'USDC', 'BEP20', '0x0b1aacd7f24c5dde9df5eb9a4d714b6a634e2f0e', true)

ON DUPLICATE KEY UPDATE
  address = VALUES(address),
  is_active = VALUES(is_active);

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

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Display success message
SELECT 'FxGold Trading Platform database setup completed successfully!' as Status;
SELECT 'Admin account created: admin@fxgold.shop (password: password)' as AdminInfo;
SELECT 'All wallet addresses have been configured' as WalletInfo;