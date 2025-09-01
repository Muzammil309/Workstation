-- Fix Project Task Counts
-- Run this in your Supabase SQL Editor to create triggers that automatically update project task counts

-- Function to update project task counts
CREATE OR REPLACE FUNCTION update_project_task_counts()
RETURNS TRIGGER AS $$
BEGIN
    -- Handle INSERT
    IF TG_OP = 'INSERT' THEN
        IF NEW.project_id IS NOT NULL THEN
            UPDATE projects 
            SET 
                taskscount = (
                    SELECT COUNT(*) 
                    FROM tasks 
                    WHERE project_id = NEW.project_id
                ),
                completedtasks = (
                    SELECT COUNT(*) 
                    FROM tasks 
                    WHERE project_id = NEW.project_id 
                    AND status = 'completed'
                ),
                progress = CASE 
                    WHEN (SELECT COUNT(*) FROM tasks WHERE project_id = NEW.project_id) > 0 
                    THEN ROUND(
                        (SELECT COUNT(*) FROM tasks WHERE project_id = NEW.project_id AND status = 'completed')::DECIMAL / 
                        (SELECT COUNT(*) FROM tasks WHERE project_id = NEW.project_id) * 100
                    )
                    ELSE 0 
                END
            WHERE id = NEW.project_id;
        END IF;
        RETURN NEW;
    END IF;

    -- Handle UPDATE
    IF TG_OP = 'UPDATE' THEN
        -- Update old project if project_id changed
        IF OLD.project_id IS NOT NULL AND (NEW.project_id IS NULL OR OLD.project_id != NEW.project_id) THEN
            UPDATE projects 
            SET 
                taskscount = (
                    SELECT COUNT(*) 
                    FROM tasks 
                    WHERE project_id = OLD.project_id
                ),
                completedtasks = (
                    SELECT COUNT(*) 
                    FROM tasks 
                    WHERE project_id = OLD.project_id 
                    AND status = 'completed'
                ),
                progress = CASE 
                    WHEN (SELECT COUNT(*) FROM tasks WHERE project_id = OLD.project_id) > 0 
                    THEN ROUND(
                        (SELECT COUNT(*) FROM tasks WHERE project_id = OLD.project_id AND status = 'completed')::DECIMAL / 
                        (SELECT COUNT(*) FROM tasks WHERE project_id = OLD.project_id) * 100
                    )
                    ELSE 0 
                END
            WHERE id = OLD.project_id;
        END IF;

        -- Update new project
        IF NEW.project_id IS NOT NULL THEN
            UPDATE projects 
            SET 
                taskscount = (
                    SELECT COUNT(*) 
                    FROM tasks 
                    WHERE project_id = NEW.project_id
                ),
                completedtasks = (
                    SELECT COUNT(*) 
                    FROM tasks 
                    WHERE project_id = NEW.project_id 
                    AND status = 'completed'
                ),
                progress = CASE 
                    WHEN (SELECT COUNT(*) FROM tasks WHERE project_id = NEW.project_id) > 0 
                    THEN ROUND(
                        (SELECT COUNT(*) FROM tasks WHERE project_id = NEW.project_id AND status = 'completed')::DECIMAL / 
                        (SELECT COUNT(*) FROM tasks WHERE project_id = NEW.project_id) * 100
                    )
                    ELSE 0 
                END
            WHERE id = NEW.project_id;
        END IF;
        RETURN NEW;
    END IF;

    -- Handle DELETE
    IF TG_OP = 'DELETE' THEN
        IF OLD.project_id IS NOT NULL THEN
            UPDATE projects 
            SET 
                taskscount = (
                    SELECT COUNT(*) 
                    FROM tasks 
                    WHERE project_id = OLD.project_id
                ),
                completedtasks = (
                    SELECT COUNT(*) 
                    FROM tasks 
                    WHERE project_id = OLD.project_id 
                    AND status = 'completed'
                ),
                progress = CASE 
                    WHEN (SELECT COUNT(*) FROM tasks WHERE project_id = OLD.project_id) > 0 
                    THEN ROUND(
                        (SELECT COUNT(*) FROM tasks WHERE project_id = OLD.project_id AND status = 'completed')::DECIMAL / 
                        (SELECT COUNT(*) FROM tasks WHERE project_id = OLD.project_id) * 100
                    )
                    ELSE 0 
                END
            WHERE id = OLD.project_id;
        END IF;
        RETURN OLD;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_update_project_task_counts ON tasks;

-- Create trigger
CREATE TRIGGER trigger_update_project_task_counts
    AFTER INSERT OR UPDATE OR DELETE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_project_task_counts();

-- Fix existing project task counts
UPDATE projects 
SET 
    taskscount = (
        SELECT COUNT(*) 
        FROM tasks 
        WHERE project_id = projects.id
    ),
    completedtasks = (
        SELECT COUNT(*) 
        FROM tasks 
        WHERE project_id = projects.id 
        AND status = 'completed'
    ),
    progress = CASE 
        WHEN (SELECT COUNT(*) FROM tasks WHERE project_id = projects.id) > 0 
        THEN ROUND(
            (SELECT COUNT(*) FROM tasks WHERE project_id = projects.id AND status = 'completed')::DECIMAL / 
            (SELECT COUNT(*) FROM tasks WHERE project_id = projects.id) * 100
        )
        ELSE 0 
    END;

-- Verify the results
SELECT 
    p.id,
    p.name,
    p.taskscount,
    p.completedtasks,
    p.progress,
    (SELECT COUNT(*) FROM tasks WHERE project_id = p.id) as actual_total_tasks,
    (SELECT COUNT(*) FROM tasks WHERE project_id = p.id AND status = 'completed') as actual_completed_tasks
FROM projects p
ORDER BY p.created_at DESC;
