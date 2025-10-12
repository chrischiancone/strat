'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'

export interface GrantFilters {
  department_ids?: string[]
  fiscal_year_ids?: string[]
  grant_status?: string[] // secured, requested, pending, projected
}

export interface GrantInitiativeRow {
  initiative_id: string
  initiative_name: string
  department_id: string
  department_name: string
  priority_level: string
  status: string
  grant_source: string
  grant_amount: number
  grant_status: string
  total_cost: number
  fiscal_year: number
  plan_id: string
}

export interface GrantSummary {
  total_grant_funding: number
  total_initiatives: number
  secured_amount: number
  pending_amount: number
  by_status: Array<{
    status: string
    count: number
    amount: number
  }>
  by_department: Array<{
    department_id: string
    department_name: string
    count: number
    amount: number
  }>
}

export interface GrantInitiativesData {
  summary: GrantSummary
  initiatives: GrantInitiativeRow[]
}

export async function getGrantInitiatives(
  filters: GrantFilters = {}
): Promise<GrantInitiativesData> {
  const supabase = createServerSupabaseClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('users')
    .select('role, municipality_id')
    .eq('id', user.id)
    .single()

  if (!profile) {
    throw new Error('User profile not found')
  }

  type Profile = {
    role: string
    municipality_id: string
  }

  const typedProfile = profile as unknown as Profile

  // Only Finance Director and Admin can access
  if (typedProfile.role !== 'finance' && typedProfile.role !== 'admin') {
    throw new Error('Access denied: Finance role required')
  }

  // Fetch all initiative budgets with grant funding
  let query = supabase
    .from('initiative_budgets')
    .select(
      `
      id,
      amount,
      funding_source,
      funding_status,
      fiscal_year_id,
      fiscal_year:fiscal_years!initiative_budgets_fiscal_year_id_fkey(
        id,
        year
      ),
      initiative:initiatives!inner(
        id,
        name,
        priority_level,
        status,
        total_year_1_cost,
        total_year_2_cost,
        total_year_3_cost,
        goal:strategic_goals!inner(
          strategic_plan:strategic_plans!inner(
            id,
            department:departments!inner(
              id,
              name,
              municipality_id
            )
          )
        )
      )
    `
    )
    .eq('initiative.goal.strategic_plan.department.municipality_id', typedProfile.municipality_id)
    // Filter for grant funding sources (contains "grant" case-insensitive)
    .ilike('funding_source', '%grant%')

  // Apply filters
  if (filters.fiscal_year_ids && filters.fiscal_year_ids.length > 0) {
    query = query.in('fiscal_year_id', filters.fiscal_year_ids)
  }

  if (filters.grant_status && filters.grant_status.length > 0) {
    query = query.in('funding_status', filters.grant_status)
  }

  const { data: budgets, error } = await query

  if (error) {
    console.error('Error fetching grant initiatives:', error)
    throw new Error('Failed to fetch grant initiatives')
  }

  if (!budgets || budgets.length === 0) {
    return {
      summary: {
        total_grant_funding: 0,
        total_initiatives: 0,
        secured_amount: 0,
        pending_amount: 0,
        by_status: [],
        by_department: [],
      },
      initiatives: [],
    }
  }

  // Type the response
  type BudgetResponse = {
    id: string
    amount: number
    funding_source: string
    funding_status: string
    fiscal_year_id: string
    fiscal_year: { id: string; year: number }
    initiative: {
      id: string
      name: string
      priority_level: string
      status: string
      total_year_1_cost: number
      total_year_2_cost: number
      total_year_3_cost: number
      goal: {
        strategic_plan: {
          id: string
          department: {
            id: string
            name: string
            municipality_id: string
          }
        }
      }
    }
  }

  const typedBudgets = budgets as unknown as BudgetResponse[]

  // Apply department filter if specified
  let filteredBudgets = typedBudgets
  if (filters.department_ids && filters.department_ids.length > 0) {
    filteredBudgets = typedBudgets.filter((budget) =>
      filters.department_ids!.includes(budget.initiative.goal.strategic_plan.department.id)
    )
  }

  // Aggregate by initiative
  const initiativeMap = new Map<
    string,
    {
      initiative_id: string
      initiative_name: string
      department_id: string
      department_name: string
      priority_level: string
      status: string
      grant_source: string
      grant_amount: number
      grant_status: string
      total_cost: number
      fiscal_year: number
      plan_id: string
    }
  >()

  filteredBudgets.forEach((budget) => {
    const initiative_id = budget.initiative.id
    const existing = initiativeMap.get(initiative_id)

    if (existing) {
      // Add to grant amount if same initiative
      existing.grant_amount += budget.amount
      // Update status to most favorable (secured > requested > pending > projected)
      const statusPriority = { secured: 4, requested: 3, pending: 2, projected: 1 }
      if (
        statusPriority[budget.funding_status as keyof typeof statusPriority] >
        statusPriority[existing.grant_status as keyof typeof statusPriority]
      ) {
        existing.grant_status = budget.funding_status
      }
    } else {
      initiativeMap.set(initiative_id, {
        initiative_id,
        initiative_name: budget.initiative.name,
        department_id: budget.initiative.goal.strategic_plan.department.id,
        department_name: budget.initiative.goal.strategic_plan.department.name,
        priority_level: budget.initiative.priority_level,
        status: budget.initiative.status,
        grant_source: budget.funding_source,
        grant_amount: budget.amount,
        grant_status: budget.funding_status,
        total_cost: (budget.initiative.total_year_1_cost || 0) + (budget.initiative.total_year_2_cost || 0) + (budget.initiative.total_year_3_cost || 0),
        fiscal_year: budget.fiscal_year.year,
        plan_id: budget.initiative.goal.strategic_plan.id,
      })
    }
  })

  const initiatives = Array.from(initiativeMap.values()).sort((a, b) =>
    a.initiative_name.localeCompare(b.initiative_name)
  )

  // Calculate summary statistics
  const totalGrantFunding = initiatives.reduce((sum, init) => sum + init.grant_amount, 0)
  const securedAmount = initiatives
    .filter((init) => init.grant_status === 'secured')
    .reduce((sum, init) => sum + init.grant_amount, 0)
  const pendingAmount = totalGrantFunding - securedAmount

  // By status
  const statusMap = new Map<string, { count: number; amount: number }>()
  initiatives.forEach((init) => {
    const existing = statusMap.get(init.grant_status) || { count: 0, amount: 0 }
    statusMap.set(init.grant_status, {
      count: existing.count + 1,
      amount: existing.amount + init.grant_amount,
    })
  })

  // By department
  const deptMap = new Map<string, { name: string; count: number; amount: number }>()
  initiatives.forEach((init) => {
    const existing = deptMap.get(init.department_id) || { name: init.department_name, count: 0, amount: 0 }
    deptMap.set(init.department_id, {
      name: init.department_name,
      count: existing.count + 1,
      amount: existing.amount + init.grant_amount,
    })
  })

  return {
    summary: {
      total_grant_funding: totalGrantFunding,
      total_initiatives: initiatives.length,
      secured_amount: securedAmount,
      pending_amount: pendingAmount,
      by_status: Array.from(statusMap.entries())
        .map(([status, data]) => ({ status, count: data.count, amount: data.amount }))
        .sort((a, b) => b.amount - a.amount),
      by_department: Array.from(deptMap.entries())
        .map(([id, data]) => ({
          department_id: id,
          department_name: data.name,
          count: data.count,
          amount: data.amount,
        }))
        .sort((a, b) => b.amount - a.amount),
    },
    initiatives,
  }
}
