-- Strategic Planning System - Row Level Security Policies
-- Part 5: Security policies for data access control

-- =====================================================
-- ENABLE RLS ON ALL TABLES
-- =====================================================
ALTER TABLE municipalities ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE fiscal_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategic_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategic_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE initiatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE initiative_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE initiative_kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE quarterly_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE initiative_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE initiative_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Get current user's municipality
CREATE OR REPLACE FUNCTION public.user_municipality_id()
RETURNS UUID AS $$
    SELECT municipality_id FROM public.users WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER;

-- Get current user's department
CREATE OR REPLACE FUNCTION public.user_department_id()
RETURNS UUID AS $$
    SELECT department_id FROM public.users WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER;

-- Get current user's role
CREATE OR REPLACE FUNCTION public.user_role()
RETURNS TEXT AS $$
    SELECT role FROM public.users WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER;

-- Check if user is admin or city manager
CREATE OR REPLACE FUNCTION public.is_admin_or_manager()
RETURNS BOOLEAN AS $$
    SELECT role IN ('admin', 'city_manager') FROM public.users WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER;

-- =====================================================
-- MUNICIPALITIES - Read by users in the municipality
-- =====================================================
CREATE POLICY municipalities_select ON municipalities
    FOR SELECT USING (
        id = public.user_municipality_id()
    );

CREATE POLICY municipalities_update ON municipalities
    FOR UPDATE USING (
        id = public.user_municipality_id() AND public.user_role() = 'admin'
    );

-- =====================================================
-- DEPARTMENTS
-- =====================================================
CREATE POLICY departments_select ON departments
    FOR SELECT USING (
        municipality_id = public.user_municipality_id()
    );

CREATE POLICY departments_insert ON departments
    FOR INSERT WITH CHECK (
        municipality_id = public.user_municipality_id() AND public.is_admin_or_manager()
    );

CREATE POLICY departments_update ON departments
    FOR UPDATE USING (
        municipality_id = public.user_municipality_id() AND
        (public.is_admin_or_manager() OR id = public.user_department_id())
    );

-- =====================================================
-- FISCAL YEARS
-- =====================================================
CREATE POLICY fiscal_years_select ON fiscal_years
    FOR SELECT USING (
        municipality_id = public.user_municipality_id()
    );

CREATE POLICY fiscal_years_insert ON fiscal_years
    FOR INSERT WITH CHECK (
        municipality_id = public.user_municipality_id() AND public.user_role() IN ('admin', 'finance')
    );

CREATE POLICY fiscal_years_update ON fiscal_years
    FOR UPDATE USING (
        municipality_id = public.user_municipality_id() AND public.user_role() IN ('admin', 'finance')
    );

-- =====================================================
-- USERS
-- =====================================================
CREATE POLICY users_select ON users
    FOR SELECT USING (
        municipality_id = public.user_municipality_id()
    );

CREATE POLICY users_update_own ON users
    FOR UPDATE USING (
        id = auth.uid()
    )
    WITH CHECK (
        id = auth.uid()
    );

CREATE POLICY users_update_admin ON users
    FOR UPDATE USING (
        municipality_id = public.user_municipality_id() AND public.user_role() = 'admin'
    );

-- =====================================================
-- STRATEGIC PLANS
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
-- STRATEGIC GOALS
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

-- =====================================================
-- INITIATIVES
-- =====================================================
CREATE POLICY initiatives_select ON initiatives
    FOR SELECT USING (
        -- Can see if part of lead department or collaborating department
        EXISTS (
            SELECT 1 FROM strategic_goals sg
            JOIN strategic_plans sp ON sg.strategic_plan_id = sp.id
            JOIN departments d ON sp.department_id = d.id
            WHERE sg.id = strategic_goal_id
            AND d.municipality_id = public.user_municipality_id()
        )
        OR EXISTS (
            SELECT 1 FROM initiative_collaborators ic
            WHERE ic.initiative_id = initiatives.id
            AND ic.department_id = public.user_department_id()
        )
    );

CREATE POLICY initiatives_insert ON initiatives
    FOR INSERT WITH CHECK (
        -- Lead department or admin can create
        lead_department_id = public.user_department_id() OR public.is_admin_or_manager()
    );

CREATE POLICY initiatives_update ON initiatives
    FOR UPDATE USING (
        -- Lead department, collaborators, or admin can update
        lead_department_id = public.user_department_id()
        OR public.is_admin_or_manager()
        OR EXISTS (
            SELECT 1 FROM initiative_collaborators ic
            WHERE ic.initiative_id = initiatives.id
            AND ic.department_id = public.user_department_id()
        )
    );

CREATE POLICY initiatives_delete ON initiatives
    FOR DELETE USING (
        lead_department_id = public.user_department_id() OR public.user_role() = 'admin'
    );

-- =====================================================
-- INITIATIVE BUDGETS
-- =====================================================
CREATE POLICY initiative_budgets_select ON initiative_budgets
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM initiatives i
            JOIN strategic_goals sg ON i.strategic_goal_id = sg.id
            JOIN strategic_plans sp ON sg.strategic_plan_id = sp.id
            JOIN departments d ON sp.department_id = d.id
            WHERE i.id = initiative_id
            AND d.municipality_id = public.user_municipality_id()
        )
        OR public.user_role() IN ('finance', 'city_manager', 'admin')
    );

CREATE POLICY initiative_budgets_insert ON initiative_budgets
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM initiatives i
            WHERE i.id = initiative_id
            AND (i.lead_department_id = public.user_department_id() OR public.user_role() IN ('finance', 'admin'))
        )
    );

CREATE POLICY initiative_budgets_update ON initiative_budgets
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM initiatives i
            WHERE i.id = initiative_id
            AND (i.lead_department_id = public.user_department_id() OR public.user_role() IN ('finance', 'admin'))
        )
    );

-- =====================================================
-- INITIATIVE KPIs
-- =====================================================
CREATE POLICY initiative_kpis_select ON initiative_kpis
    FOR SELECT USING (
        (initiative_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM initiatives i
            JOIN strategic_goals sg ON i.strategic_goal_id = sg.id
            JOIN strategic_plans sp ON sg.strategic_plan_id = sp.id
            JOIN departments d ON sp.department_id = d.id
            WHERE i.id = initiative_id
            AND d.municipality_id = public.user_municipality_id()
        ))
        OR (strategic_goal_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM strategic_goals sg
            JOIN strategic_plans sp ON sg.strategic_plan_id = sp.id
            JOIN departments d ON sp.department_id = d.id
            WHERE sg.id = initiative_kpis.strategic_goal_id
            AND d.municipality_id = public.user_municipality_id()
        ))
        OR (strategic_plan_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM strategic_plans sp
            JOIN departments d ON sp.department_id = d.id
            WHERE sp.id = initiative_kpis.strategic_plan_id
            AND d.municipality_id = public.user_municipality_id()
        ))
    );

CREATE POLICY initiative_kpis_insert ON initiative_kpis
    FOR INSERT WITH CHECK (
        public.user_role() IN ('department_director', 'staff', 'admin', 'city_manager')
    );

CREATE POLICY initiative_kpis_update ON initiative_kpis
    FOR UPDATE USING (
        public.user_role() IN ('department_director', 'staff', 'admin', 'city_manager')
    );

-- =====================================================
-- QUARTERLY MILESTONES
-- =====================================================
CREATE POLICY quarterly_milestones_select ON quarterly_milestones
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM initiatives i
            JOIN strategic_goals sg ON i.strategic_goal_id = sg.id
            JOIN strategic_plans sp ON sg.strategic_plan_id = sp.id
            JOIN departments d ON sp.department_id = d.id
            WHERE i.id = initiative_id
            AND d.municipality_id = public.user_municipality_id()
        )
    );

CREATE POLICY quarterly_milestones_insert ON quarterly_milestones
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM initiatives i
            WHERE i.id = initiative_id
            AND (i.lead_department_id = public.user_department_id() OR public.is_admin_or_manager())
        )
    );

CREATE POLICY quarterly_milestones_update ON quarterly_milestones
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM initiatives i
            WHERE i.id = initiative_id
            AND (i.lead_department_id = public.user_department_id() OR public.is_admin_or_manager())
        )
    );

-- =====================================================
-- INITIATIVE DEPENDENCIES & COLLABORATORS
-- =====================================================
CREATE POLICY initiative_dependencies_select ON initiative_dependencies
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM initiatives i
            JOIN strategic_goals sg ON i.strategic_goal_id = sg.id
            JOIN strategic_plans sp ON sg.strategic_plan_id = sp.id
            JOIN departments d ON sp.department_id = d.id
            WHERE (i.id = initiative_id OR i.id = depends_on_initiative_id)
            AND d.municipality_id = public.user_municipality_id()
        )
    );

CREATE POLICY initiative_dependencies_insert ON initiative_dependencies
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM initiatives i
            WHERE i.id = initiative_id
            AND (i.lead_department_id = public.user_department_id() OR public.is_admin_or_manager())
        )
    );

CREATE POLICY initiative_collaborators_select ON initiative_collaborators
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM initiatives i
            JOIN strategic_goals sg ON i.strategic_goal_id = sg.id
            JOIN strategic_plans sp ON sg.strategic_plan_id = sp.id
            JOIN departments d ON sp.department_id = d.id
            WHERE i.id = initiative_id
            AND d.municipality_id = public.user_municipality_id()
        )
    );

CREATE POLICY initiative_collaborators_insert ON initiative_collaborators
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM initiatives i
            WHERE i.id = initiative_id
            AND (i.lead_department_id = public.user_department_id() OR public.is_admin_or_manager())
        )
    );

-- =====================================================
-- AUDIT LOGS - Read-only for authorized users
-- =====================================================
CREATE POLICY audit_logs_select ON audit_logs
    FOR SELECT USING (
        public.user_role() IN ('admin', 'city_manager')
    );

-- =====================================================
-- DOCUMENT EMBEDDINGS
-- =====================================================
CREATE POLICY document_embeddings_select ON document_embeddings
    FOR SELECT USING (
        -- Anyone in the municipality can read embeddings
        true
    );

CREATE POLICY document_embeddings_insert ON document_embeddings
    FOR INSERT WITH CHECK (
        -- System can insert embeddings
        true
    );

-- =====================================================
-- COMMENTS
-- =====================================================
CREATE POLICY comments_select ON comments
    FOR SELECT USING (
        -- Can see comments on entities you have access to
        (entity_type = 'strategic_plan' AND EXISTS (
            SELECT 1 FROM strategic_plans sp
            JOIN departments d ON sp.department_id = d.id
            WHERE sp.id = entity_id
            AND d.municipality_id = public.user_municipality_id()
        ))
        OR (entity_type = 'initiative' AND EXISTS (
            SELECT 1 FROM initiatives i
            JOIN strategic_goals sg ON i.strategic_goal_id = sg.id
            JOIN strategic_plans sp ON sg.strategic_plan_id = sp.id
            JOIN departments d ON sp.department_id = d.id
            WHERE i.id = entity_id
            AND d.municipality_id = public.user_municipality_id()
        ))
        OR (entity_type = 'goal' AND EXISTS (
            SELECT 1 FROM strategic_goals sg
            JOIN strategic_plans sp ON sg.strategic_plan_id = sp.id
            JOIN departments d ON sp.department_id = d.id
            WHERE sg.id = entity_id
            AND d.municipality_id = public.user_municipality_id()
        ))
    );

CREATE POLICY comments_insert ON comments
    FOR INSERT WITH CHECK (
        author_id = auth.uid()
    );

CREATE POLICY comments_update ON comments
    FOR UPDATE USING (
        author_id = auth.uid() OR public.user_role() = 'admin'
    );

CREATE POLICY comments_delete ON comments
    FOR DELETE USING (
        author_id = auth.uid() OR public.user_role() = 'admin'
    );
