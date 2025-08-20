-- Disable RLS on tasks table to fix the issue
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;

-- Check if RLS is disabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'tasks';

-- If you want to re-enable RLS later with proper policies, use these:

-- First drop any existing policies that might be causing issues
DROP POLICY IF EXISTS "Enable read access for all users" ON tasks;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON tasks;
DROP POLICY IF EXISTS "Enable update for users based on id" ON tasks;
DROP POLICY IF EXISTS "Enable delete for users based on id" ON tasks;

-- Then enable RLS
-- ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Then create proper policies:
-- CREATE POLICY "Enable read access for all users" ON tasks
--   FOR SELECT USING (true);

-- CREATE POLICY "Enable insert for authenticated users" ON tasks
--   FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- CREATE POLICY "Enable update for users based on created_by" ON tasks
--   FOR UPDATE USING (auth.uid() = created_by);

-- CREATE POLICY "Enable delete for users based on created_by" ON tasks
--   FOR DELETE USING (auth.uid() = created_by);
