# 🔒 Secure Team Member Setup Guide

## 🚨 **IMPORTANT: These are TEMPORARY passwords - change them after first login!**

## 🔐 **Step 1: Temporary Passwords (Change After First Login)**

**⚠️ WARNING: These are temporary passwords for initial setup only!**

| # | Name | Email | **Temporary Password** | Department | Role |
|---|------|-------|------------------------|------------|------|
| 1 | **Alina Atta** | alina.atta@changemechanics.pk | `alina123` | Development | user |
| 2 | **Rameesha Nouman** | rameesha.nouman@changemechanics.pk | `rameesha123` | Design | user |
| 3 | **Mehar Alam** | mehar.alam@changemechanics.pk | `mehar123` | Marketing | user |
| 4 | **Umayr Masud** | umayr.masud@changemechanics.pk | `umayr123` | Development | user |
| 5 | **Muzammil Ahmed** | muzammil.ahmed@changemechanics.pk | `muzammil123` | Development | user |

## 🚀 **Step 2: Create Users in Supabase Auth**

1. **Go to:** [supabase.com/dashboard](https://supabase.com/dashboard)
2. **Select your project**
3. **Click:** Authentication → Users
4. **Click:** "Add User" for each team member
5. **Enter:** Email and temporary password from the table above
6. **Click:** "Create User" for each person
7. **Copy the User ID** for each person

## 📊 **Step 3: Get User IDs from Database**

Run this query in Supabase SQL Editor:

```sql
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
```

## 🗄️ **Step 4: Create User Profiles**

After getting User IDs, run this (replace USER_ID_1, USER_ID_2, etc. with actual IDs):

```sql
INSERT INTO public.users (
  id, name, email, role, department, status, phone, location, bio, skills, avatar, preferences, created_at, updated_at
) VALUES 
(
  'USER_ID_1', 'Alina Atta', 'alina.atta@changemechanics.pk', 'user', 'Development', 'active',
  '+92 300 1234567', 'Lahore, Pakistan',
  'Full-stack developer with expertise in React, Node.js, and cloud technologies.',
  ARRAY['React', 'Node.js', 'TypeScript', 'AWS', 'Docker'],
  NULL,
  '{"theme": "system", "notifications": true, "emailUpdates": false, "taskUpdates": true, "projectUpdates": true, "language": "en"}',
  NOW(), NOW()
),
(
  'USER_ID_2', 'Rameesha Nouman', 'rameesha.nouman@changemechanics.pk', 'user', 'Design', 'active',
  '+92 300 2345678', 'Karachi, Pakistan',
  'UI/UX designer passionate about creating intuitive and beautiful user experiences.',
  ARRAY['Figma', 'Adobe Creative Suite', 'User Research', 'Prototyping', 'Design Systems'],
  NULL,
  '{"theme": "system", "notifications": true, "emailUpdates": false, "taskUpdates": true, "projectUpdates": true, "language": "en"}',
  NOW(), NOW()
),
(
  'USER_ID_3', 'Mehar Alam', 'mehar.alam@changemechanics.pk', 'user', 'Marketing', 'active',
  '+92 300 3456789', 'Islamabad, Pakistan',
  'Digital marketing specialist with expertise in social media, SEO, and content strategy.',
  ARRAY['Social Media Marketing', 'SEO', 'Content Strategy', 'Google Analytics', 'Email Marketing'],
  NULL,
  '{"theme": "system", "notifications": true, "emailUpdates": false, "taskUpdates": true, "projectUpdates": true, "language": "en"}',
  NOW(), NOW()
),
(
  'USER_ID_4', 'Umayr Masud', 'umayr.masud@changemechanics.pk', 'user', 'Development', 'active',
  '+92 300 4567890', 'Faisalabad, Pakistan',
  'Backend developer specializing in Python, Django, and database design.',
  ARRAY['Python', 'Django', 'PostgreSQL', 'REST APIs', 'Microservices'],
  NULL,
  '{"theme": "system", "notifications": true, "emailUpdates": false, "taskUpdates": true, "projectUpdates": true, "language": "en"}',
  NOW(), NOW()
),
(
  'USER_ID_5', 'Muzammil Ahmed', 'muzammil.ahmed@changemechanics.pk', 'user', 'Development', 'active',
  '+92 300 5678901', 'Rawalpindi, Pakistan',
  'Mobile app developer with experience in React Native and Flutter.',
  ARRAY['React Native', 'Flutter', 'JavaScript', 'Mobile UI/UX', 'App Store Optimization'],
  NULL,
  '{"theme": "system", "notifications": true, "emailUpdates": false, "taskUpdates": true, "projectUpdates": true, "language": "en"}',
  NOW(), NOW()
);
```

## ✅ **Step 5: Verify Setup**

Run this to check all users are created:

```sql
SELECT id, name, email, role, department, status, created_at
FROM public.users 
WHERE email LIKE '%changemechanics.pk%';
```

## 🔐 **Step 6: Test Login & Change Passwords**

1. **Test login** with temporary passwords
2. **Immediately change passwords** after first login
3. **Enable 2FA** for enhanced security

## 🚨 **Security Best Practices**

- ✅ **Change temporary passwords** immediately after first login
- ✅ **Use strong passwords** (12+ characters, mixed case, numbers, symbols)
- ✅ **Never share passwords** via email or chat
- ✅ **Enable 2FA** for all accounts
- ✅ **Use password managers** for secure storage

## 🔄 **How to Change Passwords After Login**

1. **Login** with temporary password
2. **Go to:** Profile → Security → Change Password
3. **Enter:** Current temporary password
4. **Enter:** New strong password
5. **Confirm:** New password
6. **Save changes**

---

**🎯 After following these steps, your team members will be able to login successfully with temporary passwords!**
