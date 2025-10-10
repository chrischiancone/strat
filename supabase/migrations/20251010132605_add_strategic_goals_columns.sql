-- Add display_order and created_by columns to strategic_goals table
-- This migration supports Story 1.6: Define Strategic Goals

ALTER TABLE strategic_goals
  ADD COLUMN display_order INTEGER,
  ADD COLUMN created_by UUID REFERENCES users(id) ON DELETE RESTRICT;

-- Set default display_order based on existing goal_number
UPDATE strategic_goals
SET display_order = goal_number
WHERE display_order IS NULL;

-- Make display_order NOT NULL after setting defaults
ALTER TABLE strategic_goals
  ALTER COLUMN display_order SET NOT NULL;

-- Add index for efficient ordering queries
CREATE INDEX strategic_goals_display_order_idx ON strategic_goals(strategic_plan_id, display_order);

COMMENT ON COLUMN strategic_goals.display_order IS 'Order in which goals are displayed (allows reordering without changing goal_number)';
COMMENT ON COLUMN strategic_goals.created_by IS 'User who created this goal';
