-- Create team_messages table for the Team Inbox System
-- Run this in your Supabase SQL Editor

-- Create team_messages table
CREATE TABLE IF NOT EXISTS team_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content TEXT NOT NULL,
    sender_id UUID NOT NULL,
    sender_name TEXT NOT NULL,
    sender_email TEXT NOT NULL,
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'system', 'notification')),
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_team_messages_sender_id ON team_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_team_messages_created_at ON team_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_team_messages_is_read ON team_messages(is_read);

-- Enable Row Level Security (RLS)
ALTER TABLE team_messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Allow authenticated users to read all messages
CREATE POLICY "Users can read all team messages" ON team_messages
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow authenticated users to insert their own messages
CREATE POLICY "Users can insert their own messages" ON team_messages
    FOR INSERT WITH CHECK (auth.uid()::text = sender_id::text);

-- Allow users to update their own messages (for editing)
CREATE POLICY "Users can update their own messages" ON team_messages
    FOR UPDATE USING (auth.uid()::text = sender_id::text);

-- Allow users to update is_read status on any message (for marking as read)
CREATE POLICY "Users can mark messages as read" ON team_messages
    FOR UPDATE USING (true)
    WITH CHECK (
        -- Only allow updating is_read field
        OLD.content = NEW.content AND
        OLD.sender_id = NEW.sender_id AND
        OLD.sender_name = NEW.sender_name AND
        OLD.sender_email = NEW.sender_email AND
        OLD.message_type = NEW.message_type AND
        OLD.created_at = NEW.created_at
    );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_team_messages_updated_at 
    BEFORE UPDATE ON team_messages 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample messages for testing (optional)
INSERT INTO team_messages (content, sender_id, sender_name, sender_email, message_type) VALUES
('Welcome to the team inbox! This is where we can communicate in real-time.', 
 '00000000-0000-0000-0000-000000000000', 'System', 'system@changeMechanics.com', 'system'),
('Great work on the latest project updates! 🎉', 
 '00000000-0000-0000-0000-000000000001', 'Admin User', 'admin@changeMechanics.com', 'text'),
('Don''t forget about the team meeting tomorrow at 2 PM.', 
 '00000000-0000-0000-0000-000000000001', 'Admin User', 'admin@changeMechanics.com', 'text');

-- Grant necessary permissions
GRANT ALL ON team_messages TO authenticated;
GRANT ALL ON team_messages TO service_role;

-- Create whiteboard_elements table for the Collaborative Whiteboard
CREATE TABLE IF NOT EXISTS whiteboard_elements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('pen', 'rectangle', 'circle', 'text')),
    points NUMERIC[],
    x NUMERIC,
    y NUMERIC,
    width NUMERIC,
    height NUMERIC,
    text TEXT,
    color TEXT NOT NULL DEFAULT '#000000',
    stroke_width INTEGER NOT NULL DEFAULT 2,
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for whiteboard elements
CREATE INDEX IF NOT EXISTS idx_whiteboard_elements_created_by ON whiteboard_elements(created_by);
CREATE INDEX IF NOT EXISTS idx_whiteboard_elements_created_at ON whiteboard_elements(created_at DESC);

-- Enable RLS for whiteboard elements
ALTER TABLE whiteboard_elements ENABLE ROW LEVEL SECURITY;

-- RLS policies for whiteboard elements
CREATE POLICY "Users can read all whiteboard elements" ON whiteboard_elements
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert whiteboard elements" ON whiteboard_elements
    FOR INSERT WITH CHECK (auth.uid()::text = created_by::text);

CREATE POLICY "Users can update their own whiteboard elements" ON whiteboard_elements
    FOR UPDATE USING (auth.uid()::text = created_by::text);

CREATE POLICY "Users can delete their own whiteboard elements" ON whiteboard_elements
    FOR DELETE USING (auth.uid()::text = created_by::text);

-- Create trigger for whiteboard elements updated_at
CREATE TRIGGER update_whiteboard_elements_updated_at
    BEFORE UPDATE ON whiteboard_elements
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions for whiteboard elements
GRANT ALL ON whiteboard_elements TO authenticated;
GRANT ALL ON whiteboard_elements TO service_role;

-- Verify the tables were created successfully
SELECT
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name IN ('team_messages', 'whiteboard_elements')
ORDER BY table_name, ordinal_position;
