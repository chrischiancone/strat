# Strategic Planning System - Supabase Database

## Overview

This directory contains the complete database schema and migrations for the municipal strategic planning application. The system uses a **hybrid approach**: relational tables for core entities and JSONB for complex, template-driven data.

## Database Architecture

### Core Principles
- **Relational Normalized Data**: Frequently queried entities (plans, goals, initiatives, budgets)
- **JSONB Flexibility**: Complex nested structures (SWOT analysis, financial breakdowns, ROI analysis)
- **Row-Level Security**: Department-scoped access control
- **Audit Trail**: Comprehensive change tracking
- **Vector Embeddings**: RAG-enabled semantic search with pgvector

### Key Features
- Multi-municipality support (future scalability)
- 3-year strategic planning cycles
- NEEDS/WANTS/NICE_TO_HAVE prioritization
- Cross-departmental collaboration tracking
- Quarterly milestone tracking
- Financial analysis with multiple funding sources
- Performance metrics (KPIs) at multiple levels

## Migration Files

Migrations are numbered and must be run in order:

1. **`20250109000001_create_core_tables.sql`**
   - Municipalities, departments, fiscal years, users
   - Foundation tables for the system

2. **`20250109000002_create_planning_tables.sql`**
   - Strategic plans, goals, initiatives
   - Core planning entities

3. **`20250109000003_create_supporting_tables.sql`**
   - Initiative budgets, KPIs, milestones
   - Dependencies, collaborators
   - Supporting tracking tables

4. **`20250109000004_create_system_tables.sql`**
   - Audit logs, document embeddings (pgvector)
   - Comments for collaboration
   - System infrastructure

5. **`20250109000005_enable_rls_policies.sql`**
   - Row-level security policies
   - Department-scoped access control
   - Role-based permissions

6. **`20250109000006_seed_data.sql`**
   - Sample City of Carrollton data
   - Water & Field Services example plan
   - Development and testing data

## Quick Start

### Local Development with Supabase CLI

1. **Install Supabase CLI**
   ```bash
   npm install -g supabase
   ```

2. **Initialize Supabase locally**
   ```bash
   # From project root
   supabase init
   ```

3. **Start local Supabase**
   ```bash
   supabase start
   ```

4. **Run migrations**
   ```bash
   supabase db reset
   ```
   This will run all migrations in order and seed the database.

5. **Access local services**
   - Studio UI: http://localhost:54323
   - API URL: http://localhost:54321
   - Database: postgresql://postgres:postgres@localhost:54322/postgres

### Connecting from Next.js

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

## Schema Overview

### Entity Relationships

```
municipalities
    ↓
departments
    ↓
strategic_plans (3-year)
    ↓
strategic_goals (3-5 per plan)
    ↓
initiatives (NEEDS/WANTS/NICE_TO_HAVES)
    ↓
├─ initiative_budgets (normalized financial)
├─ initiative_kpis (performance metrics)
├─ quarterly_milestones (timeline tracking)
├─ initiative_dependencies (many-to-many)
└─ initiative_collaborators (cross-departmental)
```

### Key Tables

#### `strategic_plans`
The 3-year planning document for a department
- Links to start/end fiscal years
- Contains SWOT analysis, environmental scan, benchmarking (JSONB)
- Status workflow: draft → under_review → approved → active → archived

#### `initiatives`
Individual strategic initiatives (e.g., "1.1: Smart Water Meter Deployment")
- Priority level: NEED, WANT, NICE_TO_HAVE
- Comprehensive JSONB fields: financial_analysis, roi_analysis, risks, dependencies
- Numeric cost fields for aggregation (year 1/2/3)
- Status tracking: not_started → in_progress → completed

#### `initiative_budgets`
Normalized budget entries for reporting
- Category: personnel, equipment, services, training, materials, other
- Funding source tracking (general fund, grants, bonds, fees)
- Enables queries like "total grant funding across all initiatives"

#### `document_embeddings`
Vector embeddings for RAG/AI features
- Uses pgvector extension
- Stores embeddings for plans, initiatives, uploaded PDFs
- Enables semantic search and AI-powered analysis

## Row-Level Security (RLS)

All tables have RLS enabled with policies that enforce:

### Access Patterns

**Department Staff**
- Full access to their department's plans and initiatives
- Read access to collaborating departments' initiatives
- Can comment on accessible entities

**Department Directors**
- All staff permissions
- Approve/publish plans for their department

**City Manager / Finance**
- Read access to all departments' plans
- Financial data access across all initiatives
- Can comment and provide feedback

**Admin**
- Full system access
- User management
- Can modify any entity

**Public Role**
- Read-only access to published (active) strategic plans
- No access to draft or under-review plans

### Helper Functions

```sql
auth.user_municipality_id()  -- Current user's municipality
auth.user_department_id()    -- Current user's department
auth.user_role()             -- Current user's role
auth.is_admin_or_manager()   -- Admin or City Manager check
```

## Audit Trail

All changes to key tables are automatically logged in `audit_logs`:
- Strategic plans, goals, initiatives, budgets
- Captures old/new values, user, timestamp, IP address
- Immutable log for compliance and accountability

Trigger automatically fires on INSERT/UPDATE/DELETE.

## Vector Search (RAG)

The `document_embeddings` table supports:

```sql
-- Find similar initiatives
SELECT content_text, 1 - (embedding <=> query_embedding) AS similarity
FROM document_embeddings
WHERE content_type = 'initiative'
ORDER BY embedding <=> query_embedding
LIMIT 10;
```

Indexes:
- IVFFlat index for fast approximate search (good for large datasets)
- Alternative HNSW index available (commented out, more accurate)

## Sample Queries

### Get all initiatives for a department's current plan
```sql
SELECT i.*, sg.title AS goal_title
FROM initiatives i
JOIN strategic_goals sg ON i.strategic_goal_id = sg.id
JOIN strategic_plans sp ON sg.strategic_plan_id = sp.id
WHERE sp.department_id = :department_id
  AND sp.status = 'active'
ORDER BY i.priority_level, i.rank_within_priority;
```

### Total budget by funding source for FY2025
```sql
SELECT
    funding_source,
    SUM(amount) AS total_amount
FROM initiative_budgets ib
JOIN fiscal_years fy ON ib.fiscal_year_id = fy.id
WHERE fy.year = 2025
GROUP BY funding_source
ORDER BY total_amount DESC;
```

### Initiatives at risk or behind schedule
```sql
SELECT
    i.initiative_number,
    i.name,
    i.status,
    COUNT(qm.id) AS total_milestones,
    COUNT(CASE WHEN qm.status = 'delayed' THEN 1 END) AS delayed_milestones
FROM initiatives i
LEFT JOIN quarterly_milestones qm ON i.id = qm.initiative_id
WHERE i.status = 'at_risk'
   OR i.status = 'in_progress'
GROUP BY i.id
HAVING COUNT(CASE WHEN qm.status = 'delayed' THEN 1 END) > 0;
```

### Cross-departmental initiatives
```sql
SELECT
    i.initiative_number,
    i.name,
    d_lead.name AS lead_department,
    STRING_AGG(d_collab.name, ', ') AS collaborating_departments
FROM initiatives i
JOIN departments d_lead ON i.lead_department_id = d_lead.id
JOIN initiative_collaborators ic ON i.id = ic.initiative_id
JOIN departments d_collab ON ic.department_id = d_collab.id
GROUP BY i.id, d_lead.name
HAVING COUNT(ic.id) > 0;
```

## TypeScript Types

Generate TypeScript types from your schema:

```bash
supabase gen types typescript --local > types/supabase.ts
```

Use in your Next.js app:

```typescript
import { Database } from '@/types/supabase'

type Initiative = Database['public']['Tables']['initiatives']['Row']
type InitiativeInsert = Database['public']['Tables']['initiatives']['Insert']
type InitiativeUpdate = Database['public']['Tables']['initiatives']['Update']
```

## Best Practices

### When to Use JSONB vs Relational
- **Use JSONB for**: Template-driven data, evolving structures, display-as-unit data
- **Use Relational for**: Frequently queried fields, aggregations, foreign key relationships

### Updating Costs
When updating initiative costs, update both:
1. `total_year_X_cost` columns (for quick aggregation)
2. `financial_analysis` JSONB (for detailed breakdown)

### Performance
- JSONB fields are indexed with GIN indexes automatically
- Use JSONB path queries: `financial_analysis->>'year_1'->>'total'`
- For frequent queries, consider computed columns or materialized views

### Security
- Never bypass RLS in application code
- Always use service role key only in server-side functions
- Audit logs are append-only (no UPDATE/DELETE policies)

## Extending the Schema

### Adding a New Table

1. Create migration file:
   ```bash
   supabase migration new add_my_table
   ```

2. Write SQL:
   ```sql
   CREATE TABLE my_table (
       id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
       -- columns...
       created_at TIMESTAMPTZ DEFAULT NOW()
   );
   ```

3. Add RLS policies:
   ```sql
   ALTER TABLE my_table ENABLE ROW LEVEL SECURITY;
   CREATE POLICY my_table_select ON my_table FOR SELECT...
   ```

4. Add to audit:
   ```sql
   CREATE TRIGGER my_table_audit AFTER INSERT OR UPDATE OR DELETE ON my_table
       FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
   ```

## Troubleshooting

### RLS Blocking Queries
```sql
-- Temporarily disable RLS for debugging (local only!)
ALTER TABLE initiatives DISABLE ROW LEVEL SECURITY;

-- Check which policies would apply
SELECT * FROM pg_policies WHERE tablename = 'initiatives';
```

### Migration Issues
```bash
# Reset database (WARNING: destroys data)
supabase db reset

# Check migration status
supabase migration list

# Repair migration history
supabase migration repair --status applied <version>
```

### Performance Issues
```sql
-- Analyze query performance
EXPLAIN ANALYZE SELECT...

-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
ORDER BY idx_scan;
```

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL JSONB](https://www.postgresql.org/docs/current/datatype-json.html)
- [pgvector Documentation](https://github.com/pgvector/pgvector)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

## Support

For questions or issues:
1. Check the schema overview doc: `docs/database-schema-overview.md`
2. Review sample queries in this README
3. Examine seed data for examples: `migrations/20250109000006_seed_data.sql`
