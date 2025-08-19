"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { LogIn, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (!email || !password) {
        toast({
          title: 'Error',
          description: 'Please fill in all fields.',
          variant: 'destructive',
        })
        return
      }

      await login(email, password)
      toast({ title: 'Success!', description: 'Welcome back to TaskFlow!' })
      router.push('/dashboard')
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-white text-sm font-medium">
          Email Address
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
            className="w-4 h-4 text-neon-blue bg-transparent border-white/20 rounded focus:ring-neon-blue/20"
          />
          <span className="text-sm text-gray-300">Remember me</span>
        </label>
        <button
          type="button"
          className="text-sm text-neon-blue hover:text-neon-blue/80 transition-colors"
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
          >
            Sign up
          </button>
        </p>
      </div>
    </form>
  )
}
