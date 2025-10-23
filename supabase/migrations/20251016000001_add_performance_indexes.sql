-- ================================================
-- Performance Indexes Migration
-- ================================================
-- This migration adds indexes to improve query performance
-- on frequently accessed columns across all tables
-- Created: 2025-10-16
-- ================================================

-- ============================================
-- Core Tables Indexes
-- ============================================

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_municipality_id ON public.users(municipality_id);
CREATE INDEX IF NOT EXISTS idx_users_department_id ON public.users(department_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON public.users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at DESC);

-- Departments table indexes
CREATE INDEX IF NOT EXISTS idx_departments_municipality_id ON public.departments(municipality_id);
CREATE INDEX IF NOT EXISTS idx_departments_is_active ON public.departments(is_active);

-- Fiscal years table indexes
CREATE INDEX IF NOT EXISTS idx_fiscal_years_municipality_id ON public.fiscal_years(municipality_id);
CREATE INDEX IF NOT EXISTS idx_fiscal_years_start_date ON public.fiscal_years(start_date);
CREATE INDEX IF NOT EXISTS idx_fiscal_years_end_date ON public.fiscal_years(end_date);
CREATE INDEX IF NOT EXISTS idx_fiscal_years_is_current ON public.fiscal_years(is_current);

-- ============================================
-- Planning Tables Indexes
-- ============================================

-- Strategic plans table indexes
CREATE INDEX IF NOT EXISTS idx_strategic_plans_department_id ON public.strategic_plans(department_id);
CREATE INDEX IF NOT EXISTS idx_strategic_plans_start_fiscal_year_id ON public.strategic_plans(start_fiscal_year_id);
CREATE INDEX IF NOT EXISTS idx_strategic_plans_status ON public.strategic_plans(status);
CREATE INDEX IF NOT EXISTS idx_strategic_plans_created_by ON public.strategic_plans(created_by);
CREATE INDEX IF NOT EXISTS idx_strategic_plans_created_at ON public.strategic_plans(created_at DESC);

-- Strategic goals table indexes  
CREATE INDEX IF NOT EXISTS idx_strategic_goals_plan_id ON public.strategic_goals(strategic_plan_id);
CREATE INDEX IF NOT EXISTS idx_strategic_goals_goal_number ON public.strategic_goals(goal_number);

-- Initiatives table indexes
CREATE INDEX IF NOT EXISTS idx_initiatives_strategic_goal_id ON public.initiatives(strategic_goal_id);
CREATE INDEX IF NOT EXISTS idx_initiatives_lead_department_id ON public.initiatives(lead_department_id);
CREATE INDEX IF NOT EXISTS idx_initiatives_status ON public.initiatives(status);
CREATE INDEX IF NOT EXISTS idx_initiatives_priority_level ON public.initiatives(priority_level);
CREATE INDEX IF NOT EXISTS idx_initiatives_fiscal_year_id ON public.initiatives(fiscal_year_id);
CREATE INDEX IF NOT EXISTS idx_initiatives_created_at ON public.initiatives(created_at DESC);

-- Composite index for common initiative queries
CREATE INDEX IF NOT EXISTS idx_initiatives_dept_status ON public.initiatives(lead_department_id, status);
CREATE INDEX IF NOT EXISTS idx_initiatives_goal_status ON public.initiatives(strategic_goal_id, status);

-- ============================================
-- Budget & Finance Indexes
-- ============================================

-- Initiative budgets table indexes
CREATE INDEX IF NOT EXISTS idx_initiative_budgets_initiative_id ON public.initiative_budgets(initiative_id);
CREATE INDEX IF NOT EXISTS idx_initiative_budgets_fiscal_year_id ON public.initiative_budgets(fiscal_year_id);
CREATE INDEX IF NOT EXISTS idx_initiative_budgets_category ON public.initiative_budgets(category);
CREATE INDEX IF NOT EXISTS idx_initiative_budgets_funding_status ON public.initiative_budgets(funding_status);

-- Composite index for budget queries
CREATE INDEX IF NOT EXISTS idx_initiative_budgets_fy_status ON public.initiative_budgets(fiscal_year_id, funding_status);

-- ============================================
-- KPIs & Milestones Indexes
-- ============================================

-- Initiative KPIs table indexes
CREATE INDEX IF NOT EXISTS idx_initiative_kpis_initiative_id ON public.initiative_kpis(initiative_id);
CREATE INDEX IF NOT EXISTS idx_initiative_kpis_strategic_goal_id ON public.initiative_kpis(strategic_goal_id);
CREATE INDEX IF NOT EXISTS idx_initiative_kpis_strategic_plan_id ON public.initiative_kpis(strategic_plan_id);
CREATE INDEX IF NOT EXISTS idx_initiative_kpis_frequency ON public.initiative_kpis(measurement_frequency);

-- Quarterly milestones table indexes
CREATE INDEX IF NOT EXISTS idx_quarterly_milestones_initiative_id ON public.quarterly_milestones(initiative_id);
CREATE INDEX IF NOT EXISTS idx_quarterly_milestones_status ON public.quarterly_milestones(status);
CREATE INDEX IF NOT EXISTS idx_quarterly_milestones_fiscal_year_id ON public.quarterly_milestones(fiscal_year_id);
CREATE INDEX IF NOT EXISTS idx_quarterly_milestones_completion_date ON public.quarterly_milestones(completion_date);

-- ============================================
-- Supporting Tables Indexes
-- ============================================

-- Comments table indexes
CREATE INDEX IF NOT EXISTS idx_comments_entity_type ON public.comments(entity_type);
CREATE INDEX IF NOT EXISTS idx_comments_entity_id ON public.comments(entity_id);
CREATE INDEX IF NOT EXISTS idx_comments_author_id ON public.comments(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON public.comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_is_resolved ON public.comments(is_resolved);

-- Composite index for comment queries
CREATE INDEX IF NOT EXISTS idx_comments_entity ON public.comments(entity_type, entity_id);

-- Activity log table indexes
CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON public.activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_resource_type ON public.activity_log(resource_type);
CREATE INDEX IF NOT EXISTS idx_activity_log_resource_id ON public.activity_log(resource_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_action ON public.activity_log(action);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON public.activity_log(created_at DESC);

-- Composite indexes for activity log queries
CREATE INDEX IF NOT EXISTS idx_activity_log_resource ON public.activity_log(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_user_date ON public.activity_log(user_id, created_at DESC);

-- Notifications table indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- Composite index for notification queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, read) WHERE read = false;

-- Initiative dependencies indexes
CREATE INDEX IF NOT EXISTS idx_initiative_dependencies_initiative_id ON public.initiative_dependencies(initiative_id);
CREATE INDEX IF NOT EXISTS idx_initiative_dependencies_depends_on ON public.initiative_dependencies(depends_on_initiative_id);
CREATE INDEX IF NOT EXISTS idx_initiative_dependencies_critical ON public.initiative_dependencies(is_critical_path) WHERE is_critical_path = true;

-- Initiative collaborators indexes
CREATE INDEX IF NOT EXISTS idx_initiative_collaborators_initiative_id ON public.initiative_collaborators(initiative_id);
CREATE INDEX IF NOT EXISTS idx_initiative_collaborators_department_id ON public.initiative_collaborators(department_id);
CREATE INDEX IF NOT EXISTS idx_initiative_collaborators_role ON public.initiative_collaborators(role);

-- ============================================
-- System Tables Indexes
-- ============================================

-- Council goals table indexes
CREATE INDEX IF NOT EXISTS idx_council_goals_municipality_id ON public.council_goals(municipality_id);
CREATE INDEX IF NOT EXISTS idx_council_goals_category ON public.council_goals(category);
CREATE INDEX IF NOT EXISTS idx_council_goals_is_active ON public.council_goals(is_active);
CREATE INDEX IF NOT EXISTS idx_council_goals_sort_order ON public.council_goals(sort_order);

-- Dashboard messages table indexes
CREATE INDEX IF NOT EXISTS idx_dashboard_messages_location ON public.dashboard_messages(location);
CREATE INDEX IF NOT EXISTS idx_dashboard_messages_bg_color ON public.dashboard_messages(bg_color);

-- Collaboration sessions indexes
CREATE INDEX IF NOT EXISTS idx_collaboration_sessions_resource ON public.collaboration_sessions(resource_id, resource_type);
CREATE INDEX IF NOT EXISTS idx_collaboration_sessions_expires_at ON public.collaboration_sessions(expires_at);

-- Live edits indexes
CREATE INDEX IF NOT EXISTS idx_live_edits_session_id ON public.live_edits(session_id);
CREATE INDEX IF NOT EXISTS idx_live_edits_resource ON public.live_edits(resource_id, resource_type);
CREATE INDEX IF NOT EXISTS idx_live_edits_applied ON public.live_edits(applied);

-- Audit logs indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_record ON public.audit_logs(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_changed_by ON public.audit_logs(changed_by);
CREATE INDEX IF NOT EXISTS idx_audit_logs_changed_at ON public.audit_logs(changed_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);

-- Document embeddings indexes
CREATE INDEX IF NOT EXISTS idx_document_embeddings_content ON public.document_embeddings(content_type, content_id);

-- ============================================
-- Full-text Search Indexes
-- ============================================

-- Add GIN indexes for full-text search on text fields
CREATE INDEX IF NOT EXISTS idx_initiatives_name_gin ON public.initiatives USING gin(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_initiatives_description_gin ON public.initiatives USING gin(to_tsvector('english', description));
CREATE INDEX IF NOT EXISTS idx_strategic_goals_title_gin ON public.strategic_goals USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_strategic_plans_title_gin ON public.strategic_plans USING gin(to_tsvector('english', title));

-- ============================================
-- Analysis and Maintenance
-- ============================================

-- Run ANALYZE to update query planner statistics
ANALYZE;

-- Add comments documenting the indexes
COMMENT ON INDEX idx_initiatives_dept_status IS 'Composite index for filtering initiatives by department and status';
COMMENT ON INDEX idx_initiatives_goal_status IS 'Composite index for filtering initiatives by goal and status';
COMMENT ON INDEX idx_initiative_budgets_fy_status IS 'Composite index for budget queries filtered by fiscal year and status';
COMMENT ON INDEX idx_notifications_user_unread IS 'Partial index for unread notifications per user - improves notification feed queries';
COMMENT ON INDEX idx_initiatives_name_gin IS 'Full-text search index for initiative names';
COMMENT ON INDEX idx_initiative_dependencies_critical IS 'Partial index for critical path dependencies';
