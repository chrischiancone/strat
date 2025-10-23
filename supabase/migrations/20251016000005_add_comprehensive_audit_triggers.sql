-- Strategic Planning System - Comprehensive Audit Triggers
-- Add audit triggers to all critical tables for complete activity tracking

-- =====================================================
-- ADD AUDIT TRIGGERS TO MISSING CORE TABLES
-- =====================================================

-- 1. MUNICIPALITIES TABLE
CREATE TRIGGER municipalities_audit AFTER INSERT OR UPDATE OR DELETE ON municipalities
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- 2. DEPARTMENTS TABLE  
CREATE TRIGGER departments_audit AFTER INSERT OR UPDATE OR DELETE ON departments
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- 3. FISCAL YEARS TABLE
CREATE TRIGGER fiscal_years_audit AFTER INSERT OR UPDATE OR DELETE ON fiscal_years
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- 4. USERS TABLE
CREATE TRIGGER users_audit AFTER INSERT OR UPDATE OR DELETE ON users
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- =====================================================
-- ADD AUDIT TRIGGERS TO SUPPORTING TABLES
-- =====================================================

-- 5. COMMENTS TABLE (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'comments') THEN
        EXECUTE 'CREATE TRIGGER comments_audit AFTER INSERT OR UPDATE OR DELETE ON comments
            FOR EACH ROW EXECUTE FUNCTION audit_trigger_function()';
    END IF;
END $$;

-- 6. COUNCIL GOALS TABLE (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'council_goals') THEN
        EXECUTE 'CREATE TRIGGER council_goals_audit AFTER INSERT OR UPDATE OR DELETE ON council_goals
            FOR EACH ROW EXECUTE FUNCTION audit_trigger_function()';
    END IF;
END $$;

-- 7. AI ANALYSES TABLE (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ai_analyses') THEN
        EXECUTE 'CREATE TRIGGER ai_analyses_audit AFTER INSERT OR UPDATE OR DELETE ON ai_analyses
            FOR EACH ROW EXECUTE FUNCTION audit_trigger_function()';
    END IF;
END $$;

-- =====================================================
-- ENHANCED AUDIT TRIGGER FUNCTION WITH MORE METADATA
-- =====================================================

-- Function to capture additional audit metadata
CREATE OR REPLACE FUNCTION enhanced_audit_trigger_function()
RETURNS TRIGGER AS $$
DECLARE
    current_user_id UUID;
    session_info JSONB;
BEGIN
    -- Get current authenticated user
    current_user_id := COALESCE(auth.uid(), NULL);
    
    -- Collect session metadata
    session_info := jsonb_build_object(
        'session_id', current_setting('request.jwt.claims', true)::jsonb->>'session_id',
        'ip_address', current_setting('request.headers', true)::jsonb->>'x-forwarded-for',
        'user_agent', current_setting('request.headers', true)::jsonb->>'user-agent',
        'timestamp', NOW()
    );
    
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (
            table_name, 
            record_id, 
            action, 
            new_values, 
            changed_by,
            ip_address,
            user_agent
        )
        VALUES (
            TG_TABLE_NAME, 
            NEW.id, 
            'insert', 
            to_jsonb(NEW), 
            current_user_id,
            (session_info->>'ip_address')::INET,
            session_info->>'user_agent'
        );
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Only log if there are actual changes
        IF to_jsonb(OLD) <> to_jsonb(NEW) THEN
            INSERT INTO audit_logs (
                table_name, 
                record_id, 
                action, 
                old_values, 
                new_values, 
                changed_by,
                ip_address,
                user_agent
            )
            VALUES (
                TG_TABLE_NAME, 
                NEW.id, 
                'update', 
                to_jsonb(OLD), 
                to_jsonb(NEW), 
                current_user_id,
                (session_info->>'ip_address')::INET,
                session_info->>'user_agent'
            );
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs (
            table_name, 
            record_id, 
            action, 
            old_values, 
            changed_by,
            ip_address,
            user_agent
        )
        VALUES (
            TG_TABLE_NAME, 
            OLD.id, 
            'delete', 
            to_jsonb(OLD), 
            current_user_id,
            (session_info->>'ip_address')::INET,
            session_info->>'user_agent'
        );
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- ADD INDEXES FOR BETTER AUDIT LOG PERFORMANCE
-- =====================================================

-- Additional indexes for common audit log queries
CREATE INDEX IF NOT EXISTS audit_logs_action_idx ON audit_logs(action);
CREATE INDEX IF NOT EXISTS audit_logs_table_action_idx ON audit_logs(table_name, action);
CREATE INDEX IF NOT EXISTS audit_logs_user_date_idx ON audit_logs(changed_by, changed_at DESC);

-- Partial index for common filtering scenarios
CREATE INDEX IF NOT EXISTS audit_logs_user_activity_idx 
    ON audit_logs(changed_by, table_name, action) 
    WHERE changed_by IS NOT NULL;

-- Note: We cannot use NOW() in partial indexes as it's not immutable.
-- For recent activity queries, use the regular changed_at DESC index.

-- =====================================================
-- CREATE AUDIT LOG SUMMARY VIEW
-- =====================================================

CREATE OR REPLACE VIEW audit_log_summary AS
SELECT 
    table_name,
    action,
    COUNT(*) as total_count,
    COUNT(DISTINCT changed_by) as unique_users,
    MIN(changed_at) as first_occurrence,
    MAX(changed_at) as last_occurrence,
    COUNT(*) FILTER (WHERE changed_at > NOW() - INTERVAL '1 day') as count_last_24h,
    COUNT(*) FILTER (WHERE changed_at > NOW() - INTERVAL '7 days') as count_last_7d,
    COUNT(*) FILTER (WHERE changed_at > NOW() - INTERVAL '30 days') as count_last_30d
FROM audit_logs
GROUP BY table_name, action
ORDER BY total_count DESC;

COMMENT ON VIEW audit_log_summary IS 'Summary statistics for audit log activity by table and action';

-- =====================================================
-- CREATE USER ACTIVITY SUMMARY VIEW
-- =====================================================

CREATE OR REPLACE VIEW user_activity_summary AS
SELECT 
    al.changed_by as user_id,
    u.full_name,
    u.email,
    u.role,
    COUNT(*) as total_actions,
    COUNT(DISTINCT al.table_name) as tables_modified,
    MAX(al.changed_at) as last_activity,
    COUNT(*) FILTER (WHERE al.changed_at > NOW() - INTERVAL '1 day') as actions_last_24h,
    COUNT(*) FILTER (WHERE al.changed_at > NOW() - INTERVAL '7 days') as actions_last_7d,
    COUNT(*) FILTER (WHERE al.action = 'insert') as total_creates,
    COUNT(*) FILTER (WHERE al.action = 'update') as total_updates,
    COUNT(*) FILTER (WHERE al.action = 'delete') as total_deletes
FROM audit_logs al
LEFT JOIN users u ON al.changed_by = u.id
WHERE al.changed_by IS NOT NULL
GROUP BY al.changed_by, u.full_name, u.email, u.role
ORDER BY total_actions DESC;

COMMENT ON VIEW user_activity_summary IS 'Summary of user activity based on audit logs';