'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { SwotAnalysis, EnvironmentalScan } from './strategic-plans'

export interface DashboardData {
  plan: {
    id: string
    title: string
    status: string
    fiscal_year_start: string
    fiscal_year_end: string
    department_name: string
    swot_analysis: SwotAnalysis | null
    environmental_scan: EnvironmentalScan | null
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

  // Get current user
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser()

  if (!currentUser) {
    throw new Error('Unauthorized')
  }

  // Get plan metadata with department info
  const { data: plan, error: planError } = await supabase
    .from('strategic_plans')
    .select('id, title, status, fiscal_year_start, fiscal_year_end, swot_analysis, environmental_scan, departments(name)')
    .eq('id', planId)
    .single()

  if (planError || !plan) {
    throw new Error('Plan not found')
  }

  type PlanData = {
    id: string
    title: string
    status: string
    fiscal_year_start: string
    fiscal_year_end: string
    swot_analysis: unknown
    environmental_scan: unknown
    departments: { name: string }
  }
  const typedPlan = plan as PlanData

  // Get all goals for this plan
  const { data: goals } = await supabase
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
    const { data: initiatives } = await supabase
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
    const { data: fundingSources } = await supabase
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
    const { data: initiativeKpis } = await supabase
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
    const { data: goalKpis } = await supabase
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
  const { data: planKpis } = await supabase
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
      fiscal_year_start: typedPlan.fiscal_year_start,
      fiscal_year_end: typedPlan.fiscal_year_end,
      department_name: typedPlan.departments.name,
      swot_analysis:
        typeof typedPlan.swot_analysis === 'object' && typedPlan.swot_analysis !== null
          ? (typedPlan.swot_analysis as SwotAnalysis)
          : null,
      environmental_scan:
        typeof typedPlan.environmental_scan === 'object' && typedPlan.environmental_scan !== null
          ? (typedPlan.environmental_scan as EnvironmentalScan)
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
