-- Simple one-liner to add all missing columns
-- Run this if the comprehensive script doesn't work

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS skills TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS avatar TEXT,
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{"theme": "system", "notifications": true, "language": "en"}';

-- Then update existing users with default values
UPDATE users SET
  location = COALESCE(location, 'Not specified'),
  phone = COALESCE(phone, 'Not specified'),
  bio = COALESCE(bio, 'No bio available'),
  skills = COALESCE(skills, ARRAY['Teamwork', 'Communication']),
  preferences = COALESCE(preferences, '{"theme": "system", "notifications": true, "language": "en"}')::jsonb,
  updated_at = COALESCE(updated_at, NOW())
WHERE location IS NULL OR phone IS NULL OR bio IS NULL OR skills IS NULL OR preferences IS NULL OR updated_at IS NULL;
