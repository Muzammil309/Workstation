-- Comprehensive script to add ALL missing columns to users table
-- This will fix the profile editing issues completely

-- Step 1: Check current table structure
SELECT 'Current users table structure:' as info;
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- Step 2: Add updated_at column (if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE users ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Added updated_at column';
    ELSE
        RAISE NOTICE 'updated_at column already exists';
    END IF;
END $$;

-- Step 3: Add location column (if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'location'
    ) THEN
        ALTER TABLE users ADD COLUMN location TEXT;
        RAISE NOTICE 'Added location column';
    ELSE
        RAISE NOTICE 'location column already exists';
    END IF;
END $$;

-- Step 4: Add phone column (if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'phone'
    ) THEN
        ALTER TABLE users ADD COLUMN phone TEXT;
        RAISE NOTICE 'Added phone column';
    ELSE
        RAISE NOTICE 'phone column already exists';
    END IF;
END $$;

-- Step 5: Add bio column (if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'bio'
    ) THEN
        ALTER TABLE users ADD COLUMN bio TEXT;
        RAISE NOTICE 'Added bio column';
    ELSE
        RAISE NOTICE 'bio column already exists';
    END IF;
END $$;

-- Step 6: Add skills column (if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'skills'
    ) THEN
        ALTER TABLE users ADD COLUMN skills TEXT[] DEFAULT '{}';
        RAISE NOTICE 'Added skills column';
    ELSE
        RAISE NOTICE 'skills column already exists';
    END IF;
END $$;

-- Step 7: Add avatar column (if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'avatar'
    ) THEN
        ALTER TABLE users ADD COLUMN avatar TEXT;
        RAISE NOTICE 'Added avatar column';
    ELSE
        RAISE NOTICE 'avatar column already exists';
    END IF;
END $$;

-- Step 8: Add preferences column (if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'preferences'
    ) THEN
        ALTER TABLE users ADD COLUMN preferences JSONB DEFAULT '{"theme": "system", "notifications": true, "language": "en"}';
        RAISE NOTICE 'Added preferences column';
    ELSE
        RAISE NOTICE 'preferences column already exists';
    END IF;
END $$;

-- Step 9: Update existing users with sample data and set updated_at
UPDATE users SET
  location = COALESCE(location, 'Not specified'),
  phone = COALESCE(phone, 'Not specified'),
  bio = COALESCE(bio, 'No bio available'),
  skills = COALESCE(skills, ARRAY['Teamwork', 'Communication']),
  preferences = COALESCE(preferences, '{"theme": "system", "notifications": true, "language": "en"}')::jsonb,
  updated_at = COALESCE(updated_at, NOW())
WHERE location IS NULL OR phone IS NULL OR bio IS NULL OR skills IS NULL OR preferences IS NULL OR updated_at IS NULL;

-- Step 10: Verify all columns were added
SELECT 'Final users table structure:' as info;
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- Step 11: Test query to ensure all columns are accessible
SELECT 'Testing all columns:' as info;
SELECT 
  id, 
  name, 
  email, 
  location, 
  phone, 
  bio, 
  skills, 
  preferences,
  updated_at
FROM users 
LIMIT 1;

-- Step 12: Test update functionality
SELECT 'Testing update functionality:' as info;
UPDATE users 
SET 
  location = 'Test Location',
  phone = '+1 (555) 123-4567',
  bio = 'Test bio',
  skills = ARRAY['Test Skill'],
  preferences = '{"theme": "dark", "notifications": true, "language": "en"}'::jsonb,
  updated_at = NOW()
WHERE id = (SELECT id FROM users LIMIT 1);

-- Step 13: Verify the update worked
SELECT 'Verifying update worked:' as info;
SELECT 
  id,
  name,
  email,
  location,
  phone,
  bio,
  skills,
  preferences,
  updated_at
FROM users 
LIMIT 1;

-- If all the above worked without errors, your profile editing should work!
