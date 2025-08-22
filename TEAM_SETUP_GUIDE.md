# 🚀 Team Member Setup Guide

## 📋 Overview
This guide will help you set up your team members in the Change Mechanics task management system.

## 🔐 Generated Passwords

### Team Member Credentials

| # | Name | Email | Password | Department | Role |
|---|------|-------|----------|------------|------|
| 1 | **Alina Atta** | alina.atta@changemechanics.pk | `@dcyJt#58Y0I` | Development | user |
| 2 | **Rameesha Nouman** | rameesha.nouman@changemechanics.pk | `*lfTW@4Zg8Wr` | Design | user |
| 3 | **Mehar Alam** | mehar.alam@changemechanics.pk | `zw7MM57DxH^9` | Marketing | user |
| 4 | **Umayr Masud** | umayr.masud@changemechanics.pk | `m9Eih9w@U#3m` | Development | user |
| 5 | **Muzammil Ahmed** | muzammil.ahmed@changemechanics.pk | `r3zMBrfC#MIM` | Development | user |

## 🛠️ Setup Steps

### Step 1: Create Users in Supabase Auth
1. **Go to your Supabase Dashboard**
2. **Navigate to Authentication > Users**
3. **Click "Add User" for each team member**
4. **Enter their email and generated password**
5. **Copy the generated User ID for each person**

### Step 2: Add User Profiles to Database
1. **Go to SQL Editor in Supabase**
2. **Run the `add-team-members.sql` script**
3. **Replace `auth-user-id-X` with actual User IDs from Step 1**
4. **Execute the INSERT statements**

### Step 3: Share Login Credentials
1. **Send each team member their credentials securely**
2. **Include the login URL: `https://your-app.vercel.app/`**
3. **Ask them to change password on first login**

## 🌍 Language Support
Your team can now use the system in:
- 🇺🇸 **English** (Default)
- 🇪🇸 **Spanish** (Español)
- 🇫🇷 **French** (Français)
- 🇸🇦 **Arabic** (العربية)
- 🇵🇰 **Urdu** (اردو)

## 🔒 Security Features
- **Two-Factor Authentication** available for all users
- **Password change** required on first login
- **Role-based access control**
- **Secure session management**

## 📱 First Login Instructions for Team Members

### For Each Team Member:
1. **Visit**: `https://your-app.vercel.app/`
2. **Click**: "Login" button
3. **Enter**: Email and generated password
4. **Click**: "Sign In"
5. **Navigate**: Profile → Security → Change Password
6. **Set**: New secure password
7. **Optional**: Enable Two-Factor Authentication

## 🎯 What Team Members Can Do
- ✅ **View and manage tasks**
- ✅ **Create and edit projects**
- ✅ **Update their profiles**
- ✅ **Change language preferences**
- ✅ **Enable security features**
- ✅ **Collaborate with team**

## 🚨 Important Security Notes
- **Store passwords securely** (password manager recommended)
- **Delete the password generation script** after use
- **Ask team members to change passwords immediately**
- **Monitor login activity** in Supabase dashboard
- **Enable 2FA** for enhanced security

## 📞 Support
If team members encounter issues:
1. **Check Supabase logs** for authentication errors
2. **Verify user exists** in both auth.users and public.users tables
3. **Ensure RLS policies** allow proper access
4. **Check browser console** for client-side errors

## 🎉 Success Checklist
- [ ] All 5 team members created in Supabase Auth
- [ ] User profiles added to public.users table
- [ ] Credentials shared securely with team
- [ ] Team members can login successfully
- [ ] Passwords changed on first login
- [ ] Language preferences set
- [ ] 2FA enabled (optional but recommended)

---

**🎯 Your team is now ready to collaborate on Change Mechanics projects!**
