# 🗄️ Supabase Setup Guide for TaskFlow

## 📋 Prerequisites
- Supabase account and project created
- Supabase project URL and API keys
- TaskFlow application running locally

## 🔑 Step 1: Get Your Supabase Credentials

### 1a: Go to Supabase Dashboard
1. Visit [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project (or create a new one)

### 1b: Get API Keys
1. **Click "Settings"** in the left sidebar
2. **Click "API"** tab
3. **Copy these values:**
   - **Project URL** (e.g., `https://abc123.supabase.co`)
   - **anon public** key (starts with `eyJ...`)
   - **service_role** key (starts with `eyJ...`)

## 📁 Step 2: Create Environment File

### 2a: Create .env.local
**Create a new file called `.env.local` in your project root** (same folder as `package.json`)

### 2b: Add Your Credentials
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**Replace the placeholder values with your actual Supabase credentials**

## 🗄️ Step 3: Create Database Tables

### 3a: Open Supabase SQL Editor
1. In Supabase dashboard, click **"SQL Editor"**
2. Click **"New query"**

### 3b: Run This SQL Code
```sql
-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  avatar TEXT,
  department TEXT,
  phone TEXT,
  location TEXT,
  skills TEXT[],
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'away')),
  join_date TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'on-hold', 'completed')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  start_date DATE,
  end_date DATE,
  budget TEXT,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  team_members TEXT[],
  tasks_count INTEGER DEFAULT 0,
  completed_tasks INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  assignee_id UUID REFERENCES users(id),
  project_id UUID REFERENCES projects(id),
  deadline DATE,
  assigned_on DATE DEFAULT CURRENT_DATE,
  actual_time TEXT,
  estimated_hours INTEGER,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  tags TEXT[],
  dependencies TEXT[],
  auto_delete JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert sample admin user
INSERT INTO users (email, name, role, department, status) 
VALUES ('admin@changemechanics.pk', 'Admin User', 'admin', 'Management', 'active')
ON CONFLICT (email) DO NOTHING;
```

### 3c: Click "Run" to Execute

## 🚀 Step 4: Test Connection

### 4a: Restart Development Server
```bash
# Stop current server (Ctrl+C)
npm run dev
```

### 4b: Check Dashboard
1. Go to `http://localhost:3005/dashboard`
2. Click on **"Tasks"** tab
3. Look for the **TestDB component** at the top

### 4c: Expected Results
- ✅ **Green box**: Database connected successfully
- ❌ **Red box**: Check error message and follow troubleshooting steps

## 🔒 Step 5: Security & Deployment

### 5a: Local Development
- ✅ `.env.local` is automatically ignored by git
- ✅ Your keys are safe locally

### 5b: Vercel Deployment
1. **Go to Vercel Dashboard** → Your Project → Settings
2. **Click "Environment Variables"**
3. **Add each variable** from your `.env.local`
4. **Redeploy** your application

## 🐛 Troubleshooting

### Problem: "Environment variables are missing"
**Solution**: Create `.env.local` file in project root

### Problem: "Invalid API key"
**Solution**: Check your Supabase API keys are correct

### Problem: "Table doesn't exist"
**Solution**: Run the SQL code in Supabase SQL Editor

### Problem: "Connection failed"
**Solution**: Check your Supabase project URL is correct

## 📱 Next Steps

After successful connection:
1. ✅ **Remove TestDB component** from dashboard
2. ✅ **Update components** to use Supabase instead of local state
3. ✅ **Add authentication** system
4. ✅ **Connect tasks/projects** to database
5. ✅ **Set up custom domain**

## 🆘 Need Help?

1. **Check browser console** for detailed error messages
2. **Verify environment variables** are loaded
3. **Confirm Supabase project** is active
4. **Check network tab** for API requests

---

**🎯 Goal**: Get the green "Database Connected Successfully!" message in your dashboard!
