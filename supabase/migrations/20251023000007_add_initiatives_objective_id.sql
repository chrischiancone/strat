-- Add strategic_objective_id to initiatives and index
ALTER TABLE initiatives
  ADD COLUMN IF NOT EXISTS strategic_objective_id UUID REFERENCES strategic_objectives(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS initiatives_objective_id_idx ON initiatives(strategic_objective_id);

-- Backfill: optional. For now, leave NULL; future operations when adding via objective will populate both fields.
