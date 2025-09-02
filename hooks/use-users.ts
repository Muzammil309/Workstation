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

// Simple shared cache to dedupe concurrent loads and reduce load during dashboard init
let cachedUsers: User[] | null = null
let inFlight: Promise<User[]> | null = null
let lastFetched = 0
const TTL_MS = 60_000 // 1 minute cache TTL

async function fetchUsersWithRetry(): Promise<User[]> {
  let delay = 300
  for (let i = 0; i < 3; i++) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, role, department, status')
        .eq('status', 'active')
        .order('name')

      if (error) throw error
      return data || []
    } catch (err) {
      if (i === 2) throw err
      await new Promise(res => setTimeout(res, delay))
      delay *= 2
    }
  }
  return []
}

export function useUsers() {
  const [users, setUsers] = useState<User[]>(cachedUsers || [])
  const [isLoading, setIsLoading] = useState(!cachedUsers)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const loadUsers = async () => {
      try {
        setIsLoading(prev => prev || !cachedUsers)
        setError(null)

        // Serve from cache if fresh
        if (cachedUsers && Date.now() - lastFetched < TTL_MS) {
          if (!cancelled) setUsers(cachedUsers)
          return
        }

        // Dedupe concurrent loads
        if (!inFlight) {
          inFlight = fetchUsersWithRetry()
        }
        const data = await inFlight
        if (!cancelled) {
          cachedUsers = data
          lastFetched = Date.now()
          setUsers(data)
        }
      } catch (err) {
        console.error('Error loading users:', err)
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load users')
      } finally {
        if (!cancelled) setIsLoading(false)
        inFlight = null
      }
    }

    loadUsers()
    return () => { cancelled = true }
  }, [])

  const getUserById = (id: string): User | undefined => {
    return users.find(user => user.id === id)
  }

  const getUsersByIds = (ids: string[]): User[] => {
    return ids.map(id => getUserById(id)).filter(Boolean) as User[]
  }

  const getUserNames = (ids: string[]): string[] => {
    return getUsersByIds(ids).map(user => user.name)
  }

  const refetch = async () => {
    cachedUsers = null
    lastFetched = 0
    await fetchUsersWithRetry().then(data => {
      cachedUsers = data
      lastFetched = Date.now()
      setUsers(data)
    })
  }

  return {
    users,
    isLoading,
    error,
    getUserById,
    getUsersByIds,
    getUserNames,
    refetch
  }
}
