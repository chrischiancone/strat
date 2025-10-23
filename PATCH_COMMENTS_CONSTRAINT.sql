-- Update comments.entity_type constraint to allow both legacy and new values
DO $$
BEGIN
  -- Drop existing constraint if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'comments'
      AND constraint_type = 'CHECK'
      AND constraint_name = 'comments_resource_type_check'
  ) THEN
    ALTER TABLE comments DROP CONSTRAINT comments_resource_type_check;
  END IF;
END $$;

-- Create new, more permissive constraint
ALTER TABLE comments
  ADD CONSTRAINT comments_resource_type_check
  CHECK (entity_type IN ('plan','goal','initiative','dashboard','strategic_plan','milestone'));
