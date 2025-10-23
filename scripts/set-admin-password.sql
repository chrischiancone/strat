-- Set admin user password to 'admin123'
-- This updates the Supabase auth.users table

UPDATE auth.users
SET 
  encrypted_password = crypt('admin123', gen_salt('bf')),
  email_confirmed_at = NOW()
WHERE email = 'admin@carrollton.gov';
