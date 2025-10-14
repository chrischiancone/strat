-- Migration: Allow single fiscal year strategic plans
-- This migration removes the constraint that required different start/end fiscal years
-- to support single fiscal year strategic plans

-- Drop the existing constraint that prevents same start/end fiscal years
ALTER TABLE strategic_plans DROP CONSTRAINT strategic_plans_years_valid;

-- Update table comment to reflect single or multi-year support
COMMENT ON TABLE strategic_plans IS 'Strategic planning documents (single or multi-year)';
