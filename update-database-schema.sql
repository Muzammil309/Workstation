-- Update Database Schema for Enhanced Task Management
-- Run this in your Supabase SQL Editor

-- Add missing columns to the tasks table
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS assigned_on DATE,
ADD COLUMN IF NOT EXISTS actual_time TEXT,
ADD COLUMN IF NOT EXISTS estimated_hours INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS dependencies TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS auto_delete BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS project_id TEXT,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Update existing tasks to have default values
UPDATE tasks 
SET 
  estimated_hours = COALESCE(estimated_hours, 0),
  progress = COALESCE(progress, 0),
  tags = COALESCE(tags, '{}'),
  dependencies = COALESCE(dependencies, '{}')
WHERE 
  estimated_hours IS NULL 
  OR progress IS NULL 
  OR tags IS NULL 
  OR dependencies IS NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_deadline ON tasks(deadline);
CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON tasks(created_by);

-- Verify the updated schema
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'tasks' 
ORDER BY ordinal_position;
