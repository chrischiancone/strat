'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'

export interface InitiativeDetailData {
  id: string
  name: string
  description: string | null
  priority_level: string
  status: string
  year_1_cost: number
  year_2_cost: number
  year_3_cost: number
  total_cost: number
  funding_sources: string[]
  responsible_party: string | null
  financial_analysis: unknown
  goal: {
    id: string
    title: string
    description: string | null
  }
  plan: {
    id: string
    title: string
    department_name: string
    fiscal_year_start: number
    fiscal_year_end: number
    created_by: string
  }
  budgets: Array<{
    id: string
    fiscal_year: number
    year_number: number
    personnel_cost: number
    equipment_cost: number
    services_cost: number
    training_cost: number
    materials_cost: number
    other_cost: number
    total_cost: number
    funding_source: string
    funding_status: string
    notes: string | null
  }>
}

export async function getInitiativeDetail(initiativeId: string): Promise<InitiativeDetailData> {
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
    .select('role, department_id, municipality_id')
    .eq('id', user.id)
    .single()

  if (!profile) {
    throw new Error('User profile not found')
  }

  type Profile = {
    role: string
    department_id: string | null
    municipality_id: string
  }

  const typedProfile = profile as unknown as Profile

  // Fetch initiative with all related data
  const { data: initiative, error } = await supabase
    .from('initiatives')
    .select(
      `
      id,
      name,
      description,
      priority_level,
      status,
      year_1_cost,
      year_2_cost,
      year_3_cost,
      total_cost,
      funding_sources,
      responsible_party,
      financial_analysis,
      goal:strategic_goals!inner(
        id,
        title,
        description,
        strategic_plan:strategic_plans!inner(
          id,
          title,
          fiscal_year_start,
          fiscal_year_end,
          department_id,
          created_by,
          department:departments!inner(
            name,
            municipality_id
          )
        )
      ),
      initiative_budgets(
        id,
        fiscal_year,
        year_number,
        personnel_cost,
        equipment_cost,
        services_cost,
        training_cost,
        materials_cost,
        other_cost,
        total_cost,
        funding_source,
        funding_status,
        notes
      )
    `
    )
    .eq('id', initiativeId)
    .single()

  if (error) {
    console.error('Error fetching initiative:', error)
    throw new Error('Failed to fetch initiative')
  }

  if (!initiative) {
    throw new Error('Initiative not found')
  }

  // Type the response
  type InitiativeResponse = {
    id: string
    name: string
    description: string | null
    priority_level: string
    status: string
    year_1_cost: number
    year_2_cost: number
    year_3_cost: number
    total_cost: number
    funding_sources: string[]
    responsible_party: string | null
    financial_analysis: unknown
    goal: {
      id: string
      title: string
      description: string | null
      strategic_plan: {
        id: string
        title: string
        fiscal_year_start: number
        fiscal_year_end: number
        department_id: string
        created_by: string
        department: {
          name: string
          municipality_id: string
        }
      }
    }
    initiative_budgets: Array<{
      id: string
      fiscal_year: number
      year_number: number
      personnel_cost: number
      equipment_cost: number
      services_cost: number
      training_cost: number
      materials_cost: number
      other_cost: number
      total_cost: number
      funding_source: string
      funding_status: string
      notes: string | null
    }>
  }

  const typedInitiative = initiative as unknown as InitiativeResponse

  // Check access permissions
  const isSameMunicipality = typedInitiative.goal.strategic_plan.department.municipality_id === typedProfile.municipality_id
  const isFinance = typedProfile.role === 'finance'
  const isAdmin = typedProfile.role === 'admin'
  const isCityManager = typedProfile.role === 'city_manager'
  const isSameDepartment = typedProfile.department_id === typedInitiative.goal.strategic_plan.department_id

  if (!isSameMunicipality || !(isFinance || isAdmin || isCityManager || isSameDepartment)) {
    throw new Error('Access denied')
  }

  // Transform to expected format
  return {
    id: typedInitiative.id,
    name: typedInitiative.name,
    description: typedInitiative.description,
    priority_level: typedInitiative.priority_level,
    status: typedInitiative.status,
    year_1_cost: typedInitiative.year_1_cost,
    year_2_cost: typedInitiative.year_2_cost,
    year_3_cost: typedInitiative.year_3_cost,
    total_cost: typedInitiative.total_cost,
    funding_sources: typedInitiative.funding_sources || [],
    responsible_party: typedInitiative.responsible_party,
    financial_analysis: typedInitiative.financial_analysis,
    goal: {
      id: typedInitiative.goal.id,
      title: typedInitiative.goal.title,
      description: typedInitiative.goal.description,
    },
    plan: {
      id: typedInitiative.goal.strategic_plan.id,
      title: typedInitiative.goal.strategic_plan.title,
      department_name: typedInitiative.goal.strategic_plan.department.name,
      fiscal_year_start: typedInitiative.goal.strategic_plan.fiscal_year_start,
      fiscal_year_end: typedInitiative.goal.strategic_plan.fiscal_year_end,
      created_by: typedInitiative.goal.strategic_plan.created_by,
    },
    budgets: typedInitiative.initiative_budgets.sort((a, b) => a.year_number - b.year_number),
  }
}
