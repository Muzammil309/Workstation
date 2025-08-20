"use client"
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export function TestDB() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [envStatus, setEnvStatus] = useState<{
    url: boolean
    anonKey: boolean
    serviceKey: boolean
  }>({
    url: false,
    anonKey: false,
    serviceKey: false
  })

  useEffect(() => {
    // Check environment variables
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    setEnvStatus({
      url: !!url,
      anonKey: !!anonKey,
      serviceKey: !!serviceKey
    })

    // If environment variables are missing, show error
    if (!url || !anonKey) {
      setError('Environment variables are missing. Please check your .env.local file.')
      setLoading(false)
      return
    }

    async function fetchUsers() {
      try {
        console.log('🔍 Attempting to connect to Supabase...')
        console.log('URL:', url)
        console.log('Anon Key exists:', !!anonKey)
        
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .limit(5)
        
        if (error) {
          console.error('❌ Supabase error:', error)
          throw error
        }
        
        console.log('✅ Supabase connection successful!')
        console.log('Data received:', data)
        
        setUsers(data || [])
      } catch (err: any) {
        console.error('❌ Error details:', err)
        setError(err.message || 'Unknown error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  if (loading) {
    return (
      <div className="p-4 bg-blue-100 rounded m-4">
        <h3>🔄 Testing Database Connection...</h3>
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 rounded m-4">
        <h3>❌ Database Connection Failed</h3>
        <p className="text-red-700 mb-3">{error}</p>
        
        <div className="bg-gray-100 p-3 rounded text-sm">
          <h4 className="font-semibold mb-2">Environment Variables Status:</h4>
          <div className="space-y-1">
            <div className={envStatus.url ? 'text-green-600' : 'text-red-600'}>
              {envStatus.url ? '✅' : '❌'} NEXT_PUBLIC_SUPABASE_URL
            </div>
            <div className={envStatus.anonKey ? 'text-green-600' : 'text-red-600'}>
              {envStatus.anonKey ? '✅' : '❌'} NEXT_PUBLIC_SUPABASE_ANON_KEY
            </div>
            <div className={envStatus.serviceKey ? 'text-green-600' : 'text-red-600'}>
              {envStatus.serviceKey ? '✅' : '❌'} SUPABASE_SERVICE_ROLE_KEY
            </div>
          </div>
        </div>
        
        <div className="mt-3 p-3 bg-yellow-100 rounded text-sm">
          <h4 className="font-semibold mb-2">Troubleshooting Steps:</h4>
          <ol className="list-decimal list-inside space-y-1">
            <li>Create <code>.env.local</code> file in project root</li>
            <li>Add your Supabase credentials</li>
            <li>Restart the development server</li>
            <li>Check browser console for detailed errors</li>
          </ol>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 bg-green-100 rounded m-4">
      <h3 className="text-green-800 text-lg font-semibold">✅ Database Connected Successfully!</h3>
      <p className="text-green-700 mb-3">Found {users.length} users in database</p>
      
      {users.length > 0 ? (
        <div className="bg-white p-3 rounded">
          <h4 className="font-semibold mb-2">Sample Users:</h4>
          <pre className="text-xs overflow-auto">{JSON.stringify(users, null, 2)}</pre>
        </div>
      ) : (
        <div className="bg-yellow-100 p-3 rounded">
          <p className="text-yellow-800">No users found. You may need to create some sample data.</p>
        </div>
      )}
      
      <div className="mt-3 p-3 bg-blue-100 rounded text-sm">
        <h4 className="font-semibold mb-2">Environment Variables Status:</h4>
        <div className="space-y-1">
          <div className="text-green-600">✅ NEXT_PUBLIC_SUPABASE_URL</div>
          <div className="text-green-600">✅ NEXT_PUBLIC_SUPABASE_ANON_KEY</div>
          <div className="text-green-600">✅ SUPABASE_SERVICE_ROLE_KEY</div>
        </div>
      </div>
    </div>
  )
}