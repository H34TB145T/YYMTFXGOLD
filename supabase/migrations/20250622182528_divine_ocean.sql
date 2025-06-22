/*
  # Remove Default Balance for New Users
  
  This migration removes the default $1000 balance for newly created users.
  All new users will start with $0 balance.
  
  Changes:
  - Update users table to set default balance to 0
  - Update existing user accounts to have 0 balance (except admin)
*/

-- Set up database encoding
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- Use the correct database
USE zpjhpszw_fxgold;

-- Update the users table to remove default balance
ALTER TABLE users MODIFY COLUMN balance DECIMAL(18, 2) DEFAULT 0.00;

-- Update all existing user accounts (except admin) to have $0 balance
UPDATE users 
SET balance = 0.00 
WHERE role = 'user';

-- Keep admin balance as is (should already be 0)
-- Admin account balance remains unchanged

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Display success message
SELECT 'Default balance removed - new users start with $0' as Status;
SELECT 'Existing user balances reset to $0' as UserUpdate;
SELECT 'Admin account balance unchanged' as AdminStatus;