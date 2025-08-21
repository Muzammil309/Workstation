-- Update Projects and Profiles Database Schema
-- Run this in your Supabase SQL Editor

-- 1. Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'on-hold', 'completed')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  startDate DATE NOT NULL,
  endDate DATE NOT NULL,
  teamMembers TEXT[] DEFAULT '{}',
  budget TEXT,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  tasksCount INTEGER DEFAULT 0,
  completedTasks INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Add new profile fields to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS skills TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS avatar TEXT,
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{"theme": "system", "notifications": true, "language": "en"}';

-- 3. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_by ON projects(created_by);
CREATE INDEX IF NOT EXISTS idx_projects_priority ON projects(priority);
CREATE INDEX IF NOT EXISTS idx_projects_dates ON projects(startDate, endDate);

-- 4. Add RLS policies for projects table
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Allow users to view all projects
CREATE POLICY "Users can view all projects" ON projects
  FOR SELECT USING (true);

-- Allow authenticated users to create projects
CREATE POLICY "Authenticated users can create projects" ON projects
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow project creators to update their projects
CREATE POLICY "Users can update their own projects" ON projects
  FOR UPDATE USING (auth.uid() = created_by);

-- Allow admins to delete any project
CREATE POLICY "Admins can delete any project" ON projects
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- 5. Insert sample projects (optional)
INSERT INTO projects (name, description, status, progress, startDate, endDate, teamMembers, budget, priority, created_by) VALUES
('Website Redesign', 'Complete overhaul of company website with modern design', 'active', 65, '2024-01-01', '2024-03-31', ARRAY['Alina Atta', 'Rameesha Nouman'], '$15,000', 'high', (SELECT id FROM users WHERE email = 'muzammil.ahmed@changemechanics.pk' LIMIT 1)),
('Mobile App Development', 'iOS and Android app for customer engagement', 'planning', 15, '2024-02-01', '2024-06-30', ARRAY['Mehar Alam', 'Umayr Masud'], '$25,000', 'medium', (SELECT id FROM users WHERE email = 'muzammil.ahmed@changemechanics.pk' LIMIT 1)),
('Database Migration', 'Migrate from legacy system to cloud database', 'completed', 100, '2023-11-01', '2024-01-15', ARRAY['Muzammil Ahmed', 'Alina Atta'], '$8,000', 'high', (SELECT id FROM users WHERE email = 'muzammil.ahmed@changemechanics.pk' LIMIT 1))
ON CONFLICT (name) DO NOTHING;

-- 6. Update existing users with sample profile data
UPDATE users SET
  phone = '+92 300 1234567',
  location = 'Lahore, Pakistan',
  bio = 'Experienced developer passionate about creating innovative solutions',
  skills = ARRAY['React', 'TypeScript', 'Node.js', 'Supabase'],
  preferences = '{"theme": "system", "notifications": true, "language": "en"}'
WHERE email = 'alina.atta@changemechanics.pk';

UPDATE users SET
  phone = '+92 301 2345678',
  location = 'Karachi, Pakistan',
  bio = 'Creative designer focused on user experience and visual design',
  skills = ARRAY['Figma', 'Adobe Creative Suite', 'UI/UX Design', 'Prototyping'],
  preferences = '{"theme": "dark", "notifications": true, "language": "en"}'
WHERE email = 'rameesha.nouman@changemechanics.pk';

UPDATE users SET
  phone = '+92 302 3456789',
  location = 'Islamabad, Pakistan',
  bio = 'Marketing specialist with expertise in digital campaigns and brand strategy',
  skills = ARRAY['Digital Marketing', 'SEO', 'Social Media', 'Content Strategy'],
  preferences = '{"theme": "light", "notifications": false, "language": "en"}'
WHERE email = 'mehar.alam@changemechanics.pk';

UPDATE users SET
  phone = '+92 303 4567890',
  location = 'Rawalpindi, Pakistan',
  bio = 'Full-stack developer with strong backend and database skills',
  skills = ARRAY['Python', 'Django', 'PostgreSQL', 'AWS'],
  preferences = '{"theme": "system", "notifications": true, "language": "en"}'
WHERE email = 'umayr.masud@changemechanics.pk';

UPDATE users SET
  phone = '+92 304 5678901',
  location = 'Lahore, Pakistan',
  bio = 'Project manager and team lead with expertise in agile methodologies',
  skills = ARRAY['Project Management', 'Agile', 'Team Leadership', 'Strategic Planning'],
  preferences = '{"theme": "dark", "notifications": true, "language": "en"}'
WHERE email = 'muzammil.ahmed@changemechanics.pk';

-- 7. Verify the updated schema
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name IN ('projects', 'users')
ORDER BY table_name, ordinal_position;

-- 8. Show sample data
SELECT 'Projects' as table_name, COUNT(*) as count FROM projects
UNION ALL
SELECT 'Users with profiles' as table_name, COUNT(*) as count FROM users WHERE phone IS NOT NULL;
