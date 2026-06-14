-- Add completion columns to tasks table
ALTER TABLE tasks ADD COLUMN completed_at TIMESTAMPTZ;
ALTER TABLE tasks ADD COLUMN actual_minutes INTEGER;
