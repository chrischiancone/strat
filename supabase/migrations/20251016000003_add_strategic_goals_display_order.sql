-- Add display_order column to strategic_goals table
ALTER TABLE strategic_goals 
ADD COLUMN IF NOT EXISTS display_order INTEGER NOT NULL DEFAULT 0;

-- Create index for performance
CREATE INDEX IF NOT EXISTS strategic_goals_display_order_idx ON strategic_goals(display_order);

-- Add comment for documentation
COMMENT ON COLUMN strategic_goals.display_order IS 'Display order for sorting goals in the UI';
