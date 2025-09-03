// Comprehensive diagnostic script for Team Inbox messaging issues
// Run with: node scripts/diagnose-messaging.js

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Read environment variables from .env.local file
let supabaseUrl, supabaseAnonKey

try {
  const envPath = path.join(__dirname, '..', '.env.local')
  const envContent = fs.readFileSync(envPath, 'utf8')

  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=')
    if (key === 'NEXT_PUBLIC_SUPABASE_URL') {
      supabaseUrl = value?.replace(/["\r\n]/g, '').trim()
    } else if (key === 'NEXT_PUBLIC_SUPABASE_ANON_KEY') {
      supabaseAnonKey = value?.replace(/["\r\n]/g, '').trim()
    }
  })
} catch (err) {
  console.error('❌ Could not read .env.local file:', err.message)
  console.log('💡 Please ensure .env.local exists in the project root with:')
  console.log('   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url')
  console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key')
  process.exit(1)
}

console.log('🔍 TEAM INBOX MESSAGING DIAGNOSTIC TOOL')
console.log('=====================================')

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables')
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing')
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Set' : '❌ Missing')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function runDiagnostics() {
  console.log('\n1. 🔗 BASIC CONNECTIVITY TEST')
  console.log('-----------------------------')
  
  try {
    const { data, error } = await supabase.from('team_messages').select('count')
    if (error) {
      console.error('❌ Cannot connect to team_messages:', error.message)
      console.error('   Error details:', error)
    } else {
      console.log('✅ Successfully connected to team_messages table')
    }
  } catch (err) {
    console.error('❌ Connection error:', err.message)
  }

  try {
    const { data, error } = await supabase.from('individual_messages').select('count')
    if (error) {
      console.error('❌ Cannot connect to individual_messages:', error.message)
      console.error('   Error details:', error)
    } else {
      console.log('✅ Successfully connected to individual_messages table')
    }
  } catch (err) {
    console.error('❌ Individual messages connection error:', err.message)
  }

  console.log('\n2. 🔐 AUTHENTICATION STATUS')
  console.log('---------------------------')
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError) {
    console.error('❌ Authentication error:', authError.message)
    console.log('💡 This might be why messages are failing - no authenticated user')
  } else if (!user) {
    console.log('⚠️  No authenticated user found')
    console.log('💡 Messages require authentication to write to database')
  } else {
    console.log('✅ User authenticated:', user.email)
    console.log('   User ID:', user.id)
  }

  console.log('\n3. 🛡️  RLS POLICY TEST')
  console.log('---------------------')
  
  // Test team_messages INSERT permission
  try {
    const testMessage = {
      content: 'Diagnostic test message',
      sender_id: user?.id || 'test-user-id',
      sender_name: 'Diagnostic Test',
      sender_email: user?.email || 'test@example.com',
      message_type: 'text',
      is_read: false
    }
    
    const { data, error } = await supabase
      .from('team_messages')
      .insert([testMessage])
      .select()
    
    if (error) {
      console.error('❌ Cannot insert team message:', error.message)
      console.error('   Error code:', error.code)
      console.error('   Error details:', error.details)
      console.error('   Error hint:', error.hint)
      
      if (error.code === '42501' || error.message.includes('policy')) {
        console.log('💡 This is likely an RLS policy issue')
      }
    } else {
      console.log('✅ Successfully inserted test team message')
      console.log('   Message ID:', data[0]?.id)
      
      // Clean up test message
      await supabase.from('team_messages').delete().eq('id', data[0].id)
      console.log('🧹 Cleaned up test message')
    }
  } catch (err) {
    console.error('❌ Team message insert test failed:', err.message)
  }

  // Test individual_messages INSERT permission
  try {
    const testDM = {
      content: 'Diagnostic test DM',
      sender_id: user?.id || 'test-user-id',
      sender_name: 'Diagnostic Test',
      recipient_id: user?.id || 'test-recipient-id',
      recipient_name: 'Test Recipient'
    }
    
    const { data, error } = await supabase
      .from('individual_messages')
      .insert([testDM])
      .select()
    
    if (error) {
      console.error('❌ Cannot insert individual message:', error.message)
      console.error('   Error code:', error.code)
      console.error('   Error details:', error.details)
      
      if (error.code === '42501' || error.message.includes('policy')) {
        console.log('💡 This is likely an RLS policy issue')
      }
    } else {
      console.log('✅ Successfully inserted test individual message')
      console.log('   Message ID:', data[0]?.id)
      
      // Clean up test message
      await supabase.from('individual_messages').delete().eq('id', data[0].id)
      console.log('🧹 Cleaned up test DM')
    }
  } catch (err) {
    console.error('❌ Individual message insert test failed:', err.message)
  }

  console.log('\n4. 📡 REAL-TIME SUBSCRIPTION TEST')
  console.log('--------------------------------')
  
  let teamSubStatus = 'PENDING'
  let dmSubStatus = 'PENDING'
  
  const teamChannel = supabase
    .channel('diagnostic_team_messages')
    .on('postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'team_messages' },
      (payload) => {
        console.log('📨 Real-time team message received:', payload.new?.content)
      }
    )
    .subscribe((status) => {
      teamSubStatus = status
      console.log('📡 Team messages subscription:', status)
    })

  const dmChannel = supabase
    .channel('diagnostic_individual_messages')
    .on('postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'individual_messages' },
      (payload) => {
        console.log('📨 Real-time individual message received:', payload.new?.content)
      }
    )
    .subscribe((status) => {
      dmSubStatus = status
      console.log('📡 Individual messages subscription:', status)
    })

  // Wait for subscriptions to establish
  await new Promise(resolve => setTimeout(resolve, 3000))
  
  console.log('\n5. 📊 FINAL DIAGNOSIS')
  console.log('--------------------')
  
  if (teamSubStatus === 'SUBSCRIBED' && dmSubStatus === 'SUBSCRIBED') {
    console.log('✅ Real-time subscriptions are working')
  } else {
    console.error('❌ Real-time subscription issues detected')
    console.log('   Team messages:', teamSubStatus)
    console.log('   Individual messages:', dmSubStatus)
  }
  
  if (!user) {
    console.log('\n🎯 ROOT CAUSE IDENTIFIED: NO AUTHENTICATED USER')
    console.log('   - Messages are falling back to local storage because there\'s no authenticated user')
    console.log('   - Database writes require authentication')
    console.log('   - Solution: Ensure user is logged in before accessing Team Inbox')
  }
  
  // Cleanup
  supabase.removeChannel(teamChannel)
  supabase.removeChannel(dmChannel)
  
  console.log('\n✅ Diagnostic complete')
  process.exit(0)
}

runDiagnostics().catch(console.error)
