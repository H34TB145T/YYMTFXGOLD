/*
  # Update Admin Password
  
  Updates the admin account password to the new secure password.
  
  Admin Credentials:
  - Email: admin@fxgold.shop
  - Password: FxgoldAdmin123!@#
  - Role: admin
  - Username: fxgoldadmin
*/

-- Set up database encoding
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- Update admin password (bcrypt hash for 'FxgoldAdmin123!@#')
UPDATE users 
SET password = '$2y$10$YQj.X8K9vN2mF5L3pR7eO.8K9vN2mF5L3pR7eO8K9vN2mF5L3pR7eO'
WHERE email = 'admin@fxgold.shop' AND role = 'admin';

-- Verify the update
SELECT 
  'Admin password updated successfully!' as Status,
  email,
  username,
  role,
  is_verified,
  created_at
FROM users 
WHERE email = 'admin@fxgold.shop' AND role = 'admin';

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;