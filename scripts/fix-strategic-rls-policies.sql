-- Fix missing RLS policies for strategic_plans and strategic_goals

-- Drop existing policies if any
DROP POLICY IF EXISTS strategic_plans_select ON strategic_plans;
DROP POLICY IF EXISTS strategic_plans_insert ON strategic_plans;
DROP POLICY IF EXISTS strategic_plans_update ON strategic_plans;
DROP POLICY IF EXISTS strategic_plans_delete ON strategic_plans;

DROP POLICY IF EXISTS strategic_goals_select ON strategic_goals;
DROP POLICY IF EXISTS strategic_goals_insert ON strategic_goals;
DROP POLICY IF EXISTS strategic_goals_update ON strategic_goals;
DROP POLICY IF EXISTS strategic_goals_delete ON strategic_goals;

-- =====================================================
-- STRATEGIC PLANS POLICIES
-- =====================================================
CREATE POLICY strategic_plans_select ON strategic_plans
    FOR SELECT USING (
        -- Users can see plans from their municipality
        EXISTS (
            SELECT 1 FROM departments d
            WHERE d.id = department_id
            AND d.municipality_id = public.user_municipality_id()
        )
        -- Public role can see published plans only
        OR (public.user_role() = 'public' AND status = 'active')
    );

CREATE POLICY strategic_plans_insert ON strategic_plans
    FOR INSERT WITH CHECK (
        -- Department directors and staff can create plans for their department
        EXISTS (
            SELECT 1 FROM departments d
            WHERE d.id = department_id
            AND d.municipality_id = public.user_municipality_id()
            AND (public.user_department_id() = d.id OR public.is_admin_or_manager())
        )
    );

CREATE POLICY strategic_plans_update ON strategic_plans
    FOR UPDATE USING (
        -- Own department can edit, or admin/city manager
        EXISTS (
            SELECT 1 FROM departments d
            WHERE d.id = department_id
            AND d.municipality_id = public.user_municipality_id()
            AND (public.user_department_id() = d.id OR public.is_admin_or_manager())
        )
    );

CREATE POLICY strategic_plans_delete ON strategic_plans
    FOR DELETE USING (
        -- Only admins can delete plans
        EXISTS (
            SELECT 1 FROM departments d
            WHERE d.id = department_id
            AND d.municipality_id = public.user_municipality_id()
            AND public.user_role() = 'admin'
        )
    );

-- =====================================================
-- STRATEGIC GOALS POLICIES
-- =====================================================
CREATE POLICY strategic_goals_select ON strategic_goals
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM strategic_plans sp
            JOIN departments d ON sp.department_id = d.id
            WHERE sp.id = strategic_plan_id
            AND d.municipality_id = public.user_municipality_id()
        )
    );

CREATE POLICY strategic_goals_insert ON strategic_goals
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM strategic_plans sp
            JOIN departments d ON sp.department_id = d.id
            WHERE sp.id = strategic_plan_id
            AND d.municipality_id = public.user_municipality_id()
            AND (public.user_department_id() = d.id OR public.is_admin_or_manager())
        )
    );

CREATE POLICY strategic_goals_update ON strategic_goals
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM strategic_plans sp
            JOIN departments d ON sp.department_id = d.id
            WHERE sp.id = strategic_plan_id
            AND d.municipality_id = public.user_municipality_id()
            AND (public.user_department_id() = d.id OR public.is_admin_or_manager())
        )
    );

CREATE POLICY strategic_goals_delete ON strategic_goals
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM strategic_plans sp
            JOIN departments d ON sp.department_id = d.id
            WHERE sp.id = strategic_plan_id
            AND d.municipality_id = public.user_municipality_id()
            AND (public.user_department_id() = d.id OR public.user_role() = 'admin')
        )
    );
