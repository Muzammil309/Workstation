# 🔐 Supabase Auth Admin Setup Guide

## 🚨 **Why Direct Database Insertion Was Unsafe**

The previous approach of inserting users directly into the database had several **critical security issues**:

### ❌ **Security Problems:**
1. **No Authentication**: Users couldn't actually log in
2. **Plain Text Passwords**: Major security vulnerability
3. **Bypass Supabase Auth**: Circumvented built-in security
4. **No Session Management**: No JWT tokens or user sessions
5. **No Password Hashing**: Passwords stored insecurely

## ✅ **Secure Solution: Supabase Auth Admin**

I've reverted to using `supabase.auth.admin.createUser()` which provides:

### **🔒 Security Benefits:**
- ✅ **Proper Authentication**: Users can immediately log in
- ✅ **Password Hashing**: Supabase handles secure password storage
- ✅ **JWT Tokens**: Proper session management
- ✅ **Email Verification**: Built-in email confirmation
- ✅ **User Metadata**: Secure storage of additional user info
- ✅ **Audit Logs**: Track user creation and changes

## 🛠️ **Setup Steps for Supabase Auth Admin**

### **Step 1: Check Service Role Key**

1. Go to your **Supabase Dashboard**
2. Navigate to **Settings** → **API**
3. Copy your **Service Role Key** (not the anon key)

### **Step 2: Update Environment Variables**

In your `.env.local` file, ensure you have:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# For Admin Operations (Server-side only)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### **Step 3: Create Server-Side API Route**

Create a new file: `app/api/admin/create-user/route.ts`

```typescript
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { name, email, password, role, department, phone, location, bio, skills } = await request.json()

    // Create Supabase client with service role
    const supabase = createRouteHandlerClient({ cookies }, {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
      supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!
    })

    // Step 1: Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, role, department }
    })

    if (authError) throw authError

    // Step 2: Create profile in public.users
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        name,
        email,
        role,
        department,
        status: 'active',
        phone: phone || null,
        location: location || null,
        bio: bio || null,
        skills: skills || [],
        preferences: {
          theme: 'system',
          notifications: true,
          emailUpdates: false,
          taskUpdates: true,
          projectUpdates: true,
          language: 'en',
          notificationSounds: {
            default: 'default',
            urgent: 'urgent',
            alert: 'alert'
          },
          soundVolume: 50,
          soundsEnabled: true,
          vibrateEnabled: false
        }
      })

    if (profileError) {
      // Cleanup auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authData.user.id)
      throw profileError
    }

    return NextResponse.json({ 
      success: true, 
      user: authData.user 
    })

  } catch (error: any) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: error.message }, 
      { status: 500 }
    )
  }
}
```

### **Step 4: Update Admin Panel to Use API Route**

Modify the `addNewUser` function in `admin-panel.tsx`:

```typescript
const addNewUser = async () => {
  try {
    setCreatingUser(true)
    
    // Validate required fields
    if (!newUser.name.trim() || !newUser.email.trim() || !newUser.password.trim()) {
      toast({
        title: "Validation Error",
        description: "Name, email, and password are required",
        variant: "destructive"
      })
      return
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', newUser.email)
      .single()

    if (existingUser) {
      toast({
        title: "Error",
        description: "User with this email already exists",
        variant: "destructive"
      })
      return
    }

    // Create user via API route (server-side with service role)
    const response = await fetch('/api/admin/create-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newUser)
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || 'Failed to create user')
    }

    toast({
      title: "Success",
      description: `New ${newUser.role} user "${newUser.name}" created successfully! They can now log in with their email and password.`,
    })

    // Reset form and refresh users
    setNewUser({
      name: '',
      email: '',
      password: '',
      role: 'user',
      department: 'Development',
      phone: '',
      location: '',
      bio: '',
      skills: []
    })
    setShowAddUser(false)
    await fetchUsers()

  } catch (error: any) {
    console.error('Error creating new user:', error)
    toast({
      title: "Error",
      description: error.message || "Failed to create new user",
      variant: "destructive"
    })
  } finally {
    setCreatingUser(false)
  }
}
```

## 🔑 **Alternative: Use Supabase Edge Functions**

If you prefer, you can also create a Supabase Edge Function:

### **Step 1: Create Edge Function**

```bash
supabase functions new create-user
```

### **Step 2: Edge Function Code**

```typescript
// supabase/functions/create-user/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const { name, email, password, role, department, phone, location, bio, skills } = await req.json()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Create user in auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, role, department }
    })

    if (authError) throw authError

    // Create profile
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        name,
        email,
        role,
        department,
        status: 'active',
        phone: phone || null,
        location: location || null,
        bio: bio || null,
        skills: skills || [],
        preferences: {
          theme: 'system',
          notifications: true,
          emailUpdates: false,
          taskUpdates: true,
          projectUpdates: true,
          language: 'en',
          notificationSounds: {
            default: 'default',
            urgent: 'urgent',
            alert: 'alert'
          },
          soundVolume: 50,
          soundsEnabled: true,
          vibrateEnabled: false
        }
      })

    if (profileError) {
      await supabase.auth.admin.deleteUser(authData.user.id)
      throw profileError
    }

    return new Response(
      JSON.stringify({ success: true, user: authData.user }),
      { headers: { 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
```

## 🎯 **Recommended Approach**

I recommend using **Option 1 (API Route)** because:

1. ✅ **Easier to implement** and debug
2. ✅ **Better error handling** and logging
3. ✅ **More control** over the process
4. ✅ **Easier to test** and maintain

## 🔍 **Troubleshooting**

### **If you get "Admin privileges required":**

1. **Check Service Role Key**: Ensure you're using the correct key
2. **Verify Environment Variables**: Check `.env.local` file
3. **Check Supabase Settings**: Ensure RLS policies allow admin operations
4. **Verify User Role**: Ensure your account has admin role in database

### **Common Issues:**

- **Permission Denied**: Use service role key, not anon key
- **RLS Policy Issues**: Check Row Level Security policies
- **Missing Columns**: Run the schema fix script first
- **Environment Variables**: Ensure all required vars are set

## 🎉 **Expected Result**

After proper setup, you'll have:

- ✅ **Secure user creation** with proper authentication
- ✅ **Immediate login capability** for new users
- ✅ **Password security** handled by Supabase
- ✅ **Proper session management** with JWT tokens
- ✅ **Audit logging** for all admin operations
- ✅ **Email verification** capabilities

---

**Security Note**: Never expose your service role key in client-side code. Always use it server-side only!
