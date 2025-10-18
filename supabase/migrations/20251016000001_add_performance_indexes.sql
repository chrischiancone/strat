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
CREATE INDEX IF NOT EXISTS idx_departments_parent_id ON public.departments(parent_department_id);
CREATE INDEX IF NOT EXISTS idx_departments_is_active ON public.departments(is_active);

-- Fiscal years table indexes
CREATE INDEX IF NOT EXISTS idx_fiscal_years_municipality_id ON public.fiscal_years(municipality_id);
CREATE INDEX IF NOT EXISTS idx_fiscal_years_start_date ON public.fiscal_years(start_date);
CREATE INDEX IF NOT EXISTS idx_fiscal_years_end_date ON public.fiscal_years(end_date);
CREATE INDEX IF NOT EXISTS idx_fiscal_years_is_active ON public.fiscal_years(is_active);

-- ============================================
-- Planning Tables Indexes
-- ============================================

-- Strategic plans table indexes
CREATE INDEX IF NOT EXISTS idx_strategic_plans_municipality_id ON public.strategic_plans(municipality_id);
CREATE INDEX IF NOT EXISTS idx_strategic_plans_fiscal_year_id ON public.strategic_plans(fiscal_year_id);
CREATE INDEX IF NOT EXISTS idx_strategic_plans_status ON public.strategic_plans(status);
CREATE INDEX IF NOT EXISTS idx_strategic_plans_created_by ON public.strategic_plans(created_by);
CREATE INDEX IF NOT EXISTS idx_strategic_plans_created_at ON public.strategic_plans(created_at DESC);

-- Goals table indexes  
CREATE INDEX IF NOT EXISTS idx_goals_plan_id ON public.goals(plan_id);
CREATE INDEX IF NOT EXISTS idx_goals_department_id ON public.goals(department_id);
CREATE INDEX IF NOT EXISTS idx_goals_status ON public.goals(status);
CREATE INDEX IF NOT EXISTS idx_goals_priority ON public.goals(priority);
CREATE INDEX IF NOT EXISTS idx_goals_target_completion_date ON public.goals(target_completion_date);

-- Initiatives table indexes
CREATE INDEX IF NOT EXISTS idx_initiatives_goal_id ON public.initiatives(goal_id);
CREATE INDEX IF NOT EXISTS idx_initiatives_department_id ON public.initiatives(department_id);
CREATE INDEX IF NOT EXISTS idx_initiatives_status ON public.initiatives(status);
CREATE INDEX IF NOT EXISTS idx_initiatives_priority ON public.initiatives(priority);
CREATE INDEX IF NOT EXISTS idx_initiatives_owner_id ON public.initiatives(owner_id);
CREATE INDEX IF NOT EXISTS idx_initiatives_start_date ON public.initiatives(start_date);
CREATE INDEX IF NOT EXISTS idx_initiatives_end_date ON public.initiatives(end_date);
CREATE INDEX IF NOT EXISTS idx_initiatives_created_at ON public.initiatives(created_at DESC);

-- Composite index for common initiative queries
CREATE INDEX IF NOT EXISTS idx_initiatives_dept_status ON public.initiatives(department_id, status);
CREATE INDEX IF NOT EXISTS idx_initiatives_goal_status ON public.initiatives(goal_id, status);

-- ============================================
-- Budget & Finance Indexes
-- ============================================

-- Budget allocations table indexes
CREATE INDEX IF NOT EXISTS idx_budget_allocations_initiative_id ON public.budget_allocations(initiative_id);
CREATE INDEX IF NOT EXISTS idx_budget_allocations_fiscal_year_id ON public.budget_allocations(fiscal_year_id);
CREATE INDEX IF NOT EXISTS idx_budget_allocations_category ON public.budget_allocations(category);
CREATE INDEX IF NOT EXISTS idx_budget_allocations_status ON public.budget_allocations(status);

-- Composite index for budget queries
CREATE INDEX IF NOT EXISTS idx_budget_alloc_fy_status ON public.budget_allocations(fiscal_year_id, status);

-- Funding sources table indexes
CREATE INDEX IF NOT EXISTS idx_funding_sources_municipality_id ON public.funding_sources(municipality_id);
CREATE INDEX IF NOT EXISTS idx_funding_sources_type ON public.funding_sources(type);
CREATE INDEX IF NOT EXISTS idx_funding_sources_is_active ON public.funding_sources(is_active);

-- Budget categories table indexes
CREATE INDEX IF NOT EXISTS idx_budget_categories_municipality_id ON public.budget_categories(municipality_id);
CREATE INDEX IF NOT EXISTS idx_budget_categories_is_active ON public.budget_categories(is_active);

-- ============================================
-- KPIs & Milestones Indexes
-- ============================================

-- KPIs table indexes
CREATE INDEX IF NOT EXISTS idx_kpis_initiative_id ON public.kpis(initiative_id);
CREATE INDEX IF NOT EXISTS idx_kpis_status ON public.kpis(status);
CREATE INDEX IF NOT EXISTS idx_kpis_target_date ON public.kpis(target_date);

-- Milestones table indexes
CREATE INDEX IF NOT EXISTS idx_milestones_initiative_id ON public.milestones(initiative_id);
CREATE INDEX IF NOT EXISTS idx_milestones_status ON public.milestones(status);
CREATE INDEX IF NOT EXISTS idx_milestones_due_date ON public.milestones(due_date);
CREATE INDEX IF NOT EXISTS idx_milestones_completed_date ON public.milestones(completed_date);

-- ============================================
-- Supporting Tables Indexes
-- ============================================

-- Comments table indexes
CREATE INDEX IF NOT EXISTS idx_comments_entity_type ON public.comments(entity_type);
CREATE INDEX IF NOT EXISTS idx_comments_entity_id ON public.comments(entity_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON public.comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON public.comments(created_at DESC);

-- Composite index for comment queries
CREATE INDEX IF NOT EXISTS idx_comments_entity ON public.comments(entity_type, entity_id);

-- Attachments table indexes
CREATE INDEX IF NOT EXISTS idx_attachments_entity_type ON public.attachments(entity_type);
CREATE INDEX IF NOT EXISTS idx_attachments_entity_id ON public.attachments(entity_id);
CREATE INDEX IF NOT EXISTS idx_attachments_uploaded_by ON public.attachments(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_attachments_created_at ON public.attachments(created_at DESC);

-- Activity log table indexes
CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON public.activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_entity_type ON public.activity_log(entity_type);
CREATE INDEX IF NOT EXISTS idx_activity_log_entity_id ON public.activity_log(entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_action ON public.activity_log(action);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON public.activity_log(created_at DESC);

-- Composite indexes for activity log queries
CREATE INDEX IF NOT EXISTS idx_activity_log_entity ON public.activity_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_user_date ON public.activity_log(user_id, created_at DESC);

-- Notifications table indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- Composite index for notification queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read) WHERE is_read = false;

-- Tags table indexes
CREATE INDEX IF NOT EXISTS idx_tags_entity_type ON public.tags(entity_type);
CREATE INDEX IF NOT EXISTS idx_tags_entity_id ON public.tags(entity_id);
CREATE INDEX IF NOT EXISTS idx_tags_name ON public.tags(name);

-- ============================================
-- System Tables Indexes
-- ============================================

-- Council goals table indexes (if exists)
CREATE INDEX IF NOT EXISTS idx_council_goals_municipality_id ON public.council_goals(municipality_id);
CREATE INDEX IF NOT EXISTS idx_council_goals_fiscal_year_id ON public.council_goals(fiscal_year_id);
CREATE INDEX IF NOT EXISTS idx_council_goals_status ON public.council_goals(status);

-- Dashboard messages table indexes (if exists)
CREATE INDEX IF NOT EXISTS idx_dashboard_messages_municipality_id ON public.dashboard_messages(municipality_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_messages_is_active ON public.dashboard_messages(is_active);
CREATE INDEX IF NOT EXISTS idx_dashboard_messages_priority ON public.dashboard_messages(priority);

-- Backups table indexes (if exists)
CREATE INDEX IF NOT EXISTS idx_backups_municipality_id ON public.backups(municipality_id);
CREATE INDEX IF NOT EXISTS idx_backups_created_by ON public.backups(created_by);
CREATE INDEX IF NOT EXISTS idx_backups_created_at ON public.backups(created_at DESC);

-- AI analyses table indexes (if exists)
CREATE INDEX IF NOT EXISTS idx_ai_analyses_entity_type ON public.ai_analyses(entity_type);
CREATE INDEX IF NOT EXISTS idx_ai_analyses_entity_id ON public.ai_analyses(entity_id);
CREATE INDEX IF NOT EXISTS idx_ai_analyses_created_at ON public.ai_analyses(created_at DESC);

-- ============================================
-- Full-text Search Indexes
-- ============================================

-- Add GIN indexes for full-text search on text fields
CREATE INDEX IF NOT EXISTS idx_initiatives_name_gin ON public.initiatives USING gin(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_initiatives_description_gin ON public.initiatives USING gin(to_tsvector('english', description));
CREATE INDEX IF NOT EXISTS idx_goals_name_gin ON public.goals USING gin(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_strategic_plans_name_gin ON public.strategic_plans USING gin(to_tsvector('english', name));

-- ============================================
-- Analysis and Maintenance
-- ============================================

-- Run ANALYZE to update query planner statistics
ANALYZE;

-- Add comments documenting the indexes
COMMENT ON INDEX idx_initiatives_dept_status IS 'Composite index for filtering initiatives by department and status';
COMMENT ON INDEX idx_budget_alloc_fy_status IS 'Composite index for budget queries filtered by fiscal year and status';
COMMENT ON INDEX idx_notifications_user_unread IS 'Partial index for unread notifications per user - improves notification feed queries';
COMMENT ON INDEX idx_initiatives_name_gin IS 'Full-text search index for initiative names';
