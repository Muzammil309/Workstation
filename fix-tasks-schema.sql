-- Fix Tasks Table Schema
-- Run this in your Supabase SQL Editor to ensure all required columns exist

-- First, let's check what columns currently exist
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'tasks' 
ORDER BY ordinal_position;

-- Add missing columns if they don't exist
DO $$ 
BEGIN
    -- Add project_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'project_id') THEN
        ALTER TABLE tasks ADD COLUMN project_id TEXT;
    END IF;
    
    -- Add assignees column if it doesn't exist (as JSONB for array storage)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'assignees') THEN
        ALTER TABLE tasks ADD COLUMN assignees JSONB DEFAULT '[]'::jsonb;
    END IF;
    
    -- Add estimated_hours column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'estimated_hours') THEN
        ALTER TABLE tasks ADD COLUMN estimated_hours INTEGER DEFAULT 0;
    END IF;
    
    -- Add progress column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'progress') THEN
        ALTER TABLE tasks ADD COLUMN progress INTEGER DEFAULT 0;
    END IF;
    
    -- Add tags column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'tags') THEN
        ALTER TABLE tasks ADD COLUMN tags TEXT[] DEFAULT '{}';
    END IF;
    
    -- Add dependencies column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'dependencies') THEN
        ALTER TABLE tasks ADD COLUMN dependencies TEXT[] DEFAULT '{}';
    END IF;
    
    -- Add created_by column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'created_by') THEN
        ALTER TABLE tasks ADD COLUMN created_by TEXT;
    END IF;
    
    -- Add created_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'created_at') THEN
        ALTER TABLE tasks ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'updated_at') THEN
        ALTER TABLE tasks ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    -- Add assigned_on column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'assigned_on') THEN
        ALTER TABLE tasks ADD COLUMN assigned_on DATE;
    END IF;
    
    -- Add notes column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'notes') THEN
        ALTER TABLE tasks ADD COLUMN notes TEXT;
    END IF;
    
    -- Add actual_time column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'actual_time') THEN
        ALTER TABLE tasks ADD COLUMN actual_time TEXT;
    END IF;
    
    -- Add auto_delete column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'auto_delete') THEN
        ALTER TABLE tasks ADD COLUMN auto_delete BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Update existing tasks to have default values for new columns
UPDATE tasks 
SET 
  estimated_hours = COALESCE(estimated_hours, 0),
  progress = COALESCE(progress, 0),
  tags = COALESCE(tags, '{}'),
  dependencies = COALESCE(dependencies, '{}'),
  assignees = COALESCE(assignees, '[]'::jsonb),
  created_at = COALESCE(created_at, NOW()),
  updated_at = COALESCE(updated_at, NOW())
WHERE 
  estimated_hours IS NULL 
  OR progress IS NULL 
  OR tags IS NULL 
  OR dependencies IS NULL
  OR assignees IS NULL
  OR created_at IS NULL
  OR updated_at IS NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_deadline ON tasks(deadline);
CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON tasks(created_by);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);

-- Verify the final schema
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'tasks' 
ORDER BY ordinal_position;

-- Show sample data to verify structure
SELECT 
  id,
  title,
  project_id,
  assignees,
  estimated_hours,
  progress,
  status,
  priority
FROM tasks 
LIMIT 5;
