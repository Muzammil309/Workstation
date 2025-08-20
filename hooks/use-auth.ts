"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
  name?: string
  role: 'user' | 'admin'
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is already authenticated with Supabase
    const checkAuth = async () => {
      try {
        console.log('🔍 useAuth: Starting auth check...')
        const { data: { session } } = await supabase.auth.getSession()
        console.log('🔍 useAuth: Session check result:', { session: !!session, userId: session?.user?.id })
        
        if (session) {
          console.log('🔍 useAuth: Session found, checking users table...')
          // Get user details from database
          const { data: userData, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single()
            
          console.log('🔍 useAuth: Users table query result:', { userData, error })
          
          if (error) {
            console.error('❌ useAuth: Error fetching user from users table:', error)
            throw error
          }
          
          if (userData) {
            console.log('✅ useAuth: User data found, formatting user...')
            const formattedUser: User = {
              id: userData.id,
              email: userData.email,
              name: userData.name,
              firstName: userData.name?.split(' ')[0],
              lastName: userData.name?.split(' ').slice(1).join(' '),
              role: userData.role as 'user' | 'admin'
            }
            console.log('✅ useAuth: Setting user:', formattedUser)
            setUser(formattedUser)
          } else {
            console.log('⚠️ useAuth: No user data found in users table')
          }
        } else {
          console.log('🔍 useAuth: No session found')
        }
      } catch (error) {
        console.error('❌ useAuth: Auth check failed:', error)
      } finally {
        console.log('🔍 useAuth: Setting isLoading to false')
        setIsLoading(false)
      }
    }

    checkAuth()
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔍 useAuth: Auth state change event:', event, 'Session:', !!session)
        
        if (event === 'SIGNED_IN' && session) {
          console.log('🔍 useAuth: SIGNED_IN event, getting user details from database...')
          // Get user details from database when they sign in
          const { data: userData, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single()
            
          console.log('🔍 useAuth: Database query result for SIGNED_IN:', { userData, error })
          
          if (!error && userData) {
            console.log('✅ useAuth: User data found for SIGNED_IN, formatting...')
            const formattedUser: User = {
              id: userData.id,
              email: userData.email,
              name: userData.name,
              firstName: userData.name?.split(' ')[0],
              lastName: userData.name?.split(' ').slice(1).join(' '),
              role: userData.role as 'user' | 'admin'
            }
            console.log('✅ useAuth: Setting user from SIGNED_IN event:', formattedUser)
            setUser(formattedUser)
          } else {
            console.error('❌ useAuth: Error getting user data for SIGNED_IN:', error)
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('🔍 useAuth: SIGNED_OUT event, clearing user')
          setUser(null)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const login = async (email: string, password: string) => {
    try {
      console.log('🔍 useAuth.login: Starting login process for:', email)
      
      // First, check if user exists in our users table
      console.log('🔍 useAuth.login: Checking users table...')
      const { data: userCheck, error: userCheckError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single()
      
      console.log('🔍 useAuth.login: Users table check result:', { userCheck, userCheckError })
      
      if (userCheckError || !userCheck) {
        console.error('❌ useAuth.login: User not found in users table:', userCheckError)
        throw new Error('User not found. Please contact your administrator.')
      }
      
      console.log('✅ useAuth.login: User found in users table, attempting Supabase auth...')
      
      // Now attempt to authenticate with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      console.log('🔍 useAuth.login: Supabase auth result:', { data, error })
      
      if (error) {
        console.error('❌ useAuth.login: Supabase auth error:', error)
        // Provide more specific error messages
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password')
        } else if (error.message.includes('Email not confirmed')) {
          throw new Error('Please verify your email address')
        } else {
          throw new Error('Authentication failed. Please try again.')
        }
      }
      
      if (data.user) {
        console.log('✅ useAuth.login: Supabase auth successful, user ID:', data.user.id)
        console.log('🔍 useAuth.login: Comparing user IDs - Supabase:', data.user.id, 'Users table:', userCheck.id)
        
        // Verify the user ID matches between auth and our users table
        if (data.user.id !== userCheck.id) {
          console.error('❌ useAuth.login: User ID mismatch!')
          throw new Error('User account mismatch. Please contact your administrator.')
        }
        
        console.log('✅ useAuth.login: User IDs match, formatting user...')
        const formattedUser: User = {
          id: userCheck.id,
          email: userCheck.email,
          name: userCheck.name,
          firstName: userCheck.name?.split(' ')[0],
          lastName: userCheck.name?.split(' ').slice(1).join(' '),
          role: userCheck.role as 'user' | 'admin'
        }
        console.log('✅ useAuth.login: Setting user in state:', formattedUser)
        setUser(formattedUser)
        return formattedUser
      }
      
      console.error('❌ useAuth.login: No user data returned from Supabase')
      throw new Error('Authentication failed. Please try again.')
    } catch (error: any) {
      console.error('❌ useAuth.login: Login failed:', error)
      throw error
    }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  const updateUser = async (updates: Partial<User>) => {
    if (!user) return
    
    try {
      // Update user in database
      const { error } = await supabase
        .from('users')
        .update({
          name: updates.firstName && updates.lastName 
            ? `${updates.firstName} ${updates.lastName}`
            : user.name,
          ...updates
        })
        .eq('id', user.id)
        
      if (error) throw error
      
      // Update local state
      const updatedUser = { ...user, ...updates }
      setUser(updatedUser)
      
      return updatedUser
    } catch (error) {
      console.error('Update user failed:', error)
      throw error
    }
  }
  
  // Admin function to create new users
  const createUser = async (userData: { 
    email: string, 
    password: string, 
    firstName: string, 
    lastName: string,
    role: 'user' | 'admin',
    department?: string
  }) => {
    // Only admins can create users
    if (!user || user.role !== 'admin') {
      throw new Error('Unauthorized: Only admins can create users')
    }
    
    try {
      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', userData.email)
        .single()
      
      if (existingUser) {
        throw new Error('User with this email already exists')
      }
      
      // Create auth user with Supabase
      const { data, error } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true
      })
      
      if (error) throw error
      
      if (data.user) {
        // Add user details to users table
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: userData.email,
            name: `${userData.firstName} ${userData.lastName}`,
            role: userData.role,
            status: 'active',
            department: userData.department || null
          })
          
        if (insertError) throw insertError
        
        return {
          id: data.user.id,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: userData.role,
          department: userData.department
        }
      }
      
      throw new Error('Failed to create user')
    } catch (error) {
      console.error('Create user failed:', error)
      throw error
    }
  }

  // Admin function to create invitation links
  const createInvitation = async (email: string, firstName: string, lastName: string, department?: string) => {
    // Only admins can create invitations
    if (!user || user.role !== 'admin') {
      throw new Error('Unauthorized: Only admins can create invitations')
    }
    
    try {
      // Generate a secure invitation token
      const invitationToken = crypto.randomUUID()
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
      
      // Store invitation in database (you'll need to create this table)
      const { error: insertError } = await supabase
        .from('user_invitations')
        .insert({
          email,
          first_name: firstName,
          last_name: lastName,
          department,
          invitation_token: invitationToken,
          expires_at: expiresAt.toISOString(),
          invited_by: user.id,
          status: 'pending'
        })
        
      if (insertError) throw insertError
      
      // Return invitation link
      const invitationLink = `${window.location.origin}/invite?token=${invitationToken}`
      
      return {
        email,
        firstName,
        lastName,
        department,
        invitationLink,
        expiresAt
      }
    } catch (error) {
      console.error('Create invitation failed:', error)
      throw error
    }
  }

  // Function to accept invitation and create user account
  const acceptInvitation = async (token: string, password: string) => {
    try {
      // Get invitation details
      const { data: invitation, error: invitationError } = await supabase
        .from('user_invitations')
        .select('*')
        .eq('invitation_token', token)
        .eq('status', 'pending')
        .single()
      
      if (invitationError || !invitation) {
        throw new Error('Invalid or expired invitation')
      }
      
      // Check if invitation has expired
      if (new Date(invitation.expires_at) < new Date()) {
        throw new Error('Invitation has expired')
      }
      
      // Create the user account
      const userData = await createUser({
        email: invitation.email,
        password,
        firstName: invitation.first_name,
        lastName: invitation.last_name,
        role: 'user',
        department: invitation.department
      })
      
      // Mark invitation as accepted
      await supabase
        .from('user_invitations')
        .update({ status: 'accepted', accepted_at: new Date().toISOString() })
        .eq('invitation_token', token)
      
      return userData
    } catch (error) {
      console.error('Accept invitation failed:', error)
      throw error
    }
  }

  return {
    user,
    isLoading,
    login,
    logout,
    updateUser,
    createUser,
    createInvitation,
    acceptInvitation
  }
}
