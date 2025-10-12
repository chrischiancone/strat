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
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('role, municipality_id')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    console.error('Profile error:', profileError)
    throw new Error('User profile not found')
  }

  // Only Finance Director and Admin can access
  if (profile.role !== 'finance' && profile.role !== 'admin') {
    throw new Error('Access denied: Finance role required')
  }

  console.log('Fetching funding sources for municipality:', profile.municipality_id)

  // First, get departments for this municipality
  const { data: departments, error: deptError } = await supabase
    .from('departments')
    .select('id')
    .eq('municipality_id', profile.municipality_id)

  if (deptError) {
    console.error('Error fetching departments:', deptError)
    throw new Error(`Failed to fetch departments: ${deptError.message}`)
  }

  if (!departments || departments.length === 0) {
    return {
      total_budget: 0,
      funding_sources: [],
      general_fund_over_committed: false,
    }
  }

  const departmentIds = departments.map(d => d.id)

  // Get strategic plans for these departments
  const { data: plans, error: plansError } = await supabase
    .from('strategic_plans')
    .select('id, department_id')
    .in('department_id', departmentIds)

  if (plansError) {
    console.error('Error fetching plans:', plansError)
    throw new Error(`Failed to fetch plans: ${plansError.message}`)
  }

  if (!plans || plans.length === 0) {
    return {
      total_budget: 0,
      funding_sources: [],
      general_fund_over_committed: false,
    }
  }

  const planIds = plans.map(p => p.id)
  const planDeptMap = new Map(plans.map(p => [p.id, p.department_id]))

  // Get goals for these plans
  const { data: goals, error: goalsError } = await supabase
    .from('strategic_goals')
    .select('id, strategic_plan_id')
    .in('strategic_plan_id', planIds)

  if (goalsError) {
    console.error('Error fetching goals:', goalsError)
    throw new Error(`Failed to fetch goals: ${goalsError.message}`)
  }

  if (!goals || goals.length === 0) {
    return {
      total_budget: 0,
      funding_sources: [],
      general_fund_over_committed: false,
    }
  }

  const goalIds = goals.map(g => g.id)
  const goalPlanMap = new Map(goals.map(g => [g.id, g.strategic_plan_id]))

  // Get initiatives for these goals
  const { data: initiatives, error: initError } = await supabase
    .from('initiatives')
    .select('id, name, strategic_goal_id, total_year_1_cost, total_year_2_cost, total_year_3_cost')
    .in('strategic_goal_id', goalIds)

  if (initError) {
    console.error('Error fetching initiatives:', initError)
    throw new Error(`Failed to fetch initiatives: ${initError.message}`)
  }

  if (!initiatives || initiatives.length === 0) {
    return {
      total_budget: 0,
      funding_sources: [],
      general_fund_over_committed: false,
    }
  }

  const initiativeIds = initiatives.map(i => i.id)
  const initiativeMap = new Map(initiatives.map(i => [i.id, i]))

  // Now get the budgets with filters
  let budgetQuery = supabase
    .from('initiative_budgets')
    .select(`
      id,
      amount,
      funding_source,
      funding_status,
      fiscal_year_id,
      initiative_id
    `)
    .in('initiative_id', initiativeIds)

  // Apply filters
  if (filters.fiscal_year_ids && filters.fiscal_year_ids.length > 0) {
    budgetQuery = budgetQuery.in('fiscal_year_id', filters.fiscal_year_ids)
  }

  if (filters.funding_status && filters.funding_status.length > 0) {
    budgetQuery = budgetQuery.in('funding_status', filters.funding_status)
  }

  const { data: budgets, error: budgetError } = await budgetQuery

  if (budgetError) {
    console.error('Error fetching budgets:', budgetError)
    throw new Error(`Failed to fetch budgets: ${budgetError.message}`)
  }

  if (!budgets || budgets.length === 0) {
    return {
      total_budget: 0,
      funding_sources: [],
      general_fund_over_committed: false,
    }
  }

  // Get department names
  const { data: departmentDetails } = await supabase
    .from('departments')
    .select('id, name')
    .in('id', departmentIds)

  const deptNameMap = new Map(departmentDetails?.map(d => [d.id, d.name]) || [])

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

  budgets.forEach((budget) => {
    const source = budget.funding_source || 'Unspecified'
    const initiative = initiativeMap.get(budget.initiative_id)
    
    if (!initiative) return

    const goalId = initiative.strategic_goal_id
    const planId = goalPlanMap.get(goalId)
    if (!planId) return

    const deptId = planDeptMap.get(planId)
    if (!deptId) return

    const department_name = deptNameMap.get(deptId) || 'Unknown'
    const total_cost = (initiative.total_year_1_cost || 0) + 
                      (initiative.total_year_2_cost || 0) + 
                      (initiative.total_year_3_cost || 0)

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
    sourceData.initiatives.add(budget.initiative_id)

    // Track secured vs pending amounts
    if (budget.funding_status === 'secured') {
      sourceData.secured_amount += budget.amount
    } else {
      // requested, pending, projected all count as "pending"
      sourceData.pending_amount += budget.amount
    }

    // Track initiative details
    if (!sourceData.initiative_details.has(budget.initiative_id)) {
      sourceData.initiative_details.set(budget.initiative_id, {
        id: budget.initiative_id,
        name: initiative.name,
        department_name,
        total_cost,
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
  // Simplified implementation - reuse the main function and filter
  const data = await getFundingSourceData(filters)
  const sourceData = data.funding_sources.find(s => s.funding_source === fundingSource)
  
  if (!sourceData) {
    return []
  }

  // Get additional priority level data
  const supabase = createServerSupabaseClient()
  const initiativeIds = sourceData.initiatives.map(i => i.id)
  
  const { data: initiatives } = await supabase
    .from('initiatives')
    .select('id, priority_level')
    .in('id', initiativeIds)

  const priorityMap = new Map(initiatives?.map(i => [i.id, i.priority_level]) || [])

  return sourceData.initiatives.map(init => ({
    ...init,
    priority_level: priorityMap.get(init.id) || 'NICE_TO_HAVE'
  }))
}
