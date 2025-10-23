-- Council Goals and Core Values Management
-- Migration to create tables for managing city-wide strategic goals and core values

-- =====================================================
-- COUNCIL GOALS TABLE
-- =====================================================
CREATE TABLE council_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    municipality_id UUID NOT NULL REFERENCES municipalities(id) ON DELETE CASCADE,
    category TEXT NOT NULL CHECK (category IN ('core_value', 'focus_area')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    key_points TEXT[] DEFAULT '{}',
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(municipality_id, category, sort_order)
);

-- Indexes for performance
CREATE INDEX council_goals_municipality_category_idx ON council_goals(municipality_id, category);
CREATE INDEX council_goals_sort_order_idx ON council_goals(sort_order);
CREATE INDEX council_goals_active_idx ON council_goals(is_active);

-- Comments
COMMENT ON TABLE council_goals IS 'City council strategic goals and core values that departments align with';
COMMENT ON COLUMN council_goals.category IS 'Type: core_value (Hospitality, Optimize, etc.) or focus_area (specific strategic focus)';
COMMENT ON COLUMN council_goals.key_points IS 'Array of key bullet points/sub-goals under this category';

-- Enable RLS
ALTER TABLE council_goals ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Council goals are viewable by municipality users" ON council_goals
    FOR SELECT USING (
        municipality_id IN (
            SELECT municipality_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Only admins can modify council goals" ON council_goals
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role = 'admin'
            AND municipality_id = council_goals.municipality_id
        )
    );

-- Trigger for updated_at
CREATE TRIGGER council_goals_updated_at BEFORE UPDATE ON council_goals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SEED DATA FOR CARROLLTON
-- =====================================================
INSERT INTO council_goals (municipality_id, category, title, description, key_points, sort_order, created_by)
SELECT 
    m.id as municipality_id,
    'core_value' as category,
    'Hospitality' as title,
    'We focus on quality of life in our community so all feel safe, valued, respected, and welcomed.' as description,
    ARRAY[
        'Communicate and engage with the community',
        'Improve accessibility to the services we provide',
        'Enhance the perception of our brand',
        'Foster a sense of belonging by valuing diversity and inclusivity',
        'Foster a welcoming environment for businesses and residents',
        'Provide professional and courteous service',
        'Provide opportunities for a healthy lifestyle'
    ] as key_points,
    1 as sort_order,
    '00000000-0000-0000-0000-000000000001'::uuid as created_by
FROM municipalities m WHERE m.name = 'City of Carrollton';

INSERT INTO council_goals (municipality_id, category, title, description, key_points, sort_order, created_by)
SELECT 
    m.id as municipality_id,
    'core_value' as category,
    'Optimize' as title,
    'Our processes enable us to deliver high-quality, expedient, and friendly service.' as description,
    ARRAY[
        'Allocate resources for optimal results',
        'Ensure processes for integrated, cross-functional planning and execution',
        'Leverage technology to improve our effectiveness and efficiency',
        'Adapt business practices to respond to changing conditions'
    ] as key_points,
    2 as sort_order,
    '00000000-0000-0000-0000-000000000001'::uuid as created_by
FROM municipalities m WHERE m.name = 'City of Carrollton';

INSERT INTO council_goals (municipality_id, category, title, description, key_points, sort_order, created_by)
SELECT 
    m.id as municipality_id,
    'core_value' as category,
    'Motivate' as title,
    'Our employees are empowered and trusted to work as a team to deliver exceptional service.' as description,
    ARRAY[
        'Foster a positive workplace culture',
        'Ensure our employees have appropriate resources and exemplify the Vision',
        'Attract and retain a diverse, motivated, and qualified team',
        'Invest in the professional development of our employees'
    ] as key_points,
    3 as sort_order,
    '00000000-0000-0000-0000-000000000001'::uuid as created_by
FROM municipalities m WHERE m.name = 'City of Carrollton';

INSERT INTO council_goals (municipality_id, category, title, description, key_points, sort_order, created_by)
SELECT 
    m.id as municipality_id,
    'core_value' as category,
    'Economical' as title,
    'We build and maintain a consistently thriving and diverse financial base while being outstanding stewards of City resources.' as description,
    ARRAY[
        'Increase and stimulate the sales tax base',
        'Increase the property tax base',
        'Leverage opportunities around TODs',
        'Manage infrastructure with fiduciary care',
        'Ensure City services are an optimal value'
    ] as key_points,
    4 as sort_order,
    '00000000-0000-0000-0000-000000000001'::uuid as created_by
FROM municipalities m WHERE m.name = 'City of Carrollton';
