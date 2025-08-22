-- COMPLETE TEAM MEMBER SETUP SCRIPT
-- Run this in your Supabase SQL Editor AFTER creating users in Auth UI

-- =====================================================
-- STEP 1: CREATE USERS IN SUPABASE AUTH UI FIRST
-- =====================================================
-- Go to Authentication > Users in your Supabase dashboard
-- Click "Add User" for each team member with these credentials:

-- 1. Alina Atta
--    Email: alina.atta@changemechanics.pk
--    Password: 4MVE&ilWd8C2

-- 2. Rameesha Nouman
--    Email: rameesha.nouman@changemechanics.pk
--    Password: !^4uWzLsZbIY

-- 3. Mehar Alam
--    Email: mehar.alam@changemechanics.pk
--    Password: GJX*!pq8tr5@

-- 4. Umayr Masud
--    Email: umayr.masud@changemechanics.pk
--    Password: CmJqVfR#N6vd

-- 5. Muzammil Ahmed
--    Email: muzammil.ahmed@changemechanics.pk
--    Password: kbP*knub67NN

-- =====================================================
-- STEP 2: GET USER IDs FROM AUTH.USERS TABLE
-- =====================================================
-- Run this query to get all the User IDs you need:

SELECT 
  id, 
  email,
  CASE 
    WHEN email = 'alina.atta@changemechanics.pk' THEN 'Alina Atta'
    WHEN email = 'rameesha.nouman@changemechanics.pk' THEN 'Rameesha Nouman'
    WHEN email = 'mehar.alam@changemechanics.pk' THEN 'Mehar Alam'
    WHEN email = 'umayr.masud@changemechanics.pk' THEN 'Umayr Masud'
    WHEN email = 'muzammil.ahmed@changemechanics.pk' THEN 'Muzammil Ahmed'
    ELSE 'Unknown'
  END as name
FROM auth.users 
WHERE email IN (
  'alina.atta@changemechanics.pk',
  'rameesha.nouman@changemechanics.pk',
  'mehar.alam@changemechanics.pk',
  'umayr.masud@changemechanics.pk',
  'muzammil.ahmed@changemechanics.pk'
);

-- =====================================================
-- STEP 3: INSERT TEAM MEMBER PROFILES
-- =====================================================
-- Copy the User IDs from Step 2 and replace them in the INSERT statements below
-- Then uncomment and run this section:

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
  'REPLACE-WITH-ALINA-USER-ID', -- Replace with Alina's actual auth user ID
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
  'REPLACE-WITH-RAMEESHA-USER-ID', -- Replace with Rameesha's actual auth user ID
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
  'REPLACE-WITH-MEHAR-USER-ID', -- Replace with Mehar's actual auth user ID
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
  'REPLACE-WITH-UMAYR-USER-ID', -- Replace with Umayr's actual auth user ID
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
  'REPLACE-WITH-MUZAMMIL-USER-ID', -- Replace with Muzammil's actual auth user ID
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

-- =====================================================
-- STEP 4: VERIFY SETUP
-- =====================================================
-- After running the INSERT statements, verify all users are created:

SELECT 
  id,
  name,
  email,
  role,
  department,
  status,
  created_at
FROM public.users 
WHERE email IN (
  'alina.atta@changemechanics.pk',
  'rameesha.nouman@changemechanics.pk',
  'mehar.alam@changemechanics.pk',
  'umayr.masud@changemechanics.pk',
  'muzammil.ahmed@changemechanics.pk'
);

-- =====================================================
-- STEP 5: TEST LOGIN CREDENTIALS
-- =====================================================
-- Use these credentials to test login:

-- 1. Alina Atta: alina.atta@changemechanics.pk / 4MVE&ilWd8C2
-- 2. Rameesha Nouman: rameesha.nouman@changemechanics.pk / !^4uWzLsZbIY
-- 3. Mehar Alam: mehar.alam@changemechanics.pk / GJX*!pq8tr5@
-- 4. Umayr Masud: umayr.masud@changemechanics.pk / CmJqVfR#N6vd
-- 5. Muzammil Ahmed: muzammil.ahmed@changemechanics.pk / kbP*knub67NN

-- =====================================================
-- TROUBLESHOOTING
-- =====================================================
-- If you get errors, check:

-- 1. Users exist in auth.users:
SELECT id, email FROM auth.users WHERE email LIKE '%changemechanics.pk%';

-- 2. Users exist in public.users:
SELECT id, name, email FROM public.users WHERE email LIKE '%changemechanics.pk%';

-- 3. RLS policies allow access:
SELECT * FROM pg_policies WHERE tablename = 'users';

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
-- After completing all steps, your team members should be able to login successfully!
-- They can then change their passwords in Profile → Security → Change Password
