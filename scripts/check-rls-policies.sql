-- RLS Policy Checker for Team Inbox Messaging
-- Run this in your Supabase SQL Editor to check and fix RLS policies

-- 1. Check if RLS is enabled on tables
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('team_messages', 'individual_messages')
  AND schemaname = 'public';

-- 2. Check existing policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename IN ('team_messages', 'individual_messages')
  AND schemaname = 'public'
ORDER BY tablename, policyname;

-- 3. Enable RLS if not already enabled
ALTER TABLE public.team_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.individual_messages ENABLE ROW LEVEL SECURITY;

-- 4. Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Users can read team messages" ON public.team_messages;
DROP POLICY IF EXISTS "Users can insert team messages" ON public.team_messages;
DROP POLICY IF EXISTS "Users can read their individual messages" ON public.individual_messages;
DROP POLICY IF EXISTS "Users can insert individual messages" ON public.individual_messages;

-- 5. Create comprehensive RLS policies for team_messages

-- Allow all authenticated users to read team messages
CREATE POLICY "Users can read team messages" ON public.team_messages
  FOR SELECT 
  USING (auth.role() = 'authenticated');

-- Allow authenticated users to insert team messages with their own sender_id
CREATE POLICY "Users can insert team messages" ON public.team_messages
  FOR INSERT 
  WITH CHECK (
    auth.role() = 'authenticated' 
    AND auth.uid()::text = sender_id
  );

-- Allow users to update their own messages (for read status, etc.)
CREATE POLICY "Users can update their own team messages" ON public.team_messages
  FOR UPDATE 
  USING (auth.uid()::text = sender_id)
  WITH CHECK (auth.uid()::text = sender_id);

-- 6. Create comprehensive RLS policies for individual_messages

-- Allow users to read messages they sent or received
CREATE POLICY "Users can read their individual messages" ON public.individual_messages
  FOR SELECT 
  USING (
    auth.role() = 'authenticated' 
    AND (
      auth.uid()::text = sender_id 
      OR auth.uid()::text = recipient_id
    )
  );

-- Allow authenticated users to insert individual messages with their own sender_id
CREATE POLICY "Users can insert individual messages" ON public.individual_messages
  FOR INSERT 
  WITH CHECK (
    auth.role() = 'authenticated' 
    AND auth.uid()::text = sender_id
  );

-- Allow users to update messages they sent or received (for read status, etc.)
CREATE POLICY "Users can update their individual messages" ON public.individual_messages
  FOR UPDATE 
  USING (
    auth.role() = 'authenticated' 
    AND (
      auth.uid()::text = sender_id 
      OR auth.uid()::text = recipient_id
    )
  )
  WITH CHECK (
    auth.role() = 'authenticated' 
    AND (
      auth.uid()::text = sender_id 
      OR auth.uid()::text = recipient_id
    )
  );

-- 7. Verify the policies were created correctly
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename IN ('team_messages', 'individual_messages')
  AND schemaname = 'public'
ORDER BY tablename, policyname;

-- 8. Test queries (these should work for authenticated users)
-- Note: These are example queries - actual testing should be done from the application

-- Test team_messages SELECT (should work for any authenticated user)
-- SELECT * FROM public.team_messages LIMIT 5;

-- Test team_messages INSERT (should work if sender_id matches auth.uid())
-- INSERT INTO public.team_messages (content, sender_id, sender_name, sender_email, message_type, is_read)
-- VALUES ('Test message', auth.uid()::text, 'Test User', 'test@example.com', 'text', false);

-- Test individual_messages SELECT (should only return messages for current user)
-- SELECT * FROM public.individual_messages 
-- WHERE sender_id = auth.uid()::text OR recipient_id = auth.uid()::text
-- LIMIT 5;

-- Test individual_messages INSERT (should work if sender_id matches auth.uid())
-- INSERT INTO public.individual_messages (content, sender_id, sender_name, recipient_id, recipient_name)
-- VALUES ('Test DM', auth.uid()::text, 'Test User', 'recipient-user-id', 'Recipient Name');

-- 9. Check table structure to ensure compatibility
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name IN ('team_messages', 'individual_messages')
  AND table_schema = 'public'
ORDER BY table_name, ordinal_position;
