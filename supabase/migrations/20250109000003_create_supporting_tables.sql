-- Strategic Planning System - Supporting Tables Migration
-- Part 3: Budgets, KPIs, milestones, dependencies, collaboration

-- =====================================================
-- 8. INITIATIVE BUDGETS (Normalized financial tracking)
-- =====================================================
CREATE TABLE initiative_budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    initiative_id UUID NOT NULL REFERENCES initiatives(id) ON DELETE CASCADE,
    fiscal_year_id UUID NOT NULL REFERENCES fiscal_years(id) ON DELETE RESTRICT,
    category TEXT NOT NULL,
    amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    funding_source TEXT,
    funding_status TEXT DEFAULT 'projected',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT initiative_budgets_category_check CHECK (category IN ('personnel', 'equipment', 'services', 'training', 'materials', 'other')),
    CONSTRAINT initiative_budgets_funding_status_check CHECK (funding_status IN ('secured', 'requested', 'pending', 'projected'))
);

CREATE INDEX initiative_budgets_initiative_year_idx ON initiative_budgets(initiative_id, fiscal_year_id);
CREATE INDEX initiative_budgets_fiscal_year_source_idx ON initiative_budgets(fiscal_year_id, funding_source);

COMMENT ON TABLE initiative_budgets IS 'Normalized budget entries for aggregation and reporting';

-- =====================================================
-- 9. INITIATIVE KPIs (Performance metrics)
-- =====================================================
CREATE TABLE initiative_kpis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    initiative_id UUID REFERENCES initiatives(id) ON DELETE CASCADE,
    strategic_goal_id UUID REFERENCES strategic_goals(id) ON DELETE CASCADE,
    strategic_plan_id UUID REFERENCES strategic_plans(id) ON DELETE CASCADE,
    metric_name TEXT NOT NULL,
    measurement_frequency TEXT,
    baseline_value TEXT,
    year_1_target TEXT,
    year_2_target TEXT,
    year_3_target TEXT,
    data_source TEXT,
    responsible_party TEXT,
    actual_values JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT initiative_kpis_frequency_check CHECK (measurement_frequency IN ('monthly', 'quarterly', 'annual', 'continuous')),
    CONSTRAINT initiative_kpis_level_check CHECK (
        (initiative_id IS NOT NULL AND strategic_goal_id IS NULL AND strategic_plan_id IS NULL) OR
        (initiative_id IS NULL AND strategic_goal_id IS NOT NULL AND strategic_plan_id IS NULL) OR
        (initiative_id IS NULL AND strategic_goal_id IS NULL AND strategic_plan_id IS NOT NULL)
    )
);

CREATE INDEX initiative_kpis_initiative_idx ON initiative_kpis(initiative_id);
CREATE INDEX initiative_kpis_goal_idx ON initiative_kpis(strategic_goal_id);
CREATE INDEX initiative_kpis_plan_idx ON initiative_kpis(strategic_plan_id);

COMMENT ON TABLE initiative_kpis IS 'Performance metrics at initiative, goal, or plan level';

-- =====================================================
-- 10. QUARTERLY MILESTONES
-- =====================================================
CREATE TABLE quarterly_milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    initiative_id UUID NOT NULL REFERENCES initiatives(id) ON DELETE CASCADE,
    fiscal_year_id UUID NOT NULL REFERENCES fiscal_years(id) ON DELETE RESTRICT,
    quarter INTEGER NOT NULL,
    milestone_description TEXT NOT NULL,
    responsible_party TEXT,
    budget_impact NUMERIC(12,2) DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'not_started',
    completion_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT quarterly_milestones_unique UNIQUE (initiative_id, fiscal_year_id, quarter),
    CONSTRAINT quarterly_milestones_quarter_check CHECK (quarter BETWEEN 1 AND 4),
    CONSTRAINT quarterly_milestones_status_check CHECK (status IN ('not_started', 'in_progress', 'completed', 'delayed'))
);

CREATE INDEX quarterly_milestones_initiative_idx ON quarterly_milestones(initiative_id);
CREATE INDEX quarterly_milestones_status_idx ON quarterly_milestones(status);

COMMENT ON TABLE quarterly_milestones IS 'Implementation timeline tracking';

-- =====================================================
-- 11. INITIATIVE DEPENDENCIES (Many-to-many)
-- =====================================================
CREATE TABLE initiative_dependencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    initiative_id UUID NOT NULL REFERENCES initiatives(id) ON DELETE CASCADE,
    depends_on_initiative_id UUID NOT NULL REFERENCES initiatives(id) ON DELETE CASCADE,
    dependency_type TEXT,
    nature_of_dependency TEXT,
    is_critical_path BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT initiative_dependencies_unique UNIQUE (initiative_id, depends_on_initiative_id),
    CONSTRAINT initiative_dependencies_not_self CHECK (initiative_id != depends_on_initiative_id),
    CONSTRAINT initiative_dependencies_type_check CHECK (dependency_type IN ('internal', 'external', 'resource_sharing'))
);

CREATE INDEX initiative_dependencies_initiative_idx ON initiative_dependencies(initiative_id);
CREATE INDEX initiative_dependencies_depends_on_idx ON initiative_dependencies(depends_on_initiative_id);
CREATE INDEX initiative_dependencies_critical_idx ON initiative_dependencies(is_critical_path) WHERE is_critical_path = true;

COMMENT ON TABLE initiative_dependencies IS 'Initiative prerequisite relationships';

-- =====================================================
-- 12. INITIATIVE COLLABORATORS (Cross-departmental)
-- =====================================================
CREATE TABLE initiative_collaborators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    initiative_id UUID NOT NULL REFERENCES initiatives(id) ON DELETE CASCADE,
    department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    resources_committed TEXT,
    budget_share NUMERIC(12,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT initiative_collaborators_unique UNIQUE (initiative_id, department_id),
    CONSTRAINT initiative_collaborators_role_check CHECK (role IN ('lead', 'support', 'contributor'))
);

CREATE INDEX initiative_collaborators_initiative_idx ON initiative_collaborators(initiative_id);
CREATE INDEX initiative_collaborators_department_idx ON initiative_collaborators(department_id);

COMMENT ON TABLE initiative_collaborators IS 'Multi-department collaboration on initiatives';

-- =====================================================
-- TRIGGERS
-- =====================================================
CREATE TRIGGER initiative_budgets_updated_at BEFORE UPDATE ON initiative_budgets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER initiative_kpis_updated_at BEFORE UPDATE ON initiative_kpis
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER quarterly_milestones_updated_at BEFORE UPDATE ON quarterly_milestones
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
