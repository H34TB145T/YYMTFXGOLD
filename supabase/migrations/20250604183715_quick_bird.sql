-- Set up database
CREATE DATABASE IF NOT EXISTS fxgold_trading;
USE fxgold_trading;

-- Enable strict mode and UTF-8
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
  balance DECIMAL(18, 2) DEFAULT 0,
  usdt_balance DECIMAL(18, 8) DEFAULT 0,
  margin_balance DECIMAL(18, 8) DEFAULT 0,
  wallet_address VARCHAR(255),
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
  amount DECIMAL(18, 8) NOT NULL DEFAULT 0,
  purchase_price DECIMAL(18, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
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
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create positions table
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
  pnl DECIMAL(18, 2) DEFAULT 0,
  is_open BOOLEAN DEFAULT true,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create admin_wallets table
CREATE TABLE IF NOT EXISTS admin_wallets (
  id VARCHAR(36) PRIMARY KEY,
  network ENUM('TRC20', 'ERC20', 'BEP20') NOT NULL,
  address VARCHAR(255) NOT NULL,
  memo VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create orders table
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
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Insert default admin account
INSERT INTO users (
  id, 
  username, 
  email, 
  password, 
  full_name, 
  role, 
  is_verified
) VALUES (
  UUID(), 
  'fxgoldadmin',
  'admin@fxgold.com',
  -- Password: FxG0ld123!@#
  '$2y$10$8KzC.VN6Y7YzxYZV5qX8.OQv.NX.9jvq5X5Q5X5Q5X5Q5X5Q5X',
  'FxGold Admin',
  'admin',
  true
);

-- Insert default admin wallets
INSERT INTO admin_wallets (id, network, address) VALUES
(UUID(), 'TRC20', 'TRC20AdminWalletAddress'),
(UUID(), 'ERC20', 'ERC20AdminWalletAddress'),
(UUID(), 'BEP20', 'BEP20AdminWalletAddress');

SET FOREIGN_KEY_CHECKS = 1;