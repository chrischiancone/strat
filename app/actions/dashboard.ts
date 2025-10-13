'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'
import type { SwotAnalysis, EnvironmentalScan, BenchmarkingData } from './strategic-plans'

export interface DashboardData {
  plan: {
    id: string
    title: string
    status: string
    fiscal_year_start: string
    fiscal_year_end: string
    department_name: string
    created_by: string
    swot_analysis: SwotAnalysis | null
    environmental_scan: EnvironmentalScan | null
    benchmarking_data: BenchmarkingData | null
  }

  goalCount: number

  initiativesByPriority: {
    NEED: number
    WANT: number
    NICE_TO_HAVE: number
  }

  initiativesByStatus: {
    not_started: number
    in_progress: number
    at_risk: number
    completed: number
    deferred: number
  }

  budgetByYear: {
    year_1: number
    year_2: number
    year_3: number
  }

  budgetByFundingSource: Array<{
    source_name: string
    total: number
  }>

  kpiProgress: Array<{
    id: string
    metric_name: string
    baseline_value: string
    year_1_target: string
    year_2_target: string
    year_3_target: string
    initiative_name?: string
    goal_name?: string
  }>
}

export async function getDashboardData(planId: string): Promise<DashboardData> {
  const supabase = createServerSupabaseClient()
  const adminClient = createAdminSupabaseClient()

  // Get current user for authentication
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser()

  if (!currentUser) {
    throw new Error('Unauthorized')
  }

  // Use admin client for data queries to bypass RLS
  // We've already verified user authentication above
  const { data: plan, error: planError } = await adminClient
    .from('strategic_plans')
    .select(`
      id,
      title,
      status,
      created_by,
      swot_analysis,
      environmental_scan,
      benchmarking_data,
      departments(name),
      start_fiscal_year:fiscal_years!start_fiscal_year_id(year),
      end_fiscal_year:fiscal_years!end_fiscal_year_id(year)
    `)
    .eq('id', planId)
    .single()

  if (planError || !plan) {
    console.error('Error loading plan:', planError)
    throw new Error('Plan not found')
  }

  type PlanData = {
    id: string
    title: string
    status: string
    created_by: string
    swot_analysis: unknown
    environmental_scan: unknown
    benchmarking_data: unknown
    departments: { name: string }
    start_fiscal_year: { year: number }
    end_fiscal_year: { year: number }
  }
  const typedPlan = plan as PlanData

  // Get all goals for this plan
  const { data: goals } = await adminClient
    .from('strategic_goals')
    .select('id')
    .eq('strategic_plan_id', planId)

  type Goal = { id: string }
  const typedGoals = (goals || []) as Goal[]
  const goalCount = typedGoals.length
  const goalIds = typedGoals.map((g) => g.id)

  // Initialize counts
  const initiativesByPriority = {
    NEED: 0,
    WANT: 0,
    NICE_TO_HAVE: 0,
  }

  const initiativesByStatus = {
    not_started: 0,
    in_progress: 0,
    at_risk: 0,
    completed: 0,
    deferred: 0,
  }

  const budgetByYear = {
    year_1: 0,
    year_2: 0,
    year_3: 0,
  }

  // Get all initiatives for this plan
  if (goalIds.length > 0) {
    const { data: initiatives } = await adminClient
      .from('initiatives')
      .select('priority_level, status, total_year_1_cost, total_year_2_cost, total_year_3_cost')
      .in('strategic_goal_id', goalIds)

    type Initiative = {
      priority_level: string
      status: string
      total_year_1_cost: number
      total_year_2_cost: number
      total_year_3_cost: number
    }
    const typedInitiatives = (initiatives || []) as Initiative[]

    typedInitiatives.forEach((initiative) => {
      // Count by priority
      if (initiative.priority_level in initiativesByPriority) {
        initiativesByPriority[initiative.priority_level as keyof typeof initiativesByPriority]++
      }

      // Count by status
      if (initiative.status in initiativesByStatus) {
        initiativesByStatus[initiative.status as keyof typeof initiativesByStatus]++
      }

      // Sum budgets
      budgetByYear.year_1 += initiative.total_year_1_cost || 0
      budgetByYear.year_2 += initiative.total_year_2_cost || 0
      budgetByYear.year_3 += initiative.total_year_3_cost || 0
    })
  }

  // Get funding sources
  let budgetByFundingSource: Array<{ source_name: string; total: number }> = []

  if (goalIds.length > 0) {
    const { data: fundingSources } = await adminClient
      .from('initiative_budgets')
      .select('source_name, amount, initiatives!inner(strategic_goal_id)')
      .in('initiatives.strategic_goal_id', goalIds)

    type FundingSource = {
      source_name: string
      amount: number
    }
    const typedFundingSources = (fundingSources || []) as FundingSource[]

    // Aggregate by source name
    const sourceMap = new Map<string, number>()
    typedFundingSources.forEach((source) => {
      const currentTotal = sourceMap.get(source.source_name) || 0
      sourceMap.set(source.source_name, currentTotal + source.amount)
    })

    budgetByFundingSource = Array.from(sourceMap.entries()).map(([source_name, total]) => ({
      source_name,
      total,
    }))
  }

  // Get KPIs for this plan (initiative-level, goal-level, and plan-level)
  let kpiProgress: DashboardData['kpiProgress'] = []

  if (goalIds.length > 0) {
    // Get initiative-level KPIs
    const { data: initiativeKpis } = await adminClient
      .from('initiative_kpis')
      .select(`
        id,
        metric_name,
        baseline_value,
        year_1_target,
        year_2_target,
        year_3_target,
        initiatives!inner(name, strategic_goal_id)
      `)
      .in('initiatives.strategic_goal_id', goalIds)

    type InitiativeKpi = {
      id: string
      metric_name: string
      baseline_value: string
      year_1_target: string
      year_2_target: string
      year_3_target: string
      initiatives: { name: string }
    }
    const typedInitiativeKpis = (initiativeKpis || []) as InitiativeKpi[]

    kpiProgress = kpiProgress.concat(
      typedInitiativeKpis.map((kpi) => ({
        id: kpi.id,
        metric_name: kpi.metric_name,
        baseline_value: kpi.baseline_value,
        year_1_target: kpi.year_1_target,
        year_2_target: kpi.year_2_target,
        year_3_target: kpi.year_3_target,
        initiative_name: kpi.initiatives.name,
      }))
    )

    // Get goal-level KPIs
    const { data: goalKpis } = await adminClient
      .from('initiative_kpis')
      .select(`
        id,
        metric_name,
        baseline_value,
        year_1_target,
        year_2_target,
        year_3_target,
        strategic_goals!inner(title)
      `)
      .in('strategic_goal_id', goalIds)
      .is('initiative_id', null)

    type GoalKpi = {
      id: string
      metric_name: string
      baseline_value: string
      year_1_target: string
      year_2_target: string
      year_3_target: string
      strategic_goals: { title: string }
    }
    const typedGoalKpis = (goalKpis || []) as GoalKpi[]

    kpiProgress = kpiProgress.concat(
      typedGoalKpis.map((kpi) => ({
        id: kpi.id,
        metric_name: kpi.metric_name,
        baseline_value: kpi.baseline_value,
        year_1_target: kpi.year_1_target,
        year_2_target: kpi.year_2_target,
        year_3_target: kpi.year_3_target,
        goal_name: kpi.strategic_goals.title,
      }))
    )
  }

  // Get plan-level KPIs
  const { data: planKpis } = await adminClient
    .from('initiative_kpis')
    .select('id, metric_name, baseline_value, year_1_target, year_2_target, year_3_target')
    .eq('strategic_plan_id', planId)
    .is('strategic_goal_id', null)
    .is('initiative_id', null)

  type PlanKpi = {
    id: string
    metric_name: string
    baseline_value: string
    year_1_target: string
    year_2_target: string
    year_3_target: string
  }
  const typedPlanKpis = (planKpis || []) as PlanKpi[]

  kpiProgress = kpiProgress.concat(
    typedPlanKpis.map((kpi) => ({
      id: kpi.id,
      metric_name: kpi.metric_name,
      baseline_value: kpi.baseline_value,
      year_1_target: kpi.year_1_target,
      year_2_target: kpi.year_2_target,
      year_3_target: kpi.year_3_target,
    }))
  )

  return {
    plan: {
      id: typedPlan.id,
      title: typedPlan.title,
      status: typedPlan.status,
      fiscal_year_start: typedPlan.start_fiscal_year.year.toString(),
      fiscal_year_end: typedPlan.end_fiscal_year.year.toString(),
      department_name: typedPlan.departments.name,
      created_by: typedPlan.created_by,
      swot_analysis:
        typeof typedPlan.swot_analysis === 'object' && typedPlan.swot_analysis !== null
          ? (typedPlan.swot_analysis as SwotAnalysis)
          : null,
      environmental_scan:
        typeof typedPlan.environmental_scan === 'object' && typedPlan.environmental_scan !== null
          ? (typedPlan.environmental_scan as EnvironmentalScan)
          : null,
      benchmarking_data:
        typeof typedPlan.benchmarking_data === 'object' && typedPlan.benchmarking_data !== null
          ? (typedPlan.benchmarking_data as BenchmarkingData)
          : null,
    },
    goalCount,
    initiativesByPriority,
    initiativesByStatus,
    budgetByYear,
    budgetByFundingSource,
    kpiProgress,
  }
}

// Main dashboard statistics
export interface MainDashboardStats {
  userInfo: {
    name: string
    email: string
    role: string
    departmentName: string | null
  }
  fiscalYear: {
    current: string
    start: number
    end: number
  } | null
  stats: {
    totalPlans: number
    activePlans: number
    totalInitiatives: number
    activeInitiatives: number
    totalBudget: number
  }
  recentPlans: Array<{
    id: string
    title: string
    status: string
    updated_at: string
    department_name: string
  }>
  recentInitiatives: Array<{
    id: string
    name: string
    status: string
    plan_id: string
    plan_title: string
  }>
}

export async function getMainDashboardStats(): Promise<MainDashboardStats> {
  const supabase = createServerSupabaseClient()
  const adminSupabase = createAdminSupabaseClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  // Get user profile with department using admin client
  const { data: profile } = await adminSupabase
    .from('users')
    .select('full_name, role, department_id, departments:department_id(name)')
    .eq('id', user.id)
    .single<{
      full_name: string
      role: string
      department_id: string | null
      departments: { name: string } | null
    }>()

  const userRole = profile?.role || 'staff'
  const departmentId = profile?.department_id
  const departmentName = profile?.departments?.name || null
  const userName = profile?.full_name || user.email || 'User'

  // Determine access level
  const isAdmin = userRole === 'admin'
  const isFinance = userRole === 'finance'
  const isCityManager = userRole === 'city_manager'
  const hasFullAccess = isAdmin || isFinance || isCityManager

  // Get user's municipality to fetch current fiscal year
  const { data: userWithMunicipality } = await adminSupabase
    .from('users')
    .select('municipality_id')
    .eq('id', user.id)
    .single<{ municipality_id: string }>()

  // Fetch current fiscal year
  let currentFiscalYear = null
  if (userWithMunicipality?.municipality_id) {
    const { data: fiscalYear } = await adminSupabase
      .from('fiscal_years')
      .select('year, start_date, end_date')
      .eq('municipality_id', userWithMunicipality.municipality_id)
      .eq('is_current', true)
      .single<{ year: number; start_date: string; end_date: string }>()
    
    if (fiscalYear) {
      const startYear = new Date(fiscalYear.start_date).getFullYear()
      const endYear = new Date(fiscalYear.end_date).getFullYear()
      currentFiscalYear = {
        current: fiscalYear.year.toString(),
        start: startYear,
        end: endYear
      }
    }
  }

  // Fetch total plans using admin client
  let plansQuery = adminSupabase.from('strategic_plans').select('id, status', { count: 'exact' })
  if (!hasFullAccess && departmentId) {
    plansQuery = plansQuery.eq('department_id', departmentId)
  }
  const { count: totalPlans } = await plansQuery

  // Fetch active plans using admin client
  let activePlansQuery = adminSupabase
    .from('strategic_plans')
    .select('id', { count: 'exact' })
    .eq('status', 'active')
  if (!hasFullAccess && departmentId) {
    activePlansQuery = activePlansQuery.eq('department_id', departmentId)
  }
  const { count: activePlans } = await activePlansQuery

  // Declare initiative counters at function level to fix scoping
  let totalInitiatives = 0
  let activeInitiatives = 0

  // Fetch total initiatives using admin client
  if (!hasFullAccess && departmentId) {
    // For department users, filter initiatives by department through strategic plans
    const { data: planIds } = await adminSupabase
      .from('strategic_plans')
      .select('id')
      .eq('department_id', departmentId)
    
    const planIdList = planIds?.map(p => p.id) || []
    
    if (planIdList.length > 0) {
      const { data: goalIds } = await adminSupabase
        .from('strategic_goals')
        .select('id')
        .in('strategic_plan_id', planIdList)
      
      const goalIdList = goalIds?.map(g => g.id) || []
      
      const { count: totalInitiativesCount } = await adminSupabase
        .from('initiatives')
        .select('id', { count: 'exact' })
        .in('strategic_goal_id', goalIdList.length > 0 ? goalIdList : [])
      
      const { count: activeInitiativesCount } = await adminSupabase
        .from('initiatives')
        .select('id', { count: 'exact' })
        .in('strategic_goal_id', goalIdList.length > 0 ? goalIdList : [])
        .eq('status', 'in_progress')
      
      totalInitiatives = totalInitiativesCount || 0
      activeInitiatives = activeInitiativesCount || 0
    } else {
      totalInitiatives = 0
      activeInitiatives = 0
    }
  } else {
    // For admin/city manager/finance, show all initiatives
    const { count: totalInitiativesCount } = await adminSupabase
      .from('initiatives')
      .select('id', { count: 'exact' })
    
    const { count: activeInitiativesCount } = await adminSupabase
      .from('initiatives')
      .select('id', { count: 'exact' })
      .eq('status', 'in_progress')
    
    totalInitiatives = totalInitiativesCount || 0
    activeInitiatives = activeInitiativesCount || 0
  }

  // Fetch total budget using admin client
  let budgetData
  if (!hasFullAccess && departmentId) {
    // For department users, filter budget by department
    const { data: planIds } = await adminSupabase
      .from('strategic_plans')
      .select('id')
      .eq('department_id', departmentId)
    
    const planIdList = planIds?.map(p => p.id) || []
    
    if (planIdList.length > 0) {
      const { data: goalIds } = await adminSupabase
        .from('strategic_goals')
        .select('id')
        .in('strategic_plan_id', planIdList)
      
      const goalIdList = goalIds?.map(g => g.id) || []
      
      const { data } = await adminSupabase
        .from('initiatives')
        .select('year_1_cost, year_2_cost, year_3_cost')
        .in('strategic_goal_id', goalIdList.length > 0 ? goalIdList : [])
      
      budgetData = data
    } else {
      budgetData = []
    }
  } else {
    // For admin/city manager/finance, show all budget data
    const { data } = await adminSupabase
      .from('initiatives')
      .select('year_1_cost, year_2_cost, year_3_cost')
    budgetData = data
  }

  type InitiativeBudget = {
    year_1_cost: number | null
    year_2_cost: number | null
    year_3_cost: number | null
  }
  const typedBudgetData = (budgetData || []) as InitiativeBudget[]
  
  const totalBudget = typedBudgetData.reduce((sum, init) => {
    const year1 = init.year_1_cost || 0
    const year2 = init.year_2_cost || 0
    const year3 = init.year_3_cost || 0
    return sum + year1 + year2 + year3
  }, 0)

  // Fetch recent plans (last 5) using admin client
  let recentPlansQuery = adminSupabase
    .from('strategic_plans')
    .select('id, title, status, updated_at, departments:department_id(name)')
    .order('updated_at', { ascending: false })
    .limit(5)
  if (!hasFullAccess && departmentId) {
    recentPlansQuery = recentPlansQuery.eq('department_id', departmentId)
  }
  const { data: recentPlansData } = await recentPlansQuery

  type RecentPlan = {
    id: string
    title: string | null
    status: string
    updated_at: string
    departments: { name: string } | null
  }
  const typedRecentPlansData = (recentPlansData || []) as RecentPlan[]
  
  const recentPlans = typedRecentPlansData.map((plan) => ({
    id: plan.id,
    title: plan.title || 'Untitled Plan',
    status: plan.status,
    updated_at: plan.updated_at,
    department_name: plan.departments?.name || 'Unknown',
  }))

  // Fetch recent initiatives (last 5) using admin client
  let recentInitiativesData
  if (!hasFullAccess && departmentId) {
    // For department users, filter recent initiatives by department
    const { data: planIds } = await adminSupabase
      .from('strategic_plans')
      .select('id')
      .eq('department_id', departmentId)
    
    const planIdList = planIds?.map(p => p.id) || []
    
    if (planIdList.length > 0) {
      const { data: goalIds } = await adminSupabase
        .from('strategic_goals')
        .select('id, strategic_plan_id')
        .in('strategic_plan_id', planIdList)
      
      const goalIdList = goalIds?.map(g => g.id) || []
      const goalToPlanMap = new Map(goalIds?.map(g => [g.id, g.strategic_plan_id]) || [])
      
      const { data } = await adminSupabase
        .from('initiatives')
        .select('id, name, status, strategic_goal_id')
        .in('strategic_goal_id', goalIdList.length > 0 ? goalIdList : [])
        .order('created_at', { ascending: false })
        .limit(5)
      
      // Get plan titles for each initiative
      const planData = planIds || []
      const planTitleMap = new Map()
      
      for (const plan of planData) {
        const { data: planDetails } = await adminSupabase
          .from('strategic_plans')
          .select('id, title')
          .eq('id', plan.id)
          .single()
        if (planDetails) {
          planTitleMap.set(planDetails.id, planDetails.title)
        }
      }
      
      recentInitiativesData = data?.map(init => ({
        ...init,
        plan_id: goalToPlanMap.get(init.strategic_goal_id) || '',
        strategic_plans: { title: planTitleMap.get(goalToPlanMap.get(init.strategic_goal_id)) || 'Unknown Plan' }
      })) || []
    } else {
      recentInitiativesData = []
    }
  } else {
    // For admin/city manager/finance, show all recent initiatives
    const { data } = await adminSupabase
      .from('initiatives')
      .select('id, name, status, strategic_goal_id, strategic_goals!inner(strategic_plan_id, strategic_plans!inner(id, title))')
      .order('created_at', { ascending: false })
      .limit(5)
    
    recentInitiativesData = data?.map(init => ({
      id: init.id,
      name: init.name,
      status: init.status,
      strategic_goal_id: init.strategic_goal_id,
      plan_id: (init.strategic_goals as any)?.strategic_plans?.id || '',
      strategic_plans: { title: (init.strategic_goals as any)?.strategic_plans?.title || 'Unknown Plan' }
    })) || []
  }

  type RecentInitiative = {
    id: string
    name: string
    status: string
    plan_id: string
    strategic_plans: { title: string } | null
  }
  const typedRecentInitiativesData = (recentInitiativesData || []) as RecentInitiative[]
  
  const recentInitiatives = typedRecentInitiativesData.map((init) => ({
    id: init.id,
    name: init.name,
    status: init.status,
    plan_id: init.plan_id,
    plan_title: init.strategic_plans?.title || 'Unknown Plan',
  }))

  return {
    userInfo: {
      name: userName,
      email: user.email || '',
      role: userRole,
      departmentName,
    },
    fiscalYear: currentFiscalYear,
    stats: {
      totalPlans: totalPlans || 0,
      activePlans: activePlans || 0,
      totalInitiatives: totalInitiatives || 0,
      activeInitiatives: activeInitiatives || 0,
      totalBudget,
    },
    recentPlans,
    recentInitiatives,
  }
}
