# Debug Task Creation Error

## Step 1: Run the Database Schema Fix

First, run the `fix-tasks-schema.sql` script in your Supabase SQL Editor to ensure all required columns exist.

## Step 2: Check Current Database Schema

Run this query to see what columns currently exist in your tasks table:

```sql
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'tasks' 
ORDER BY ordinal_position;
```

## Step 3: Check for Missing Columns

Look for these essential columns:
- `project_id` (TEXT)
- `assignees` (JSONB or TEXT[])
- `estimated_hours` (INTEGER)
- `progress` (INTEGER)
- `created_by` (TEXT)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

## Step 4: Test Task Creation

Try creating a simple task with minimal data to isolate the issue:

```sql
INSERT INTO tasks (
  title, 
  description, 
  project_id, 
  status, 
  priority, 
  progress, 
  estimated_hours, 
  assignees, 
  created_by, 
  created_at, 
  updated_at
) VALUES (
  'Test Task',
  'Test Description',
  'test-project-id',
  'pending',
  'medium',
  0,
  0,
  '[]'::jsonb,
  'test-user-id',
  NOW(),
  NOW()
);
```

## Step 5: Check Browser Console

Open your browser's Developer Tools (F12) and check the Console tab for any JavaScript errors when creating a task.

## Step 6: Check Network Tab

In the Network tab, look for the request to create a task and check:
- Request payload
- Response status
- Response body

## Common Issues and Solutions

### Issue 1: Missing Column Error
**Error**: `could not find the 'column_name' column of 'tasks' in the schema cache`

**Solution**: Run the `fix-tasks-schema.sql` script

### Issue 2: Data Type Mismatch
**Error**: `invalid input syntax for type json`

**Solution**: Ensure `assignees` column is JSONB type and data is valid JSON

### Issue 3: Required Field Missing
**Error**: `null value in column "required_column" violates not-null constraint`

**Solution**: Check that all required fields are being sent from the form

### Issue 4: Foreign Key Constraint
**Error**: `insert or update on table "tasks" violates foreign key constraint`

**Solution**: Ensure the `project_id` and `created_by` values exist in their respective tables

## Debugging Checklist

- [ ] Database schema is up to date
- [ ] All required columns exist
- [ ] Data types match between frontend and database
- [ ] Required fields are being sent
- [ ] Foreign key references are valid
- [ ] No JavaScript errors in console
- [ ] Network requests are successful

## Next Steps

1. Run the schema fix script
2. Check the current schema
3. Try creating a test task
4. Check browser console and network
5. Report any specific error messages

If you're still getting errors, please share:
- The exact error message
- Browser console errors
- Network request details
- Current database schema
