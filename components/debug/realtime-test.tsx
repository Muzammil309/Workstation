"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

// Temporary debug component to test real-time subscriptions
// Add this to your dashboard to debug real-time issues
export function RealtimeTest() {
  const { user } = useAuth()
  const [teamSubStatus, setTeamSubStatus] = useState('DISCONNECTED')
  const [dmSubStatus, setDmSubStatus] = useState('DISCONNECTED')
  const [receivedMessages, setReceivedMessages] = useState<any[]>([])
  const [testResults, setTestResults] = useState<string[]>([])

  const addTestResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
    console.log(`🔍 RealtimeTest: ${message}`)
  }

  useEffect(() => {
    if (!user?.id) {
      addTestResult('❌ No authenticated user found')
      return
    }

    addTestResult(`✅ User authenticated: ${user.email}`)

    // Test team messages subscription
    const teamChannel = supabase
      .channel('debug_team_messages')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'team_messages' },
        (payload) => {
          addTestResult(`📨 Team message received: ${payload.new?.content}`)
          setReceivedMessages(prev => [...prev, { type: 'team', data: payload.new }])
        }
      )
      .subscribe((status) => {
        setTeamSubStatus(status)
        addTestResult(`📡 Team subscription status: ${status}`)
      })

    // Test individual messages subscription
    const dmChannel = supabase
      .channel('debug_individual_messages')
      .on('postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'individual_messages',
          filter: `or(sender_id.eq.${user.id},recipient_id.eq.${user.id})`
        },
        (payload) => {
          addTestResult(`📨 Individual message received: ${payload.new?.content}`)
          setReceivedMessages(prev => [...prev, { type: 'individual', data: payload.new }])
        }
      )
      .subscribe((status) => {
        setDmSubStatus(status)
        addTestResult(`📡 Individual subscription status: ${status}`)
      })

    return () => {
      supabase.removeChannel(teamChannel)
      supabase.removeChannel(dmChannel)
      addTestResult('🔌 Cleaned up subscriptions')
    }
  }, [user?.id])

  const testTeamMessage = async () => {
    if (!user?.id) {
      addTestResult('❌ Cannot test: No authenticated user')
      return
    }

    try {
      addTestResult('📤 Testing team message insert...')
      const { data, error } = await supabase
        .from('team_messages')
        .insert([{
          content: `Test message from ${user.email} at ${new Date().toLocaleTimeString()}`,
          sender_id: user.id,
          sender_name: user.name || user.email || 'Test User',
          sender_email: user.email || '',
          message_type: 'text',
          is_read: false
        }])
        .select()

      if (error) {
        addTestResult(`❌ Team message insert failed: ${error.message}`)
        console.error('Team message insert error:', error)
      } else {
        addTestResult(`✅ Team message inserted successfully`)
      }
    } catch (err) {
      addTestResult(`❌ Team message test error: ${err}`)
    }
  }

  const testIndividualMessage = async () => {
    if (!user?.id) {
      addTestResult('❌ Cannot test: No authenticated user')
      return
    }

    try {
      addTestResult('📤 Testing individual message insert...')
      const { data, error } = await supabase
        .from('individual_messages')
        .insert([{
          content: `Test DM from ${user.email} at ${new Date().toLocaleTimeString()}`,
          sender_id: user.id,
          sender_name: user.name || user.email || 'Test User',
          recipient_id: user.id, // Send to self for testing
          recipient_name: user.name || user.email || 'Test User'
        }])
        .select()

      if (error) {
        addTestResult(`❌ Individual message insert failed: ${error.message}`)
        console.error('Individual message insert error:', error)
      } else {
        addTestResult(`✅ Individual message inserted successfully`)
      }
    } catch (err) {
      addTestResult(`❌ Individual message test error: ${err}`)
    }
  }

  const testDatabaseConnectivity = async () => {
    try {
      addTestResult('🔍 Testing database connectivity...')
      
      const { data, error } = await supabase.from('team_messages').select('count')
      if (error) {
        addTestResult(`❌ Database connectivity failed: ${error.message}`)
      } else {
        addTestResult('✅ Database connectivity successful')
      }

      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
      if (authError) {
        addTestResult(`❌ Auth check failed: ${authError.message}`)
      } else if (!authUser) {
        addTestResult('❌ No authenticated user')
      } else {
        addTestResult(`✅ Auth check passed: ${authUser.email}`)
      }
    } catch (err) {
      addTestResult(`❌ Connectivity test error: ${err}`)
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Real-time Messaging Debug Tool</CardTitle>
        <div className="flex gap-2">
          <Badge variant={teamSubStatus === 'SUBSCRIBED' ? 'default' : 'destructive'}>
            Team: {teamSubStatus}
          </Badge>
          <Badge variant={dmSubStatus === 'SUBSCRIBED' ? 'default' : 'destructive'}>
            DM: {dmSubStatus}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          <Button onClick={testDatabaseConnectivity} variant="outline">
            Test Database
          </Button>
          <Button onClick={testTeamMessage} variant="outline">
            Test Team Message
          </Button>
          <Button onClick={testIndividualMessage} variant="outline">
            Test Individual Message
          </Button>
          <Button onClick={() => setTestResults([])} variant="outline">
            Clear Log
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold mb-2">Test Log</h3>
            <div className="bg-gray-100 p-3 rounded max-h-60 overflow-y-auto text-sm">
              {testResults.map((result, index) => (
                <div key={index} className="mb-1">{result}</div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Received Messages</h3>
            <div className="bg-gray-100 p-3 rounded max-h-60 overflow-y-auto text-sm">
              {receivedMessages.map((msg, index) => (
                <div key={index} className="mb-2 p-2 bg-white rounded">
                  <div className="font-medium">{msg.type} message</div>
                  <div>{msg.data?.content}</div>
                  <div className="text-xs text-gray-500">
                    From: {msg.data?.sender_name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
