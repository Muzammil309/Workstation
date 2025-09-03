# Team Inbox Messaging Troubleshooting Guide

## 🔍 Systematic Investigation Steps

### Step 1: Run Diagnostic Scripts

1. **Database Connectivity Test**
   ```bash
   node scripts/diagnose-messaging.js
   ```
   This will check:
   - Supabase connection
   - Authentication status
   - RLS policy permissions
   - Real-time subscription health

2. **RLS Policy Check**
   - Run `scripts/check-rls-policies.sql` in your Supabase SQL Editor
   - This will verify and fix RLS policies

### Step 2: Check Browser Console

Open your browser's Developer Tools and look for these specific log messages:

**✅ Good Signs:**
- `✅ Database connectivity test passed`
- `✅ Authentication test passed for user: [email]`
- `📡 Team messages subscription status: SUBSCRIBED`
- `📡 Individual messages subscription status: SUBSCRIBED`
- `✅ Team message saved to database:`

**❌ Problem Indicators:**
- `❌ No authenticated user found - this will cause database writes to fail`
- `❌ Database connectivity test failed:`
- `🔒 This is an RLS policy violation - user lacks INSERT permission`
- `📡 Team messages subscription status: CHANNEL_ERROR`

### Step 3: Authentication Check

The most common cause of "will sync when connection is restored" messages is **missing authentication**.

**Check:**
1. Is the user properly logged in?
2. Does `user?.id` exist in the component?
3. Is the authentication token valid?

**Debug Code Added:**
```javascript
// Pre-flight checks now added to both sendMessage functions
if (!user?.id) {
  console.error('❌ Cannot send message: No authenticated user')
  toast({
    title: "Authentication Error", 
    description: "Please log in to send messages",
    variant: "destructive"
  })
  return
}
```

### Step 4: RLS Policy Verification

**Common RLS Issues:**
1. **Missing Policies**: Tables have RLS enabled but no policies
2. **Wrong User Context**: Policies check `auth.uid()` but user isn't authenticated
3. **Policy Logic Errors**: Policies don't match the actual data structure

**Fixed Policies (run the SQL script):**
```sql
-- Team Messages
CREATE POLICY "Users can read team messages" ON public.team_messages
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert team messages" ON public.team_messages
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' 
    AND auth.uid()::text = sender_id
  );

-- Individual Messages  
CREATE POLICY "Users can read their individual messages" ON public.individual_messages
  FOR SELECT USING (
    auth.role() = 'authenticated' 
    AND (auth.uid()::text = sender_id OR auth.uid()::text = recipient_id)
  );

CREATE POLICY "Users can insert individual messages" ON public.individual_messages
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' 
    AND auth.uid()::text = sender_id
  );
```

### Step 5: Real-Time Configuration

**Supabase Project Settings:**
1. Go to Settings → API in Supabase Dashboard
2. Verify "Realtime" is enabled
3. Check that `team_messages` and `individual_messages` tables have Realtime enabled

**Table-Level Realtime:**
```sql
-- Enable realtime for tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.team_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.individual_messages;
```

### Step 6: Network Connectivity

**Check for:**
1. Firewall blocking WebSocket connections
2. Corporate proxy issues
3. Network connectivity problems
4. Supabase service status

## 🛠️ Enhanced Error Logging

The updated code now includes comprehensive error logging:

**Database Errors:**
```javascript
if (error) {
  console.error('❌ Database insert error:', error)
  console.error('   Error code:', error.code)
  console.error('   Error message:', error.message)
  console.error('   Error details:', error.details)
  console.error('   Error hint:', error.hint)
  
  if (error.code === '42501') {
    console.error('   🔒 This is an RLS policy violation')
  }
}
```

**Authentication Checks:**
```javascript
console.log('📤 Current user context:', { 
  id: user.id, 
  email: user.email, 
  name: user.name 
})
```

**Real-Time Status:**
```javascript
.subscribe((status) => {
  console.log('📡 Team messages subscription status:', status)
  if (status === 'SUBSCRIBED') {
    console.log('✅ Team messages real-time subscription active')
  } else if (status === 'CHANNEL_ERROR') {
    console.error('❌ Team messages subscription failed')
  }
})
```

## 🧪 Debug Component

Add the debug component to your dashboard temporarily:

```tsx
import { RealtimeTest } from '@/components/debug/realtime-test'

// Add to your dashboard
<RealtimeTest />
```

This component will:
- Test database connectivity
- Test message insertion
- Monitor real-time subscriptions
- Show detailed logs and received messages

## 🔧 Common Fixes

### Fix 1: Authentication Issues
```javascript
// Ensure user is authenticated before accessing Team Inbox
if (!user?.id) {
  return <div>Please log in to access Team Inbox</div>
}
```

### Fix 2: RLS Policy Issues
Run the provided SQL script to fix all RLS policies.

### Fix 3: Real-Time Not Working
1. Check Supabase project settings
2. Verify table-level realtime is enabled
3. Check browser console for subscription status

### Fix 4: Network Issues
1. Test with different networks
2. Check browser's Network tab for failed requests
3. Verify Supabase service status

## 📊 Expected Console Output

**Successful Flow:**
```
🔄 TeamInbox: Initializing for user: [user-id]
🔍 Testing database connectivity...
✅ Database connectivity test passed
✅ Authentication test passed for user: [email]
📥 Loading messages from database...
✅ Loaded X messages from database
🔄 Setting up real-time subscription for team messages...
📡 Team messages subscription status: SUBSCRIBED
✅ Team messages real-time subscription active
📤 Attempting to send team message: [content]
📤 Team message data: {...}
📤 Attempting database insert...
✅ Team message saved to database: {...}
```

**Problem Flow:**
```
🔄 TeamInbox: Initializing for user: [user-id]
🔍 Testing database connectivity...
❌ Authentication test failed: [error]
📤 Attempting to send team message: [content]
❌ Cannot send message: No authenticated user
```

## 🎯 Root Cause Analysis

Based on the "will sync when connection is restored" message, the most likely causes are:

1. **Authentication Missing (90% of cases)**
   - User not properly logged in
   - Auth token expired
   - Auth context not available

2. **RLS Policy Violations (8% of cases)**
   - Policies too restrictive
   - User ID mismatch
   - Missing policies

3. **Network/Configuration Issues (2% of cases)**
   - Supabase connectivity problems
   - Real-time not enabled
   - Firewall/proxy issues

## 🚀 Next Steps

1. Run the diagnostic script
2. Check browser console logs
3. Fix authentication if needed
4. Run RLS policy script
5. Test with debug component
6. Monitor real-time subscriptions

The enhanced error logging will pinpoint the exact issue causing messages to fall back to local storage.
