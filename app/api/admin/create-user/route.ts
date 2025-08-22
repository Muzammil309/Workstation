import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { name, email, password, role, department, phone, location, bio, skills } = await request.json()

    // Validate required fields
    if (!name || !email || !password || !role || !department) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email, password, role, department' },
        { status: 400 }
      )
    }

    // Create Supabase client with service role
    const cookieStore = await cookies()
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    )

    // Step 1: Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email.trim().toLowerCase(),
      password,
      email_confirm: true,
      user_metadata: { 
        name: name.trim(), 
        role, 
        department 
      }
    })

    if (authError) {
      console.error('Auth creation error:', authError)
      throw new Error(`Authentication error: ${authError.message}`)
    }

    if (!authData.user) {
      throw new Error('No user data returned from auth creation')
    }

    // Step 2: Create profile in public.users table
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id, // Use the auth user's ID
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role,
        department,
        status: 'active',
        phone: phone?.trim() || null,
        location: location?.trim() || null,
        bio: bio?.trim() || null,
        skills: skills?.length > 0 ? skills : [],
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
      console.error('Profile creation error:', profileError)
      
      // If profile creation fails, try to clean up the auth user
      try {
        await supabase.auth.admin.deleteUser(authData.user.id)
        console.log('Cleaned up auth user after profile creation failure')
      } catch (cleanupError) {
        console.error('Failed to cleanup auth user after profile creation failure:', cleanupError)
      }
      
      throw new Error(`Profile creation error: ${profileError.message}`)
    }

    console.log(`User created successfully: ${email}`)

    return NextResponse.json({ 
      success: true, 
      user: {
        id: authData.user.id,
        email: authData.user.email,
        name: name.trim(),
        role,
        department
      }
    })

  } catch (error: any) {
    console.error('Error creating user:', error)
    
    let errorMessage = "Failed to create new user"
    
    if (error.message) {
      if (error.message.includes('duplicate')) {
        errorMessage = "User with this email already exists"
      } else if (error.message.includes('permission')) {
        errorMessage = "Admin privileges required. Please check your Supabase settings"
      } else if (error.message.includes('invalid')) {
        errorMessage = "Invalid input data provided"
      } else {
        errorMessage = error.message
      }
    }
    
    return NextResponse.json(
      { error: errorMessage }, 
      { status: 500 }
    )
  }
}
