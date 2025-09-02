-- Create notifications table for real-time notification system
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error', 'task_assigned', 'deadline_approaching', 'message_received', 'task_completed')),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "isRead" BOOLEAN DEFAULT FALSE,
    "userId" UUID NOT NULL,
    "actionUrl" TEXT,
    "eventType" TEXT,
    "eventData" JSONB,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications("userId");
CREATE INDEX IF NOT EXISTS idx_notifications_timestamp ON notifications(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications("userId", "isRead") WHERE "isRead" = FALSE;
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- Enable Row Level Security
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies for notifications
CREATE POLICY "Users can read their own notifications" ON notifications
    FOR SELECT USING (auth.uid()::text = "userId"::text);

CREATE POLICY "Users can insert notifications for themselves" ON notifications
    FOR INSERT WITH CHECK (auth.uid()::text = "userId"::text);

CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (auth.uid()::text = "userId"::text);

CREATE POLICY "Users can delete their own notifications" ON notifications
    FOR DELETE USING (auth.uid()::text = "userId"::text);

-- Allow service role to insert notifications for any user (for system notifications)
CREATE POLICY "Service role can insert notifications" ON notifications
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_notifications_updated_at
    BEFORE UPDATE ON notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT ALL ON notifications TO authenticated;
GRANT ALL ON notifications TO service_role;

-- Verify the table was created successfully
SELECT
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'notifications'
ORDER BY ordinal_position;
