'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'

export interface FinanceBudgetFilters {
  department_ids?: string[]
  fiscal_year_ids?: string[]
  priority_levels?: string[]
  funding_sources?: string[]
  funding_statuses?: string[]
  search?: string
}

export interface InitiativeBudgetRow {
  initiative_id: string
  initiative_name: string
  department_id: string
  department_name: string
  goal_title: string
  priority_level: string
  status: string
  year_1_cost: number
  year_2_cost: number
  year_3_cost: number
  total_cost: number
  funding_sources: string[]
  fiscal_year: number
  plan_id: string
  budget_validated_by: string | null
  budget_validated_at: string | null
}

export interface FinanceBudgetSummary {
  total_budget: number
  total_initiatives: number
  total_departments: number
  budgets_validated: number
  budgets_pending_validation: number
  budget_by_fiscal_year: Array<{
    fiscal_year: number
    total: number
  }>
  budget_by_department: Array<{
    department_id: string
    department_name: string
    total: number
    initiative_count: number
  }>
}

export interface FinanceBudgetsData {
  summary: FinanceBudgetSummary
  initiatives: InitiativeBudgetRow[]
  total_count: number
}

export async function getFinanceInitiativeBudgets(
  filters: FinanceBudgetFilters = {},
  page: number = 1,
  pageSize: number = 50,
  sortBy: string = 'total_cost',
  sortOrder: 'asc' | 'desc' = 'desc'
): Promise<FinanceBudgetsData> {
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
    .select('role, municipality_id, department_id')
    .eq('id', user.id)
    .single<{ role: string; municipality_id: string; department_id: string | null }>()

  if (profileError || !profile) {
    console.error('Profile error:', profileError)
    throw new Error('User profile not found')
  }

  // Check role-based access: finance, admin, city_manager, department_director
  const allowedRoles = ['finance', 'admin', 'city_manager', 'department_director']
  if (!allowedRoles.includes(profile.role)) {
    throw new Error('Access denied: Insufficient permissions')
  }

  console.log('Fetching initiatives for municipality:', profile.municipality_id)

  // First, get departments for this municipality
  const { data: depts, error: deptsError } = await supabase
    .from('departments')
    .select('id, name')
    .eq('municipality_id', profile.municipality_id)

  if (deptsError) {
    console.error('Error fetching departments:', deptsError)
    throw new Error(`Failed to fetch departments: ${deptsError.message}`)
  }

  if (!depts || depts.length === 0) {
    console.log('No departments found for municipality:', profile.municipality_id)
    return {
      summary: {
        total_budget: 0,
        total_initiatives: 0,
        total_departments: 0,
        budgets_validated: 0,
        budgets_pending_validation: 0,
        budget_by_fiscal_year: [],
        budget_by_department: [],
      },
      initiatives: [],
      total_count: 0,
    }
  }

  const deptIds = depts.map(d => d.id)
  console.log('Found departments:', depts.length, 'IDs:', deptIds)

  // Now get strategic plans for these departments
  const { data: plans, error: plansError } = await supabase
    .from('strategic_plans')
    .select('id, department_id')
    .in('department_id', deptIds)
    .returns<{ id: string; department_id: string }[]>()

  if (plansError) {
    console.error('Error fetching plans:', plansError)
    throw new Error(`Failed to fetch plans: ${plansError.message}`)
  }

  if (!plans || plans.length === 0) {
    console.log('No strategic plans found for departments')
    return {
      summary: {
        total_budget: 0,
        total_initiatives: 0,
        total_departments: 0,
        budgets_validated: 0,
        budgets_pending_validation: 0,
        budget_by_fiscal_year: [],
        budget_by_department: [],
      },
      initiatives: [],
      total_count: 0,
    }
  }

  const planIds = plans.map(p => p.id)
  console.log('Found strategic plans:', plans.length, 'IDs:', planIds)

  // Create department lookup map
  const deptMap = new Map(depts.map(d => [d.id, d]))
  
  // Get all goals for these plans
  type Goal = {
    id: string
    title: string
    strategic_plan_id: string
  }

  const { data: goals, error: goalsError } = await supabase
    .from('strategic_goals')
    .select('id, title, strategic_plan_id')
    .in('strategic_plan_id', planIds)
    .returns<Goal[]>()

  if (goalsError) {
    console.error('Error fetching goals:', goalsError)
    throw new Error(`Failed to fetch goals: ${goalsError.message}`)
  }

  if (!goals || goals.length === 0) {
    console.log('No strategic goals found for plans')
    return {
      summary: {
        total_budget: 0,
        total_initiatives: 0,
        total_departments: 0,
        budgets_validated: 0,
        budgets_pending_validation: 0,
        budget_by_fiscal_year: [],
        budget_by_department: [],
      },
      initiatives: [],
      total_count: 0,
    }
  }

  const goalIds = goals.map(g => g.id)
  console.log('Found strategic goals:', goals.length)

  // Now get initiatives for these goals
  type Initiative = {
    id: string
    name: string
    priority_level: string
    status: string
    total_year_1_cost: number | null
    total_year_2_cost: number | null
    total_year_3_cost: number | null
    budget_validated_by: string | null
    budget_validated_at: string | null
    strategic_goal_id: string
    fiscal_year_id: string
  }

  let query = supabase
    .from('initiatives')
    .select(`
      id,
      name,
      priority_level,
      status,
      total_year_1_cost,
      total_year_2_cost,
      total_year_3_cost,
      budget_validated_by,
      budget_validated_at,
      strategic_goal_id,
      fiscal_year_id
    `)
    .in('strategic_goal_id', goalIds)
    .returns<Initiative[]>()

  // Apply filters
  if (filters.priority_levels && filters.priority_levels.length > 0) {
    query = query.in('priority_level', filters.priority_levels)
  }

  if (filters.search) {
    query = query.ilike('name', `%${filters.search}%`)
  }

  const { data: initiatives, error: initiativesError } = await query

  if (initiativesError) {
    console.error('Error fetching initiatives:', initiativesError)
    throw new Error(`Failed to fetch initiatives: ${initiativesError.message}`)
  }

  console.log('Found initiatives:', initiatives?.length || 0)

  if (!initiatives || initiatives.length === 0) {
    console.log('No initiatives found for goals')
    return {
      summary: {
        total_budget: 0,
        total_initiatives: 0,
        total_departments: 0,
        budgets_validated: 0,
        budgets_pending_validation: 0,
        budget_by_fiscal_year: [],
        budget_by_department: [],
      },
      initiatives: [],
      total_count: 0,
    }
  }

  // Get fiscal years
  const fiscalYearIds = [...new Set(initiatives.map(i => i.fiscal_year_id).filter(Boolean))]
  const fiscalYearMap = new Map<string, number>()
  
  if (fiscalYearIds.length > 0) {
    type FiscalYear = {
      id: string
      year: number
    }

    const { data: fiscalYears } = await supabase
      .from('fiscal_years')
      .select('id, year')
      .in('id', fiscalYearIds)
      .returns<FiscalYear[]>()
    
    if (fiscalYears) {
      fiscalYears.forEach(fy => {
        fiscalYearMap.set(fy.id, fy.year)
      })
    }
  }

  // Create lookup maps
  const goalMap = new Map(goals.map(g => [g.id, g]))
  const planMap = new Map(plans.map(p => [p.id, p]))

  // Transform initiatives
  let transformedInitiatives = initiatives.map(init => {
    const goal = goalMap.get(init.strategic_goal_id)
    const plan = goal ? planMap.get(goal.strategic_plan_id) : null
    const department = plan ? deptMap.get(plan.department_id) : null

    return {
      initiative_id: init.id,
      initiative_name: init.name,
      department_id: department?.id || '',
      department_name: department?.name || 'Unknown',
      goal_title: goal?.title || '',
      priority_level: init.priority_level,
      status: init.status,
      year_1_cost: init.total_year_1_cost || 0,
      year_2_cost: init.total_year_2_cost || 0,
      year_3_cost: init.total_year_3_cost || 0,
      total_cost: (init.total_year_1_cost || 0) + (init.total_year_2_cost || 0) + (init.total_year_3_cost || 0),
      funding_sources: [],
      fiscal_year: fiscalYearMap.get(init.fiscal_year_id) || 0,
      plan_id: goal?.strategic_plan_id || '',
      budget_validated_by: init.budget_validated_by,
      budget_validated_at: init.budget_validated_at,
    }
  }).filter(init => init.department_id) // Filter out any without departments

  // Apply department filtering based on role
  if (profile.role === 'department_director' && profile.department_id) {
    // Department directors only see their own department
    transformedInitiatives = transformedInitiatives.filter((init) =>
      init.department_id === profile.department_id
    )
  }

  // Apply client-side filters
  if (filters.department_ids && filters.department_ids.length > 0) {
    transformedInitiatives = transformedInitiatives.filter((init) =>
      filters.department_ids!.includes(init.department_id)
    )
  }

  if (filters.fiscal_year_ids && filters.fiscal_year_ids.length > 0) {
    const selectedYears = Array.from(fiscalYearMap.entries())
      .filter(([id]) => filters.fiscal_year_ids!.includes(id))
      .map(([_, year]) => year)
    
    transformedInitiatives = transformedInitiatives.filter((init) =>
      selectedYears.includes(init.fiscal_year)
    )
  }

  // Calculate summary statistics
  const totalBudget = transformedInitiatives.reduce((sum, init) => sum + init.total_cost, 0)
  const uniqueDepartments = new Set(transformedInitiatives.map((init) => init.department_id))
  const budgetsValidated = transformedInitiatives.filter((init) => init.budget_validated_by !== null).length
  const budgetsPendingValidation = transformedInitiatives.length - budgetsValidated

  // Budget by fiscal year
  const budgetByYear = new Map<number, number>()
  transformedInitiatives.forEach((init) => {
    const current = budgetByYear.get(init.fiscal_year) || 0
    budgetByYear.set(init.fiscal_year, current + init.total_cost)
  })

  // Budget by department
  const budgetByDept = new Map<string, { name: string; total: number; count: number }>()
  transformedInitiatives.forEach((init) => {
    const current = budgetByDept.get(init.department_id) || {
      name: init.department_name,
      total: 0,
      count: 0,
    }
    budgetByDept.set(init.department_id, {
      name: init.department_name,
      total: current.total + init.total_cost,
      count: current.count + 1,
    })
  })

  // Sort initiatives
  const sortedInitiatives = [...transformedInitiatives].sort((a, b) => {
    let compareValue = 0

    switch (sortBy) {
      case 'total_cost':
        compareValue = a.total_cost - b.total_cost
        break
      case 'department_name':
        compareValue = a.department_name.localeCompare(b.department_name)
        break
      case 'priority_level':
        compareValue = a.priority_level.localeCompare(b.priority_level)
        break
      case 'initiative_name':
        compareValue = a.initiative_name.localeCompare(b.initiative_name)
        break
      default:
        compareValue = a.total_cost - b.total_cost
    }

    return sortOrder === 'desc' ? -compareValue : compareValue
  })

  // Pagination
  const startIndex = (page - 1) * pageSize
  const paginatedInitiatives = sortedInitiatives.slice(startIndex, startIndex + pageSize)

  return {
    summary: {
      total_budget: totalBudget,
      total_initiatives: transformedInitiatives.length,
      total_departments: uniqueDepartments.size,
      budgets_validated: budgetsValidated,
      budgets_pending_validation: budgetsPendingValidation,
      budget_by_fiscal_year: Array.from(budgetByYear.entries())
        .map(([year, total]) => ({ fiscal_year: year, total }))
        .sort((a, b) => a.fiscal_year - b.fiscal_year),
      budget_by_department: Array.from(budgetByDept.entries())
        .map(([id, data]) => ({
          department_id: id,
          department_name: data.name,
          total: data.total,
          initiative_count: data.count,
        }))
        .sort((a, b) => b.total - a.total),
    },
    initiatives: paginatedInitiatives,
    total_count: transformedInitiatives.length,
  }
}

// Export function - returns all data without pagination
export async function getFinanceBudgetExportData(
  filters: FinanceBudgetFilters = {}
): Promise<{
  initiatives: InitiativeBudgetRow[]
  budget_by_department: Array<{
    department_name: string
    total: number
    initiative_count: number
  }>
  budget_by_funding_source: unknown[]
  budget_by_category: unknown[]
  budget_by_fiscal_year: Array<{
    fiscal_year: number
    total: number
    initiative_count: number
  }>
}> {
  // Use a very large page size to get all data
  const data = await getFinanceInitiativeBudgets(filters, 1, 10000, 'total_cost', 'desc')
  
  return {
    initiatives: data.initiatives,
    budget_by_department: data.summary.budget_by_department.map(dept => ({
      department_name: dept.department_name,
      total: dept.total,
      initiative_count: dept.initiative_count
    })),
    budget_by_funding_source: [],
    budget_by_category: [],
      budget_by_fiscal_year: data.summary.budget_by_fiscal_year.map(year => ({
        fiscal_year: year.fiscal_year,
        total: year.total,
        initiative_count: 0
      }))
  }
}

export async function toggleBudgetValidation(
  initiativeId: string,
  validate: boolean
): Promise<{ success: boolean; error?: string }> {
  const supabase = createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  type ProfileType = {
    role: string
  }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()
    .returns<ProfileType>()

  if (!profile) {
    return { success: false, error: 'User profile not found' }
  }

  // Only finance, admin, and city_manager can validate budgets
  const allowedRoles = ['finance', 'admin', 'city_manager']
  if (!allowedRoles.includes(profile.role)) {
    return { success: false, error: 'Access denied: Insufficient permissions' }
  }

  const updateData = validate
    ? {
        budget_validated_by: user.id,
        budget_validated_at: new Date().toISOString(),
      }
    : {
        budget_validated_by: null,
        budget_validated_at: null,
      }

  const { error } = await supabase
    .from('initiatives')
    .update(updateData as Record<string, unknown>)
    .eq('id', initiativeId)

  if (error) {
    console.error('Error updating budget validation:', error)
    return { success: false, error: 'Failed to update budget validation' }
  }

  return { success: true }
}
