-- Add Team Members to Database
-- Run this in your Supabase SQL Editor

-- First, create the team members in the auth.users table
-- Note: You'll need to create these users through Supabase Auth UI or API
-- The passwords below are the generated ones from the script

-- Team Member 1: Alina Atta
-- Email: alina.atta@changemechanics.pk
-- Password: @dcyJt#58Y0I
-- Department: Development
-- Role: user

-- Team Member 2: Rameesha Nouman  
-- Email: rameesha.nouman@changemechanics.pk
-- Password: *lfTW@4Zg8Wr
-- Department: Design
-- Role: user

-- Team Member 3: Mehar Alam
-- Email: mehar.alam@changemechanics.pk
-- Password: zw7MM57DxH^9
-- Department: Marketing
-- Role: user

-- Team Member 4: Umayr Masud
-- Email: umayr.masud@changemechanics.pk
-- Password: m9Eih9w@U#3m
-- Department: Development
-- Role: user

-- Team Member 5: Muzammil Ahmed
-- Email: muzammil.ahmed@changemechanics.pk
-- Password: r3zMBrfC#MIM
-- Department: Development
-- Role: user

-- After creating users in auth.users, insert their profiles into the users table
-- (This assumes the auth.users entries have been created)

-- Example of how to insert after auth user creation:
/*
INSERT INTO public.users (
  id,
  name,
  email,
  role,
  department,
  status,
  phone,
  location,
  bio,
  skills,
  avatar,
  preferences,
  created_at,
  updated_at
) VALUES 
(
  'auth-user-id-1', -- Replace with actual auth user ID
  'Alina Atta',
  'alina.atta@changemechanics.pk',
  'user',
  'Development',
  'active',
  '+92 300 1234567',
  'Lahore, Pakistan',
  'Full-stack developer with expertise in React, Node.js, and cloud technologies.',
  ARRAY['React', 'Node.js', 'TypeScript', 'AWS', 'Docker'],
  NULL,
  '{"theme": "system", "notifications": true, "emailUpdates": false, "taskUpdates": true, "projectUpdates": true, "language": "en"}',
  NOW(),
  NOW()
),
(
  'auth-user-id-2', -- Replace with actual auth user ID
  'Rameesha Nouman',
  'rameesha.nouman@changemechanics.pk',
  'user',
  'Design',
  'active',
  '+92 300 2345678',
  'Karachi, Pakistan',
  'UI/UX designer passionate about creating intuitive and beautiful user experiences.',
  ARRAY['Figma', 'Adobe Creative Suite', 'User Research', 'Prototyping', 'Design Systems'],
  NULL,
  '{"theme": "system", "notifications": true, "emailUpdates": false, "taskUpdates": true, "projectUpdates": true, "language": "en"}',
  NOW(),
  NOW()
),
(
  'auth-user-id-3', -- Replace with actual auth user ID
  'Mehar Alam',
  'mehar.alam@changemechanics.pk',
  'user',
  'Marketing',
  'active',
  '+92 300 3456789',
  'Islamabad, Pakistan',
  'Digital marketing specialist with expertise in social media, SEO, and content strategy.',
  ARRAY['Social Media Marketing', 'SEO', 'Content Strategy', 'Google Analytics', 'Email Marketing'],
  NULL,
  '{"theme": "system", "notifications": true, "emailUpdates": false, "taskUpdates": true, "projectUpdates": true, "language": "en"}',
  NOW(),
  NOW()
),
(
  'auth-user-id-4', -- Replace with actual auth user ID
  'Umayr Masud',
  'umayr.masud@changemechanics.pk',
  'user',
  'Development',
  'active',
  '+92 300 4567890',
  'Faisalabad, Pakistan',
  'Backend developer specializing in Python, Django, and database design.',
  ARRAY['Python', 'Django', 'PostgreSQL', 'REST APIs', 'Microservices'],
  NULL,
  '{"theme": "system", "notifications": true, "emailUpdates": false, "taskUpdates": true, "projectUpdates": true, "language": "en"}',
  NOW(),
  NOW()
),
(
  'auth-user-id-5', -- Replace with actual auth user ID
  'Muzammil Ahmed',
  'muzammil.ahmed@changemechanics.pk',
  'user',
  'Development',
  'active',
  '+92 300 5678901',
  'Rawalpindi, Pakistan',
  'Mobile app developer with experience in React Native and Flutter.',
  ARRAY['React Native', 'Flutter', 'JavaScript', 'Mobile UI/UX', 'App Store Optimization'],
  NULL,
  '{"theme": "system", "notifications": true, "emailUpdates": false, "taskUpdates": true, "projectUpdates": true, "language": "en"}',
  NOW(),
  NOW()
);
*/

-- IMPORTANT: 
-- 1. First create users through Supabase Auth UI or API
-- 2. Get their auth user IDs
-- 3. Replace 'auth-user-id-X' with actual IDs
-- 4. Run the INSERT statements
-- 5. Update the login URL in your app to match your actual Vercel deployment

-- To create users through Supabase Auth UI:
-- 1. Go to Authentication > Users in your Supabase dashboard
-- 2. Click "Add User"
-- 3. Enter email and password for each team member
-- 4. Copy the generated user ID
-- 5. Use that ID in the INSERT statements above
