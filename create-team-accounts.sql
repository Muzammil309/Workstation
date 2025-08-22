-- Create Team Member Accounts in Supabase
-- Run this AFTER creating users in Supabase Auth UI

-- IMPORTANT: First create these users in Supabase Auth UI:
-- 1. Go to Authentication > Users in your Supabase dashboard
-- 2. Click "Add User" for each team member
-- 3. Use the emails and passwords from the setup script
-- 4. Copy the generated User ID for each person

-- Team Member 1: Alina Atta
-- Email: alina.atta@changemechanics.pk
-- Password: 9!YTx0ovXjwr
-- Department: Development
-- Role: user

-- Team Member 2: Rameesha Nouman  
-- Email: rameesha.nouman@changemechanics.pk
-- Password: MIjM&lfP$6rl
-- Department: Design
-- Role: user

-- Team Member 3: Mehar Alam
-- Email: mehar.alam@changemechanics.pk
-- Password: UfS!ua30WlBk
-- Department: Marketing
-- Role: user

-- Team Member 4: Umayr Masud
-- Email: umayr.masud@changemechanics.pk
-- Password: AONaOqX22#Ls
-- Department: Development
-- Role: user

-- Team Member 5: Muzammil Ahmed
-- Email: muzammil.ahmed@changemechanics.pk
-- Password: *LmKNU3&bIv3
-- Department: Development
-- Role: user

-- After creating users in auth.users, insert their profiles into the users table
-- Replace 'auth-user-id-X' with the actual User IDs from Supabase Auth

-- Example INSERT statements (uncomment and modify after creating auth users):
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
  'auth-user-id-1', -- Replace with Alina's actual auth user ID
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
  'auth-user-id-2', -- Replace with Rameesha's actual auth user ID
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
  'auth-user-id-3', -- Replace with Mehar's actual auth user ID
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
  'auth-user-id-4', -- Replace with Umayr's actual auth user ID
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
  'auth-user-id-5', -- Replace with Muzammil's actual auth user ID
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

-- STEP-BY-STEP SETUP:
-- 1. Create users in Supabase Auth UI with emails and passwords above
-- 2. Get the User ID for each person from the auth.users table
-- 3. Replace 'auth-user-id-X' with actual IDs in the INSERT statements
-- 4. Uncomment the INSERT statements and run them
-- 5. Test login with the credentials

-- To get User IDs from auth.users table:
-- SELECT id, email FROM auth.users WHERE email IN (
--   'alina.atta@changemechanics.pk',
--   'rameesha.nouman@changemechanics.pk',
--   'mehar.alam@changemechanics.pk',
--   'umayr.masud@changemechanics.pk',
--   'muzammil.ahmed@changemechanics.pk'
-- );
