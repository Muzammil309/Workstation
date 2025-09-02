-- Create automation tables for Event Management Automation System
-- Run this in your Supabase SQL Editor

-- Create automation_rules table
CREATE TABLE IF NOT EXISTS automation_rules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    trigger_type TEXT NOT NULL CHECK (trigger_type IN ('deadline_approaching', 'task_overdue', 'event_created', 'status_change', 'team_assignment')),
    trigger_conditions JSONB DEFAULT '{}',
    actions JSONB NOT NULL DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_executed TIMESTAMP WITH TIME ZONE,
    execution_count INTEGER DEFAULT 0
);

-- Create event_templates table
CREATE TABLE IF NOT EXISTS event_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    task_templates JSONB NOT NULL DEFAULT '[]',
    timeline_days INTEGER DEFAULT 30,
    automation_rules TEXT[] DEFAULT '{}',
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_public BOOLEAN DEFAULT false
);

-- Create automation_executions table for tracking
CREATE TABLE IF NOT EXISTS automation_executions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    rule_id UUID NOT NULL REFERENCES automation_rules(id) ON DELETE CASCADE,
    trigger_data JSONB,
    actions_executed JSONB,
    status TEXT CHECK (status IN ('success', 'failed', 'partial')) DEFAULT 'success',
    error_message TEXT,
    execution_time_ms INTEGER,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create automation_logs table for detailed logging
CREATE TABLE IF NOT EXISTS automation_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    rule_id UUID REFERENCES automation_rules(id) ON DELETE CASCADE,
    execution_id UUID REFERENCES automation_executions(id) ON DELETE CASCADE,
    log_level TEXT CHECK (log_level IN ('info', 'warning', 'error')) DEFAULT 'info',
    message TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_automation_rules_created_by ON automation_rules(created_by);
CREATE INDEX IF NOT EXISTS idx_automation_rules_trigger_type ON automation_rules(trigger_type);
CREATE INDEX IF NOT EXISTS idx_automation_rules_is_active ON automation_rules(is_active);
CREATE INDEX IF NOT EXISTS idx_event_templates_created_by ON event_templates(created_by);
CREATE INDEX IF NOT EXISTS idx_event_templates_is_public ON event_templates(is_public);
CREATE INDEX IF NOT EXISTS idx_automation_executions_rule_id ON automation_executions(rule_id);
CREATE INDEX IF NOT EXISTS idx_automation_executions_executed_at ON automation_executions(executed_at DESC);
CREATE INDEX IF NOT EXISTS idx_automation_logs_rule_id ON automation_logs(rule_id);
CREATE INDEX IF NOT EXISTS idx_automation_logs_execution_id ON automation_logs(execution_id);

-- Enable Row Level Security (RLS)
ALTER TABLE automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for automation_rules
CREATE POLICY "Users can read their own automation rules" ON automation_rules
    FOR SELECT USING (auth.uid()::text = created_by::text);

CREATE POLICY "Users can insert their own automation rules" ON automation_rules
    FOR INSERT WITH CHECK (auth.uid()::text = created_by::text);

CREATE POLICY "Users can update their own automation rules" ON automation_rules
    FOR UPDATE USING (auth.uid()::text = created_by::text);

CREATE POLICY "Users can delete their own automation rules" ON automation_rules
    FOR DELETE USING (auth.uid()::text = created_by::text);

-- RLS Policies for event_templates
CREATE POLICY "Users can read their own templates and public templates" ON event_templates
    FOR SELECT USING (auth.uid()::text = created_by::text OR is_public = true);

CREATE POLICY "Users can insert their own event templates" ON event_templates
    FOR INSERT WITH CHECK (auth.uid()::text = created_by::text);

CREATE POLICY "Users can update their own event templates" ON event_templates
    FOR UPDATE USING (auth.uid()::text = created_by::text);

CREATE POLICY "Users can delete their own event templates" ON event_templates
    FOR DELETE USING (auth.uid()::text = created_by::text);

-- RLS Policies for automation_executions
CREATE POLICY "Users can read executions for their rules" ON automation_executions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM automation_rules 
            WHERE automation_rules.id = automation_executions.rule_id 
            AND automation_rules.created_by::text = auth.uid()::text
        )
    );

CREATE POLICY "System can insert automation executions" ON automation_executions
    FOR INSERT WITH CHECK (true);

-- RLS Policies for automation_logs
CREATE POLICY "Users can read logs for their rules" ON automation_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM automation_rules 
            WHERE automation_rules.id = automation_logs.rule_id 
            AND automation_rules.created_by::text = auth.uid()::text
        )
    );

CREATE POLICY "System can insert automation logs" ON automation_logs
    FOR INSERT WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_automation_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_automation_rules_updated_at 
    BEFORE UPDATE ON automation_rules 
    FOR EACH ROW 
    EXECUTE FUNCTION update_automation_updated_at_column();

CREATE TRIGGER update_event_templates_updated_at 
    BEFORE UPDATE ON event_templates 
    FOR EACH ROW 
    EXECUTE FUNCTION update_automation_updated_at_column();

-- Insert some sample automation rules
INSERT INTO automation_rules (name, description, trigger_type, trigger_conditions, actions, created_by) VALUES
('Event Deadline Reminder', 'Send notifications 7, 3, and 1 days before event deadlines', 'deadline_approaching', 
 '{"days_before": [7, 3, 1], "event_types": ["all"]}', 
 '[{"type": "send_notification", "parameters": {"message": "Event deadline approaching", "recipients": "assignees"}}, {"type": "create_task", "parameters": {"title": "Final preparations", "priority": "high"}}]',
 '00000000-0000-0000-0000-000000000000'),

('Overdue Task Escalation', 'Automatically escalate overdue tasks to team leads', 'task_overdue',
 '{"hours_overdue": 24, "priority_levels": ["high", "medium"]}',
 '[{"type": "send_notification", "parameters": {"message": "Task is overdue and needs attention", "recipients": "team_leads"}}, {"type": "assign_team", "parameters": {"role": "team_lead"}}]',
 '00000000-0000-0000-0000-000000000000'),

('Event Setup Automation', 'Create standard setup tasks when new events are created', 'event_created',
 '{"event_types": ["conference", "meeting", "workshop"]}',
 '[{"type": "create_task", "parameters": {"title": "Setup venue", "priority": "medium", "deadline_offset": -7}}, {"type": "create_task", "parameters": {"title": "Prepare materials", "priority": "medium", "deadline_offset": -3}}]',
 '00000000-0000-0000-0000-000000000000');

-- Insert sample event templates
INSERT INTO event_templates (name, description, task_templates, timeline_days, created_by, is_public) VALUES
('Corporate Conference', 'Complete template for organizing corporate conferences', 
 '[{"title": "Book venue", "description": "Reserve conference venue", "priority": "high", "estimated_hours": 4, "deadline_offset_days": -60, "assignee_role": "event_coordinator"}, {"title": "Send invitations", "description": "Send invitations to attendees", "priority": "medium", "estimated_hours": 2, "deadline_offset_days": -30, "assignee_role": "marketing"}, {"title": "Prepare presentation materials", "description": "Create and review all presentation materials", "priority": "high", "estimated_hours": 8, "deadline_offset_days": -14, "assignee_role": "content_creator"}]',
 90, '00000000-0000-0000-0000-000000000000', true),

('Product Launch Event', 'Template for product launch events and marketing campaigns',
 '[{"title": "Develop marketing strategy", "description": "Create comprehensive marketing plan", "priority": "high", "estimated_hours": 12, "deadline_offset_days": -45, "assignee_role": "marketing_lead"}, {"title": "Design promotional materials", "description": "Create banners, flyers, and digital assets", "priority": "medium", "estimated_hours": 6, "deadline_offset_days": -30, "assignee_role": "designer"}, {"title": "Coordinate media coverage", "description": "Arrange press releases and media interviews", "priority": "high", "estimated_hours": 4, "deadline_offset_days": -14, "assignee_role": "pr_manager"}]',
 60, '00000000-0000-0000-0000-000000000000', true);

-- Grant necessary permissions
GRANT ALL ON automation_rules TO authenticated;
GRANT ALL ON automation_rules TO service_role;
GRANT ALL ON event_templates TO authenticated;
GRANT ALL ON event_templates TO service_role;
GRANT ALL ON automation_executions TO authenticated;
GRANT ALL ON automation_executions TO service_role;
GRANT ALL ON automation_logs TO authenticated;
GRANT ALL ON automation_logs TO service_role;

-- Verify tables were created successfully
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('automation_rules', 'event_templates', 'automation_executions', 'automation_logs')
ORDER BY table_name, ordinal_position;
