"use client"

import { useState, useEffect } from 'react'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'user' | 'admin'
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate authentication check
    const checkAuth = async () => {
      try {
        // In a real app, this would check for a valid token
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
          setUser(JSON.parse(storedUser))
        }
      } catch (error) {
        console.error('Auth check failed:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    // Simulate login API call
    const user: User = {
      id: '1',
      email,
      firstName: 'Demo',
      lastName: 'User',
      role: 'admin'
    }
    
    setUser(user)
    localStorage.setItem('user', JSON.stringify(user))
    return user
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates }
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
    }
  }

  return {
    user,
    isLoading,
    login,
    logout,
    updateUser
  }
}
