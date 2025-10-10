-- Strategic Planning System - Core Tables Migration
-- Part 1: Foundation tables (municipalities, departments, fiscal_years, users)

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- =====================================================
-- 1. MUNICIPALITIES
-- =====================================================
CREATE TABLE municipalities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    state TEXT NOT NULL,
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT municipalities_slug_unique UNIQUE (slug)
);

CREATE INDEX municipalities_slug_idx ON municipalities(slug);

COMMENT ON TABLE municipalities IS 'Municipal governments using the strategic planning system';

-- =====================================================
-- 2. DEPARTMENTS
-- =====================================================
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    municipality_id UUID NOT NULL REFERENCES municipalities(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    director_name TEXT,
    director_email TEXT,
    mission_statement TEXT,
    core_services JSONB DEFAULT '[]'::jsonb,
    current_staffing JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT departments_municipality_slug_unique UNIQUE (municipality_id, slug)
);

CREATE INDEX departments_municipality_id_idx ON departments(municipality_id);
CREATE INDEX departments_is_active_idx ON departments(is_active);

COMMENT ON TABLE departments IS 'City departments that create strategic plans';

-- =====================================================
-- 3. FISCAL YEARS
-- =====================================================
CREATE TABLE fiscal_years (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    municipality_id UUID NOT NULL REFERENCES municipalities(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_current BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fiscal_years_municipality_year_unique UNIQUE (municipality_id, year),
    CONSTRAINT fiscal_years_dates_valid CHECK (end_date > start_date)
);

CREATE INDEX fiscal_years_municipality_year_idx ON fiscal_years(municipality_id, year);
CREATE INDEX fiscal_years_is_current_idx ON fiscal_years(is_current);

COMMENT ON TABLE fiscal_years IS 'Fiscal year periods for budget tracking';

-- =====================================================
-- 4. USERS (Profile extension of Supabase auth.users)
-- =====================================================
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    municipality_id UUID NOT NULL REFERENCES municipalities(id) ON DELETE CASCADE,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    role TEXT NOT NULL DEFAULT 'staff',
    full_name TEXT,
    title TEXT,
    email TEXT,
    avatar_url TEXT,
    preferences JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT users_role_check CHECK (role IN ('admin', 'department_director', 'staff', 'city_manager', 'finance', 'council', 'public'))
);

CREATE INDEX users_municipality_role_idx ON users(municipality_id, role);
CREATE INDEX users_department_id_idx ON users(department_id);
CREATE INDEX users_email_idx ON users(email);

COMMENT ON TABLE users IS 'User profiles and role assignments';

-- =====================================================
-- TRIGGERS FOR updated_at timestamps
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER municipalities_updated_at BEFORE UPDATE ON municipalities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER departments_updated_at BEFORE UPDATE ON departments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
