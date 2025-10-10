-- Strategic Planning System - Planning Tables Migration
-- Part 2: Strategic plans, goals, initiatives

-- =====================================================
-- 5. STRATEGIC PLANS
-- =====================================================
CREATE TABLE strategic_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    start_fiscal_year_id UUID NOT NULL REFERENCES fiscal_years(id) ON DELETE RESTRICT,
    end_fiscal_year_id UUID NOT NULL REFERENCES fiscal_years(id) ON DELETE RESTRICT,
    title TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft',
    version TEXT DEFAULT '1.0',
    executive_summary TEXT,
    department_vision TEXT,
    swot_analysis JSONB DEFAULT '{"strengths": [], "weaknesses": [], "opportunities": [], "threats": []}'::jsonb,
    environmental_scan JSONB DEFAULT '{}'::jsonb,
    benchmarking_data JSONB DEFAULT '{}'::jsonb,
    total_investment_amount NUMERIC(12,2) DEFAULT 0,
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    published_at TIMESTAMPTZ,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT strategic_plans_status_check CHECK (status IN ('draft', 'under_review', 'approved', 'active', 'archived')),
    CONSTRAINT strategic_plans_years_valid CHECK (start_fiscal_year_id != end_fiscal_year_id)
);

CREATE INDEX strategic_plans_department_status_idx ON strategic_plans(department_id, status);
CREATE INDEX strategic_plans_start_year_idx ON strategic_plans(start_fiscal_year_id);
CREATE INDEX strategic_plans_created_by_idx ON strategic_plans(created_by);

COMMENT ON TABLE strategic_plans IS '3-year strategic planning documents';

-- =====================================================
-- 6. STRATEGIC GOALS
-- =====================================================
CREATE TABLE strategic_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    strategic_plan_id UUID NOT NULL REFERENCES strategic_plans(id) ON DELETE CASCADE,
    goal_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    city_priority_alignment TEXT,
    objectives JSONB DEFAULT '[]'::jsonb,
    success_measures JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT strategic_goals_plan_number_unique UNIQUE (strategic_plan_id, goal_number),
    CONSTRAINT strategic_goals_number_positive CHECK (goal_number > 0)
);

CREATE INDEX strategic_goals_plan_id_idx ON strategic_goals(strategic_plan_id);

COMMENT ON TABLE strategic_goals IS 'Major strategic goals (3-5 per plan)';

-- =====================================================
-- 7. INITIATIVES
-- =====================================================
CREATE TABLE initiatives (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    strategic_goal_id UUID NOT NULL REFERENCES strategic_goals(id) ON DELETE CASCADE,
    lead_department_id UUID NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
    fiscal_year_id UUID NOT NULL REFERENCES fiscal_years(id) ON DELETE RESTRICT,
    initiative_number TEXT NOT NULL,
    name TEXT NOT NULL,
    priority_level TEXT NOT NULL,
    rank_within_priority INTEGER DEFAULT 0,
    description TEXT,
    rationale TEXT,
    expected_outcomes JSONB DEFAULT '[]'::jsonb,
    status TEXT NOT NULL DEFAULT 'not_started',

    -- JSONB fields for complex data
    financial_analysis JSONB DEFAULT '{}'::jsonb,
    roi_analysis JSONB DEFAULT '{}'::jsonb,
    cost_benefit_analysis JSONB DEFAULT '{}'::jsonb,
    implementation_timeline JSONB DEFAULT '{}'::jsonb,
    dependencies JSONB DEFAULT '{}'::jsonb,
    risks JSONB DEFAULT '[]'::jsonb,

    -- Numeric fields for aggregation
    total_year_1_cost NUMERIC(12,2) DEFAULT 0,
    total_year_2_cost NUMERIC(12,2) DEFAULT 0,
    total_year_3_cost NUMERIC(12,2) DEFAULT 0,

    responsible_party TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT initiatives_priority_check CHECK (priority_level IN ('NEED', 'WANT', 'NICE_TO_HAVE')),
    CONSTRAINT initiatives_status_check CHECK (status IN ('not_started', 'in_progress', 'at_risk', 'completed', 'deferred'))
);

CREATE INDEX initiatives_goal_id_idx ON initiatives(strategic_goal_id);
CREATE INDEX initiatives_fiscal_year_idx ON initiatives(fiscal_year_id);
CREATE INDEX initiatives_priority_rank_idx ON initiatives(priority_level, rank_within_priority);
CREATE INDEX initiatives_status_idx ON initiatives(status);
CREATE INDEX initiatives_lead_department_idx ON initiatives(lead_department_id);

COMMENT ON TABLE initiatives IS 'Individual strategic initiatives (e.g., 1.1, 2.3)';

-- =====================================================
-- TRIGGERS
-- =====================================================
CREATE TRIGGER strategic_plans_updated_at BEFORE UPDATE ON strategic_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER strategic_goals_updated_at BEFORE UPDATE ON strategic_goals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER initiatives_updated_at BEFORE UPDATE ON initiatives
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
