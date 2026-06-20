-- Update the tasks table status constraint
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_status_check;
ALTER TABLE tasks ADD CONSTRAINT tasks_status_check 
  CHECK (status IN ('not_started', 'in_progress', 'completed', 'partial', 'skipped'));

-- Add status column to calendar_events
ALTER TABLE calendar_events ADD COLUMN status TEXT;

-- Migrate existing data
UPDATE calendar_events SET status = 'completed' WHERE completed = true;
UPDATE calendar_events SET status = 'not_started' WHERE completed = false OR completed IS NULL;

-- Add constraints and defaults for calendar_events
ALTER TABLE calendar_events ADD CONSTRAINT calendar_events_status_check 
  CHECK (status IN ('not_started', 'in_progress', 'completed', 'partial', 'skipped'));
ALTER TABLE calendar_events ALTER COLUMN status SET DEFAULT 'not_started';
ALTER TABLE calendar_events ALTER COLUMN status SET NOT NULL;
