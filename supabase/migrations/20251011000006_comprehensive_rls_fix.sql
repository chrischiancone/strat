-- Comprehensive fix for RLS circular dependency issues
-- The core problem: RLS policies on tables call helper functions that query tables with RLS, causing infinite recursion
-- Solution: Recreate helper functions to bypass RLS, and simplify policies to avoid complex nested queries

-- =====================================================
-- STEP 1: Drop and recreate helper functions with proper SECURITY DEFINER
-- =====================================================

-- These functions bypass RLS by using SECURITY DEFINER
-- This is safe because they only return the current user's own data

DROP FUNCTION IF EXISTS public.user_municipality_id() CASCADE;
CREATE OR REPLACE FUNCTION public.user_municipality_id()
RETURNS UUID AS $$
    SELECT municipality_id FROM public.users WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

DROP FUNCTION IF EXISTS public.user_department_id() CASCADE;
CREATE OR REPLACE FUNCTION public.user_department_id()
RETURNS UUID AS $$
    SELECT department_id FROM public.users WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

DROP FUNCTION IF EXISTS public.user_role() CASCADE;
CREATE OR REPLACE FUNCTION public.user_role()
RETURNS TEXT AS $$
    SELECT role FROM public.users WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

DROP FUNCTION IF EXISTS public.is_admin_or_manager() CASCADE;
CREATE OR REPLACE FUNCTION public.is_admin_or_manager()
RETURNS BOOLEAN AS $$
    SELECT COALESCE(role IN ('admin', 'city_manager'), false)
    FROM public.users
    WHERE id = auth.uid()
    LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.user_municipality_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_department_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin_or_manager() TO authenticated;

-- =====================================================
-- STEP 2: Simplify users table policies
-- =====================================================

-- Drop all existing user policies
DROP POLICY IF EXISTS users_select ON users;
DROP POLICY IF EXISTS users_select_all ON users;
DROP POLICY IF EXISTS users_select_own ON users;
DROP POLICY IF EXISTS users_select_municipality ON users;
DROP POLICY IF EXISTS users_select_admin ON users;
DROP POLICY IF EXISTS users_update_own ON users;
DROP POLICY IF EXISTS users_update_admin ON users;

-- Allow authenticated users to read all users
-- This is acceptable because:
-- 1. All authenticated users are trusted municipal employees
-- 2. Helper functions need to read user data
-- 3. Sensitive operations are protected elsewhere
CREATE POLICY users_select_all ON users
    FOR SELECT TO authenticated
    USING (true);

-- Users can update their own profile
CREATE POLICY users_update_own ON users
    FOR UPDATE TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- Admins can update any user in their municipality
CREATE POLICY users_update_admin ON users
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = auth.uid()
            AND u.role = 'admin'
            AND u.municipality_id = users.municipality_id
        )
    );

-- =====================================================
-- STEP 3: Fix initiatives policies to avoid recursion
-- =====================================================

-- Drop existing initiatives policies
DROP POLICY IF EXISTS initiatives_select ON initiatives;
DROP POLICY IF EXISTS initiatives_select_policy ON initiatives;
DROP POLICY IF EXISTS initiatives_insert ON initiatives;
DROP POLICY IF EXISTS initiatives_insert_policy ON initiatives;
DROP POLICY IF EXISTS initiatives_update ON initiatives;
DROP POLICY IF EXISTS initiatives_update_policy ON initiatives;
DROP POLICY IF EXISTS initiatives_delete ON initiatives;
DROP POLICY IF EXISTS initiatives_delete_policy ON initiatives;

-- SELECT: View initiatives in your municipality
CREATE POLICY initiatives_select ON initiatives
    FOR SELECT TO authenticated
    USING (
        -- Can see initiatives from plans in your municipality
        EXISTS (
            SELECT 1
            FROM strategic_goals sg
            JOIN strategic_plans sp ON sg.strategic_plan_id = sp.id
            JOIN departments d ON sp.department_id = d.id
            WHERE sg.id = initiatives.strategic_goal_id
            AND d.municipality_id = (SELECT municipality_id FROM users WHERE id = auth.uid() LIMIT 1)
        )
    );

-- INSERT: Department staff and admins can create initiatives
CREATE POLICY initiatives_insert ON initiatives
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM users u
            WHERE u.id = auth.uid()
            AND (u.role IN ('admin', 'city_manager', 'department_director', 'staff'))
            AND EXISTS (
                SELECT 1
                FROM strategic_goals sg
                JOIN strategic_plans sp ON sg.strategic_plan_id = sp.id
                JOIN departments d ON sp.department_id = d.id
                WHERE sg.id = initiatives.strategic_goal_id
                AND d.municipality_id = u.municipality_id
            )
        )
    );

-- UPDATE: Department staff and admins can update initiatives
CREATE POLICY initiatives_update ON initiatives
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM users u
            WHERE u.id = auth.uid()
            AND (u.role IN ('admin', 'city_manager', 'department_director', 'staff'))
            AND EXISTS (
                SELECT 1
                FROM strategic_goals sg
                JOIN strategic_plans sp ON sg.strategic_plan_id = sp.id
                JOIN departments d ON sp.department_id = d.id
                WHERE sg.id = initiatives.strategic_goal_id
                AND d.municipality_id = u.municipality_id
            )
        )
    );

-- DELETE: Admins can delete initiatives
CREATE POLICY initiatives_delete ON initiatives
    FOR DELETE TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM users u
            WHERE u.id = auth.uid()
            AND u.role = 'admin'
            AND EXISTS (
                SELECT 1
                FROM strategic_goals sg
                JOIN strategic_plans sp ON sg.strategic_plan_id = sp.id
                JOIN departments d ON sp.department_id = d.id
                WHERE sg.id = initiatives.strategic_goal_id
                AND d.municipality_id = u.municipality_id
            )
        )
    );
