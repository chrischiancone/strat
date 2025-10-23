-- Harden created_by columns with default auth.uid() and FK to users
ALTER TABLE strategic_objectives ALTER COLUMN created_by SET DEFAULT auth.uid();
ALTER TABLE strategic_deliverables ALTER COLUMN created_by SET DEFAULT auth.uid();
-- Optional: also set for strategic_goals if not already
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'strategic_goals' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE strategic_goals ALTER COLUMN created_by SET DEFAULT auth.uid();
  END IF;
END $$;
