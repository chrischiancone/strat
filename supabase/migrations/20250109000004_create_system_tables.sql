-- Strategic Planning System - System Tables Migration
-- Part 4: Audit logs, embeddings, comments

-- =====================================================
-- 13. AUDIT LOGS
-- =====================================================
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    action TEXT NOT NULL,
    old_values JSONB,
    new_values JSONB,
    changed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    changed_at TIMESTAMPTZ DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    CONSTRAINT audit_logs_action_check CHECK (action IN ('insert', 'update', 'delete'))
);

CREATE INDEX audit_logs_table_record_idx ON audit_logs(table_name, record_id);
CREATE INDEX audit_logs_changed_by_idx ON audit_logs(changed_by);
CREATE INDEX audit_logs_changed_at_idx ON audit_logs(changed_at DESC);

COMMENT ON TABLE audit_logs IS 'Comprehensive audit trail for all changes';

-- =====================================================
-- 14. DOCUMENT EMBEDDINGS (RAG/AI with pgvector)
-- =====================================================
CREATE TABLE document_embeddings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_type TEXT NOT NULL,
    content_id UUID NOT NULL,
    content_text TEXT NOT NULL,
    embedding vector(1536),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT document_embeddings_type_check CHECK (content_type IN ('strategic_plan', 'initiative', 'goal', 'uploaded_pdf', 'comment'))
);

CREATE INDEX document_embeddings_content_idx ON document_embeddings(content_type, content_id);
CREATE INDEX document_embeddings_vector_idx ON document_embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

COMMENT ON TABLE document_embeddings IS 'Vector embeddings for semantic search and RAG';

-- Alternative index for HNSW (more accurate but slower to build):
-- CREATE INDEX document_embeddings_vector_hnsw_idx ON document_embeddings USING hnsw (embedding vector_cosine_ops);

-- =====================================================
-- 15. COMMENTS (Collaborative feedback)
-- =====================================================
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_resolved BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT comments_entity_type_check CHECK (entity_type IN ('strategic_plan', 'initiative', 'goal', 'milestone'))
);

CREATE INDEX comments_entity_idx ON comments(entity_type, entity_id);
CREATE INDEX comments_parent_idx ON comments(parent_comment_id);
CREATE INDEX comments_author_idx ON comments(author_id);
CREATE INDEX comments_unresolved_idx ON comments(is_resolved) WHERE is_resolved = false;

COMMENT ON TABLE comments IS 'Threaded comments for collaboration and review';

-- =====================================================
-- TRIGGERS
-- =====================================================
CREATE TRIGGER comments_updated_at BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- AUDIT TRIGGER FUNCTION
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

-- Apply audit triggers to key tables
CREATE TRIGGER strategic_plans_audit AFTER INSERT OR UPDATE OR DELETE ON strategic_plans
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER initiatives_audit AFTER INSERT OR UPDATE OR DELETE ON initiatives
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER initiative_budgets_audit AFTER INSERT OR UPDATE OR DELETE ON initiative_budgets
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER strategic_goals_audit AFTER INSERT OR UPDATE OR DELETE ON strategic_goals
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
