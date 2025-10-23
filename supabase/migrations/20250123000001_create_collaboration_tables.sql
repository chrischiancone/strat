-- Collaboration System Tables Migration
-- Real-time collaboration features for strategic planning

-- =====================================================
-- COLLABORATION SESSIONS
-- =====================================================
CREATE TABLE collaboration_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resource_id UUID NOT NULL,
    resource_type TEXT NOT NULL,
    participants JSONB DEFAULT '[]'::jsonb,
    active_editors TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT collaboration_sessions_resource_type_check CHECK (resource_type IN ('plan', 'goal', 'initiative', 'dashboard'))
);

CREATE INDEX collaboration_sessions_resource_idx ON collaboration_sessions(resource_id, resource_type);
CREATE INDEX collaboration_sessions_expires_idx ON collaboration_sessions(expires_at);

COMMENT ON TABLE collaboration_sessions IS 'Active collaboration sessions for real-time editing';

-- =====================================================
-- COMMENTS
-- =====================================================
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_id UUID NOT NULL,
    entity_type TEXT NOT NULL,
    parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    mentions TEXT[] DEFAULT '{}',
    attachments JSONB DEFAULT '[]'::jsonb,
    reactions JSONB DEFAULT '[]'::jsonb,
    is_resolved BOOLEAN DEFAULT false,
    resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    resolved_at TIMESTAMPTZ,
    position JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
CONSTRAINT comments_resource_type_check CHECK (entity_type IN ('plan', 'goal', 'initiative', 'dashboard', 'strategic_plan', 'milestone'))
);

CREATE INDEX comments_resource_idx ON comments(entity_id, entity_type);
CREATE INDEX comments_author_idx ON comments(author_id);
CREATE INDEX comments_parent_idx ON comments(parent_comment_id);
CREATE INDEX comments_resolved_idx ON comments(is_resolved);

COMMENT ON TABLE comments IS 'Comments and discussions on resources';

-- =====================================================
-- NOTIFICATIONS
-- =====================================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    resource_id UUID NOT NULL,
    resource_type TEXT NOT NULL,
    action_url TEXT,
    action_text TEXT,
    priority TEXT NOT NULL DEFAULT 'medium',
    read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    CONSTRAINT notifications_type_check CHECK (type IN ('mention', 'comment', 'edit', 'assignment', 'deadline', 'approval', 'system')),
    CONSTRAINT notifications_resource_type_check CHECK (resource_type IN ('plan', 'goal', 'initiative', 'dashboard', 'comment')),
    CONSTRAINT notifications_priority_check CHECK (priority IN ('low', 'medium', 'high', 'urgent'))
);

CREATE INDEX notifications_user_idx ON notifications(user_id, read);
CREATE INDEX notifications_created_idx ON notifications(created_at DESC);
CREATE INDEX notifications_expires_idx ON notifications(expires_at);

COMMENT ON TABLE notifications IS 'User notifications for collaboration events';

-- =====================================================
-- ACTIVITY LOG
-- =====================================================
CREATE TABLE activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    resource_id UUID,
    resource_type TEXT,
    action TEXT NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX activity_log_user_idx ON activity_log(user_id);
CREATE INDEX activity_log_resource_idx ON activity_log(resource_id, resource_type);
CREATE INDEX activity_log_created_idx ON activity_log(created_at DESC);

COMMENT ON TABLE activity_feed IS 'Activity history for auditing and collaboration';

-- =====================================================
-- LIVE EDITS (Operational Transform / CRDT)
-- =====================================================
CREATE TABLE live_edits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES collaboration_sessions(id) ON DELETE CASCADE,
    editor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    resource_id UUID NOT NULL,
    resource_type TEXT NOT NULL,
    operation TEXT NOT NULL,
    path TEXT NOT NULL,
    old_value JSONB,
    new_value JSONB,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    applied BOOLEAN DEFAULT false,
    CONSTRAINT live_edits_operation_check CHECK (operation IN ('insert', 'delete', 'update', 'move')),
    CONSTRAINT live_edits_resource_type_check CHECK (resource_type IN ('plan', 'goal', 'initiative', 'dashboard'))
);

CREATE INDEX live_edits_session_idx ON live_edits(session_id, timestamp);
CREATE INDEX live_edits_resource_idx ON live_edits(resource_id, resource_type);
CREATE INDEX live_edits_applied_idx ON live_edits(applied);

COMMENT ON TABLE live_edits IS 'Real-time collaborative editing operations';

-- =====================================================
-- TRIGGERS
-- =====================================================
CREATE TRIGGER collaboration_sessions_updated_at BEFORE UPDATE ON collaboration_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER comments_updated_at BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) - Enable later with policies
-- =====================================================
-- These will be enabled in a separate RLS migration
-- ALTER TABLE collaboration_sessions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE activity_feed ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE live_edits ENABLE ROW LEVEL SECURITY;
