-- Update current fiscal year to FY 2027 (2026-2027)
-- This migration updates the fiscal year that should be marked as current

-- First, set all fiscal years to not current
UPDATE fiscal_years 
SET is_current = false 
WHERE municipality_id = '00000000-0000-0000-0000-000000000001';

-- Then set FY 2027 as the current fiscal year (which will display as 2026-2027)
UPDATE fiscal_years 
SET is_current = true 
WHERE municipality_id = '00000000-0000-0000-0000-000000000001' 
  AND year = 2027;
