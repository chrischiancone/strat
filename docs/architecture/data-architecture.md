# Data Architecture

## Database Schema Overview

**Philosophy:** Hybrid approach combining normalized relational tables with JSONB flexibility.

### 15 Core Tables

1. **municipalities** - Multi-city support (single city for MVP)
2. **departments** - Organizational units (Water & Field Services, Parks & Rec, IT, etc.)
3. **fiscal_years** - Reference table for fiscal year periods
4. **users** - User profiles and roles (extends Supabase auth.users)
5. **strategic_plans** - The 3-year strategic planning document
6. **strategic_goals** - 3-5 major goals per plan
7. **initiatives** - Individual strategic initiatives (heart of the plan)
8. **initiative_budgets** - Normalized budget tracking for aggregation
9. **initiative_kpis** - Performance metrics / Key Performance Indicators
10. **quarterly_milestones** - Implementation timeline tracking
11. **initiative_dependencies** - Dependencies between initiatives (many-to-many)
12. **initiative_collaborators** - Cross-departmental initiatives (many-to-many)
13. **comments** - Collaborative feedback and discussion
14. **audit_logs** - Track all changes for accountability
15. **document_embeddings** - Vector embeddings for RAG/AI (Phase 2)

### Entity Relationship Diagram

```
municipalities
    ↓ (1:many)
departments ──→ users (many:1)
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
    ├─→ comments (feedback and discussion)
    └─→ audit_logs (change tracking)
```

## TypeScript Data Models

**Core Type Definitions** (`types/database.ts`):

```typescript
// Auto-generated from Supabase CLI
export type Database = {
  public: {
    Tables: {
      strategic_plans: {
        Row: {
          id: string
          department_id: string
          start_fiscal_year_id: string
          end_fiscal_year_id: string
          title: string
          status: 'draft' | 'under_review' | 'approved' | 'active' | 'archived'
          version: string
          executive_summary: string | null
          department_vision: string | null
          swot_analysis: Json | null
          environmental_scan: Json | null
          benchmarking_data: Json | null
          total_investment_amount: number
          approved_by: string | null
          approved_at: string | null
          published_at: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Row, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Insert>
      }
      initiatives: {
        Row: {
          id: string
          strategic_goal_id: string
          lead_department_id: string
          fiscal_year_id: string
          initiative_number: string
          name: string
          priority_level: 'NEED' | 'WANT' | 'NICE_TO_HAVE'
          rank_within_priority: number
          description: string
          rationale: string | null
          expected_outcomes: Json | null
          status: 'not_started' | 'in_progress' | 'at_risk' | 'completed' | 'deferred'
          financial_analysis: Json | null
          roi_analysis: Json | null
          cost_benefit_analysis: Json | null
          total_year_1_cost: number
          total_year_2_cost: number
          total_year_3_cost: number
          responsible_party: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Row, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Insert>
      }
      // ... other tables
    }
    Views: {
      // Materialized views for dashboards
    }
    Functions: {
      // RLS helper functions
    }
  }
}
```

**Application-Level Types** (`types/models.ts`):

```typescript
// Strategic Plan with relationships
export interface StrategicPlanWithRelations {
  id: string
  department: Department
  start_fiscal_year: FiscalYear
  end_fiscal_year: FiscalYear
  title: string
  status: PlanStatus
  goals: StrategicGoalWithInitiatives[]
  total_investment_amount: number
  created_by: User
  created_at: string
  updated_at: string
}

// Initiative with full context
export interface InitiativeWithContext {
  id: string
  strategic_goal: StrategicGoal
  lead_department: Department
  fiscal_year: FiscalYear
  initiative_number: string
  name: string
  priority_level: PriorityLevel
  rank_within_priority: number
  description: string
  status: InitiativeStatus
  financial_analysis: FinancialAnalysis
  roi_analysis: ROIAnalysis
  budgets: InitiativeBudget[]
  kpis: InitiativeKPI[]
  milestones: QuarterlyMilestone[]
  collaborators: InitiativeCollaborator[]
  comments: Comment[]
}

// JSONB Structures
export interface FinancialAnalysis {
  year_1?: YearBudget
  year_2?: YearBudget
  year_3?: YearBudget
  funding_sources: FundingSource[]
}

export interface YearBudget {
  personnel_costs: number
  equipment_technology: number
  professional_services: number
  training_development: number
  materials_supplies: number
  other_costs: number
  total: number
}

export interface FundingSource {
  source: string // "General Fund", "EPA Grant", etc.
  amount: number
  status: 'secured' | 'requested' | 'pending' | 'projected'
}

export interface ROIAnalysis {
  financial: {
    projected_annual_savings: number
    projected_revenue_generation: number
    payback_period_months: number
    three_year_net_impact: number
  }
  non_financial: {
    service_quality_improvement?: string
    efficiency_gains?: string
    risk_reduction?: string
    citizen_satisfaction?: string
    employee_impact?: string
  }
}
```

## Data Access Patterns

**Server Component Data Fetching**:

```typescript
// app/dashboard/page.tsx (Server Component)
import { createServerSupabaseClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = createServerSupabaseClient()

  // RLS automatically filters by user's department
  const { data: plans } = await supabase
    .from('strategic_plans')
    .select(`
      *,
      department:departments(*),
      start_fiscal_year:fiscal_years!start_fiscal_year_id(*),
      goals:strategic_goals(
        *,
        initiatives(*)
      )
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  return <DashboardView plans={plans} />
}
```

**Client Component Data Fetching** (rare, prefer Server Components):

```typescript
// components/InitiativeForm.tsx (Client Component)
'use client'

import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'

export function InitiativeForm() {
  const supabase = createBrowserSupabaseClient()
  const [goals, setGoals] = useState([])

  useEffect(() => {
    supabase
      .from('strategic_goals')
      .select('*')
      .then(({ data }) => setGoals(data || []))
  }, [])

  return <form>...</form>
}
```

**Server Actions for Mutations**:

```typescript
// app/actions/initiatives.ts
'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const initiativeSchema = z.object({
  strategic_goal_id: z.string().uuid(),
  name: z.string().min(5),
  priority_level: z.enum(['NEED', 'WANT', 'NICE_TO_HAVE']),
  description: z.string().min(20),
  // ... other fields
})

export async function createInitiative(formData: FormData) {
  const supabase = createServerSupabaseClient()

  // Parse and validate
  const parsed = initiativeSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { error: parsed.error.flatten() }
  }

  // Insert (RLS enforces department access)
  const { data, error } = await supabase
    .from('initiatives')
    .insert(parsed.data)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  // Revalidate cache
  revalidatePath('/dashboard')
  revalidatePath(`/initiatives/${data.id}`)

  return { data }
}
```

---
