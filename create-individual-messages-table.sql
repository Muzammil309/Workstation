-- Create individual_messages table for private messaging
CREATE TABLE IF NOT EXISTS individual_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content TEXT NOT NULL,
    sender_id UUID NOT NULL,
    sender_name TEXT NOT NULL,
    recipient_id UUID NOT NULL,
    recipient_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_read BOOLEAN DEFAULT FALSE,
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'image'))
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_individual_messages_sender ON individual_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_individual_messages_recipient ON individual_messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_individual_messages_conversation ON individual_messages(sender_id, recipient_id);
CREATE INDEX IF NOT EXISTS idx_individual_messages_created_at ON individual_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_individual_messages_unread ON individual_messages(recipient_id, is_read) WHERE is_read = FALSE;

-- Enable Row Level Security
ALTER TABLE individual_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for individual messages
CREATE POLICY "Users can read messages they sent or received" ON individual_messages
    FOR SELECT USING (
        auth.uid()::text = sender_id::text OR 
        auth.uid()::text = recipient_id::text
    );

CREATE POLICY "Users can insert messages they send" ON individual_messages
    FOR INSERT WITH CHECK (auth.uid()::text = sender_id::text);

CREATE POLICY "Users can update messages they sent or received" ON individual_messages
    FOR UPDATE USING (
        auth.uid()::text = sender_id::text OR 
        auth.uid()::text = recipient_id::text
    );

CREATE POLICY "Users can delete messages they sent" ON individual_messages
    FOR DELETE USING (auth.uid()::text = sender_id::text);

-- Create trigger for updated_at
CREATE TRIGGER update_individual_messages_updated_at
    BEFORE UPDATE ON individual_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT ALL ON individual_messages TO authenticated;
GRANT ALL ON individual_messages TO service_role;

-- Verify the table was created successfully
SELECT
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'individual_messages'
ORDER BY ordinal_position;
