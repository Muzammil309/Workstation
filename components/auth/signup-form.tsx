"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { UserPlus, Eye, EyeOff, Check } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'

export function SignupForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user'
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { login } = useAuth()
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800))

      if (formData.password !== formData.confirmPassword) {
        toast({
          title: "Error",
          description: "Passwords do not match.",
          variant: "destructive",
        })
        return
      }

      if (Object.values(formData).some(value => !value)) {
        toast({
          title: "Error",
          description: "Please fill in all fields.",
          variant: "destructive",
        })
        return
      }

      // Auto-login newly created user for demo
      await login(formData.email, formData.password)
      toast({ title: 'Success!', description: 'Account created successfully!' })
      router.push('/dashboard')
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName" className="text-white text-sm font-medium">
            First Name
          </Label>
          <Input
            id="firstName"
            name="firstName"
            type="text"
            placeholder="John"
            value={formData.firstName}
            onChange={handleChange}
            className="glass-card border-white/20 text-white placeholder:text-gray-400 focus:border-neon-blue focus:ring-neon-blue/20"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName" className="text-white text-sm font-medium">
            Last Name
          </Label>
          <Input
            id="lastName"
            name="lastName"
            type="text"
            placeholder="Doe"
            value={formData.lastName}
            onChange={handleChange}
            className="glass-card border-white/20 text-white placeholder:text-gray-400 focus:border-neon-blue focus:ring-neon-blue/20"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-white text-sm font-medium">
          Email Address
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="john@example.com"
          value={formData.email}
          onChange={handleChange}
          className="glass-card border-white/20 text-white placeholder:text-gray-400 focus:border-neon-blue focus:ring-neon-blue/20"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="role" className="text-white text-sm font-medium">
          Role
        </Label>
        <select
          id="role"
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="w-full px-3 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-md text-white focus:border-neon-blue focus:ring-neon-blue/20 focus:outline-none"
        >
          <option value="user" className="bg-gray-800 text-white">User</option>
          <option value="admin" className="bg-gray-800 text-white">Admin</option>
        </select>
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
            placeholder="Create a password"
            value={formData.password}
            onChange={handleChange}
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

      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-white text-sm font-medium">
          Confirm Password
        </Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="glass-card border-white/20 text-white placeholder:text-gray-400 focus:border-neon-blue focus:ring-neon-blue/20 pr-10"
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
          >
            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="flex items-start space-x-2">
        <input
          type="checkbox"
          className="w-4 h-4 text-neon-blue bg-transparent border-white/20 rounded focus:ring-neon-blue/20 mt-1"
          required
        />
        <span className="text-sm text-gray-300">
          I agree to the{" "}
          <button
            type="button"
            className="text-neon-blue hover:text-neon-blue/80 transition-colors"
          >
            Terms of Service
          </button>{" "}
          and{" "}
          <button
            type="button"
            className="text-neon-blue hover:text-neon-blue/80 transition-colors"
          >
            Privacy Policy
          </button>
        </span>
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
            <UserPlus className="w-4 h-4 mr-2" />
            Create Account
          </>
        )}
      </Button>

      <div className="text-center">
        <p className="text-sm text-gray-400">
          Already have an account?{" "}
          <button
            type="button"
            className="text-neon-blue hover:text-neon-blue/80 transition-colors font-medium"
          >
            Sign in
          </button>
        </p>
      </div>
    </form>
  )
}
