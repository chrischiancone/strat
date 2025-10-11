-- Fix RLS Circular Dependency
-- The helper functions need to read from users table, but RLS was preventing this
-- Add a policy that allows users to always read their own record

-- Drop existing problematic policy
DROP POLICY IF EXISTS users_select ON users;

-- Create new policy that allows users to read their own record first
CREATE POLICY users_select_own ON users
    FOR SELECT USING (
        id = auth.uid()
    );

-- Create policy for reading other users in same municipality
CREATE POLICY users_select_municipality ON users
    FOR SELECT USING (
        municipality_id = public.user_municipality_id()
    );

-- Grant EXECUTE permission on helper functions to authenticated users
GRANT EXECUTE ON FUNCTION public.user_municipality_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_department_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin_or_manager() TO authenticated;
