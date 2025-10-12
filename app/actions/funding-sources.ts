'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'

export interface FundingSourceFilters {
  fiscal_year_ids?: string[]
  funding_status?: string[] // secured, requested, pending, projected
}

export interface FundingSourceRow {
  funding_source: string
  total_amount: number
  initiative_count: number
  secured_amount: number
  pending_amount: number // requested + pending + projected
  initiatives: Array<{
    id: string
    name: string
    department_name: string
    total_cost: number
    funding_status: string
  }>
}

export interface FundingSourceSummary {
  total_budget: number
  funding_sources: FundingSourceRow[]
  general_fund_capacity?: number
  general_fund_committed?: number
  general_fund_over_committed: boolean
}

export async function getFundingSourceData(
  filters: FundingSourceFilters = {}
): Promise<FundingSourceSummary> {
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

  // Fetch all initiative budgets with their funding sources
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
        total_cost,
        goal:strategic_goals!inner(
          strategic_plan:strategic_plans!inner(
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

  // Apply filters
  if (filters.fiscal_year_ids && filters.fiscal_year_ids.length > 0) {
    query = query.in('fiscal_year_id', filters.fiscal_year_ids)
  }

  if (filters.funding_status && filters.funding_status.length > 0) {
    query = query.in('funding_status', filters.funding_status)
  }

  const { data: budgets, error } = await query

  if (error) {
    console.error('Error fetching funding source data:', error)
    throw new Error('Failed to fetch funding source data')
  }

  if (!budgets || budgets.length === 0) {
    return {
      total_budget: 0,
      funding_sources: [],
      general_fund_over_committed: false,
    }
  }

  // Type the response
  type BudgetResponse = {
    id: string
    amount: number
    funding_source: string | null
    funding_status: string
    fiscal_year_id: string
    fiscal_year: { id: string; year: number }
    initiative: {
      id: string
      name: string
      total_cost: number
      goal: {
        strategic_plan: {
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

  // Aggregate by funding source
  const fundingSourceMap = new Map<
    string,
    {
      total_amount: number
      secured_amount: number
      pending_amount: number
      initiatives: Set<string>
      initiative_details: Map<
        string,
        {
          id: string
          name: string
          department_name: string
          total_cost: number
          funding_status: string
        }
      >
    }
  >()

  typedBudgets.forEach((budget) => {
    const source = budget.funding_source || 'Unspecified'
    const initiative_id = budget.initiative.id
    const department_name = budget.initiative.goal.strategic_plan.department.name

    if (!fundingSourceMap.has(source)) {
      fundingSourceMap.set(source, {
        total_amount: 0,
        secured_amount: 0,
        pending_amount: 0,
        initiatives: new Set(),
        initiative_details: new Map(),
      })
    }

    const sourceData = fundingSourceMap.get(source)!

    sourceData.total_amount += budget.amount
    sourceData.initiatives.add(initiative_id)

    // Track secured vs pending amounts
    if (budget.funding_status === 'secured') {
      sourceData.secured_amount += budget.amount
    } else {
      // requested, pending, projected all count as "pending"
      sourceData.pending_amount += budget.amount
    }

    // Track initiative details
    if (!sourceData.initiative_details.has(initiative_id)) {
      sourceData.initiative_details.set(initiative_id, {
        id: initiative_id,
        name: budget.initiative.name,
        department_name,
        total_cost: budget.initiative.total_cost,
        funding_status: budget.funding_status,
      })
    }
  })

  // Convert to array format
  const fundingSources: FundingSourceRow[] = Array.from(fundingSourceMap.entries())
    .map(([source, data]) => ({
      funding_source: source,
      total_amount: data.total_amount,
      initiative_count: data.initiatives.size,
      secured_amount: data.secured_amount,
      pending_amount: data.pending_amount,
      initiatives: Array.from(data.initiative_details.values()).sort((a, b) =>
        a.name.localeCompare(b.name)
      ),
    }))
    .sort((a, b) => b.total_amount - a.total_amount)

  const totalBudget = fundingSources.reduce((sum, source) => sum + source.total_amount, 0)

  // Check for General Fund over-commitment
  // For MVP, we'll use a simple threshold - can be made configurable later
  const generalFundSource = fundingSources.find((s) =>
    s.funding_source.toLowerCase().includes('general fund')
  )
  const generalFundCommitted = generalFundSource?.total_amount || 0

  // TODO: Fetch actual General Fund capacity from municipality settings
  // For now, we'll use a placeholder - this should be configurable
  const generalFundCapacity = 10000000 // $10M placeholder

  const generalFundOverCommitted = generalFundCommitted > generalFundCapacity

  return {
    total_budget: totalBudget,
    funding_sources: fundingSources,
    general_fund_capacity: generalFundCapacity,
    general_fund_committed: generalFundCommitted,
    general_fund_over_committed: generalFundOverCommitted,
  }
}

/**
 * Get list of initiatives for a specific funding source
 */
export async function getInitiativesByFundingSource(
  fundingSource: string,
  filters: FundingSourceFilters = {}
): Promise<
  Array<{
    id: string
    name: string
    department_name: string
    priority_level: string
    total_cost: number
    funding_status: string
  }>
> {
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

  // Fetch initiatives using this funding source
  let query = supabase
    .from('initiative_budgets')
    .select(
      `
      initiative:initiatives!inner(
        id,
        name,
        priority_level,
        total_cost,
        goal:strategic_goals!inner(
          strategic_plan:strategic_plans!inner(
            department:departments!inner(
              name,
              municipality_id
            )
          )
        )
      ),
      funding_status,
      fiscal_year_id
    `
    )
    .eq('funding_source', fundingSource)
    .eq('initiative.goal.strategic_plan.department.municipality_id', typedProfile.municipality_id)

  // Apply filters
  if (filters.fiscal_year_ids && filters.fiscal_year_ids.length > 0) {
    query = query.in('fiscal_year_id', filters.fiscal_year_ids)
  }

  if (filters.funding_status && filters.funding_status.length > 0) {
    query = query.in('funding_status', filters.funding_status)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching initiatives by funding source:', error)
    throw new Error('Failed to fetch initiatives')
  }

  if (!data) {
    return []
  }

  type InitiativeResponse = {
    initiative: {
      id: string
      name: string
      priority_level: string
      total_cost: number
      goal: {
        strategic_plan: {
          department: {
            name: string
            municipality_id: string
          }
        }
      }
    }
    funding_status: string
  }

  const typedData = data as unknown as InitiativeResponse[]

  // Remove duplicates (same initiative might appear multiple times if it has multiple budget entries)
  const uniqueInitiatives = new Map<
    string,
    {
      id: string
      name: string
      department_name: string
      priority_level: string
      total_cost: number
      funding_status: string
    }
  >()

  typedData.forEach((item) => {
    if (!uniqueInitiatives.has(item.initiative.id)) {
      uniqueInitiatives.set(item.initiative.id, {
        id: item.initiative.id,
        name: item.initiative.name,
        department_name: item.initiative.goal.strategic_plan.department.name,
        priority_level: item.initiative.priority_level,
        total_cost: item.initiative.total_cost,
        funding_status: item.funding_status,
      })
    }
  })

  return Array.from(uniqueInitiatives.values()).sort((a, b) => a.name.localeCompare(b.name))
}
