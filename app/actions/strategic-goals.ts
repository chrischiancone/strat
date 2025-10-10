'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface StrategicGoal {
  id: string
  strategic_plan_id: string
  goal_number: number
  title: string
  description: string
  city_priority_alignment: string
  objectives: string[]
  success_measures: string[]
  display_order: number
  created_at: string
  updated_at: string
  created_by: string
  initiative_count?: number
}

export interface CreateGoalInput {
  strategic_plan_id: string
  goal_number: number
  title: string
  description: string
  city_priority_alignment: string
  objectives: string[]
  success_measures: string[]
}

export interface UpdateGoalInput {
  id: string
  goal_number?: number
  title?: string
  description?: string
  city_priority_alignment?: string
  objectives?: string[]
  success_measures?: string[]
}

export async function getStrategicGoals(
  planId: string
): Promise<StrategicGoal[]> {
  const supabase = createServerSupabaseClient()

  // Get current user
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser()

  if (!currentUser) {
    throw new Error('Unauthorized')
  }

  // Fetch goals with initiative count
  const { data, error } = await supabase
    .from('strategic_goals')
    .select(
      `
      id,
      strategic_plan_id,
      goal_number,
      title,
      description,
      city_priority_alignment,
      objectives,
      success_measures,
      display_order,
      created_at,
      updated_at,
      created_by
    `
    )
    .eq('strategic_plan_id', planId)
    .order('display_order', { ascending: true })

  if (error) {
    console.error('Error fetching strategic goals:', error)
    throw new Error('Failed to fetch strategic goals')
  }

  // Type the response
  interface GoalQueryResult {
    id: string
    strategic_plan_id: string
    goal_number: number
    title: string
    description: string
    city_priority_alignment: string
    objectives: unknown
    success_measures: unknown
    display_order: number
    created_at: string
    updated_at: string
    created_by: string
  }

  // For each goal, fetch initiative count
  const goalsWithCounts: StrategicGoal[] = await Promise.all(
    (data as unknown as GoalQueryResult[] || []).map(async (goal) => {
      const { count } = await supabase
        .from('initiatives')
        .select('id', { count: 'exact', head: true })
        .eq('strategic_goal_id', goal.id)

      return {
        id: goal.id,
        strategic_plan_id: goal.strategic_plan_id,
        goal_number: goal.goal_number,
        title: goal.title,
        description: goal.description,
        city_priority_alignment: goal.city_priority_alignment,
        objectives: Array.isArray(goal.objectives)
          ? (goal.objectives as string[])
          : [],
        success_measures: Array.isArray(goal.success_measures)
          ? (goal.success_measures as string[])
          : [],
        display_order: goal.display_order,
        created_at: goal.created_at,
        updated_at: goal.updated_at,
        created_by: goal.created_by,
        initiative_count: count || 0,
      }
    })
  )

  return goalsWithCounts
}

export async function createStrategicGoal(
  input: CreateGoalInput
): Promise<{ id: string }> {
  const supabase = createServerSupabaseClient()

  // Get current user
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser()

  if (!currentUser) {
    throw new Error('Unauthorized')
  }

  // Check if user has permission to edit this plan
  const { data: plan } = await supabase
    .from('strategic_plans')
    .select('department_id')
    .eq('id', input.strategic_plan_id)
    .single<{ department_id: string }>()

  if (!plan) {
    throw new Error('Plan not found')
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
  const canEdit =
    userProfile.role === 'admin' ||
    userProfile.role === 'city_manager' ||
    userProfile.department_id === plan.department_id

  if (!canEdit) {
    throw new Error('You do not have permission to add goals to this plan')
  }

  // Check if plan already has 5 goals
  const { count } = await supabase
    .from('strategic_goals')
    .select('id', { count: 'exact', head: true })
    .eq('strategic_plan_id', input.strategic_plan_id)

  if (count && count >= 5) {
    throw new Error('Cannot add more than 5 goals to a strategic plan')
  }

  // Get the next display_order
  const { data: maxOrderData } = await supabase
    .from('strategic_goals')
    .select('display_order')
    .eq('strategic_plan_id', input.strategic_plan_id)
    .order('display_order', { ascending: false })
    .limit(1)
    .maybeSingle()

  const nextOrder = maxOrderData ? (maxOrderData as { display_order: number }).display_order + 1 : 1

  // Create the goal
  const newGoal = {
    strategic_plan_id: input.strategic_plan_id,
    goal_number: input.goal_number,
    title: input.title,
    description: input.description,
    city_priority_alignment: input.city_priority_alignment,
    objectives: input.objectives,
    success_measures: input.success_measures,
    display_order: nextOrder,
    created_by: currentUser.id,
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = (await (supabase as any)
    .from('strategic_goals')
    .insert(newGoal)
    .select('id')
    .single()) as { data: { id: string } | null; error: unknown }

  if (error) {
    console.error('Error creating strategic goal:', error)
    throw new Error('Failed to create strategic goal')
  }

  if (!data) {
    throw new Error('No data returned after creating goal')
  }

  // Revalidate paths
  revalidatePath(`/plans/${input.strategic_plan_id}`)
  revalidatePath(`/plans/${input.strategic_plan_id}/edit`)

  return { id: data.id }
}

export async function updateStrategicGoal(
  input: UpdateGoalInput
): Promise<void> {
  const supabase = createServerSupabaseClient()

  // Get current user
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser()

  if (!currentUser) {
    throw new Error('Unauthorized')
  }

  // Get goal and plan info
  const { data: goal } = await supabase
    .from('strategic_goals')
    .select('strategic_plan_id, strategic_plans!inner(department_id)')
    .eq('id', input.id)
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
    throw new Error('You do not have permission to edit this goal')
  }

  // Build update data
  const updateData: { [key: string]: number | string | string[] | undefined } =
    {}
  if (input.goal_number !== undefined) updateData.goal_number = input.goal_number
  if (input.title !== undefined) updateData.title = input.title
  if (input.description !== undefined) updateData.description = input.description
  if (input.city_priority_alignment !== undefined)
    updateData.city_priority_alignment = input.city_priority_alignment
  if (input.objectives !== undefined) updateData.objectives = input.objectives
  if (input.success_measures !== undefined)
    updateData.success_measures = input.success_measures

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('strategic_goals')
    .update(updateData)
    .eq('id', input.id)

  if (error) {
    console.error('Error updating strategic goal:', error)
    throw new Error('Failed to update strategic goal')
  }

  // Revalidate paths
  const planId = (goal as { strategic_plan_id: string }).strategic_plan_id
  revalidatePath(`/plans/${planId}`)
  revalidatePath(`/plans/${planId}/edit`)
}

export async function deleteStrategicGoal(goalId: string): Promise<void> {
  const supabase = createServerSupabaseClient()

  // Get current user
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser()

  if (!currentUser) {
    throw new Error('Unauthorized')
  }

  // Get goal and plan info
  const { data: goal } = await supabase
    .from('strategic_goals')
    .select('strategic_plan_id, strategic_plans!inner(department_id)')
    .eq('id', goalId)
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
    throw new Error('You do not have permission to delete this goal')
  }

  // Check if goal has initiatives
  const { count } = await supabase
    .from('initiatives')
    .select('id', { count: 'exact', head: true })
    .eq('strategic_goal_id', goalId)

  if (count && count > 0) {
    throw new Error(
      `Cannot delete goal with ${count} initiative(s). Please delete or reassign initiatives first.`
    )
  }

  // Delete the goal
  const { error } = await supabase
    .from('strategic_goals')
    .delete()
    .eq('id', goalId)

  if (error) {
    console.error('Error deleting strategic goal:', error)
    throw new Error('Failed to delete strategic goal')
  }

  // Revalidate paths
  const planId = (goal as { strategic_plan_id: string }).strategic_plan_id
  revalidatePath(`/plans/${planId}`)
  revalidatePath(`/plans/${planId}/edit`)
}

export async function reorderStrategicGoals(
  planId: string,
  goalIds: string[]
): Promise<void> {
  const supabase = createServerSupabaseClient()

  // Get current user
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser()

  if (!currentUser) {
    throw new Error('Unauthorized')
  }

  // Check if user has permission to edit this plan
  const { data: plan } = await supabase
    .from('strategic_plans')
    .select('department_id')
    .eq('id', planId)
    .single<{ department_id: string }>()

  if (!plan) {
    throw new Error('Plan not found')
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
  const canEdit =
    userProfile.role === 'admin' ||
    userProfile.role === 'city_manager' ||
    userProfile.department_id === plan.department_id

  if (!canEdit) {
    throw new Error('You do not have permission to reorder goals in this plan')
  }

  // Update display_order for each goal
  for (let i = 0; i < goalIds.length; i++) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('strategic_goals')
      .update({ display_order: i + 1 })
      .eq('id', goalIds[i])
      .eq('strategic_plan_id', planId)

    if (error) {
      console.error('Error reordering goals:', error)
      throw new Error('Failed to reorder goals')
    }
  }

  // Revalidate paths
  revalidatePath(`/plans/${planId}`)
  revalidatePath(`/plans/${planId}/edit`)
}
