'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'

export interface InitiativeFilters {
  department_ids?: string[]
  priority_levels?: ('NEED' | 'WANT' | 'NICE_TO_HAVE')[]
  status?: ('not_started' | 'in_progress' | 'at_risk' | 'completed' | 'deferred')[]
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface InitiativeSummary {
  id: string
  name: string
  department_name: string
  plan_title: string
  goal_title: string
  priority_level: string
  status: string
  total_cost: number
  year_1_cost: number
  year_2_cost: number
  year_3_cost: number
  responsible_party: string | null
}

export interface InitiativeCounts {
  byPriority: {
    NEED: number
    WANT: number
    NICE_TO_HAVE: number
  }
  byStatus: {
    not_started: number
    in_progress: number
    at_risk: number
    completed: number
    deferred: number
  }
}

export interface CityWideInitiativesData {
  summary: {
    total_initiatives: number
    at_risk_count: number
    total_budget: number
  }
  counts: InitiativeCounts
  atRiskInitiatives: InitiativeSummary[]
  initiatives: InitiativeSummary[]
  pagination: {
    total: number
    page: number
    pageSize: number
    totalPages: number
  }
}

export async function getCityWideInitiatives(
  filters: InitiativeFilters = {},
  page: number = 1,
  pageSize: number = 50
): Promise<CityWideInitiativesData> {
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

  // Only City Manager and Admin can access city-wide initiatives
  if (profile.role !== 'city_manager' && profile.role !== 'admin') {
    throw new Error('Access denied: City Manager or Admin role required')
  }

  // Get all plans in the municipality
  let plansQuery = supabase
    .from('strategic_plans')
    .select(
      `
      id,
      title,
      departments!inner(
        id,
        name,
        municipality_id
      )
    `
    )
    .eq('departments.municipality_id', profile.municipality_id)

  // Apply department filter
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
    departments: {
      id: string
      name: string
    }
  }

  const typedPlans = (plans || []) as Plan[]
  const planIds = typedPlans.map((p) => p.id)

  if (planIds.length === 0) {
    return {
      summary: {
        total_initiatives: 0,
        at_risk_count: 0,
        total_budget: 0,
      },
      counts: {
        byPriority: { NEED: 0, WANT: 0, NICE_TO_HAVE: 0 },
        byStatus: { not_started: 0, in_progress: 0, at_risk: 0, completed: 0, deferred: 0 },
      },
      atRiskInitiatives: [],
      initiatives: [],
      pagination: { total: 0, page, pageSize, totalPages: 0 },
    }
  }

  // Get all goals for these plans
  const { data: goals } = await supabase
    .from('strategic_goals')
    .select('id, strategic_plan_id, title')
    .in('strategic_plan_id', planIds)

  type Goal = { id: string; strategic_plan_id: string; title: string }
  const typedGoals = (goals || []) as Goal[]
  const goalIds = typedGoals.map((g) => g.id)

  if (goalIds.length === 0) {
    return {
      summary: {
        total_initiatives: 0,
        at_risk_count: 0,
        total_budget: 0,
      },
      counts: {
        byPriority: { NEED: 0, WANT: 0, NICE_TO_HAVE: 0 },
        byStatus: { not_started: 0, in_progress: 0, at_risk: 0, completed: 0, deferred: 0 },
      },
      atRiskInitiatives: [],
      initiatives: [],
      pagination: { total: 0, page, pageSize, totalPages: 0 },
    }
  }

  // Build base initiatives query
  let initiativesQuery = supabase
    .from('initiatives')
    .select(
      `
      id,
      name,
      priority_level,
      status,
      total_year_1_cost,
      total_year_2_cost,
      total_year_3_cost,
      responsible_party,
      strategic_goal_id,
      lead_department_id,
      departments!initiatives_lead_department_id_fkey(name)
    `,
      { count: 'exact' }
    )
    .in('strategic_goal_id', goalIds)

  // Apply filters
  if (filters.priority_levels && filters.priority_levels.length > 0) {
    initiativesQuery = initiativesQuery.in('priority_level', filters.priority_levels)
  }

  if (filters.status && filters.status.length > 0) {
    initiativesQuery = initiativesQuery.in('status', filters.status)
  }

  if (filters.search) {
    initiativesQuery = initiativesQuery.ilike('name', `%${filters.search}%`)
  }

  // Get total count for pagination
  const { count: totalCount } = await initiativesQuery

  // Apply sorting
  const sortBy = filters.sortBy || 'name'
  const sortOrder = filters.sortOrder || 'asc'

  if (sortBy === 'name') {
    initiativesQuery = initiativesQuery.order('name', { ascending: sortOrder === 'asc' })
  } else if (sortBy === 'priority') {
    initiativesQuery = initiativesQuery.order('priority_level', { ascending: sortOrder === 'asc' })
  } else if (sortBy === 'status') {
    initiativesQuery = initiativesQuery.order('status', { ascending: sortOrder === 'asc' })
  } else if (sortBy === 'budget') {
    // Note: Sorting by calculated field is done client-side after fetch
  }

  // Apply pagination
  const offset = (page - 1) * pageSize
  initiativesQuery = initiativesQuery.range(offset, offset + pageSize - 1)

  const { data: initiatives, error: initiativesError } = await initiativesQuery

  if (initiativesError) {
    console.error('Error fetching initiatives:', initiativesError)
    throw new Error('Failed to fetch initiatives')
  }

  type Initiative = {
    id: string
    name: string
    priority_level: string
    status: string
    total_year_1_cost: number
    total_year_2_cost: number
    total_year_3_cost: number
    responsible_party: string | null
    strategic_goal_id: string
    lead_department_id: string
    departments: { name: string }
  }

  const typedInitiatives = (initiatives || []) as Initiative[]

  // Get all initiatives for counts (without pagination)
  const { data: allInitiatives } = await supabase
    .from('initiatives')
    .select('id, priority_level, status, total_year_1_cost, total_year_2_cost, total_year_3_cost')
    .in('strategic_goal_id', goalIds)

  type AllInitiative = {
    id: string
    priority_level: string
    status: string
    total_year_1_cost: number
    total_year_2_cost: number
    total_year_3_cost: number
  }

  const typedAllInitiatives = (allInitiatives || []) as AllInitiative[]

  // Calculate counts
  const counts: InitiativeCounts = {
    byPriority: { NEED: 0, WANT: 0, NICE_TO_HAVE: 0 },
    byStatus: { not_started: 0, in_progress: 0, at_risk: 0, completed: 0, deferred: 0 },
  }

  let totalBudget = 0

  typedAllInitiatives.forEach((init) => {
    // Count by priority
    if (init.priority_level in counts.byPriority) {
      counts.byPriority[init.priority_level as keyof typeof counts.byPriority]++
    }

    // Count by status
    if (init.status in counts.byStatus) {
      counts.byStatus[init.status as keyof typeof counts.byStatus]++
    }

    // Sum budget
    totalBudget += init.total_year_1_cost + init.total_year_2_cost + init.total_year_3_cost
  })

  // Get at-risk initiatives (full details)
  const { data: atRiskInits } = await supabase
    .from('initiatives')
    .select(
      `
      id,
      name,
      priority_level,
      status,
      total_year_1_cost,
      total_year_2_cost,
      total_year_3_cost,
      responsible_party,
      strategic_goal_id,
      lead_department_id,
      departments!initiatives_lead_department_id_fkey(name)
    `
    )
    .in('strategic_goal_id', goalIds)
    .eq('status', 'at_risk')
    .order('total_year_1_cost', { ascending: false })
    .limit(10)

  const typedAtRiskInits = (atRiskInits || []) as Initiative[]

  // Map initiatives to summary format
  const mapInitiative = (init: Initiative): InitiativeSummary => {
    const goal = typedGoals.find((g) => g.id === init.strategic_goal_id)
    const plan = goal ? typedPlans.find((p) => p.id === goal.strategic_plan_id) : null

    return {
      id: init.id,
      name: init.name,
      department_name: init.departments.name,
      plan_title: plan?.title || 'Unknown Plan',
      goal_title: goal?.title || 'Unknown Goal',
      priority_level: init.priority_level,
      status: init.status,
      total_cost: init.total_year_1_cost + init.total_year_2_cost + init.total_year_3_cost,
      year_1_cost: init.total_year_1_cost,
      year_2_cost: init.total_year_2_cost,
      year_3_cost: init.total_year_3_cost,
      responsible_party: init.responsible_party,
    }
  }

  const initiativesSummary = typedInitiatives.map(mapInitiative)
  const atRiskSummary = typedAtRiskInits.map(mapInitiative)

  // Sort by budget if requested (client-side)
  if (sortBy === 'budget') {
    initiativesSummary.sort((a, b) => {
      const comparison = a.total_cost - b.total_cost
      return sortOrder === 'asc' ? comparison : -comparison
    })
  }

  return {
    summary: {
      total_initiatives: typedAllInitiatives.length,
      at_risk_count: counts.byStatus.at_risk,
      total_budget: totalBudget,
    },
    counts,
    atRiskInitiatives: atRiskSummary,
    initiatives: initiativesSummary,
    pagination: {
      total: totalCount || 0,
      page,
      pageSize,
      totalPages: Math.ceil((totalCount || 0) / pageSize),
    },
  }
}
