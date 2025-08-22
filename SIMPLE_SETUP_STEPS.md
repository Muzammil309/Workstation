# 🚀 Simple Team Setup Steps

## 🔐 **NEW TEAM MEMBER PASSWORDS**

| # | Name | Email | Password | Department |
|---|------|-------|----------|------------|
| 1 | **Alina Atta** | alina.atta@changemechanics.pk | `4MVE&ilWd8C2` | Development |
| 2 | **Rameesha Nouman** | rameesha.nouman@changemechanics.pk | `!^4uWzLsZbIY` | Design |
| 3 | **Mehar Alam** | mehar.alam@changemechanics.pk | `GJX*!pq8tr5@` | Marketing |
| 4 | **Umayr Masud** | umayr.masud@changemechanics.pk | `CmJqVfR#N6vd` | Development |
| 5 | **Muzammil Ahmed** | muzammil.ahmed@changemechanics.pk | `kbP*knub67NN` | Development |

## ⚡ **3 SIMPLE STEPS**

### **Step 1: Create Users in Supabase Auth**
1. **Go to:** [supabase.com/dashboard](https://supabase.com/dashboard)
2. **Select your project**
3. **Click:** Authentication → Users
4. **Click:** "Add User" for each team member
5. **Enter:** Email and password from the table above
6. **Click:** "Create User" for each person

### **Step 2: Run the SQL Script**
1. **Go to:** SQL Editor in Supabase
2. **Copy and paste:** The entire `complete-team-setup.sql` script
3. **Run Step 2** to get User IDs
4. **Copy the User IDs** from the results
5. **Replace** `REPLACE-WITH-XXX-USER-ID` with actual IDs
6. **Uncomment** the INSERT section (remove `/*` and `*/`)
7. **Run the INSERT statements**

### **Step 3: Test Login**
1. **Go to:** Your app URL
2. **Try login** with any team member credentials
3. **Should work perfectly!** ✅

## 🎯 **What This Script Does**

- ✅ **Creates all 5 team members** in one go
- ✅ **Sets up complete profiles** with skills, bio, location
- ✅ **Configures preferences** for notifications and language
- ✅ **Includes verification queries** to check everything worked
- ✅ **Provides troubleshooting** if something goes wrong

## 🚨 **Important Notes**

- **Run Step 1 FIRST** (create users in Auth UI)
- **Copy User IDs exactly** from Step 2 results
- **Replace all placeholder IDs** before running INSERT
- **Test login** before sharing credentials with team

## 📞 **If You Get Stuck**

1. **Check the troubleshooting section** in the SQL script
2. **Verify users exist** in both auth.users and public.users
3. **Ensure RLS policies** allow proper access
4. **Check browser console** for client-side errors

---

**🎯 After following these steps, all team members will be able to login successfully!**
