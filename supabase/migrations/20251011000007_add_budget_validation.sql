-- Add budget validation tracking to initiatives table
-- Story 3.7: Budget Validation Workflow

ALTER TABLE initiatives
ADD COLUMN budget_validated_by UUID REFERENCES users(id) ON DELETE SET NULL,
ADD COLUMN budget_validated_at TIMESTAMPTZ;

CREATE INDEX initiatives_budget_validated_idx ON initiatives(budget_validated_by) WHERE budget_validated_by IS NOT NULL;

COMMENT ON COLUMN initiatives.budget_validated_by IS 'Finance user who validated this initiative budget';
COMMENT ON COLUMN initiatives.budget_validated_at IS 'Timestamp when budget was validated by Finance';
