'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getCityWideBudget } from './city-budget'
import { getCityWideInitiatives } from './city-initiatives'

export interface ReportFilters {
  fiscal_year_ids?: string[]
  department_ids?: string[]
}

export interface DepartmentHighlight {
  department_id: string
  department_name: string
  plan_title: string
  total_budget: number
  initiative_count: number
  top_initiatives: Array<{
    name: string
    priority_level: string
    total_cost: number
  }>
}

export interface CouncilReportData {
  metadata: {
    title: string
    generated_at: string
    generated_by: string
    generated_by_name: string
    fiscal_years: string
    municipality_name: string
  }
  executive_summary: {
    total_plans: number
    total_initiatives: number
    total_budget: number
    at_risk_count: number
    completed_count: number
    in_progress_count: number
  }
  budget_summary: {
    by_year: Array<{
      fiscal_year: number
      total: number
    }>
    by_department: Array<{
      department_name: string
      total: number
      percentage: number
    }>
    by_funding_source: Array<{
      source_name: string
      total: number
      percentage: number
    }>
    by_priority: {
      need: number
      want: number
      nice_to_have: number
    }
  }
  department_highlights: DepartmentHighlight[]
  at_risk_initiatives: Array<{
    name: string
    department_name: string
    priority_level: string
    total_cost: number
    responsible_party: string | null
  }>
  top_initiatives: Array<{
    rank: number
    name: string
    department_name: string
    priority_level: string
    status: string
    total_cost: number
  }>
}

export async function generateCouncilReportData(
  filters: ReportFilters = {}
): Promise<CouncilReportData> {
  const supabase = createServerSupabaseClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  // Get user profile with municipality
  const { data: profile } = await supabase
    .from('users')
    .select('role, first_name, last_name, municipality_id, municipalities(name)')
    .eq('id', user.id)
    .single()

  if (!profile) {
    throw new Error('User profile not found')
  }

  type Profile = {
    role: string
    first_name: string
    last_name: string
    municipality_id: string
    municipalities: { name: string }
  }

  const typedProfile = profile as unknown as Profile

  // Only City Manager and Admin can generate reports
  if (typedProfile.role !== 'city_manager' && typedProfile.role !== 'admin') {
    throw new Error('Access denied: City Manager or Admin role required')
  }

  // Get fiscal years for display
  let fiscalYearsDisplay = 'All Years'
  if (filters.fiscal_year_ids && filters.fiscal_year_ids.length > 0) {
    const { data: fiscalYears } = await supabase
      .from('fiscal_years')
      .select('year')
      .in('id', filters.fiscal_year_ids)
      .order('year')

    if (fiscalYears && fiscalYears.length > 0) {
      const years = fiscalYears.map((fy) => (fy as { year: number }).year)
      fiscalYearsDisplay = years.join(', ')
    }
  }

  // Fetch comprehensive data
  const [budgetData, initiativesData] = await Promise.all([
    getCityWideBudget({
      fiscal_year_ids: filters.fiscal_year_ids,
      department_ids: filters.department_ids,
    }),
    getCityWideInitiatives(
      {
        department_ids: filters.department_ids,
      },
      1,
      1000 // Get all for report
    ),
  ])

  // Calculate budget by priority
  const budgetByPriority = {
    need: 0,
    want: 0,
    nice_to_have: 0,
  }

  initiativesData.initiatives.forEach((init) => {
    if (init.priority_level === 'NEED') {
      budgetByPriority.need += init.total_cost
    } else if (init.priority_level === 'WANT') {
      budgetByPriority.want += init.total_cost
    } else if (init.priority_level === 'NICE_TO_HAVE') {
      budgetByPriority.nice_to_have += init.total_cost
    }
  })

  // Calculate department percentages
  const totalBudget = budgetData.summary.total_budget
  const budgetByDeptWithPercentage = budgetData.budgetByDepartment.map((dept) => ({
    ...dept,
    percentage: totalBudget > 0 ? (dept.total / totalBudget) * 100 : 0,
  }))

  // Group initiatives by department for highlights
  const deptMap = new Map<string, DepartmentHighlight>()

  initiativesData.initiatives.forEach((init) => {
    if (!deptMap.has(init.department_name)) {
      deptMap.set(init.department_name, {
        department_id: init.department_name, // Using name as ID for now
        department_name: init.department_name,
        plan_title: init.plan_title,
        total_budget: 0,
        initiative_count: 0,
        top_initiatives: [],
      })
    }

    const dept = deptMap.get(init.department_name)!
    dept.total_budget += init.total_cost
    dept.initiative_count++
  })

  // Get top 3 initiatives per department
  const departmentHighlights: DepartmentHighlight[] = []
  deptMap.forEach((dept) => {
    const deptInits = initiativesData.initiatives
      .filter((init) => init.department_name === dept.department_name)
      .sort((a, b) => b.total_cost - a.total_cost)
      .slice(0, 3)

    dept.top_initiatives = deptInits.map((init) => ({
      name: init.name,
      priority_level: init.priority_level,
      total_cost: init.total_cost,
    }))

    departmentHighlights.push(dept)
  })

  // Sort department highlights by budget (descending)
  departmentHighlights.sort((a, b) => b.total_budget - a.total_budget)

  // Get at-risk initiatives
  const atRiskInitiatives = initiativesData.atRiskInitiatives.slice(0, 10).map((init) => ({
    name: init.name,
    department_name: init.department_name,
    priority_level: init.priority_level,
    total_cost: init.total_cost,
    responsible_party: init.responsible_party,
  }))

  // Get top 10 initiatives by budget
  const topInitiatives = initiativesData.initiatives
    .sort((a, b) => b.total_cost - a.total_cost)
    .slice(0, 10)
    .map((init, index) => ({
      rank: index + 1,
      name: init.name,
      department_name: init.department_name,
      priority_level: init.priority_level,
      status: init.status,
      total_cost: init.total_cost,
    }))

  return {
    metadata: {
      title: 'City Council Strategic Planning Report',
      generated_at: new Date().toISOString(),
      generated_by: user.id,
      generated_by_name: `${typedProfile.first_name} ${typedProfile.last_name}`,
      fiscal_years: fiscalYearsDisplay,
      municipality_name: typedProfile.municipalities.name,
    },
    executive_summary: {
      total_plans: budgetData.summary.total_plans,
      total_initiatives: initiativesData.summary.total_initiatives,
      total_budget: budgetData.summary.total_budget,
      at_risk_count: initiativesData.summary.at_risk_count,
      completed_count: initiativesData.counts.byStatus.completed,
      in_progress_count: initiativesData.counts.byStatus.in_progress,
    },
    budget_summary: {
      by_year: budgetData.budgetByYear.map((item) => ({
        fiscal_year: item.fiscal_year,
        total: item.total,
      })),
      by_department: budgetByDeptWithPercentage.map((item) => ({
        department_name: item.department_name,
        total: item.total,
        percentage: item.percentage,
      })),
      by_funding_source: budgetData.budgetByFundingSource,
      by_priority: budgetByPriority,
    },
    department_highlights: departmentHighlights,
    at_risk_initiatives: atRiskInitiatives,
    top_initiatives: topInitiatives,
  }
}
