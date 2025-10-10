# Strategic Planning System - Database Schema

## Architecture Philosophy: Hybrid Approach

**Normalized (Relational):** Core entities, relationships, frequently queried data
**JSONB (Flexible):** Complex nested structures, template-driven data, evolving schemas

---

## Schema Overview

### Core Entity Relationship Diagram

```
municipalities
    ↓ (1:many)
departments
    ↓ (1:many)
strategic_plans ──→ fiscal_years (3-year span)
    ↓ (1:many)
strategic_goals
    ↓ (1:many)
initiatives ←──→ initiatives (dependencies, many:many)
    ↓           ↓ (many:many via junction)
    ↓       departments (collaborative initiatives)
    ↓
    ├─→ initiative_budgets (normalized financial tracking)
    ├─→ initiative_kpis (performance metrics)
    ├─→ quarterly_milestones (implementation timeline)
    └─→ audit_logs (change tracking)
```

---

## Table Specifications

### 1. `municipalities`
**Purpose:** Support multi-city deployment (future scalability)

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `name` | text | City name (e.g., "City of Carrollton") |
| `slug` | text | URL-safe identifier (e.g., "carrollton") |
| `state` | text | State abbreviation |
| `settings` | jsonb | City-specific configuration |
| `created_at` | timestamptz | Record creation |
| `updated_at` | timestamptz | Last modification |

**Indexes:**
- Unique on `slug`

---

### 2. `departments`
**Purpose:** Organizational units that create strategic plans

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `municipality_id` | uuid | FK to municipalities |
| `name` | text | Department name (e.g., "Water & Field Services") |
| `slug` | text | URL-safe identifier |
| `director_name` | text | Department director |
| `director_email` | text | Contact email |
| `mission_statement` | text | Department mission |
| `core_services` | jsonb | Array of service areas |
| `current_staffing` | jsonb | FTE breakdown by category |
| `is_active` | boolean | Active status |
| `created_at` | timestamptz | Record creation |
| `updated_at` | timestamptz | Last modification |

**Indexes:**
- `municipality_id`, `slug` (unique together)
- `municipality_id` (for filtering)

---

### 3. `fiscal_years`
**Purpose:** Reference table for fiscal year periods

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `municipality_id` | uuid | FK to municipalities |
| `year` | integer | Fiscal year (e.g., 2025) |
| `start_date` | date | FY start (e.g., 2024-10-01) |
| `end_date` | date | FY end (e.g., 2025-09-30) |
| `is_current` | boolean | Current fiscal year flag |
| `created_at` | timestamptz | Record creation |

**Indexes:**
- `municipality_id`, `year` (unique together)

---

### 4. `strategic_plans`
**Purpose:** The 3-year strategic planning document

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `department_id` | uuid | FK to departments |
| `start_fiscal_year_id` | uuid | FK to fiscal_years (Year 1) |
| `end_fiscal_year_id` | uuid | FK to fiscal_years (Year 3) |
| `title` | text | Plan title |
| `status` | text | draft, under_review, approved, active, archived |
| `version` | text | Version number (e.g., "2.0") |
| `executive_summary` | text | High-level overview |
| `department_vision` | text | 3-year vision statement |
| `swot_analysis` | jsonb | {strengths: [], weaknesses: [], opportunities: [], threats: []} |
| `environmental_scan` | jsonb | Demographics, economic, regulatory, tech trends |
| `benchmarking_data` | jsonb | Peer municipality comparisons |
| `total_investment_amount` | numeric(12,2) | Total 3-year investment |
| `approved_by` | uuid | FK to users (approver) |
| `approved_at` | timestamptz | Approval timestamp |
| `published_at` | timestamptz | Publication date |
| `created_by` | uuid | FK to users (creator) |
| `created_at` | timestamptz | Record creation |
| `updated_at` | timestamptz | Last modification |

**Indexes:**
- `department_id`, `status`
- `start_fiscal_year_id`

**Status Flow:** `draft → under_review → approved → active → archived`

---

### 5. `strategic_goals`
**Purpose:** 3-5 major goals per strategic plan

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `strategic_plan_id` | uuid | FK to strategic_plans |
| `goal_number` | integer | Order/numbering (1, 2, 3, 4) |
| `title` | text | Goal title |
| `description` | text | 1-2 sentence description |
| `city_priority_alignment` | text | Which city strategic priority this supports |
| `objectives` | jsonb | Array of SMART objectives |
| `success_measures` | jsonb | Array of success measures |
| `created_at` | timestamptz | Record creation |
| `updated_at` | timestamptz | Last modification |

**Indexes:**
- `strategic_plan_id`, `goal_number` (unique together)

**JSONB Structure Examples:**
```json
objectives: [
  "Increase water quality compliance to 99.5% by end of Year 3",
  "Reduce emergency response time to under 15 minutes city-wide"
]

success_measures: [
  "Monthly water quality test results",
  "Average response time tracking"
]
```

---

### 6. `initiatives`
**Purpose:** Individual strategic initiatives (the heart of the plan)

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `strategic_goal_id` | uuid | FK to strategic_goals |
| `lead_department_id` | uuid | FK to departments |
| `fiscal_year_id` | uuid | FK to fiscal_years (implementation year) |
| `initiative_number` | text | e.g., "1.1", "2.3" |
| `name` | text | Initiative name |
| `priority_level` | text | NEED, WANT, NICE_TO_HAVE |
| `rank_within_priority` | integer | Ranking within priority tier |
| `description` | text | Detailed description |
| `rationale` | text | Why this is critical |
| `expected_outcomes` | jsonb | Array of expected outcomes |
| `status` | text | not_started, in_progress, at_risk, completed, deferred |
| `financial_analysis` | jsonb | Cost breakdown, funding sources |
| `roi_analysis` | jsonb | Financial & non-financial ROI |
| `cost_benefit_analysis` | jsonb | Benefits vs costs breakdown |
| `implementation_timeline` | jsonb | Quarterly milestones |
| `dependencies` | jsonb | Internal/external dependencies |
| `risks` | jsonb | Risk assessment matrix |
| `total_year_1_cost` | numeric(12,2) | Year 1 budget |
| `total_year_2_cost` | numeric(12,2) | Year 2 budget (if multi-year) |
| `total_year_3_cost` | numeric(12,2) | Year 3 budget (if multi-year) |
| `responsible_party` | text | Name/title of responsible person |
| `created_at` | timestamptz | Record creation |
| `updated_at` | timestamptz | Last modification |

**Indexes:**
- `strategic_goal_id`
- `fiscal_year_id`
- `priority_level`, `rank_within_priority`
- `status`

**JSONB Structure Examples:**

```json
financial_analysis: {
  "year_1": {
    "personnel_costs": 75000,
    "equipment_technology": 50000,
    "professional_services": 25000,
    "training_development": 10000,
    "materials_supplies": 5000,
    "other_costs": 0,
    "total": 165000
  },
  "funding_sources": [
    {"source": "General Fund", "amount": 100000, "status": "secured"},
    {"source": "EPA Grant", "amount": 65000, "status": "pending"}
  ]
}

roi_analysis: {
  "financial": {
    "projected_annual_savings": 50000,
    "projected_revenue_generation": 0,
    "payback_period_months": 36,
    "three_year_net_impact": 150000
  },
  "non_financial": {
    "service_quality_improvement": "30% reduction in water quality incidents",
    "efficiency_gains": "Save 200 staff hours annually",
    "risk_reduction": "Mitigate regulatory compliance penalties",
    "citizen_satisfaction": "Expected 15% increase in satisfaction scores"
  }
}

risks: [
  {
    "risk": "Vendor delays in equipment delivery",
    "probability": "M",
    "impact": "H",
    "mitigation": "Dual-source procurement strategy",
    "contingency": "Rent temporary equipment"
  }
]
```

---

### 7. `initiative_budgets`
**Purpose:** Normalized budget tracking for aggregation and reporting

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `initiative_id` | uuid | FK to initiatives |
| `fiscal_year_id` | uuid | FK to fiscal_years |
| `category` | text | personnel, equipment, services, training, materials, other |
| `amount` | numeric(12,2) | Budget amount |
| `funding_source` | text | General fund, grants, bonds, fees, etc. |
| `funding_status` | text | secured, requested, pending, projected |
| `notes` | text | Additional context |
| `created_at` | timestamptz | Record creation |
| `updated_at` | timestamptz | Last modification |

**Indexes:**
- `initiative_id`, `fiscal_year_id`
- `fiscal_year_id`, `funding_source`

**Design Note:** This table allows easy queries like:
- "Total budget across all initiatives for FY2025"
- "All grant-funded initiatives"
- "Equipment spending across departments"

---

### 8. `initiative_kpis`
**Purpose:** Performance metrics / Key Performance Indicators

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `initiative_id` | uuid | FK to initiatives (nullable for department-level KPIs) |
| `strategic_goal_id` | uuid | FK to strategic_goals (nullable) |
| `strategic_plan_id` | uuid | FK to strategic_plans (for dept-wide KPIs) |
| `metric_name` | text | KPI name |
| `measurement_frequency` | text | monthly, quarterly, annual |
| `baseline_value` | text | Current/starting value |
| `year_1_target` | text | Year 1 target |
| `year_2_target` | text | Year 2 target |
| `year_3_target` | text | Year 3 target |
| `data_source` | text | Where data comes from |
| `responsible_party` | text | Who tracks this |
| `actual_values` | jsonb | {date: value} pairs for actual measurements |
| `created_at` | timestamptz | Record creation |
| `updated_at` | timestamptz | Last modification |

**Indexes:**
- `initiative_id`
- `strategic_goal_id`
- `strategic_plan_id`

**Design Note:** Flexible structure allows KPIs at initiative, goal, or department level

---

### 9. `quarterly_milestones`
**Purpose:** Track implementation timeline progress

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `initiative_id` | uuid | FK to initiatives |
| `fiscal_year_id` | uuid | FK to fiscal_years |
| `quarter` | integer | 1, 2, 3, 4 |
| `milestone_description` | text | What should be accomplished |
| `responsible_party` | text | Name/title |
| `budget_impact` | numeric(12,2) | Spending in this quarter |
| `status` | text | not_started, in_progress, completed, delayed |
| `completion_date` | date | Actual completion date |
| `notes` | text | Progress notes |
| `created_at` | timestamptz | Record creation |
| `updated_at` | timestamptz | Last modification |

**Indexes:**
- `initiative_id`, `fiscal_year_id`, `quarter` (unique together)
- `status`

---

### 10. `initiative_dependencies`
**Purpose:** Track dependencies between initiatives (many-to-many)

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `initiative_id` | uuid | FK to initiatives (dependent initiative) |
| `depends_on_initiative_id` | uuid | FK to initiatives (prerequisite) |
| `dependency_type` | text | internal, external, resource_sharing |
| `nature_of_dependency` | text | Description of dependency |
| `is_critical_path` | boolean | Blocks progress if not met |
| `created_at` | timestamptz | Record creation |

**Indexes:**
- `initiative_id`, `depends_on_initiative_id` (unique together)
- `depends_on_initiative_id` (for reverse lookups)

---

### 11. `initiative_collaborators`
**Purpose:** Cross-departmental initiatives (many-to-many)

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `initiative_id` | uuid | FK to initiatives |
| `department_id` | uuid | FK to departments |
| `role` | text | lead, support, contributor |
| `resources_committed` | text | Description of resources |
| `budget_share` | numeric(12,2) | This department's budget contribution |
| `created_at` | timestamptz | Record creation |

**Indexes:**
- `initiative_id`, `department_id` (unique together)

---

### 12. `users` (extends Supabase auth.users)
**Purpose:** User profiles and roles

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key (matches auth.users.id) |
| `municipality_id` | uuid | FK to municipalities |
| `department_id` | uuid | FK to departments (nullable) |
| `role` | text | admin, department_director, staff, city_manager, finance, council, public |
| `full_name` | text | User's name |
| `title` | text | Job title |
| `email` | text | Email (synced from auth) |
| `avatar_url` | text | Profile image |
| `preferences` | jsonb | UI preferences, notifications |
| `is_active` | boolean | Account status |
| `created_at` | timestamptz | Record creation |
| `updated_at` | timestamptz | Last modification |

**Indexes:**
- `municipality_id`, `role`
- `department_id`

---

### 13. `audit_logs`
**Purpose:** Track all changes to strategic plans and initiatives

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `table_name` | text | Which table was modified |
| `record_id` | uuid | ID of modified record |
| `action` | text | insert, update, delete |
| `old_values` | jsonb | Previous state |
| `new_values` | jsonb | New state |
| `changed_by` | uuid | FK to users |
| `changed_at` | timestamptz | When change occurred |
| `ip_address` | inet | Source IP |
| `user_agent` | text | Browser/client info |

**Indexes:**
- `table_name`, `record_id`
- `changed_by`
- `changed_at`

---

### 14. `document_embeddings` (for RAG/AI)
**Purpose:** Vector embeddings for semantic search and AI analysis

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `content_type` | text | strategic_plan, initiative, goal, uploaded_pdf |
| `content_id` | uuid | FK to relevant table |
| `content_text` | text | Text that was embedded |
| `embedding` | vector(1536) | pgvector embedding (OpenAI ada-002 dimension) |
| `metadata` | jsonb | Additional context for retrieval |
| `created_at` | timestamptz | Record creation |

**Indexes:**
- `content_type`, `content_id`
- HNSW index on `embedding` for vector similarity search

**Design Note:** Enables:
- "Find initiatives similar to this one"
- "What does our plan say about water infrastructure?"
- Comparative analysis across departments/years

---

### 15. `comments`
**Purpose:** Collaborative feedback and discussion

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `entity_type` | text | strategic_plan, initiative, goal |
| `entity_id` | uuid | ID of commented entity |
| `parent_comment_id` | uuid | FK to comments (for threading) |
| `author_id` | uuid | FK to users |
| `content` | text | Comment text |
| `is_resolved` | boolean | For review comments |
| `created_at` | timestamptz | Record creation |
| `updated_at` | timestamptz | Last modification |

**Indexes:**
- `entity_type`, `entity_id`
- `parent_comment_id`

---

## Design Decisions & Rationale

### Why Hybrid?
- **Relational core:** Enables complex queries across plans, departments, years
- **JSONB flexibility:** Template sections evolve; municipalities customize formats
- **Best practice:** Normalize what you query often; embed what you display as units

### Financial Data Strategy
- **Normalized `initiative_budgets`:** Enables aggregation, reporting, funding analysis
- **JSONB `financial_analysis`:** Preserves template structure for detailed breakdowns
- **Both coexist:** Summary in table, detail in JSON

### Multi-Year Handling
- **Fiscal year FK:** Each initiative linked to implementation year
- **Budget columns:** Year 1/2/3 costs on initiative table for convenience
- **Detailed breakdown:** `initiative_budgets` table with year FK for precision

### Audit & Compliance
- **Comprehensive audit log:** Government accountability requirements
- **Status tracking:** Clear workflow states
- **Approval chain:** Captured in strategic_plans table

### AI/RAG Integration
- **Embeddings table:** Separate from core data, can regenerate
- **Flexible content types:** Embed plans, initiatives, uploaded documents
- **Metadata JSONB:** Store fiscal year, department, priority for filtered retrieval

---

## Next Steps

1. **Review this schema** - Does it match your mental model?
2. **Refine together** - What's missing? What should change?
3. **Generate migrations** - I'll create the SQL files
4. **RLS policies** - Define security rules
5. **Seed data** - Create sample data for testing

**What would you like to adjust or explore further?**
