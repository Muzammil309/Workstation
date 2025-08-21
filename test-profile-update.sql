-- Test script to verify profile updates work
-- Run this after adding the columns to test if they're working

-- Test 1: Try to update a user's location
UPDATE users 
SET location = 'Test Location Updated'
WHERE id = (SELECT id FROM users LIMIT 1);

-- Test 2: Try to update a user's phone
UPDATE users 
SET phone = '+1 (555) 999-8888'
WHERE id = (SELECT id FROM users LIMIT 1);

-- Test 3: Try to update a user's bio
UPDATE users 
SET bio = 'This is a test bio to verify the column works'
WHERE id = (SELECT id FROM users LIMIT 1);

-- Test 4: Try to update a user's skills
UPDATE users 
SET skills = ARRAY['Test Skill 1', 'Test Skill 2', 'Test Skill 3']
WHERE id = (SELECT id FROM users LIMIT 1);

-- Test 5: Try to update a user's preferences
UPDATE users 
SET preferences = '{"theme": "dark", "notifications": false, "language": "es"}'::jsonb
WHERE id = (SELECT id FROM users LIMIT 1);

-- Test 6: Verify the updates worked
SELECT 
  id,
  name,
  email,
  location,
  phone,
  bio,
  skills,
  preferences
FROM users 
LIMIT 1;

-- If all the above worked without errors, the columns are properly added!
