-- Fix Missing Assignee Column and Add Team Members
-- Run this in your Supabase SQL Editor

-- 1. Add missing assignee column to tasks table
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS assignee TEXT;

-- 2. Update existing tasks to have empty assignee (if any exist)
UPDATE tasks 
SET assignee = '' 
WHERE assignee IS NULL;

-- 3. Add team members to users table
INSERT INTO users (id, email, name, role, status, department, created_at) VALUES
-- Generate UUIDs for each team member
(gen_random_uuid(), 'alina.atta@changemechanics.pk', 'Alina Atta', 'user', 'active', 'Development', NOW()),
(gen_random_uuid(), 'rameesha.nouman@changemechanics.pk', 'Rameesha Nouman', 'user', 'active', 'Design', NOW()),
(gen_random_uuid(), 'mehar.alam@changemechanics.pk', 'Mehar Alam', 'user', 'active', 'Marketing', NOW()),
(gen_random_uuid(), 'umayr.masud@changemechanics.pk', 'Umayr Masud', 'user', 'active', 'Development', NOW()),
(gen_random_uuid(), 'muzammil.ahmed@changemechanics.pk', 'Muzammil Ahmed', 'admin', 'active', 'Management', NOW())
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  department = EXCLUDED.department;

-- 4. Verify the changes
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'tasks' 
AND column_name IN ('assignee', 'estimated_hours', 'tags', 'dependencies')
ORDER BY column_name;

-- 5. Show team members
SELECT id, email, name, role, department, status, created_at 
FROM users 
ORDER BY role DESC, name;
