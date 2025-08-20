-- Test if tasks table exists
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public'
   AND table_name = 'tasks'
);

-- Check tasks table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'tasks'
ORDER BY ordinal_position;

-- Check if there are any tasks in the table
SELECT COUNT(*) FROM tasks;

-- Test direct task insertion
INSERT INTO tasks (
  title, 
  description, 
  status, 
  priority, 
  progress, 
  created_by, 
  created_at, 
  updated_at
)
VALUES (
  'Test Task from SQL', 
  'This is a test task created directly via SQL', 
  'pending', 
  'medium', 
  0, 
  '00000000-0000-0000-0000-000000000000', -- Replace with a real user ID
  NOW(), 
  NOW()
)
RETURNING *;

-- Check if task was created
SELECT * FROM tasks ORDER BY created_at DESC LIMIT 1;
