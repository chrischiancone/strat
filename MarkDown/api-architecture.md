# API Architecture

## API Strategy: Database-First (PostgREST)

**No custom REST or GraphQL API**. Supabase auto-generates a RESTful API via PostgREST based on database schema. All API calls are database queries through the Supabase client.

### Supabase Client API Patterns

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

## Server Actions as API Endpoints

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

## API Security

All API access is secured via Supabase RLS policies (see [Security Architecture](#security-architecture)).

---
