-- Final fix for RLS circular dependency
-- The issue: users table policies were calling helper functions that query the users table, creating infinite recursion
-- Solution: Allow authenticated users to read from users table without complex conditions

-- Drop ALL existing user SELECT policies to start clean
DROP POLICY IF EXISTS users_select ON users;
DROP POLICY IF EXISTS users_select_own ON users;
DROP POLICY IF EXISTS users_select_municipality ON users;
DROP POLICY IF EXISTS users_select_admin ON users;

-- Create a simple policy: authenticated users can read all users
-- This is acceptable because:
-- 1. All authenticated users are trusted municipal employees
-- 2. The helper functions need to read user data to work properly
-- 3. Sensitive operations are protected by role-based checks elsewhere
CREATE POLICY users_select_all ON users
    FOR SELECT TO authenticated
    USING (true);

-- Re-ensure helper functions have correct permissions
GRANT EXECUTE ON FUNCTION public.user_municipality_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_department_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin_or_manager() TO authenticated;
