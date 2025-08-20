"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { LogIn, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      if (!email || !password) {
        setError('Please fill in all fields')
        setIsLoading(false)
        return
      }

      console.log('🔍 Login attempt starting for:', email)
      console.log('🔍 Password length:', password.length)
      
      // Step 1: Check if user exists in users table
      console.log('🔍 Step 1: Checking if user exists in users table...')
      const { data: userCheck, error: userCheckError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single()
      
      console.log('🔍 User check result:', { userCheck, userCheckError })
      
      if (userCheckError) {
        console.error('❌ User not found in users table:', userCheckError)
        setError('User not found. Please contact your administrator.')
        return
      }
      
      if (!userCheck) {
        console.error('❌ No user data returned from users table')
        setError('User not found. Please contact your administrator.')
        return
      }
      
      console.log('✅ User found in users table:', userCheck)
      
      // Step 2: Try Supabase authentication
      console.log('🔍 Step 2: Attempting Supabase authentication...')
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      console.log('🔍 Auth result:', { authData, authError })
      
      if (authError) {
        console.error('❌ Supabase auth error:', authError)
        if (authError.message.includes('Invalid login credentials')) {
          setError('Invalid email or password')
        } else if (authError.message.includes('Email not confirmed')) {
          setError('Please verify your email address')
        } else {
          setError(`Authentication failed: ${authError.message}`)
        }
        return
      }
      
      if (!authData.user) {
        console.error('❌ No user data returned from auth')
        setError('Authentication failed. No user data received.')
        return
      }
      
      console.log('✅ Supabase auth successful!')
      console.log('✅ Auth user ID:', authData.user.id)
      console.log('✅ Users table user ID:', userCheck.id)
      
      // Step 3: Verify user IDs match
      if (authData.user.id !== userCheck.id) {
        console.error('❌ User ID mismatch!', {
          authId: authData.user.id,
          usersTableId: userCheck.id
        })
        setError('User account mismatch. Please contact your administrator.')
        return
      }
      
      console.log('✅ User IDs match! Login successful!')
      
      toast({ title: 'Success!', description: 'Welcome back to TaskFlow!' })
      
      // Force navigation to dashboard
      console.log('🔍 Redirecting to dashboard...')
      window.location.href = '/dashboard'
    } catch (err: any) {
      console.error('❌ Unexpected login error:', err)
      
      if (err.message?.includes('Invalid login credentials')) {
        setError('Invalid email or password')
      } else if (err.message?.includes('Email not confirmed')) {
        setError('Please verify your email address')
      } else {
        setError(`Unexpected error: ${err.message || 'Please try again.'}`)
      }
    } finally {
      console.log('🔍 Setting loading to false')
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Debug Info */}
      <div className="p-2 bg-blue-500/20 border border-blue-500/30 rounded-md text-xs text-blue-200">
        <div>Debug: Loading = {isLoading ? 'true' : 'false'}</div>
        <div>Debug: Email = {email}</div>
        <div>Debug: Password length = {password.length}</div>
      </div>
      
      {error && (
        <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-md flex items-center space-x-2 text-sm text-red-200">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="email" className="text-white text-sm font-medium">
          Email Address
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          className="glass-card border-white/20 text-white placeholder:text-gray-400 focus:border-neon-blue focus:ring-neon-blue/20"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-white text-sm font-medium">
          Password
        </Label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            className="glass-card border-white/20 text-white placeholder:text-gray-400 focus:border-neon-blue focus:ring-neon-blue/20 pr-10"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="remember"
            autoComplete="off"
            className="w-4 h-4 text-neon-blue bg-transparent border-white/20 rounded focus:ring-neon-blue/20"
          />
          <span className="text-sm text-gray-300">Remember me</span>
        </label>
        <button
          type="button"
          className="text-sm text-neon-blue hover:text-neon-blue/80 transition-colors"
          onClick={() => toast({ 
            title: "Password Reset", 
            description: "Please contact your administrator to reset your password."
          })}
        >
          Forgot password?
        </button>
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-neon-blue to-neon-purple text-white hover:from-neon-blue/90 hover:to-neon-purple/90 focus:ring-neon-blue/20 transition-all duration-200"
      >
        {isLoading ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
          />
        ) : (
          <>
            <LogIn className="w-4 h-4 mr-2" />
            Sign In
          </>
        )}
      </Button>

      <div className="text-center">
        <p className="text-sm text-gray-400">
          Don't have an account?{" "}
          <button
            type="button"
            className="text-neon-blue hover:text-neon-blue/80 transition-colors font-medium"
            onClick={() => toast({ 
              title: "Contact Admin", 
              description: "Please contact your administrator to create an account for you."
            })}
          >
            Contact Administrator
          </button>
        </p>
      </div>
    </form>
  )
}
