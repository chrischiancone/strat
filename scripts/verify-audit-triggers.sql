-- Script to verify and install audit triggers
-- Run this in your Supabase SQL Editor

-- =====================================================
-- STEP 1: Check if audit_logs table exists
-- =====================================================
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'audit_logs'
) as audit_logs_exists;

-- =====================================================
-- STEP 2: Check current audit log count
-- =====================================================
SELECT COUNT(*) as current_audit_log_count FROM audit_logs;

-- =====================================================
-- STEP 3: Check if audit_trigger_function exists
-- =====================================================
SELECT 
    routine_name,
    routine_type,
    routine_definition
FROM information_schema.routines
WHERE routine_name = 'audit_trigger_function'
AND routine_schema = 'public';

-- =====================================================
-- STEP 4: List all audit triggers currently installed
-- =====================================================
SELECT 
    trigger_name,
    event_object_table as table_name,
    action_timing,
    string_agg(event_manipulation, ', ' ORDER BY event_manipulation) as events
FROM information_schema.triggers
WHERE trigger_name LIKE '%audit%'
GROUP BY trigger_name, event_object_table, action_timing
ORDER BY event_object_table;

-- =====================================================
-- STEP 5: Check which tables are missing audit triggers
-- =====================================================
SELECT 
    t.tablename as table_name,
    CASE 
        WHEN tr.trigger_name IS NULL THEN 'MISSING'
        ELSE 'EXISTS'
    END as trigger_status
FROM pg_tables t
LEFT JOIN (
    SELECT DISTINCT 
        event_object_table,
        trigger_name
    FROM information_schema.triggers
    WHERE trigger_name LIKE '%audit%'
) tr ON t.tablename = tr.event_object_table
WHERE t.schemaname = 'public'
AND t.tablename IN (
    'strategic_plans',
    'initiatives',
    'initiative_budgets',
    'strategic_goals',
    'municipalities',
    'departments',
    'fiscal_years',
    'users',
    'comments',
    'council_goals',
    'ai_analyses'
)
ORDER BY trigger_status DESC, table_name;

-- =====================================================
-- STEP 6: Install audit trigger function if missing
-- =====================================================
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (table_name, record_id, action, new_values, changed_by)
        VALUES (TG_TABLE_NAME, NEW.id, 'insert', to_jsonb(NEW), auth.uid());
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_logs (table_name, record_id, action, old_values, new_values, changed_by)
        VALUES (TG_TABLE_NAME, NEW.id, 'update', to_jsonb(OLD), to_jsonb(NEW), auth.uid());
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs (table_name, record_id, action, old_values, changed_by)
        VALUES (TG_TABLE_NAME, OLD.id, 'delete', to_jsonb(OLD), auth.uid());
        RETURN OLD;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- STEP 7: Install audit triggers on all critical tables
-- =====================================================

-- Drop existing audit triggers first (to avoid duplicates)
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT DISTINCT trigger_name, event_object_table
        FROM information_schema.triggers
        WHERE trigger_name LIKE '%audit%'
    ) LOOP
        EXECUTE 'DROP TRIGGER IF EXISTS ' || r.trigger_name || ' ON ' || r.event_object_table;
    END LOOP;
END $$;

-- Install triggers on core planning tables
CREATE TRIGGER strategic_plans_audit AFTER INSERT OR UPDATE OR DELETE ON strategic_plans
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER initiatives_audit AFTER INSERT OR UPDATE OR DELETE ON initiatives
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER initiative_budgets_audit AFTER INSERT OR UPDATE OR DELETE ON initiative_budgets
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER strategic_goals_audit AFTER INSERT OR UPDATE OR DELETE ON strategic_goals
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Install triggers on admin tables
CREATE TRIGGER municipalities_audit AFTER INSERT OR UPDATE OR DELETE ON municipalities
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER departments_audit AFTER INSERT OR UPDATE OR DELETE ON departments
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER fiscal_years_audit AFTER INSERT OR UPDATE OR DELETE ON fiscal_years
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER users_audit AFTER INSERT OR UPDATE OR DELETE ON users
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Install triggers on supporting tables (if they exist)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'comments') THEN
        EXECUTE 'CREATE TRIGGER comments_audit AFTER INSERT OR UPDATE OR DELETE ON comments
            FOR EACH ROW EXECUTE FUNCTION audit_trigger_function()';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'council_goals') THEN
        EXECUTE 'CREATE TRIGGER council_goals_audit AFTER INSERT OR UPDATE OR DELETE ON council_goals
            FOR EACH ROW EXECUTE FUNCTION audit_trigger_function()';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ai_analyses') THEN
        EXECUTE 'CREATE TRIGGER ai_analyses_audit AFTER INSERT OR UPDATE OR DELETE ON ai_analyses
            FOR EACH ROW EXECUTE FUNCTION audit_trigger_function()';
    END IF;
END $$;

-- =====================================================
-- STEP 8: Verify triggers are now installed
-- =====================================================
SELECT 
    trigger_name,
    event_object_table as table_name,
    action_timing,
    string_agg(event_manipulation, ', ' ORDER BY event_manipulation) as events
FROM information_schema.triggers
WHERE trigger_name LIKE '%audit%'
GROUP BY trigger_name, event_object_table, action_timing
ORDER BY event_object_table;

-- =====================================================
-- STEP 9: Test the trigger with a dummy update
-- =====================================================
-- This will update the updated_at timestamp on a municipality
-- and should create an audit log entry
-- NOTE: Replace the municipality_id with your actual municipality ID
-- 
-- UPDATE municipalities 
-- SET name = name 
-- WHERE id = 'YOUR-MUNICIPALITY-ID-HERE';
--
-- Then check:
-- SELECT * FROM audit_logs ORDER BY changed_at DESC LIMIT 5;
