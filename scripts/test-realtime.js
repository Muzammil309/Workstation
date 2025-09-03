// Test script to verify Supabase real-time configuration
// Run this with: node scripts/test-realtime.js

const { createClient } = require('@supabase/supabase-js')

// You'll need to replace these with your actual Supabase credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testRealtimeConfiguration() {
  console.log('🔍 Testing Supabase Real-time Configuration...')
  console.log('📡 Supabase URL:', supabaseUrl)
  
  // Test 1: Check if we can connect to Supabase
  try {
    const { data, error } = await supabase.from('team_messages').select('count').limit(1)
    if (error) {
      console.error('❌ Cannot connect to team_messages table:', error.message)
      return
    }
    console.log('✅ Successfully connected to team_messages table')
  } catch (err) {
    console.error('❌ Connection error:', err.message)
    return
  }

  // Test 2: Check individual_messages table
  try {
    const { data, error } = await supabase.from('individual_messages').select('count').limit(1)
    if (error) {
      console.error('❌ Cannot connect to individual_messages table:', error.message)
      return
    }
    console.log('✅ Successfully connected to individual_messages table')
  } catch (err) {
    console.error('❌ Individual messages connection error:', err.message)
    return
  }

  // Test 3: Set up real-time subscription for team_messages
  console.log('🔄 Testing team_messages real-time subscription...')
  const teamChannel = supabase
    .channel('test_team_messages')
    .on('postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'team_messages' },
      (payload) => {
        console.log('📨 Real-time team message received:', payload.new)
      }
    )
    .subscribe((status) => {
      console.log('📡 Team messages subscription status:', status)
      if (status === 'SUBSCRIBED') {
        console.log('✅ Team messages real-time subscription is working!')
      } else if (status === 'CHANNEL_ERROR') {
        console.error('❌ Team messages subscription failed')
      }
    })

  // Test 4: Set up real-time subscription for individual_messages
  console.log('🔄 Testing individual_messages real-time subscription...')
  const dmChannel = supabase
    .channel('test_individual_messages')
    .on('postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'individual_messages' },
      (payload) => {
        console.log('📨 Real-time individual message received:', payload.new)
      }
    )
    .subscribe((status) => {
      console.log('📡 Individual messages subscription status:', status)
      if (status === 'SUBSCRIBED') {
        console.log('✅ Individual messages real-time subscription is working!')
      } else if (status === 'CHANNEL_ERROR') {
        console.error('❌ Individual messages subscription failed')
      }
    })

  // Keep the script running for 30 seconds to test real-time
  console.log('⏳ Listening for real-time events for 30 seconds...')
  console.log('💡 Try inserting a message in another window to test real-time functionality')
  
  setTimeout(() => {
    console.log('🔌 Cleaning up subscriptions...')
    supabase.removeChannel(teamChannel)
    supabase.removeChannel(dmChannel)
    console.log('✅ Test completed')
    process.exit(0)
  }, 30000)
}

// Run the test
testRealtimeConfiguration().catch(console.error)
