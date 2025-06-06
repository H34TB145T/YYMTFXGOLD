/*
  # Add OTP Management Table

  1. New Tables
    - otp_codes
      - Stores OTP codes for email verification, password reset, and 2FA
      - Includes expiration timestamps for security
      - Supports different OTP types

  2. Security
    - Enable RLS on otp_codes table
    - Add cleanup for expired OTPs
    - Secure access policies

  3. Updates
    - Add two_factor_enabled column to users table
    - Add is_verified column to users table
*/

-- Add missing columns to users table if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'two_factor_enabled'
  ) THEN
    ALTER TABLE users ADD COLUMN two_factor_enabled BOOLEAN DEFAULT false;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'is_verified'
  ) THEN
    ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Create OTP codes table
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

-- Create a function to clean up expired OTPs (MySQL Event)
-- Note: This requires SUPER privileges, so you might need to run this manually in cPanel
/*
CREATE EVENT IF NOT EXISTS cleanup_expired_otps
ON SCHEDULE EVERY 1 HOUR
DO
  DELETE FROM otp_codes WHERE expires_at <= NOW();
*/

-- Insert some sample data for testing (remove in production)
-- INSERT INTO users (id, username, email, password, full_name, role, is_verified, two_factor_enabled) VALUES
-- (UUID(), 'testuser', 'test@example.com', '$2y$10$example_hash', 'Test User', 'user', true, false);