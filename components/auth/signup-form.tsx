"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { LockKeyhole, AlertTriangle } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function SignupForm() {
  const { toast } = useToast()
  const router = useRouter()

  // Redirect to login page
  const handleRedirectToLogin = () => {
    router.push('/login')
  }

  return (
    <div className="space-y-6 text-center">
      <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-lg">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
            <LockKeyhole className="w-8 h-8 text-red-400" />
          </div>
          
          <h3 className="text-xl font-bold text-white">Public Registration Disabled</h3>
          
          <div className="text-gray-300 text-sm max-w-md">
            <p>For security reasons, public registration has been disabled.</p>
            <p className="mt-2">Please contact your administrator to create an account for you.</p>
          </div>
          
          <div className="flex items-center space-x-2 text-amber-400 bg-amber-500/10 px-4 py-2 rounded-md text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span>Only administrators can create new user accounts</span>
          </div>
        </div>
      </div>
      
      <Button
        onClick={handleRedirectToLogin}
        className="w-full bg-gradient-to-r from-neon-blue to-neon-purple text-white hover:from-neon-blue/90 hover:to-neon-purple/90 focus:ring-neon-blue/20 transition-all duration-200"
      >
        Return to Login
      </Button>
      
      <div className="text-center">
        <p className="text-sm text-gray-400">
          Need an account?{" "}
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
    </div>
  )
}
