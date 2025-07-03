/*
  # Session management and security enhancements
  
  1. New Tables
    - `remember_tokens` - Stores persistent login tokens
    - `login_attempts` - Tracks login attempts for rate limiting
  
  2. Security
    - Enable RLS on all tables
    - Add policies for authentication
*/

-- Create remember_tokens table
CREATE TABLE IF NOT EXISTS remember_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  token TEXT NOT NULL,
  selector TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create login_attempts table
CREATE TABLE IF NOT EXISTS login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT NOT NULL,
  action TEXT NOT NULL,
  attempt_time TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS remember_tokens_user_id_idx ON remember_tokens(user_id);
CREATE INDEX IF NOT EXISTS remember_tokens_selector_idx ON remember_tokens(selector);
CREATE INDEX IF NOT EXISTS remember_tokens_expires_at_idx ON remember_tokens(expires_at);
CREATE INDEX IF NOT EXISTS login_attempts_ip_action_idx ON login_attempts(ip_address, action, attempt_time);

-- Enable row level security
ALTER TABLE remember_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;

-- Create policies for remember_tokens table
CREATE POLICY "Users can read own remember tokens" 
  ON remember_tokens 
  FOR SELECT 
  TO authenticated 
  USING (user_id = auth.uid() OR (SELECT role FROM users WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Users can delete own remember tokens" 
  ON remember_tokens 
  FOR DELETE 
  TO authenticated 
  USING (user_id = auth.uid());

-- Create policies for login_attempts table
CREATE POLICY "Only admins can read login attempts" 
  ON login_attempts 
  FOR SELECT 
  TO authenticated 
  USING ((SELECT role FROM users WHERE id = auth.uid()) = 'admin');

-- Add function to clean up expired tokens and old login attempts
CREATE OR REPLACE FUNCTION cleanup_expired_data()
RETURNS void AS $$
BEGIN
  -- Delete expired remember tokens
  DELETE FROM remember_tokens WHERE expires_at < now();
  
  -- Delete old login attempts (older than 24 hours)
  DELETE FROM login_attempts WHERE attempt_time < (now() - interval '24 hours');
END;
$$ LANGUAGE plpgsql;

-- Add function to check rate limiting
CREATE OR REPLACE FUNCTION is_rate_limited(check_ip TEXT, check_action TEXT, limit_count INTEGER, hours INTEGER)
RETURNS boolean AS $$
DECLARE
  attempt_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO attempt_count 
  FROM login_attempts 
  WHERE ip_address = check_ip 
    AND action = check_action 
    AND attempt_time > (now() - (hours || ' hours')::interval);
    
  RETURN attempt_count >= limit_count;
END;
$$ LANGUAGE plpgsql;

-- Add function to record an attempt
CREATE OR REPLACE FUNCTION record_attempt(check_ip TEXT, check_action TEXT)
RETURNS void AS $$
BEGIN
  INSERT INTO login_attempts (ip_address, action) 
  VALUES (check_ip, check_action);
END;
$$ LANGUAGE plpgsql;