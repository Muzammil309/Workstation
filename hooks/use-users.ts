import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export interface User {
  id: string
  name: string
  email: string
  role?: string
  department?: string
  status?: string
}

export function useUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, role, department, status')
        .eq('status', 'active')
        .order('name')

      if (error) throw error
      setUsers(data || [])
    } catch (err) {
      console.error('Error loading users:', err)
      setError(err instanceof Error ? err.message : 'Failed to load users')
    } finally {
      setIsLoading(false)
    }
  }

  const getUserById = (id: string): User | undefined => {
    return users.find(user => user.id === id)
  }

  const getUsersByIds = (ids: string[]): User[] => {
    return ids.map(id => getUserById(id)).filter(Boolean) as User[]
  }

  const getUserNames = (ids: string[]): string[] => {
    return getUsersByIds(ids).map(user => user.name)
  }

  return {
    users,
    isLoading,
    error,
    getUserById,
    getUsersByIds,
    getUserNames,
    refetch: loadUsers
  }
}
