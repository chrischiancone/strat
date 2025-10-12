'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'

export interface BudgetFilters {
  fiscal_year_ids?: string[]
  department_ids?: string[]
  priority_levels?: ('NEED' | 'WANT' | 'NICE_TO_HAVE')[]
}

export interface BudgetByYear {
  fiscal_year_id: string
  fiscal_year: number
  total: number
}

export interface BudgetByDepartment {
  department_id: string
  department_name: string
  total: number
  initiative_count: number
}

export interface BudgetByFundingSource {
  source_name: string
  total: number
  percentage: number
}

export interface BudgetByCategory {
  category: string
  total: number
  percentage: number
}

export interface InitiativeDetail {
  id: string
  name: string
  department_name: string
  priority_level: string
  total_cost: number
  year_1_cost: number
  year_2_cost: number
  year_3_cost: number
}

export interface CityWideBudgetData {
  summary: {
    total_budget: number
    total_initiatives: number
    total_departments: number
    total_plans: number
  }
  budgetByYear: BudgetByYear[]
  budgetByDepartment: BudgetByDepartment[]
  budgetByFundingSource: BudgetByFundingSource[]
  budgetByCategory: BudgetByCategory[]
  topInitiatives: InitiativeDetail[]
}

export async function getCityWideBudget(
  filters: BudgetFilters = {}
): Promise<CityWideBudgetData> {
  const supabase = createServerSupabaseClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  // Get user's role and municipality
  const { data: profile } = await supabase
    .from('users')
    .select('role, municipality_id')
    .eq('id', user.id)
    .single<{ role: string; municipality_id: string }>()

  if (!profile) {
    throw new Error('User profile not found')
  }

  // Only City Manager and Admin can access city-wide budget
  if (profile.role !== 'city_manager' && profile.role !== 'admin') {
    throw new Error('Access denied: City Manager or Admin role required')
  }

  // Build query for all plans in the municipality
  let plansQuery = supabase
    .from('strategic_plans')
    .select(
      `
      id,
      title,
      start_fiscal_year_id,
      end_fiscal_year_id,
      departments!inner(
        id,
        name,
        municipality_id
      )
    `
    )
    .eq('departments.municipality_id', profile.municipality_id)

  // Apply department filter if provided
  if (filters.department_ids && filters.department_ids.length > 0) {
    plansQuery = plansQuery.in('department_id', filters.department_ids)
  }

  const { data: plans, error: plansError } = await plansQuery

  if (plansError) {
    console.error('Error fetching plans:', plansError)
    throw new Error('Failed to fetch plans')
  }

  type Plan = {
    id: string
    title: string
    start_fiscal_year_id: string
    end_fiscal_year_id: string
    departments: {
      id: string
      name: string
      municipality_id: string
    }
  }

  const typedPlans = (plans || []) as Plan[]
  const planIds = typedPlans.map((p) => p.id)

  if (planIds.length === 0) {
    // No plans found, return empty data
    return {
      summary: {
        total_budget: 0,
        total_initiatives: 0,
        total_departments: 0,
        total_plans: 0,
      },
      budgetByYear: [],
      budgetByDepartment: [],
      budgetByFundingSource: [],
      budgetByCategory: [],
      topInitiatives: [],
    }
  }

  // Get all goals for these plans
  const { data: goals } = await supabase
    .from('strategic_goals')
    .select('id, strategic_plan_id')
    .in('strategic_plan_id', planIds)

  type Goal = { id: string; strategic_plan_id: string }
  const typedGoals = (goals || []) as Goal[]
  const goalIds = typedGoals.map((g) => g.id)

  if (goalIds.length === 0) {
    return {
      summary: {
        total_budget: 0,
        total_initiatives: 0,
        total_departments: typedPlans.length,
        total_plans: typedPlans.length,
      },
      budgetByYear: [],
      budgetByDepartment: [],
      budgetByFundingSource: [],
      budgetByCategory: [],
      topInitiatives: [],
    }
  }

  // Build initiatives query
  let initiativesQuery = supabase
    .from('initiatives')
    .select(
      `
      id,
      name,
      priority_level,
      total_year_1_cost,
      total_year_2_cost,
      total_year_3_cost,
      fiscal_year_id,
      strategic_goal_id,
      lead_department_id,
      departments!initiatives_lead_department_id_fkey(name)
    `
    )
    .in('strategic_goal_id', goalIds)

  // Apply priority filter
  if (filters.priority_levels && filters.priority_levels.length > 0) {
    initiativesQuery = initiativesQuery.in('priority_level', filters.priority_levels)
  }

  // Apply fiscal year filter
  if (filters.fiscal_year_ids && filters.fiscal_year_ids.length > 0) {
    initiativesQuery = initiativesQuery.in('fiscal_year_id', filters.fiscal_year_ids)
  }

  const { data: initiatives, error: initiativesError } = await initiativesQuery

  if (initiativesError) {
    console.error('Error fetching initiatives:', initiativesError)
    throw new Error('Failed to fetch initiatives')
  }

  type Initiative = {
    id: string
    name: string
    priority_level: string
    total_year_1_cost: number
    total_year_2_cost: number
    total_year_3_cost: number
    fiscal_year_id: string
    strategic_goal_id: string
    lead_department_id: string
    departments: { name: string }
  }

  const typedInitiatives = (initiatives || []) as Initiative[]

  // Calculate summary
  const totalBudget = typedInitiatives.reduce(
    (sum, init) =>
      sum + init.total_year_1_cost + init.total_year_2_cost + init.total_year_3_cost,
    0
  )

  // Get unique departments
  const uniqueDepartments = new Set(typedPlans.map((p) => p.departments.id))

  // Budget by Year
  const yearMap = new Map<string, number>()

  typedInitiatives.forEach((init) => {
    const current = yearMap.get(init.fiscal_year_id) || 0
    yearMap.set(
      init.fiscal_year_id,
      current + init.total_year_1_cost + init.total_year_2_cost + init.total_year_3_cost
    )
  })

  // Fetch fiscal year details
  const fiscalYearIds = Array.from(yearMap.keys())
  const { data: fiscalYears } = await supabase
    .from('fiscal_years')
    .select('id, year')
    .in('id', fiscalYearIds)

  type FiscalYear = { id: string; year: number }
  const typedFiscalYears = (fiscalYears || []) as FiscalYear[]

  const budgetByYear: BudgetByYear[] = typedFiscalYears
    .map((fy) => ({
      fiscal_year_id: fy.id,
      fiscal_year: fy.year,
      total: yearMap.get(fy.id) || 0,
    }))
    .sort((a, b) => a.fiscal_year - b.fiscal_year)

  // Budget by Department
  const deptMap = new Map<
    string,
    { name: string; total: number; initiative_count: number }
  >()

  typedInitiatives.forEach((init) => {
    // Find the plan for this initiative
    const goal = typedGoals.find((g) => g.id === init.strategic_goal_id)
    if (!goal) return

    const plan = typedPlans.find((p) => p.id === goal.strategic_plan_id)
    if (!plan) return

    const deptId = plan.departments.id
    const current = deptMap.get(deptId) || {
      name: plan.departments.name,
      total: 0,
      initiative_count: 0,
    }

    deptMap.set(deptId, {
      name: current.name,
      total:
        current.total +
        init.total_year_1_cost +
        init.total_year_2_cost +
        init.total_year_3_cost,
      initiative_count: current.initiative_count + 1,
    })
  })

  const budgetByDepartment: BudgetByDepartment[] = Array.from(deptMap.entries())
    .map(([id, data]) => ({
      department_id: id,
      department_name: data.name,
      total: data.total,
      initiative_count: data.initiative_count,
    }))
    .sort((a, b) => b.total - a.total)

  // Budget by Funding Source
  const { data: budgetRecords } = await supabase
    .from('initiative_budgets')
    .select('source_name, amount, initiative_id')
    .in('initiative_id', typedInitiatives.map((i) => i.id))

  type BudgetRecord = { source_name: string; amount: number; initiative_id: string }
  const typedBudgetRecords = (budgetRecords || []) as BudgetRecord[]

  const sourceMap = new Map<string, number>()
  typedBudgetRecords.forEach((budget) => {
    const current = sourceMap.get(budget.source_name) || 0
    sourceMap.set(budget.source_name, current + budget.amount)
  })

  const totalFundingSourceBudget = Array.from(sourceMap.values()).reduce(
    (sum, val) => sum + val,
    0
  )

  const budgetByFundingSource: BudgetByFundingSource[] = Array.from(sourceMap.entries())
    .map(([source, total]) => ({
      source_name: source,
      total,
      percentage: totalFundingSourceBudget > 0 ? (total / totalFundingSourceBudget) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total)

  // Budget by Category (extracted from source_name patterns or financial_analysis)
  // For now, we'll categorize based on common patterns in source names
  const categoryMap = new Map<string, number>()

  typedInitiatives.forEach((init) => {
    // Simplified categorization - in production, this would come from a category field
    const totalCost =
      init.total_year_1_cost + init.total_year_2_cost + init.total_year_3_cost

    // Default category
    const category = 'Operating Expenses'
    const current = categoryMap.get(category) || 0
    categoryMap.set(category, current + totalCost)
  })

  const totalCategoryBudget = Array.from(categoryMap.values()).reduce(
    (sum, val) => sum + val,
    0
  )

  const budgetByCategory: BudgetByCategory[] = Array.from(categoryMap.entries())
    .map(([category, total]) => ({
      category,
      total,
      percentage: totalCategoryBudget > 0 ? (total / totalCategoryBudget) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total)

  // Top 10 Initiatives by Budget
  const topInitiatives: InitiativeDetail[] = typedInitiatives
    .map((init) => {
      // Find department name
      const goal = typedGoals.find((g) => g.id === init.strategic_goal_id)
      const plan = goal ? typedPlans.find((p) => p.id === goal.strategic_plan_id) : null

      return {
        id: init.id,
        name: init.name,
        department_name: plan?.departments.name || 'Unknown',
        priority_level: init.priority_level,
        total_cost:
          init.total_year_1_cost + init.total_year_2_cost + init.total_year_3_cost,
        year_1_cost: init.total_year_1_cost,
        year_2_cost: init.total_year_2_cost,
        year_3_cost: init.total_year_3_cost,
      }
    })
    .sort((a, b) => b.total_cost - a.total_cost)
    .slice(0, 10)

  return {
    summary: {
      total_budget: totalBudget,
      total_initiatives: typedInitiatives.length,
      total_departments: uniqueDepartments.size,
      total_plans: typedPlans.length,
    },
    budgetByYear,
    budgetByDepartment,
    budgetByFundingSource,
    budgetByCategory,
    topInitiatives,
  }
}
