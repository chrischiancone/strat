'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type PriorityLevel = 'NEED' | 'WANT' | 'NICE_TO_HAVE'
export type InitiativeStatus = 'not_started' | 'in_progress' | 'at_risk' | 'completed' | 'deferred'

export interface Initiative {
  id: string
  strategic_goal_id: string
  lead_department_id: string
  fiscal_year_id: string
  initiative_number: string
  name: string
  priority_level: PriorityLevel
  rank_within_priority: number
  description: string | null
  rationale: string | null
  expected_outcomes: string[]
  status: InitiativeStatus
  responsible_party: string | null
  total_year_1_cost: number
  total_year_2_cost: number
  total_year_3_cost: number
  created_at: string
  updated_at: string
  goal?: {
    id: string
    goal_number: number
    title: string
    strategic_plan_id: string
  }
}

export interface CreateInitiativeInput {
  strategic_goal_id: string
  initiative_number: string
  name: string
  priority_level: PriorityLevel
  rank_within_priority: number
  description: string
  rationale: string
  expected_outcomes: string[]
  responsible_party?: string
  lead_department_id: string
  fiscal_year_id: string
}

export interface UpdateInitiativeInput {
  id: string
  initiative_number?: string
  name?: string
  priority_level?: PriorityLevel
  rank_within_priority?: number
  description?: string
  rationale?: string
  expected_outcomes?: string[]
  responsible_party?: string
  status?: InitiativeStatus
}

export async function getInitiatives(planId: string): Promise<Initiative[]> {
  const supabase = createServerSupabaseClient()

  // Get current user
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser()

  if (!currentUser) {
    throw new Error('Unauthorized')
  }

  // Fetch initiatives with goal info
  const { data, error } = await supabase
    .from('initiatives')
    .select(
      `
      id,
      strategic_goal_id,
      lead_department_id,
      fiscal_year_id,
      initiative_number,
      name,
      priority_level,
      rank_within_priority,
      description,
      rationale,
      expected_outcomes,
      status,
      responsible_party,
      total_year_1_cost,
      total_year_2_cost,
      total_year_3_cost,
      created_at,
      updated_at,
      strategic_goals!inner (
        id,
        goal_number,
        title,
        strategic_plan_id
      )
    `
    )
    .eq('strategic_goals.strategic_plan_id', planId)
    .order('rank_within_priority', { ascending: true })

  if (error) {
    console.error('Error fetching initiatives:', error)
    throw new Error('Failed to fetch initiatives')
  }

  // Type the response
  interface InitiativeQueryResult {
    id: string
    strategic_goal_id: string
    lead_department_id: string
    fiscal_year_id: string
    initiative_number: string
    name: string
    priority_level: string
    rank_within_priority: number
    description: string | null
    rationale: string | null
    expected_outcomes: unknown
    status: string
    responsible_party: string | null
    total_year_1_cost: number
    total_year_2_cost: number
    total_year_3_cost: number
    created_at: string
    updated_at: string
    strategic_goals: {
      id: string
      goal_number: number
      title: string
      strategic_plan_id: string
    }
  }

  return (data as unknown as InitiativeQueryResult[] || []).map((init) => ({
    id: init.id,
    strategic_goal_id: init.strategic_goal_id,
    lead_department_id: init.lead_department_id,
    fiscal_year_id: init.fiscal_year_id,
    initiative_number: init.initiative_number,
    name: init.name,
    priority_level: init.priority_level as PriorityLevel,
    rank_within_priority: init.rank_within_priority,
    description: init.description,
    rationale: init.rationale,
    expected_outcomes: Array.isArray(init.expected_outcomes)
      ? (init.expected_outcomes as string[])
      : [],
    status: init.status as InitiativeStatus,
    responsible_party: init.responsible_party,
    total_year_1_cost: init.total_year_1_cost,
    total_year_2_cost: init.total_year_2_cost,
    total_year_3_cost: init.total_year_3_cost,
    created_at: init.created_at,
    updated_at: init.updated_at,
    goal: {
      id: init.strategic_goals.id,
      goal_number: init.strategic_goals.goal_number,
      title: init.strategic_goals.title,
      strategic_plan_id: init.strategic_goals.strategic_plan_id,
    },
  }))
}

export async function getInitiativesByGoal(
  goalId: string
): Promise<Initiative[]> {
  const supabase = createServerSupabaseClient()

  // Get current user
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser()

  if (!currentUser) {
    throw new Error('Unauthorized')
  }

  // Fetch initiatives for this goal
  const { data, error } = await supabase
    .from('initiatives')
    .select(
      `
      id,
      strategic_goal_id,
      lead_department_id,
      fiscal_year_id,
      initiative_number,
      name,
      priority_level,
      rank_within_priority,
      description,
      rationale,
      expected_outcomes,
      status,
      responsible_party,
      total_year_1_cost,
      total_year_2_cost,
      total_year_3_cost,
      created_at,
      updated_at,
      strategic_goals!inner (
        id,
        goal_number,
        title,
        strategic_plan_id
      )
    `
    )
    .eq('strategic_goal_id', goalId)
    .order('priority_level', { ascending: true })
    .order('rank_within_priority', { ascending: true })

  if (error) {
    console.error('Error fetching initiatives by goal:', error)
    throw new Error('Failed to fetch initiatives')
  }

  // Type the response
  interface InitiativeQueryResult {
    id: string
    strategic_goal_id: string
    lead_department_id: string
    fiscal_year_id: string
    initiative_number: string
    name: string
    priority_level: string
    rank_within_priority: number
    description: string | null
    rationale: string | null
    expected_outcomes: unknown
    status: string
    responsible_party: string | null
    total_year_1_cost: number
    total_year_2_cost: number
    total_year_3_cost: number
    created_at: string
    updated_at: string
    strategic_goals: {
      id: string
      goal_number: number
      title: string
      strategic_plan_id: string
    }
  }

  return (data as unknown as InitiativeQueryResult[] || []).map((init) => ({
    id: init.id,
    strategic_goal_id: init.strategic_goal_id,
    lead_department_id: init.lead_department_id,
    fiscal_year_id: init.fiscal_year_id,
    initiative_number: init.initiative_number,
    name: init.name,
    priority_level: init.priority_level as PriorityLevel,
    rank_within_priority: init.rank_within_priority,
    description: init.description,
    rationale: init.rationale,
    expected_outcomes: Array.isArray(init.expected_outcomes)
      ? (init.expected_outcomes as string[])
      : [],
    status: init.status as InitiativeStatus,
    responsible_party: init.responsible_party,
    total_year_1_cost: init.total_year_1_cost,
    total_year_2_cost: init.total_year_2_cost,
    total_year_3_cost: init.total_year_3_cost,
    created_at: init.created_at,
    updated_at: init.updated_at,
    goal: {
      id: init.strategic_goals.id,
      goal_number: init.strategic_goals.goal_number,
      title: init.strategic_goals.title,
      strategic_plan_id: init.strategic_goals.strategic_plan_id,
    },
  }))
}

export async function createInitiative(
  input: CreateInitiativeInput
): Promise<{ id: string }> {
  const supabase = createServerSupabaseClient()

  // Get current user
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser()

  if (!currentUser) {
    throw new Error('Unauthorized')
  }

  // Get goal and plan info for permission checking
  const { data: goal } = await supabase
    .from('strategic_goals')
    .select('strategic_plans!inner(department_id)')
    .eq('id', input.strategic_goal_id)
    .single()

  if (!goal) {
    throw new Error('Goal not found')
  }

  const { data: userProfile } = await supabase
    .from('users')
    .select('role, department_id')
    .eq('id', currentUser.id)
    .single<{ role: string; department_id: string | null }>()

  if (!userProfile) {
    throw new Error('User profile not found')
  }

  // Check permissions
  const plan = (goal as { strategic_plans: { department_id: string } })
    .strategic_plans
  const canEdit =
    userProfile.role === 'admin' ||
    userProfile.role === 'city_manager' ||
    userProfile.department_id === plan.department_id

  if (!canEdit) {
    throw new Error('You do not have permission to add initiatives to this plan')
  }

  // Check for duplicate initiative number in the plan
  const { data: existingInitiatives } = await supabase
    .from('initiatives')
    .select('id, strategic_goals!inner(strategic_plan_id)')
    .eq('initiative_number', input.initiative_number)

  if (existingInitiatives && existingInitiatives.length > 0) {
    // Check if any are in the same plan
    const { data: goalPlanData } = await supabase
      .from('strategic_goals')
      .select('strategic_plan_id')
      .eq('id', input.strategic_goal_id)
      .single<{ strategic_plan_id: string }>()

    if (goalPlanData) {
      const samePlanInitiative = existingInitiatives.find(
        (init) =>
          (init as { strategic_goals: { strategic_plan_id: string } })
            .strategic_goals.strategic_plan_id === goalPlanData.strategic_plan_id
      )

      if (samePlanInitiative) {
        throw new Error(
          `Initiative number "${input.initiative_number}" is already in use in this plan`
        )
      }
    }
  }

  // Create the initiative
  const newInitiative = {
    strategic_goal_id: input.strategic_goal_id,
    lead_department_id: input.lead_department_id,
    fiscal_year_id: input.fiscal_year_id,
    initiative_number: input.initiative_number,
    name: input.name,
    priority_level: input.priority_level,
    rank_within_priority: input.rank_within_priority,
    description: input.description,
    rationale: input.rationale,
    expected_outcomes: input.expected_outcomes,
    responsible_party: input.responsible_party || null,
    status: 'not_started' as InitiativeStatus,
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = (await (supabase as any)
    .from('initiatives')
    .insert(newInitiative)
    .select('id')
    .single()) as { data: { id: string } | null; error: unknown }

  if (error) {
    console.error('Error creating initiative:', error)
    throw new Error('Failed to create initiative')
  }

  if (!data) {
    throw new Error('No data returned after creating initiative')
  }

  // Revalidate paths
  const { data: goalData } = await supabase
    .from('strategic_goals')
    .select('strategic_plan_id')
    .eq('id', input.strategic_goal_id)
    .single<{ strategic_plan_id: string }>()

  if (goalData) {
    revalidatePath(`/plans/${goalData.strategic_plan_id}`)
    revalidatePath(`/plans/${goalData.strategic_plan_id}/edit`)
  }

  return { id: data.id }
}

export async function updateInitiative(
  input: UpdateInitiativeInput
): Promise<void> {
  const supabase = createServerSupabaseClient()

  // Get current user
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser()

  if (!currentUser) {
    throw new Error('Unauthorized')
  }

  // Get initiative, goal, and plan info
  const { data: initiative } = await supabase
    .from('initiatives')
    .select('strategic_goal_id, strategic_goals!inner(strategic_plans!inner(department_id))')
    .eq('id', input.id)
    .single()

  if (!initiative) {
    throw new Error('Initiative not found')
  }

  const { data: userProfile } = await supabase
    .from('users')
    .select('role, department_id')
    .eq('id', currentUser.id)
    .single<{ role: string; department_id: string | null }>()

  if (!userProfile) {
    throw new Error('User profile not found')
  }

  // Check permissions
  const plan = (
    initiative as {
      strategic_goals: { strategic_plans: { department_id: string } }
    }
  ).strategic_goals.strategic_plans
  const canEdit =
    userProfile.role === 'admin' ||
    userProfile.role === 'city_manager' ||
    userProfile.department_id === plan.department_id

  if (!canEdit) {
    throw new Error('You do not have permission to edit this initiative')
  }

  // Build update data
  const updateData: {
    [key: string]:
      | string
      | number
      | string[]
      | PriorityLevel
      | InitiativeStatus
      | undefined
  } = {}
  if (input.initiative_number !== undefined)
    updateData.initiative_number = input.initiative_number
  if (input.name !== undefined) updateData.name = input.name
  if (input.priority_level !== undefined)
    updateData.priority_level = input.priority_level
  if (input.rank_within_priority !== undefined)
    updateData.rank_within_priority = input.rank_within_priority
  if (input.description !== undefined) updateData.description = input.description
  if (input.rationale !== undefined) updateData.rationale = input.rationale
  if (input.expected_outcomes !== undefined)
    updateData.expected_outcomes = input.expected_outcomes
  if (input.responsible_party !== undefined)
    updateData.responsible_party = input.responsible_party
  if (input.status !== undefined) updateData.status = input.status

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('initiatives')
    .update(updateData)
    .eq('id', input.id)

  if (error) {
    console.error('Error updating initiative:', error)
    throw new Error('Failed to update initiative')
  }

  // Revalidate paths
  const goalId = (initiative as { strategic_goal_id: string }).strategic_goal_id
  const { data: goalData } = await supabase
    .from('strategic_goals')
    .select('strategic_plan_id')
    .eq('id', goalId)
    .single<{ strategic_plan_id: string }>()

  if (goalData) {
    revalidatePath(`/plans/${goalData.strategic_plan_id}`)
    revalidatePath(`/plans/${goalData.strategic_plan_id}/edit`)
  }
}

export async function deleteInitiative(initiativeId: string): Promise<void> {
  const supabase = createServerSupabaseClient()

  // Get current user
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser()

  if (!currentUser) {
    throw new Error('Unauthorized')
  }

  // Get initiative, goal, and plan info
  const { data: initiative } = await supabase
    .from('initiatives')
    .select('strategic_goal_id, strategic_goals!inner(strategic_plans!inner(department_id))')
    .eq('id', initiativeId)
    .single()

  if (!initiative) {
    throw new Error('Initiative not found')
  }

  const { data: userProfile } = await supabase
    .from('users')
    .select('role, department_id')
    .eq('id', currentUser.id)
    .single<{ role: string; department_id: string | null }>()

  if (!userProfile) {
    throw new Error('User profile not found')
  }

  // Check permissions
  const plan = (
    initiative as {
      strategic_goals: { strategic_plans: { department_id: string } }
    }
  ).strategic_goals.strategic_plans
  const canEdit =
    userProfile.role === 'admin' ||
    userProfile.role === 'city_manager' ||
    userProfile.department_id === plan.department_id

  if (!canEdit) {
    throw new Error('You do not have permission to delete this initiative')
  }

  // Delete the initiative
  const { error } = await supabase
    .from('initiatives')
    .delete()
    .eq('id', initiativeId)

  if (error) {
    console.error('Error deleting initiative:', error)
    throw new Error('Failed to delete initiative')
  }

  // Revalidate paths
  const goalId = (initiative as { strategic_goal_id: string }).strategic_goal_id
  const { data: goalData } = await supabase
    .from('strategic_goals')
    .select('strategic_plan_id')
    .eq('id', goalId)
    .single<{ strategic_plan_id: string }>()

  if (goalData) {
    revalidatePath(`/plans/${goalData.strategic_plan_id}`)
    revalidatePath(`/plans/${goalData.strategic_plan_id}/edit`)
  }
}
