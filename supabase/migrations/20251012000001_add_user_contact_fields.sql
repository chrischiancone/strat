-- Add phone and mobile contact fields to users table
-- This migration adds contact information fields to the users table

ALTER TABLE users 
ADD COLUMN phone TEXT,
ADD COLUMN mobile TEXT;

-- Add indexes for phone fields (in case we need to search by phone number)
CREATE INDEX users_phone_idx ON users(phone) WHERE phone IS NOT NULL;
CREATE INDEX users_mobile_idx ON users(mobile) WHERE mobile IS NOT NULL;

-- Add comments to document the new columns
COMMENT ON COLUMN users.phone IS 'User primary phone number';
COMMENT ON COLUMN users.mobile IS 'User mobile/cell phone number';