# 🔐 Environment Variables Setup for Secure Admin Panel

## 📋 **Required Environment Variables**

To make the secure admin panel work, you need to add these variables to your `.env.local` file:

### **1. Supabase Configuration**
```bash
# Your Supabase project URL
NEXT_PUBLIC_SUPABASE_URL=https://yourproject.supabase.co

# Your Supabase anon key (public)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### **2. Admin Operations (CRITICAL - Server-side only)**
```bash
# Your Supabase service role key (PRIVATE - never expose in client code!)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🚨 **Security Warning**

**NEVER expose your `SUPABASE_SERVICE_ROLE_KEY` in client-side code!**

- ✅ **Safe**: Use in API routes (server-side)
- ❌ **Dangerous**: Use in React components (client-side)
- ❌ **Dangerous**: Expose in browser console
- ❌ **Dangerous**: Commit to public repositories

## 🔍 **How to Get These Values**

### **Step 1: Go to Supabase Dashboard**
1. Visit [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project

### **Step 2: Get Project URL**
1. Go to **Settings** → **API**
2. Copy **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`

### **Step 3: Get Anon Key**
1. In **Settings** → **API**
2. Copy **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### **Step 4: Get Service Role Key**
1. In **Settings** → **API**
2. Copy **service_role secret** key → `SUPABASE_SERVICE_ROLE_KEY`

## 📁 **File Structure**

Your `.env.local` file should look like this:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://yourproject.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# For Admin Operations (Server-side only)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🔧 **How It Works**

### **Client-Side (Safe)**
- Uses `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Limited permissions (user can only access their own data)
- Safe to expose in browser

### **Server-Side (Secure)**
- Uses `SUPABASE_SERVICE_ROLE_KEY` in API routes
- Full admin permissions for user creation
- Never exposed to client

## 🧪 **Testing the Setup**

1. **Add the environment variables** to `.env.local`
2. **Restart your development server**
3. **Try creating a user** in the admin panel
4. **Check the console** for any errors

## 🚨 **Common Issues**

### **"Admin privileges required"**
- Check if `SUPABASE_SERVICE_ROLE_KEY` is set correctly
- Verify the key has admin permissions
- Ensure the key is not expired

### **"Invalid API key"**
- Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
- Check if `NEXT_PUBLIC_SUPABASE_ANON_KEY` is valid
- Ensure project is active

### **"Permission denied"**
- Check RLS policies in Supabase
- Verify user has admin role in database
- Ensure service role key has proper permissions

## 🎯 **Expected Result**

After proper setup:
- ✅ **Admin panel works** without permission errors
- ✅ **Users can be created** with proper authentication
- ✅ **New users can log in** immediately
- ✅ **Passwords are secure** (handled by Supabase)
- ✅ **No security vulnerabilities** in client code

---

**Remember**: Keep your service role key secret and secure! 🔒
