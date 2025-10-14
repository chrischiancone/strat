-- Add two-factor authentication fields to users table

ALTER TABLE users 
ADD COLUMN two_factor_secret TEXT,
ADD COLUMN two_factor_enabled BOOLEAN DEFAULT false,
ADD COLUMN two_factor_backup_codes TEXT[];

-- Create index for performance when checking 2FA status
CREATE INDEX users_two_factor_enabled_idx ON users(two_factor_enabled);

-- Add comments
COMMENT ON COLUMN users.two_factor_secret IS 'Encrypted TOTP secret for 2FA authentication';
COMMENT ON COLUMN users.two_factor_enabled IS 'Whether 2FA is enabled for this user';
COMMENT ON COLUMN users.two_factor_backup_codes IS 'Array of hashed backup codes for 2FA recovery';