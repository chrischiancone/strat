-- Add reports_to field to users table for supervisor hierarchy
-- This enables strategic plan review workflows by defining who reports to whom

ALTER TABLE users 
ADD COLUMN reports_to UUID REFERENCES users(id) ON DELETE SET NULL;

-- Create index for performance when querying supervisor relationships
CREATE INDEX users_reports_to_idx ON users(reports_to);

-- Add comment explaining the field
COMMENT ON COLUMN users.reports_to IS 'ID of the user this person reports to (supervisor) for strategic plan review workflows';

-- Ensure a user cannot report to themselves (circular reference protection)
ALTER TABLE users 
ADD CONSTRAINT users_no_self_report CHECK (id != reports_to);