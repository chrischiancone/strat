# Strategic Planning System - Full-Stack Architecture

**Project Name:** Stratic Plan
**Version:** 1.0
**Last Updated:** January 9, 2025
**Status:** Architecture Approved

---

## Table of Contents

1. [High-Level Architecture](#high-level-architecture)
2. [Technology Stack](#technology-stack)
3. [Data Architecture](#data-architecture)
4. [API Architecture](#api-architecture)
5. [Frontend Architecture](#frontend-architecture)
6. [Backend Architecture](#backend-architecture)
7. [Security Architecture](#security-architecture)
8. [Project Structure](#project-structure)
9. [Development Workflow](#development-workflow)
10. [Deployment Architecture](#deployment-architecture)
11. [Performance Strategy](#performance-strategy)
12. [Testing Strategy](#testing-strategy)
13. [Monitoring & Observability](#monitoring--observability)
14. [Coding Standards](#coding-standards)
15. [Error Handling](#error-handling)

---

## High-Level Architecture

### System Overview

The Strategic Planning System is a full-stack web application built with Next.js 14+ and Supabase, designed to digitize municipal government strategic planning processes. The system reduces plan creation time from 40-50 hours to <25 hours while enabling real-time collaboration, automated budget validation, and comprehensive reporting.

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
│  Next.js 14+ App Router (React Server Components + Client)      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Department  │  │ City Manager │  │   Finance    │          │
│  │  Dashboard   │  │  Dashboard   │  │  Dashboard   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│  ┌─────────────────────────────────────────────────┐            │
│  │        Shared Component Library (shadcn/ui)     │            │
│  └─────────────────────────────────────────────────┘            │
└─────────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API/MIDDLEWARE LAYER                        │
│  Next.js Server Actions + Route Handlers                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Supabase     │  │  Business    │  │  PDF/Export  │          │
│  │ Client (SSR) │  │  Logic       │  │  Services    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND SERVICES                            │
│                   Supabase (BaaS Platform)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  PostgreSQL  │  │  Auth & RLS  │  │   Storage    │          │
│  │  + pgvector  │  │   Policies   │  │  (Files)     │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  PostgREST   │  │  Edge Funcs  │  │  Realtime    │          │
│  │  (Auto API)  │  │  (Optional)  │  │  (Optional)  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    INFRASTRUCTURE LAYER                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Vercel CDN  │  │   Supabase   │  │   GitHub     │          │
│  │  (Hosting)   │  │   Cloud      │  │  (VCS/CI)    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

### Architecture Principles

1. **Server-First Rendering**: Use React Server Components (RSC) for data fetching, Client Components only for interactivity
2. **Type Safety**: End-to-end TypeScript with Zod validation and generated Supabase types
3. **Security by Default**: Row-Level Security (RLS) enforced at database level, not application level
4. **Progressive Enhancement**: Core functionality works without JavaScript, enhanced with client-side features
5. **Hybrid Data Model**: Normalized relational tables + JSONB flexibility
6. **API-less Architecture**: Direct database access via Supabase client (RLS-protected), no custom REST/GraphQL layer

---

## Technology Stack

### Complete Tech Stack Table

| Layer | Technology | Version | Purpose | Justification |
|-------|------------|---------|---------|---------------|
| **Frontend Framework** | Next.js | 14.x | Server/client rendering, routing | Industry standard, RSC support, Vercel integration |
| **UI Library** | React | 18.x | Component-based UI | Foundation for Next.js, hooks ecosystem |
| **Language** | TypeScript | 5.x | Type safety | Catch errors at compile time, better DX |
| **Styling** | TailwindCSS | 3.x | Utility-first CSS | Rapid development, consistent design system |
| **Component Library** | shadcn/ui | latest | Pre-built accessible components | Built on Radix UI, customizable, copy-paste approach |
| **Form Management** | React Hook Form | 7.x | Complex form handling | Performance, validation integration |
| **Validation** | Zod | 3.x | Schema validation | Type inference, runtime safety |
| **Data Visualization** | Recharts | 2.x | Charts and graphs | React-native, declarative API |
| **Database** | PostgreSQL | 15.x | Primary data store | JSONB support, vector search (pgvector) |
| **BaaS Platform** | Supabase | latest | Backend infrastructure | Auth, RLS, auto-generated API, migrations |
| **Auth** | Supabase Auth | built-in | User authentication | Email/password, OAuth, RLS integration |
| **ORM** | Supabase Client | latest | Database access | Type-safe queries, RLS enforcement |
| **PDF Generation** | react-pdf | 3.x | Export to PDF | City Council reports, plan exports |
| **State Management** | React Context | built-in | Global state (minimal) | User session, theme, avoid Zustand unless needed |
| **HTTP Client** | fetch (native) | built-in | API calls | Server Actions preferred, fallback to fetch |
| **Date Handling** | date-fns | 2.x | Date manipulation | Lighter than moment.js |
| **Markdown** | react-markdown | 8.x | Render markdown comments | Comments, rich text display |
| **Icons** | Lucide React | latest | Icon library | Tree-shakeable, modern design |
| **Hosting** | Vercel | latest | Next.js hosting | Optimized for Next.js, edge functions |
| **CI/CD** | GitHub Actions | built-in | Automated testing, deployment | Free for public repos, Vercel integration |
| **Monitoring** | Vercel Analytics | built-in | Performance monitoring | Built-in, zero-config |
| **Error Tracking** | Sentry (optional) | latest | Error monitoring | Production error tracking |

### Key Dependencies

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "typescript": "^5.0.0",
    "@supabase/supabase-js": "^2.38.0",
    "@supabase/ssr": "^0.0.10",
    "tailwindcss": "^3.4.0",
    "react-hook-form": "^7.49.0",
    "zod": "^3.22.4",
    "@hookform/resolvers": "^3.3.4",
    "recharts": "^2.10.0",
    "@react-pdf/renderer": "^3.1.14",
    "date-fns": "^2.30.0",
    "react-markdown": "^8.0.7",
    "lucide-react": "^0.303.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.2.0"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "eslint": "^8.56.0",
    "eslint-config-next": "^14.0.0",
    "prettier": "^3.1.0",
    "prettier-plugin-tailwindcss": "^0.5.0",
    "@playwright/test": "^1.40.0",
    "vitest": "^1.1.0",
    "@testing-library/react": "^14.1.0"
  }
}
```

---

## Data Architecture

### Database Schema Overview

**Philosophy:** Hybrid approach combining normalized relational tables with JSONB flexibility.

#### 15 Core Tables

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

#### Entity Relationship Diagram

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

### TypeScript Data Models

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

### Data Access Patterns

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

## API Architecture

### API Strategy: Database-First (PostgREST)

**No custom REST or GraphQL API**. Supabase auto-generates a RESTful API via PostgREST based on database schema. All API calls are database queries through the Supabase client.

#### Supabase Client API Patterns

**Query Builder Syntax**:

```typescript
// SELECT with joins
const { data, error } = await supabase
  .from('initiatives')
  .select(`
    *,
    strategic_goal:strategic_goals(*),
    department:departments(*),
    budgets:initiative_budgets(*),
    kpis:initiative_kpis(*)
  `)
  .eq('status', 'in_progress')
  .order('rank_within_priority')
```

**Insert/Update/Delete**:

```typescript
// INSERT
const { data, error } = await supabase
  .from('initiatives')
  .insert({ name: 'New Initiative', ... })
  .select()
  .single()

// UPDATE
const { error } = await supabase
  .from('initiatives')
  .update({ status: 'completed' })
  .eq('id', initiativeId)

// DELETE (soft delete preferred)
const { error } = await supabase
  .from('strategic_plans')
  .update({ status: 'archived' })
  .eq('id', planId)
```

**Real-time Subscriptions** (Phase 2):

```typescript
const channel = supabase
  .channel('plan-changes')
  .on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'strategic_plans',
      filter: `id=eq.${planId}`,
    },
    (payload) => {
      console.log('Plan updated:', payload)
    }
  )
  .subscribe()
```

### Server Actions as API Endpoints

For complex operations, use Next.js Server Actions instead of REST endpoints:

```typescript
// app/actions/budgets.ts
'use server'

export async function validateBudget(initiativeId: string) {
  const supabase = createServerSupabaseClient()

  // Fetch initiative with budgets
  const { data: initiative } = await supabase
    .from('initiatives')
    .select('*, budgets:initiative_budgets(*)')
    .eq('id', initiativeId)
    .single()

  // Business logic: validate funding sources sum to total
  const totalBudget =
    initiative.total_year_1_cost +
    initiative.total_year_2_cost +
    initiative.total_year_3_cost

  const totalFunding = initiative.financial_analysis.funding_sources
    .reduce((sum, source) => sum + source.amount, 0)

  if (Math.abs(totalBudget - totalFunding) > 0.01) {
    return {
      valid: false,
      error: `Budget mismatch: Total=$${totalBudget}, Funding=$${totalFunding}`,
    }
  }

  return { valid: true }
}
```

### API Security

All API access is secured via Supabase RLS policies (see [Security Architecture](#security-architecture)).

---

## Frontend Architecture

### Next.js App Router Structure

```
app/
├── (auth)/                    # Auth group (different layout)
│   ├── login/
│   └── signup/
├── (dashboard)/               # Dashboard group (authenticated)
│   ├── dashboard/
│   ├── plans/
│   │   ├── page.tsx          # List all plans
│   │   ├── [id]/
│   │   │   ├── page.tsx      # Plan detail (Server Component)
│   │   │   ├── edit/
│   │   │   │   └── page.tsx  # Plan edit form
│   │   │   └── goals/
│   │   │       └── [goalId]/
│   │   │           └── initiatives/
│   │   │               └── [initiativeId]/
│   │   │                   └── page.tsx
│   │   └── new/
│   │       └── page.tsx      # Create new plan
│   ├── initiatives/
│   ├── budgets/
│   ├── reports/
│   └── settings/
├── admin/                     # Admin pages (separate layout)
│   ├── users/
│   ├── departments/
│   └── audit-logs/
├── api/                       # Route handlers (minimal use)
│   └── export-pdf/
│       └── route.ts
├── actions/                   # Server Actions (mutations)
│   ├── plans.ts
│   ├── initiatives.ts
│   └── budgets.ts
├── layout.tsx                 # Root layout
└── page.tsx                   # Home page
```

### Component Architecture

**Atomic Design Pattern**:

```
components/
├── ui/                        # shadcn/ui primitives
│   ├── button.tsx
│   ├── input.tsx
│   ├── dialog.tsx
│   └── ...
├── atoms/                     # Basic building blocks
│   ├── StatusBadge.tsx
│   ├── PriorityIcon.tsx
│   └── CurrencyDisplay.tsx
├── molecules/                 # Composed components
│   ├── InitiativeCard.tsx
│   ├── BudgetSummary.tsx
│   └── CommentThread.tsx
├── organisms/                 # Complex features
│   ├── InitiativeForm.tsx
│   ├── BudgetTable.tsx
│   ├── DashboardCharts.tsx
│   └── PlanHeader.tsx
├── templates/                 # Page layouts
│   ├── DashboardLayout.tsx
│   ├── PlanLayout.tsx
│   └── ReportLayout.tsx
└── providers/                 # Context providers
    ├── AuthProvider.tsx
    ├── ThemeProvider.tsx
    └── SupabaseProvider.tsx
```

### Server Components vs. Client Components

**Default to Server Components** (fetch data, render static content):

```typescript
// components/PlanList.tsx (Server Component)
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function PlanList() {
  const supabase = createServerSupabaseClient()
  const { data: plans } = await supabase
    .from('strategic_plans')
    .select('*')

  return (
    <div>
      {plans.map(plan => (
        <PlanCard key={plan.id} plan={plan} />
      ))}
    </div>
  )
}
```

**Use Client Components** only for interactivity:

```typescript
// components/InitiativeForm.tsx (Client Component)
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createInitiative } from '@/app/actions/initiatives'

export function InitiativeForm() {
  const form = useForm({
    resolver: zodResolver(initiativeSchema),
  })

  async function onSubmit(data) {
    const result = await createInitiative(data)
    if (result.error) {
      form.setError('root', { message: result.error })
    } else {
      // Success feedback
    }
  }

  return <form onSubmit={form.handleSubmit(onSubmit)}>...</form>
}
```

### State Management Strategy

**Minimize client-side state**. Prefer:

1. **Server state** (database, Server Components)
2. **URL state** (searchParams, route params)
3. **Form state** (React Hook Form)
4. **Local state** (useState for UI-only state)

**Only use Context** for truly global client state:

```typescript
// app/providers/AuthProvider.tsx
'use client'

import { createContext, useContext } from 'react'
import { User } from '@supabase/supabase-js'

const AuthContext = createContext<{ user: User | null }>({ user: null })

export function AuthProvider({
  children,
  user
}: {
  children: React.ReactNode
  user: User | null
}) {
  return (
    <AuthContext.Provider value={{ user }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
```

### Form Handling Pattern

**Standard Form with React Hook Form + Zod**:

```typescript
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createInitiative } from '@/app/actions/initiatives'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const initiativeSchema = z.object({
  name: z.string().min(5, 'Name must be at least 5 characters'),
  priority_level: z.enum(['NEED', 'WANT', 'NICE_TO_HAVE']),
  description: z.string().min(20),
})

type InitiativeFormData = z.infer<typeof initiativeSchema>

export function InitiativeForm({ goalId }: { goalId: string }) {
  const form = useForm<InitiativeFormData>({
    resolver: zodResolver(initiativeSchema),
    defaultValues: {
      name: '',
      priority_level: 'NEED',
      description: '',
    },
  })

  async function onSubmit(data: InitiativeFormData) {
    const result = await createInitiative({ ...data, strategic_goal_id: goalId })
    if (result.error) {
      form.setError('root', { message: result.error })
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <Input
        {...form.register('name')}
        placeholder="Initiative name"
      />
      {form.formState.errors.name && (
        <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
      )}

      <select {...form.register('priority_level')}>
        <option value="NEED">NEED</option>
        <option value="WANT">WANT</option>
        <option value="NICE_TO_HAVE">NICE TO HAVE</option>
      </select>

      <Button type="submit" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? 'Creating...' : 'Create Initiative'}
      </Button>
    </form>
  )
}
```

---

## Backend Architecture

### Supabase RLS (Row-Level Security)

**Core security layer**. All data access is controlled at the database level via RLS policies.

#### RLS Helper Functions

```sql
-- Get current user's municipality
CREATE OR REPLACE FUNCTION auth.user_municipality_id()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT municipality_id FROM public.users WHERE id = auth.uid();
$$;

-- Get current user's department
CREATE OR REPLACE FUNCTION auth.user_department_id()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT department_id FROM public.users WHERE id = auth.uid();
$$;

-- Get current user's role
CREATE OR REPLACE FUNCTION auth.user_role()
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$;

-- Check if user is admin or city manager
CREATE OR REPLACE FUNCTION auth.is_admin_or_manager()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT role IN ('admin', 'city_manager') FROM public.users WHERE id = auth.uid();
$$;
```

#### RLS Policy Examples

**Strategic Plans - Department Scoped**:

```sql
-- Department users can view their own plans
CREATE POLICY "Users can view own department plans"
ON strategic_plans
FOR SELECT
USING (
  department_id = auth.user_department_id()
  OR auth.is_admin_or_manager()
);

-- Department directors can create plans
CREATE POLICY "Directors can create plans"
ON strategic_plans
FOR INSERT
WITH CHECK (
  department_id = auth.user_department_id()
  AND auth.user_role() IN ('admin', 'department_director')
);

-- Department directors can update their drafts
CREATE POLICY "Directors can update own drafts"
ON strategic_plans
FOR UPDATE
USING (
  department_id = auth.user_department_id()
  AND status IN ('draft', 'under_review')
  AND auth.user_role() IN ('admin', 'department_director')
);

-- City Manager can approve plans
CREATE POLICY "City Manager can approve plans"
ON strategic_plans
FOR UPDATE
USING (auth.user_role() = 'city_manager')
WITH CHECK (
  status IN ('approved', 'active')
  AND auth.user_role() = 'city_manager'
);
```

**Initiatives - Cross-Department Collaboration**:

```sql
-- Users can view initiatives from their department or collaborating departments
CREATE POLICY "Users can view accessible initiatives"
ON initiatives
FOR SELECT
USING (
  lead_department_id = auth.user_department_id()
  OR EXISTS (
    SELECT 1 FROM initiative_collaborators
    WHERE initiative_id = initiatives.id
    AND department_id = auth.user_department_id()
  )
  OR auth.is_admin_or_manager()
);
```

**Comments - Universal Access**:

```sql
-- Any authenticated user can view comments on entities they can access
CREATE POLICY "Users can view comments"
ON comments
FOR SELECT
USING (
  CASE entity_type
    WHEN 'strategic_plan' THEN EXISTS (
      SELECT 1 FROM strategic_plans
      WHERE id = comments.entity_id
      AND (department_id = auth.user_department_id() OR auth.is_admin_or_manager())
    )
    WHEN 'initiative' THEN EXISTS (
      SELECT 1 FROM initiatives
      WHERE id = comments.entity_id
      AND (lead_department_id = auth.user_department_id() OR auth.is_admin_or_manager())
    )
    ELSE false
  END
);

-- Users can create comments
CREATE POLICY "Authenticated users can create comments"
ON comments
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);
```

### Database Triggers

**Audit Log Trigger**:

```sql
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF (TG_OP = 'DELETE') THEN
    INSERT INTO audit_logs (
      table_name,
      record_id,
      action,
      old_values,
      changed_by,
      changed_at
    ) VALUES (
      TG_TABLE_NAME,
      OLD.id,
      'delete',
      to_jsonb(OLD),
      auth.uid(),
      now()
    );
    RETURN OLD;
  ELSIF (TG_OP = 'UPDATE') THEN
    INSERT INTO audit_logs (
      table_name,
      record_id,
      action,
      old_values,
      new_values,
      changed_by,
      changed_at
    ) VALUES (
      TG_TABLE_NAME,
      NEW.id,
      'update',
      to_jsonb(OLD),
      to_jsonb(NEW),
      auth.uid(),
      now()
    );
    RETURN NEW;
  ELSIF (TG_OP = 'INSERT') THEN
    INSERT INTO audit_logs (
      table_name,
      record_id,
      action,
      new_values,
      changed_by,
      changed_at
    ) VALUES (
      TG_TABLE_NAME,
      NEW.id,
      'insert',
      to_jsonb(NEW),
      auth.uid(),
      now()
    );
    RETURN NEW;
  END IF;
END;
$$;

-- Apply to strategic_plans
CREATE TRIGGER strategic_plans_audit
AFTER INSERT OR UPDATE OR DELETE ON strategic_plans
FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Apply to initiatives
CREATE TRIGGER initiatives_audit
AFTER INSERT OR UPDATE OR DELETE ON initiatives
FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
```

### Database Indexes

**Performance-critical indexes**:

```sql
-- Strategic Plans
CREATE INDEX idx_strategic_plans_department_status
ON strategic_plans(department_id, status);

CREATE INDEX idx_strategic_plans_fiscal_year
ON strategic_plans(start_fiscal_year_id);

-- Initiatives
CREATE INDEX idx_initiatives_goal
ON initiatives(strategic_goal_id);

CREATE INDEX idx_initiatives_priority_rank
ON initiatives(priority_level, rank_within_priority);

CREATE INDEX idx_initiatives_status
ON initiatives(status);

-- Initiative Budgets
CREATE INDEX idx_initiative_budgets_fiscal_year
ON initiative_budgets(fiscal_year_id, funding_source);

-- Comments
CREATE INDEX idx_comments_entity
ON comments(entity_type, entity_id);

-- Audit Logs
CREATE INDEX idx_audit_logs_table_record
ON audit_logs(table_name, record_id);

CREATE INDEX idx_audit_logs_changed_at
ON audit_logs(changed_at DESC);
```

---

## Security Architecture

### Authentication Flow

**Supabase Auth with Email/Password** (MVP):

```typescript
// lib/supabase/auth.ts
import { createBrowserSupabaseClient } from './client'

export async function signUp(email: string, password: string) {
  const supabase = createBrowserSupabaseClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${location.origin}/auth/callback`,
    },
  })
  return { data, error }
}

export async function signIn(email: string, password: string) {
  const supabase = createBrowserSupabaseClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export async function signOut() {
  const supabase = createBrowserSupabaseClient()
  const { error } = await supabase.auth.signOut()
  return { error }
}
```

**Protected Route Middleware**:

```typescript
// middleware.ts
import { createMiddlewareSupabaseClient } from '@/lib/supabase/middleware'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const supabase = createMiddlewareSupabaseClient(request, response)

  const { data: { session } } = await supabase.auth.getSession()

  // Redirect to login if not authenticated
  if (!session && !request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redirect to dashboard if authenticated and trying to access login
  if (session && request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/plans/:path*',
    '/initiatives/:path*',
    '/admin/:path*',
  ],
}
```

### Authorization (Role-Based Access Control)

**7 User Roles**:

1. **admin** - Full access to all data, user management
2. **department_director** - Create/edit plans for their department
3. **staff** - Edit plans if granted access by director
4. **city_manager** - View all plans, approve plans, city-wide dashboards
5. **finance** - View all budgets, comment on budgets
6. **council** - View approved/active plans (read-only)
7. **public** - View published plans only

**Role Check Utility**:

```typescript
// lib/auth/roles.ts
import { Database } from '@/types/database'

type UserRole = Database['public']['Tables']['users']['Row']['role']

export function canEditPlan(
  userRole: UserRole,
  userDepartmentId: string,
  planDepartmentId: string,
  planStatus: string
): boolean {
  if (userRole === 'admin') return true
  if (userRole === 'city_manager') return false
  if (userDepartmentId !== planDepartmentId) return false
  if (planStatus === 'approved' || planStatus === 'active') return false
  return ['department_director', 'staff'].includes(userRole)
}

export function canApprovePlan(userRole: UserRole): boolean {
  return ['admin', 'city_manager'].includes(userRole)
}

export function canViewAllDepartments(userRole: UserRole): boolean {
  return ['admin', 'city_manager', 'finance'].includes(userRole)
}
```

### Data Validation

**Server-Side Validation with Zod**:

```typescript
// lib/validation/initiative.ts
import { z } from 'zod'

export const initiativeSchema = z.object({
  strategic_goal_id: z.string().uuid('Invalid goal ID'),
  name: z.string()
    .min(5, 'Name must be at least 5 characters')
    .max(200, 'Name too long'),
  priority_level: z.enum(['NEED', 'WANT', 'NICE_TO_HAVE']),
  rank_within_priority: z.number().int().positive(),
  description: z.string().min(20, 'Description too short'),
  financial_analysis: z.object({
    year_1: z.object({
      personnel_costs: z.number().nonnegative(),
      equipment_technology: z.number().nonnegative(),
      professional_services: z.number().nonnegative(),
      training_development: z.number().nonnegative(),
      materials_supplies: z.number().nonnegative(),
      other_costs: z.number().nonnegative(),
      total: z.number().nonnegative(),
    }).refine(
      (data) => {
        const sum = data.personnel_costs +
                    data.equipment_technology +
                    data.professional_services +
                    data.training_development +
                    data.materials_supplies +
                    data.other_costs
        return Math.abs(sum - data.total) < 0.01
      },
      { message: 'Budget categories must sum to total' }
    ),
    funding_sources: z.array(
      z.object({
        source: z.string(),
        amount: z.number().positive(),
        status: z.enum(['secured', 'requested', 'pending', 'projected']),
      })
    ).min(1, 'At least one funding source required'),
  }),
})

export type InitiativeInput = z.infer<typeof initiativeSchema>
```

### Security Best Practices

1. **Never expose database credentials** - Use environment variables
2. **RLS is mandatory** - Enable RLS on all tables
3. **Validate all inputs** - Use Zod schemas server-side
4. **Sanitize JSONB data** - Prevent JSON injection
5. **Audit all changes** - Use audit_logs table
6. **Use HTTPS only** - Enforce in production
7. **Rate limiting** - Supabase provides built-in rate limiting
8. **Content Security Policy** - Configure in next.config.js

---

## Project Structure

### Complete Directory Structure

```
strategic-planning-system/
├── .github/
│   └── workflows/
│       ├── ci.yml                 # Run tests on PR
│       └── deploy.yml             # Deploy to Vercel
├── app/                           # Next.js App Router
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── signup/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   │   ├── page.tsx           # Main dashboard
│   │   │   └── loading.tsx
│   │   ├── plans/
│   │   │   ├── page.tsx           # List plans
│   │   │   ├── [id]/
│   │   │   │   ├── page.tsx       # Plan detail
│   │   │   │   ├── edit/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── goals/
│   │   │   │       └── [goalId]/
│   │   │   │           └── initiatives/
│   │   │   │               └── [initiativeId]/
│   │   │   │                   └── page.tsx
│   │   │   └── new/
│   │   │       └── page.tsx
│   │   ├── initiatives/
│   │   ├── budgets/
│   │   ├── reports/
│   │   └── layout.tsx
│   ├── admin/
│   │   ├── users/
│   │   ├── departments/
│   │   ├── audit-logs/
│   │   └── layout.tsx
│   ├── api/
│   │   └── export-pdf/
│   │       └── route.ts
│   ├── actions/                   # Server Actions
│   │   ├── plans.ts
│   │   ├── initiatives.ts
│   │   └── budgets.ts
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Home page
│   └── globals.css                # Global styles
├── components/
│   ├── ui/                        # shadcn/ui components
│   ├── atoms/
│   ├── molecules/
│   ├── organisms/
│   ├── templates/
│   └── providers/
├── lib/
│   ├── supabase/
│   │   ├── client.ts              # Browser client
│   │   ├── server.ts              # Server client
│   │   ├── middleware.ts          # Middleware client
│   │   └── auth.ts                # Auth helpers
│   ├── auth/
│   │   └── roles.ts               # Role utilities
│   ├── validation/
│   │   ├── plan.ts
│   │   ├── initiative.ts
│   │   └── budget.ts
│   ├── utils/
│   │   ├── cn.ts                  # Class merger
│   │   ├── currency.ts
│   │   └── date.ts
│   └── pdf/
│       └── generator.ts           # PDF export logic
├── types/
│   ├── database.ts                # Auto-generated Supabase types
│   └── models.ts                  # Application types
├── supabase/
│   ├── migrations/                # Database migrations
│   │   ├── 20250109000001_create_core_tables.sql
│   │   ├── 20250109000002_create_planning_tables.sql
│   │   ├── 20250109000003_create_supporting_tables.sql
│   │   ├── 20250109000004_create_system_tables.sql
│   │   ├── 20250109000005_enable_rls_policies.sql
│   │   └── 20250109000006_seed_data.sql
│   ├── config.toml                # Supabase config
│   └── seed.sql                   # Test data
├── docs/                          # Documentation
│   ├── prd/                       # Product Requirements
│   ├── epics/                     # User stories
│   ├── architecture.md            # This file
│   └── database-schema-overview.md
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── public/
│   ├── images/
│   └── fonts/
├── .env.local                     # Local environment variables
├── .env.example                   # Example env file
├── next.config.js                 # Next.js config
├── tailwind.config.ts             # Tailwind config
├── tsconfig.json                  # TypeScript config
├── package.json
└── README.md
```

### Environment Variables

**.env.local**:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional: Third-party services
SENTRY_DSN=
VERCEL_ANALYTICS_ID=
```

**.env.production** (Vercel):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-prod-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-prod-service-role-key
NEXT_PUBLIC_APP_URL=https://strategic-planning.yourdomain.com
```

---

## Development Workflow

### Local Development Setup

```bash
# 1. Clone repository
git clone https://github.com/your-org/strategic-planning-system.git
cd strategic-planning-system

# 2. Install dependencies
npm install

# 3. Start Supabase locally
npx supabase start

# 4. Copy environment variables
cp .env.example .env.local
# Edit .env.local with Supabase credentials from `supabase status`

# 5. Run database migrations
npx supabase db push

# 6. Generate TypeScript types
npx supabase gen types typescript --local > types/database.ts

# 7. Start development server
npm run dev
```

### Git Workflow

**Branch Strategy**:

- `main` - Production-ready code
- `develop` - Integration branch
- `feature/epic-1-story-1.1` - Feature branches

**Commit Convention**:

```
type(scope): subject

[optional body]

[optional footer]
```

Examples:
- `feat(initiatives): add create initiative form`
- `fix(budgets): correct funding source validation`
- `docs(readme): update setup instructions`

### Code Review Checklist

- [ ] TypeScript compiles without errors
- [ ] All tests pass
- [ ] RLS policies tested for role
- [ ] Zod schema validation present
- [ ] No console.logs left in code
- [ ] Accessibility tested (keyboard navigation)
- [ ] Mobile responsive
- [ ] Error handling implemented

---

## Deployment Architecture

### Infrastructure Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Vercel Edge Network                   │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐   │
│  │ US-East │  │ US-West │  │  Europe │  │  Asia   │   │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘   │
│            Global CDN (Cached Assets)                    │
└─────────────────────────────────────────────────────────┘
                        ▼
┌─────────────────────────────────────────────────────────┐
│              Next.js Application (Vercel)                │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Server Components (SSR)                         │   │
│  │  - Render on-demand                              │   │
│  │  - Direct Supabase access                        │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Client Components (Browser)                     │   │
│  │  - Minimal JavaScript                            │   │
│  │  - Supabase client for real-time                 │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                        ▼
┌─────────────────────────────────────────────────────────┐
│                  Supabase Cloud                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  PostgreSQL  │  │  Auth & RLS  │  │   Storage    │  │
│  │  (Primary)   │  │              │  │   (Files)    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│  ┌──────────────┐  ┌──────────────┐                     │
│  │  PostgREST   │  │  Realtime    │                     │
│  │  (API)       │  │  (WebSocket) │                     │
│  └──────────────┘  └──────────────┘                     │
└─────────────────────────────────────────────────────────┘
```

### Deployment Process

**Automatic Deployment via GitHub Actions**:

```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Build
        run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

**Database Migrations**:

```bash
# Run migrations on Supabase cloud
npx supabase db push --db-url $DATABASE_URL

# Or via Supabase CLI (connected to project)
npx supabase link --project-ref your-project-ref
npx supabase db push
```

### Environment-Specific Configuration

**next.config.js**:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['your-project.supabase.co'],
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/dashboard',
        permanent: false,
        has: [{ type: 'cookie', key: 'sb-access-token' }],
      },
    ]
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
```

---

## Performance Strategy

### Performance Targets

- **First Contentful Paint (FCP)**: < 1.5s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Time to Interactive (TTI)**: < 3.5s
- **Total Blocking Time (TBT)**: < 300ms
- **Cumulative Layout Shift (CLS)**: < 0.1

### Optimization Techniques

**1. Server Components by Default**:

```typescript
// ✅ Good: Server Component (no client JS)
export default async function PlanPage({ params }) {
  const plan = await fetchPlan(params.id) // Server-side
  return <PlanView plan={plan} />
}

// ❌ Bad: Client Component when not needed
'use client'
export default function PlanPage({ params }) {
  const [plan, setPlan] = useState(null)
  useEffect(() => {
    fetchPlan(params.id).then(setPlan)
  }, [params.id])
  return <PlanView plan={plan} />
}
```

**2. Streaming with Suspense**:

```typescript
import { Suspense } from 'react'

export default function DashboardPage() {
  return (
    <div>
      <Suspense fallback={<ChartsSkeleton />}>
        <DashboardCharts /> {/* Server Component, async data fetch */}
      </Suspense>

      <Suspense fallback={<TableSkeleton />}>
        <InitiativeTable />
      </Suspense>
    </div>
  )
}
```

**3. Database Query Optimization**:

```typescript
// ✅ Good: Select only needed columns
const { data } = await supabase
  .from('initiatives')
  .select('id, name, status, total_year_1_cost')
  .eq('strategic_goal_id', goalId)

// ❌ Bad: Select all columns
const { data } = await supabase
  .from('initiatives')
  .select('*')
```

**4. Caching Strategy**:

```typescript
// Page-level caching (Next.js)
export const revalidate = 60 // Revalidate every 60 seconds

// Route segment config
export const dynamic = 'force-static' // Static generation
export const fetchCache = 'force-cache'
```

**5. Image Optimization**:

```typescript
import Image from 'next/image'

<Image
  src="/department-logo.png"
  alt="Department Logo"
  width={200}
  height={100}
  priority // For above-the-fold images
/>
```

**6. Bundle Size Optimization**:

```javascript
// Dynamic imports for large components
import dynamic from 'next/dynamic'

const PDFExporter = dynamic(() => import('@/components/PDFExporter'), {
  loading: () => <LoadingSpinner />,
  ssr: false, // Only load on client
})
```

---

## Testing Strategy

### Testing Pyramid

```
     ┌─────────────┐
     │   E2E (10%)  │  Playwright - Critical user flows
     └─────────────┘
    ┌───────────────┐
    │ Integration   │  Vitest - Component + DB
    │     (30%)     │
    └───────────────┘
   ┌─────────────────┐
   │   Unit (60%)    │  Vitest - Business logic
   └─────────────────┘
```

### Unit Tests (Vitest)

```typescript
// tests/unit/budget-validation.test.ts
import { describe, it, expect } from 'vitest'
import { validateBudget } from '@/lib/validation/budget'

describe('validateBudget', () => {
  it('should return valid for matching totals', () => {
    const budget = {
      year_1: {
        personnel_costs: 75000,
        equipment_technology: 50000,
        professional_services: 25000,
        training_development: 10000,
        materials_supplies: 5000,
        other_costs: 0,
        total: 165000,
      },
      funding_sources: [
        { source: 'General Fund', amount: 100000, status: 'secured' },
        { source: 'EPA Grant', amount: 65000, status: 'pending' },
      ],
    }

    const result = validateBudget(budget)
    expect(result.valid).toBe(true)
  })

  it('should return error for mismatched totals', () => {
    const budget = {
      year_1: {
        personnel_costs: 75000,
        equipment_technology: 50000,
        professional_services: 25000,
        training_development: 10000,
        materials_supplies: 5000,
        other_costs: 0,
        total: 200000, // Wrong total
      },
      funding_sources: [
        { source: 'General Fund', amount: 100000, status: 'secured' },
      ],
    }

    const result = validateBudget(budget)
    expect(result.valid).toBe(false)
    expect(result.error).toContain('Budget mismatch')
  })
})
```

### Integration Tests

```typescript
// tests/integration/create-initiative.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createClient } from '@supabase/supabase-js'
import { createInitiative } from '@/app/actions/initiatives'

describe('createInitiative', () => {
  let supabase
  let testGoalId

  beforeAll(async () => {
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Create test goal
    const { data: goal } = await supabase
      .from('strategic_goals')
      .insert({ title: 'Test Goal', ... })
      .select()
      .single()
    testGoalId = goal.id
  })

  afterAll(async () => {
    // Cleanup
    await supabase
      .from('strategic_goals')
      .delete()
      .eq('id', testGoalId)
  })

  it('should create initiative successfully', async () => {
    const formData = new FormData()
    formData.append('strategic_goal_id', testGoalId)
    formData.append('name', 'Test Initiative')
    formData.append('priority_level', 'NEED')
    formData.append('description', 'This is a test initiative description.')

    const result = await createInitiative(formData)

    expect(result.error).toBeUndefined()
    expect(result.data).toBeDefined()
    expect(result.data.name).toBe('Test Initiative')
  })
})
```

### End-to-End Tests (Playwright)

```typescript
// tests/e2e/create-plan.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Strategic Plan Creation', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login')
    await page.fill('[name="email"]', 'director@carrollton.gov')
    await page.fill('[name="password"]', 'test-password')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
  })

  test('should create new strategic plan', async ({ page }) => {
    // Navigate to create plan
    await page.click('text=Create New Plan')
    await expect(page).toHaveURL(/\/plans\/new/)

    // Fill form
    await page.fill('[name="title"]', 'FY2026-2028 Strategic Plan')
    await page.fill('[name="executive_summary"]', 'This is a test summary.')

    // Submit
    await page.click('button:has-text("Create Plan")')

    // Verify redirect and success
    await page.waitForURL(/\/plans\/[a-f0-9-]+/)
    await expect(page.locator('h1')).toContainText('FY2026-2028 Strategic Plan')
  })
})
```

---

## Monitoring & Observability

### Logging Strategy

**Structured Logging with Pino** (optional):

```typescript
// lib/logger.ts
import pino from 'pino'

export const logger = pino({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  transport: process.env.NODE_ENV !== 'production'
    ? { target: 'pino-pretty' }
    : undefined,
})

// Usage
logger.info({ initiativeId, userId }, 'Initiative created successfully')
logger.error({ error, initiativeId }, 'Failed to create initiative')
```

### Error Monitoring

**Sentry Integration**:

```typescript
// lib/sentry.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
})

// Capture errors
try {
  await createInitiative(data)
} catch (error) {
  Sentry.captureException(error, {
    tags: { action: 'create_initiative' },
    extra: { initiativeData: data },
  })
  throw error
}
```

### Performance Monitoring

**Vercel Analytics** (built-in):

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

---

## Coding Standards

### TypeScript Guidelines

1. **Strict mode enabled** - `"strict": true` in tsconfig.json
2. **No explicit `any`** - Use `unknown` if type is truly unknown
3. **Prefer interfaces over types** for object shapes
4. **Use type inference** when obvious
5. **Export types with implementations**

### Component Guidelines

1. **One component per file**
2. **Server Components by default** - Only add `'use client'` when necessary
3. **Props interface named `<ComponentName>Props`**
4. **Destructure props in function signature**
5. **Use composition over inheritance**

**Example**:

```typescript
// components/InitiativeCard.tsx
interface InitiativeCardProps {
  initiative: Initiative
  onEdit?: (id: string) => void
}

export function InitiativeCard({ initiative, onEdit }: InitiativeCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{initiative.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{initiative.description}</p>
      </CardContent>
      {onEdit && (
        <CardFooter>
          <Button onClick={() => onEdit(initiative.id)}>Edit</Button>
        </CardFooter>
      )}
    </Card>
  )
}
```

### File Naming Conventions

- **Components**: PascalCase (`InitiativeCard.tsx`)
- **Utilities**: camelCase (`formatCurrency.ts`)
- **Types**: PascalCase (`Initiative`, `User`)
- **Constants**: SCREAMING_SNAKE_CASE (`MAX_INITIATIVES`)
- **Routes**: kebab-case folders (`/strategic-plans/`)

---

## Error Handling

### Error Handling Patterns

**1. Server Actions**:

```typescript
// app/actions/initiatives.ts
'use server'

import { z } from 'zod'

export async function createInitiative(formData: FormData) {
  try {
    // Validate
    const parsed = initiativeSchema.safeParse(Object.fromEntries(formData))
    if (!parsed.success) {
      return {
        success: false,
        error: {
          type: 'validation',
          message: 'Invalid input',
          issues: parsed.error.flatten(),
        },
      }
    }

    // Insert
    const { data, error } = await supabase
      .from('initiatives')
      .insert(parsed.data)
      .select()
      .single()

    if (error) {
      logger.error({ error }, 'Database error creating initiative')
      return {
        success: false,
        error: {
          type: 'database',
          message: 'Failed to create initiative',
        },
      }
    }

    revalidatePath('/dashboard')
    return { success: true, data }

  } catch (error) {
    logger.error({ error }, 'Unexpected error creating initiative')
    Sentry.captureException(error)
    return {
      success: false,
      error: {
        type: 'unknown',
        message: 'An unexpected error occurred',
      },
    }
  }
}
```

**2. Client Error Boundaries**:

```typescript
// app/error.tsx
'use client'

import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Something went wrong!</h2>
        <button
          onClick={() => reset()}
          className="mt-4 rounded bg-blue-600 px-4 py-2 text-white"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
```

**3. User-Friendly Error Messages**:

```typescript
// lib/errors/messages.ts
export const ERROR_MESSAGES = {
  validation: {
    required: 'This field is required',
    minLength: (min: number) => `Must be at least ${min} characters`,
    email: 'Invalid email address',
  },
  database: {
    duplicate: 'A record with this value already exists',
    notFound: 'Record not found',
    constraint: 'Cannot delete: record is referenced elsewhere',
  },
  auth: {
    unauthorized: 'You do not have permission to perform this action',
    unauthenticated: 'Please log in to continue',
  },
} as const
```

---

## Appendix

### Glossary

- **RLS** - Row-Level Security (database-level access control)
- **RSC** - React Server Components
- **BaaS** - Backend as a Service
- **JSONB** - PostgreSQL's binary JSON data type
- **SWOT** - Strengths, Weaknesses, Opportunities, Threats analysis
- **KPI** - Key Performance Indicator
- **FY** - Fiscal Year

### Key Dependencies Documentation

- [Next.js 14 Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [React Hook Form](https://react-hook-form.com/)
- [Zod](https://zod.dev/)
- [TailwindCSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)

### Architecture Decision Records (ADRs)

**ADR-001: Hybrid Data Model**
- **Decision**: Use normalized relational tables + JSONB
- **Rationale**: Balance queryability with flexibility
- **Status**: Approved

**ADR-002: Server Components First**
- **Decision**: Default to Server Components, minimize client JS
- **Rationale**: Better performance, SEO, security
- **Status**: Approved

**ADR-003: Supabase RLS for Security**
- **Decision**: Enforce all access control via RLS policies
- **Rationale**: Defense in depth, prevents bypass
- **Status**: Approved

**ADR-004: No Custom API Layer**
- **Decision**: Use Supabase PostgREST, no custom REST/GraphQL
- **Rationale**: Reduce complexity, leverage auto-generated API
- **Status**: Approved

---

**Document Status:** ✅ Complete
**Last Reviewed:** January 9, 2025
**Next Review:** February 9, 2025
