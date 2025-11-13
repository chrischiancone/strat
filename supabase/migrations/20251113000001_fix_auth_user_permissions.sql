-- Fix authentication and user permissions
-- This migration ensures users can properly query their own profile after login

-- Ensure RLS is enabled on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop and recreate the users_select_all policy to ensure it's working
DROP POLICY IF EXISTS users_select_all ON public.users;

-- Create policy that allows authenticated users to read all users
-- This is necessary for the application to work properly
CREATE POLICY users_select_all ON public.users
    FOR SELECT TO authenticated
    USING (true);

-- Ensure the authenticated role has proper permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON public.users TO authenticated;

-- Create a function to help with user profile retrieval
CREATE OR REPLACE FUNCTION public.get_user_profile(user_id uuid)
RETURNS TABLE (
    id uuid,
    email text,
    full_name text,
    role text,
    municipality_id uuid,
    department_id uuid
) 
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT 
        u.id,
        u.email,
        u.full_name,
        u.role,
        u.municipality_id,
        u.department_id
    FROM public.users u
    WHERE u.id = user_id;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_profile(uuid) TO authenticated;

-- Ensure PostgREST can access the schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.users TO anon, authenticated;

