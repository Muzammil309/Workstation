-- Check Users Table Schema
-- Run this first to see what columns actually exist

-- 1. Check users table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- 2. Check if table exists and has data
SELECT COUNT(*) as total_users FROM users;

-- 3. Show sample user data (if any exist)
SELECT * FROM users LIMIT 3;
