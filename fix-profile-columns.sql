-- Fix missing profile columns in users table
-- Add missing columns that are referenced in the profile panel

-- Add location column if it doesn't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS location TEXT;

-- Add phone column if it doesn't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS phone TEXT;

-- Add bio column if it doesn't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS bio TEXT;

-- Add skills column if it doesn't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS skills TEXT[] DEFAULT '{}';

-- Add avatar column if it doesn't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS avatar TEXT;

-- Add preferences column if it doesn't exist (JSONB for storing user preferences)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{"theme": "system", "notifications": true, "language": "en"}';

-- Update existing users with sample profile data
UPDATE users SET
  location = COALESCE(location, 'Not specified'),
  phone = COALESCE(phone, 'Not specified'),
  bio = COALESCE(bio, 'No bio available'),
  skills = COALESCE(skills, ARRAY['Teamwork', 'Communication']),
  preferences = COALESCE(preferences, '{"theme": "system", "notifications": true, "language": "en}')::jsonb
WHERE location IS NULL OR phone IS NULL OR bio IS NULL OR skills IS NULL OR preferences IS NULL;

-- Verify the columns were added
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' 
  AND column_name IN ('location', 'phone', 'bio', 'skills', 'avatar', 'preferences')
ORDER BY column_name;
