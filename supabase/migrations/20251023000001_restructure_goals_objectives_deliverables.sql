-- Strategic Goals Restructure: Goals → Objectives → Deliverables
-- Migration to support hierarchical structure matching the examples provided

-- =====================================================
-- 1. CREATE OBJECTIVES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS strategic_objectives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    strategic_goal_id UUID NOT NULL REFERENCES strategic_goals(id) ON DELETE CASCADE,
    objective_number TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    display_order INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT strategic_objectives_goal_number_unique UNIQUE (strategic_goal_id, objective_number)
);

CREATE INDEX IF NOT EXISTS strategic_objectives_goal_id_idx ON strategic_objectives(strategic_goal_id);
CREATE INDEX IF NOT EXISTS strategic_objectives_display_order_idx ON strategic_objectives(strategic_goal_id, display_order);

COMMENT ON TABLE strategic_objectives IS 'Objectives under strategic goals (e.g., O1, O2)';

-- =====================================================
-- 2. CREATE DELIVERABLES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS strategic_deliverables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    strategic_objective_id UUID NOT NULL REFERENCES strategic_objectives(id) ON DELETE CASCADE,
    deliverable_number TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    target_date DATE,
    status TEXT DEFAULT 'not_started',
    display_order INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT strategic_deliverables_objective_number_unique UNIQUE (strategic_objective_id, deliverable_number),
    CONSTRAINT strategic_deliverables_status_check CHECK (status IN ('not_started', 'in_progress', 'completed', 'deferred'))
);

CREATE INDEX IF NOT EXISTS strategic_deliverables_objective_id_idx ON strategic_deliverables(strategic_objective_id);
CREATE INDEX IF NOT EXISTS strategic_deliverables_display_order_idx ON strategic_deliverables(strategic_objective_id, display_order);
CREATE INDEX IF NOT EXISTS strategic_deliverables_target_date_idx ON strategic_deliverables(target_date);
CREATE INDEX IF NOT EXISTS strategic_deliverables_status_idx ON strategic_deliverables(status);

COMMENT ON TABLE strategic_deliverables IS 'Deliverables under objectives (e.g., D1, D2, D3)';

-- =====================================================
-- 3. ADD TRIGGERS
-- =====================================================
DROP TRIGGER IF EXISTS strategic_objectives_updated_at ON strategic_objectives;
CREATE TRIGGER strategic_objectives_updated_at BEFORE UPDATE ON strategic_objectives
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS strategic_deliverables_updated_at ON strategic_deliverables;
CREATE TRIGGER strategic_deliverables_updated_at BEFORE UPDATE ON strategic_deliverables
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 4. MIGRATE EXISTING DATA (objectives and success_measures)
-- =====================================================
-- Note: This migration preserves existing objectives and success_measures as a reference
-- Manual data migration may be needed to properly structure existing data
-- The old JSONB columns will remain for backward compatibility during transition

-- =====================================================
-- 5. ADD AUDIT TRIGGERS
-- =====================================================
-- Add audit triggers for new tables if audit system is enabled
DO $$
BEGIN
    -- Check if audit function exists
    IF EXISTS (
        SELECT 1 FROM pg_proc 
        WHERE proname = 'log_audit_event'
    ) THEN
        -- Drop existing audit triggers if they exist (idempotent)
        DROP TRIGGER IF EXISTS strategic_objectives_audit_insert ON strategic_objectives;
        DROP TRIGGER IF EXISTS strategic_objectives_audit_update ON strategic_objectives;
        DROP TRIGGER IF EXISTS strategic_objectives_audit_delete ON strategic_objectives;
        DROP TRIGGER IF EXISTS strategic_deliverables_audit_insert ON strategic_deliverables;
        DROP TRIGGER IF EXISTS strategic_deliverables_audit_update ON strategic_deliverables;
        DROP TRIGGER IF EXISTS strategic_deliverables_audit_delete ON strategic_deliverables;
        
        -- Create audit triggers
        CREATE TRIGGER strategic_objectives_audit_insert
            AFTER INSERT ON strategic_objectives
            FOR EACH ROW EXECUTE FUNCTION log_audit_event();
            
        CREATE TRIGGER strategic_objectives_audit_update
            AFTER UPDATE ON strategic_objectives
            FOR EACH ROW EXECUTE FUNCTION log_audit_event();
            
        CREATE TRIGGER strategic_objectives_audit_delete
            AFTER DELETE ON strategic_objectives
            FOR EACH ROW EXECUTE FUNCTION log_audit_event();
            
        CREATE TRIGGER strategic_deliverables_audit_insert
            AFTER INSERT ON strategic_deliverables
            FOR EACH ROW EXECUTE FUNCTION log_audit_event();
            
        CREATE TRIGGER strategic_deliverables_audit_update
            AFTER UPDATE ON strategic_deliverables
            FOR EACH ROW EXECUTE FUNCTION log_audit_event();
            
        CREATE TRIGGER strategic_deliverables_audit_delete
            AFTER DELETE ON strategic_deliverables
            FOR EACH ROW EXECUTE FUNCTION log_audit_event();
    END IF;
END $$;

-- =====================================================
-- 6. ADD RLS POLICIES
-- =====================================================

-- Enable RLS (idempotent - safe to run multiple times)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'strategic_objectives'
        AND rowsecurity = true
    ) THEN
        ALTER TABLE strategic_objectives ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'strategic_deliverables'
        AND rowsecurity = true
    ) THEN
        ALTER TABLE strategic_deliverables ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Strategic Objectives Policies
-- Drop existing policies if they exist (idempotent)
DROP POLICY IF EXISTS strategic_objectives_select_policy ON strategic_objectives;
DROP POLICY IF EXISTS strategic_objectives_insert_policy ON strategic_objectives;
DROP POLICY IF EXISTS strategic_objectives_update_policy ON strategic_objectives;
DROP POLICY IF EXISTS strategic_objectives_delete_policy ON strategic_objectives;

-- Select: Users can view objectives for plans in their department or if they are admin/city_manager
CREATE POLICY strategic_objectives_select_policy ON strategic_objectives
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM strategic_goals sg
            JOIN strategic_plans sp ON sg.strategic_plan_id = sp.id
            JOIN users u ON u.id = auth.uid()
            WHERE sg.id = strategic_objectives.strategic_goal_id
            AND (
                u.role IN ('admin', 'city_manager')
                OR u.department_id = sp.department_id
            )
        )
    );

-- Insert: Department users, admins, and city managers can create objectives
CREATE POLICY strategic_objectives_insert_policy ON strategic_objectives
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM strategic_goals sg
            JOIN strategic_plans sp ON sg.strategic_plan_id = sp.id
            JOIN users u ON u.id = auth.uid()
            WHERE sg.id = strategic_objectives.strategic_goal_id
            AND (
                u.role IN ('admin', 'city_manager')
                OR u.department_id = sp.department_id
            )
        )
    );

-- Update: Department users, admins, and city managers can update objectives
CREATE POLICY strategic_objectives_update_policy ON strategic_objectives
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM strategic_goals sg
            JOIN strategic_plans sp ON sg.strategic_plan_id = sp.id
            JOIN users u ON u.id = auth.uid()
            WHERE sg.id = strategic_objectives.strategic_goal_id
            AND (
                u.role IN ('admin', 'city_manager')
                OR u.department_id = sp.department_id
            )
        )
    );

-- Delete: Department users, admins, and city managers can delete objectives
CREATE POLICY strategic_objectives_delete_policy ON strategic_objectives
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM strategic_goals sg
            JOIN strategic_plans sp ON sg.strategic_plan_id = sp.id
            JOIN users u ON u.id = auth.uid()
            WHERE sg.id = strategic_objectives.strategic_goal_id
            AND (
                u.role IN ('admin', 'city_manager')
                OR u.department_id = sp.department_id
            )
        )
    );

-- Strategic Deliverables Policies
-- Drop existing policies if they exist (idempotent)
DROP POLICY IF EXISTS strategic_deliverables_select_policy ON strategic_deliverables;
DROP POLICY IF EXISTS strategic_deliverables_insert_policy ON strategic_deliverables;
DROP POLICY IF EXISTS strategic_deliverables_update_policy ON strategic_deliverables;
DROP POLICY IF EXISTS strategic_deliverables_delete_policy ON strategic_deliverables;

-- Select: Users can view deliverables for plans in their department or if they are admin/city_manager
CREATE POLICY strategic_deliverables_select_policy ON strategic_deliverables
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM strategic_objectives so
            JOIN strategic_goals sg ON so.strategic_goal_id = sg.id
            JOIN strategic_plans sp ON sg.strategic_plan_id = sp.id
            JOIN users u ON u.id = auth.uid()
            WHERE so.id = strategic_deliverables.strategic_objective_id
            AND (
                u.role IN ('admin', 'city_manager')
                OR u.department_id = sp.department_id
            )
        )
    );

-- Insert: Department users, admins, and city managers can create deliverables
CREATE POLICY strategic_deliverables_insert_policy ON strategic_deliverables
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM strategic_objectives so
            JOIN strategic_goals sg ON so.strategic_goal_id = sg.id
            JOIN strategic_plans sp ON sg.strategic_plan_id = sp.id
            JOIN users u ON u.id = auth.uid()
            WHERE so.id = strategic_deliverables.strategic_objective_id
            AND (
                u.role IN ('admin', 'city_manager')
                OR u.department_id = sp.department_id
            )
        )
    );

-- Update: Department users, admins, and city managers can update deliverables
CREATE POLICY strategic_deliverables_update_policy ON strategic_deliverables
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM strategic_objectives so
            JOIN strategic_goals sg ON so.strategic_goal_id = sg.id
            JOIN strategic_plans sp ON sg.strategic_plan_id = sp.id
            JOIN users u ON u.id = auth.uid()
            WHERE so.id = strategic_deliverables.strategic_objective_id
            AND (
                u.role IN ('admin', 'city_manager')
                OR u.department_id = sp.department_id
            )
        )
    );

-- Delete: Department users, admins, and city managers can delete deliverables
CREATE POLICY strategic_deliverables_delete_policy ON strategic_deliverables
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM strategic_objectives so
            JOIN strategic_goals sg ON so.strategic_goal_id = sg.id
            JOIN strategic_plans sp ON sg.strategic_plan_id = sp.id
            JOIN users u ON u.id = auth.uid()
            WHERE so.id = strategic_deliverables.strategic_objective_id
            AND (
                u.role IN ('admin', 'city_manager')
                OR u.department_id = sp.department_id
            )
        )
    );
