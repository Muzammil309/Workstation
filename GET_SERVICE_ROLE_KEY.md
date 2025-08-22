# 🔑 **How to Get Your Supabase Service Role Key**

## 🚨 **CRITICAL: You're Currently Using a Placeholder!**

Your `.env.local` file currently has:
```bash
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**This is NOT a real key and will cause security issues!**

## 📋 **Step-by-Step Guide**

### **Step 1: Go to Supabase Dashboard**
1. Open [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sign in to your account
3. Select your project

### **Step 2: Navigate to API Settings**
1. Click **Settings** in the left sidebar
2. Click **API** in the settings menu

### **Step 3: Find Your Service Role Key**
1. Look for **"service_role"** section
2. Click **"Copy"** button next to the key
3. **IMPORTANT**: This key starts with `eyJ` and is very long (100+ characters)

### **Step 4: Update Your .env.local File**
Replace this line:
```bash
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

With your actual key:
```bash
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtdG5wdmJqYjV0c2JqY2JqY2JqYyIsInJvbGUiOiJzZXJ2aWNlX3JvbGUiLCJpYXQiOjE2MzQ1NjQ4MDAsImV4cCI6MTk1MDE0MDgwMH0.EGIM96RAZx35hJt9Wjz17QjRpqXy8J0Z0Z0Z0Z0Z0Z0
```

### **Step 5: Restart Your Development Server**
1. Stop your current dev server (Ctrl+C)
2. Run `npm run dev` again
3. The new environment variable will be loaded

## 🔍 **What a Real Service Role Key Looks Like**

✅ **Real Key Format:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtdG5wdmJqYjV0c2JqY2JqY2JqYyIsInJvbGUiOiJzZXJ2aWNlX3JvbGUiLCJpYXQiOjE2MzQ1NjQ4MDAsImV4cCI6MTk1MDE0MDgwMH0.EGIM96RAZx35hJt9Wjz17QjRpqXy8J0Z0Z0Z0Z0Z0Z0
```

❌ **Wrong (Placeholder):**
```
your_service_role_key_here
```

❌ **Wrong (Too Short):**
```
abc123
```

## 🚨 **Security Warnings**

1. **NEVER commit your service role key to Git**
2. **NEVER share your service role key publicly**
3. **NEVER use placeholder text**
4. **Always use the actual key from Supabase dashboard**

## 🧪 **Test After Setup**

1. **Restart your dev server**
2. **Try creating a user** in the admin panel
3. **Check the console** - no more "data can be breached" warnings
4. **User creation should work** without errors

## 🔒 **Why This Fixes Security Issues**

- **Placeholder keys** cause authentication failures
- **Invalid keys** trigger security warnings
- **Real service role keys** provide proper admin permissions
- **Proper authentication** prevents data breach warnings

---

**Remember**: Your service role key is like a master password - keep it secret and secure! 🔒
