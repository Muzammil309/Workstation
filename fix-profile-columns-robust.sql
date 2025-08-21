-- Robust script to add missing profile columns to users table
-- This script will work even if some columns already exist

-- Step 1: Check current table structure
DO $$ 
BEGIN
    RAISE NOTICE 'Current users table structure:';
END $$;

SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- Step 2: Add location column (if it doesn't exist)
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

-- Step 3: Add phone column (if it doesn't exist)
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

-- Step 4: Add bio column (if it doesn't exist)
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

-- Step 5: Add skills column (if it doesn't exist)
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

-- Step 6: Add avatar column (if it doesn't exist)
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

-- Step 7: Add preferences column (if it doesn't exist)
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

-- Step 8: Update existing users with sample data
UPDATE users SET
  location = COALESCE(location, 'Not specified')
WHERE location IS NULL;

UPDATE users SET
  phone = COALESCE(phone, 'Not specified')
WHERE phone IS NULL;

UPDATE users SET
  bio = COALESCE(bio, 'No bio available')
WHERE bio IS NULL;

UPDATE users SET
  skills = COALESCE(skills, ARRAY['Teamwork', 'Communication'])
WHERE skills IS NULL;

UPDATE users SET
  preferences = COALESCE(preferences, '{"theme": "system", "notifications": true, "language": "en"}')::jsonb
WHERE preferences IS NULL;

-- Step 9: Verify all columns were added
DO $$ 
BEGIN
    RAISE NOTICE 'Final users table structure:';
END $$;

SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- Step 10: Test query to ensure columns are accessible
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
