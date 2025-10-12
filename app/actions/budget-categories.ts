'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'

export interface CategoryFilters {
  department_ids?: string[]
  fiscal_year_ids?: string[]
}

export interface CategoryRow {
  category: string
  category_display: string
  total_amount: number
  initiative_count: number
  initiatives: Array<{
    id: string
    name: string
    department_name: string
    amount: number
    fiscal_year: number
  }>
}

export interface CategorySummary {
  total_budget: number
  categories: CategoryRow[]
  by_department: Array<{
    department_id: string
    department_name: string
    categories: Record<string, number>
    total: number
  }>
}

const CATEGORY_DISPLAY_NAMES: Record<string, string> = {
  personnel: 'Personnel',
  equipment: 'Equipment & Technology',
  services: 'Professional Services',
  training: 'Training & Development',
  materials: 'Materials & Supplies',
  other: 'Other',
}

export async function getBudgetCategories(
  filters: CategoryFilters = {}
): Promise<CategorySummary> {
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

  // Fetch all initiative budgets
  let query = supabase
    .from('initiative_budgets')
    .select(
      `
      id,
      category,
      amount,
      fiscal_year_id,
      fiscal_year:fiscal_years!initiative_budgets_fiscal_year_id_fkey(
        id,
        year
      ),
      initiative:initiatives!inner(
        id,
        name,
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

  // Apply filters
  if (filters.fiscal_year_ids && filters.fiscal_year_ids.length > 0) {
    query = query.in('fiscal_year_id', filters.fiscal_year_ids)
  }

  const { data: budgets, error } = await query

  if (error) {
    console.error('Error fetching budget categories:', error)
    throw new Error('Failed to fetch budget categories')
  }

  if (!budgets || budgets.length === 0) {
    return {
      total_budget: 0,
      categories: [],
      by_department: [],
    }
  }

  // Type the response
  type BudgetResponse = {
    id: string
    category: string
    amount: number
    fiscal_year_id: string
    fiscal_year: { id: string; year: number }
    initiative: {
      id: string
      name: string
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

  // Aggregate by category
  const categoryMap = new Map<
    string,
    {
      total_amount: number
      initiatives: Map<
        string,
        {
          id: string
          name: string
          department_name: string
          amount: number
          fiscal_year: number
        }
      >
    }
  >()

  filteredBudgets.forEach((budget) => {
    const category = budget.category
    const initiative_id = budget.initiative.id

    if (!categoryMap.has(category)) {
      categoryMap.set(category, {
        total_amount: 0,
        initiatives: new Map(),
      })
    }

    const categoryData = categoryMap.get(category)!
    categoryData.total_amount += budget.amount

    if (categoryData.initiatives.has(initiative_id)) {
      // Add to existing initiative amount
      const init = categoryData.initiatives.get(initiative_id)!
      init.amount += budget.amount
    } else {
      // Add new initiative
      categoryData.initiatives.set(initiative_id, {
        id: initiative_id,
        name: budget.initiative.name,
        department_name: budget.initiative.goal.strategic_plan.department.name,
        amount: budget.amount,
        fiscal_year: budget.fiscal_year.year,
      })
    }
  })

  // Convert to array format
  const categories: CategoryRow[] = Array.from(categoryMap.entries())
    .map(([category, data]) => ({
      category,
      category_display: CATEGORY_DISPLAY_NAMES[category] || category,
      total_amount: data.total_amount,
      initiative_count: data.initiatives.size,
      initiatives: Array.from(data.initiatives.values()).sort((a, b) =>
        a.name.localeCompare(b.name)
      ),
    }))
    .sort((a, b) => b.total_amount - a.total_amount)

  const totalBudget = categories.reduce((sum, cat) => sum + cat.total_amount, 0)

  // Aggregate by department
  const deptMap = new Map<
    string,
    {
      name: string
      categories: Record<string, number>
      total: number
    }
  >()

  filteredBudgets.forEach((budget) => {
    const deptId = budget.initiative.goal.strategic_plan.department.id
    const deptName = budget.initiative.goal.strategic_plan.department.name
    const category = budget.category

    if (!deptMap.has(deptId)) {
      deptMap.set(deptId, {
        name: deptName,
        categories: {},
        total: 0,
      })
    }

    const deptData = deptMap.get(deptId)!
    deptData.categories[category] = (deptData.categories[category] || 0) + budget.amount
    deptData.total += budget.amount
  })

  const byDepartment = Array.from(deptMap.entries())
    .map(([id, data]) => ({
      department_id: id,
      department_name: data.name,
      categories: data.categories,
      total: data.total,
    }))
    .sort((a, b) => b.total - a.total)

  return {
    total_budget: totalBudget,
    categories,
    by_department: byDepartment,
  }
}
