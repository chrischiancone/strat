-- Add source_name column to initiative_budgets table
-- This complements the existing funding_source column
ALTER TABLE initiative_budgets 
ADD COLUMN IF NOT EXISTS source_name TEXT;

-- Create index for performance
CREATE INDEX IF NOT EXISTS initiative_budgets_source_name_idx ON initiative_budgets(source_name);

-- Add comment for documentation
COMMENT ON COLUMN initiative_budgets.source_name IS 'Name of the funding source for reporting and aggregation';

-- Update existing rows to copy funding_source to source_name if source_name is null
UPDATE initiative_budgets
SET source_name = funding_source
WHERE source_name IS NULL AND funding_source IS NOT NULL;
