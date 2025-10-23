-- Add is_key_initiative field to initiatives table
-- This marks initiatives that are key/flagship initiatives for the strategic plan

ALTER TABLE initiatives 
ADD COLUMN is_key_initiative BOOLEAN NOT NULL DEFAULT false;

-- Index for filtering key initiatives
CREATE INDEX initiatives_is_key_initiative_idx ON initiatives(is_key_initiative);

-- Comment
COMMENT ON COLUMN initiatives.is_key_initiative IS 'Marks this initiative as a key/flagship initiative for the strategic plan';
