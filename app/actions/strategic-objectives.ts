'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export interface StrategicObjective {
  id: string
  strategic_goal_id: string
  objective_number: string
  title: string
  description: string
  display_order: number
  created_at: string
  updated_at: string
  created_by: string
}

export interface CreateObjectiveInput {
  strategic_goal_id: string
  objective_number: string
  title: string
  description: string
}

export interface UpdateObjectiveInput {
  id: string
  objective_number?: string
  title?: string
  description?: string
}

export async function getStrategicObjectives(
  goalId: string
): Promise<StrategicObjective[]> {
  const supabase = createServerSupabaseClient()
  const adminSupabase = createAdminSupabaseClient()

  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser()

  if (!currentUser) {
    throw new Error('Unauthorized')
  }

  const { data, error } = await adminSupabase
    .from('strategic_objectives')
    .select('*')
    .eq('strategic_goal_id', goalId)
    .order('display_order', { ascending: true })

  if (error) {
    console.error('Error fetching strategic objectives:', error)
    throw new Error('Failed to fetch strategic objectives')
  }

  return data as StrategicObjective[]
}

export async function createStrategicObjective(
  input: CreateObjectiveInput
): Promise<{ id: string }> {
  const supabase = createServerSupabaseClient()
  const adminSupabase = createAdminSupabaseClient()

  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser()

  if (!currentUser) {
    throw new Error('Unauthorized')
  }

  // Check permissions
  const { data: goal } = await adminSupabase
    .from('strategic_goals')
    .select('strategic_plan_id, strategic_plans!inner(department_id)')
    .eq('id', input.strategic_goal_id)
    .single()

  if (!goal) {
    throw new Error('Goal not found')
  }

  const { data: userProfile } = await adminSupabase
    .from('users')
    .select('role, department_id')
    .eq('id', currentUser.id)
    .single<{ role: string; department_id: string | null }>()

  if (!userProfile) {
    throw new Error('User profile not found')
  }

  const plan = (goal as { strategic_plans: { department_id: string } })
    .strategic_plans
  const canEdit =
    userProfile.role === 'admin' ||
    userProfile.role === 'city_manager' ||
    userProfile.department_id === plan.department_id

  if (!canEdit) {
    throw new Error('You do not have permission to add objectives to this goal')
  }

  // Get the next display_order
  const { data: maxOrderData } = await adminSupabase
    .from('strategic_objectives')
    .select('display_order')
    .eq('strategic_goal_id', input.strategic_goal_id)
    .order('display_order', { ascending: false })
    .limit(1)
    .maybeSingle()

  const nextOrder = maxOrderData ? (maxOrderData as { display_order: number }).display_order + 1 : 1

  const newObjective = {
    strategic_goal_id: input.strategic_goal_id,
    objective_number: input.objective_number,
    title: input.title,
    description: input.description,
    display_order: nextOrder,
    created_by: currentUser.id,
  }

  const { data, error } = await adminSupabase
    .from('strategic_objectives')
    .insert(newObjective)
    .select('id')
    .single()

  if (error) {
    console.error('Error creating strategic objective:', error)
    throw new Error(`Failed to create strategic objective: ${error.message}`)
  }

  // Get plan ID for revalidation
  const planId = (goal as { strategic_plan_id: string }).strategic_plan_id
  revalidatePath(`/plans/${planId}`)
  revalidatePath(`/plans/${planId}/edit`)

  return { id: data.id }
}

export async function updateStrategicObjective(
  input: UpdateObjectiveInput
): Promise<void> {
  const supabase = createServerSupabaseClient()
  const adminSupabase = createAdminSupabaseClient()

  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser()

  if (!currentUser) {
    throw new Error('Unauthorized')
  }

  // Check permissions
  const { data: objective } = await adminSupabase
    .from('strategic_objectives')
    .select('strategic_goal_id, strategic_goals!inner(strategic_plan_id, strategic_plans!inner(department_id))')
    .eq('id', input.id)
    .single()

  if (!objective) {
    throw new Error('Objective not found')
  }

  const { data: userProfile } = await adminSupabase
    .from('users')
    .select('role, department_id')
    .eq('id', currentUser.id)
    .single<{ role: string; department_id: string | null }>()

  if (!userProfile) {
    throw new Error('User profile not found')
  }

  const goal = (objective as { strategic_goals: { strategic_plans: { department_id: string } } })
    .strategic_goals
  const plan = goal.strategic_plans
  const canEdit =
    userProfile.role === 'admin' ||
    userProfile.role === 'city_manager' ||
    userProfile.department_id === plan.department_id

  if (!canEdit) {
    throw new Error('You do not have permission to edit this objective')
  }

  const updateData: { [key: string]: string | undefined } = {}
  if (input.objective_number !== undefined) updateData.objective_number = input.objective_number
  if (input.title !== undefined) updateData.title = input.title
  if (input.description !== undefined) updateData.description = input.description

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('strategic_objectives')
    .update(updateData)
    .eq('id', input.id)

  if (error) {
    console.error('Error updating strategic objective:', error)
    throw new Error('Failed to update strategic objective')
  }

  // Get plan ID for revalidation
  const planId = (objective as { strategic_goals: { strategic_plan_id: string } })
    .strategic_goals.strategic_plan_id
  revalidatePath(`/plans/${planId}`)
  revalidatePath(`/plans/${planId}/edit`)
}

export async function deleteStrategicObjective(objectiveId: string): Promise<void> {
  const supabase = createServerSupabaseClient()
  const adminSupabase = createAdminSupabaseClient()

  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser()

  if (!currentUser) {
    throw new Error('Unauthorized')
  }

  // Check permissions
  const { data: objective } = await adminSupabase
    .from('strategic_objectives')
    .select('strategic_goal_id, strategic_goals!inner(strategic_plan_id, strategic_plans!inner(department_id))')
    .eq('id', objectiveId)
    .single()

  if (!objective) {
    throw new Error('Objective not found')
  }

  const { data: userProfile } = await adminSupabase
    .from('users')
    .select('role, department_id')
    .eq('id', currentUser.id)
    .single<{ role: string; department_id: string | null }>()

  if (!userProfile) {
    throw new Error('User profile not found')
  }

  const goal = (objective as { strategic_goals: { strategic_plans: { department_id: string } } })
    .strategic_goals
  const plan = goal.strategic_plans
  const canEdit =
    userProfile.role === 'admin' ||
    userProfile.role === 'city_manager' ||
    userProfile.department_id === plan.department_id

  if (!canEdit) {
    throw new Error('You do not have permission to delete this objective')
  }

  // Check if objective has deliverables
  const { count } = await adminSupabase
    .from('strategic_deliverables')
    .select('id', { count: 'exact', head: true })
    .eq('strategic_objective_id', objectiveId)

  if (count && count > 0) {
    throw new Error(
      `Cannot delete objective with ${count} deliverable(s). Please delete deliverables first.`
    )
  }

  const { error } = await supabase
    .from('strategic_objectives')
    .delete()
    .eq('id', objectiveId)

  if (error) {
    console.error('Error deleting strategic objective:', error)
    throw new Error('Failed to delete strategic objective')
  }

  // Get plan ID for revalidation
  const planId = (objective as { strategic_goals: { strategic_plan_id: string } })
    .strategic_goals.strategic_plan_id
  revalidatePath(`/plans/${planId}`)
  revalidatePath(`/plans/${planId}/edit`)
}

export async function reorderStrategicObjectives(
  goalId: string,
  objectiveIds: string[]
): Promise<void> {
  const supabase = createServerSupabaseClient()
  const adminSupabase = createAdminSupabaseClient()

  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser()

  if (!currentUser) {
    throw new Error('Unauthorized')
  }

  // Check permissions
  const { data: goal } = await adminSupabase
    .from('strategic_goals')
    .select('strategic_plan_id, strategic_plans!inner(department_id)')
    .eq('id', goalId)
    .single()

  if (!goal) {
    throw new Error('Goal not found')
  }

  const { data: userProfile } = await adminSupabase
    .from('users')
    .select('role, department_id')
    .eq('id', currentUser.id)
    .single<{ role: string; department_id: string | null }>()

  if (!userProfile) {
    throw new Error('User profile not found')
  }

  const plan = (goal as { strategic_plans: { department_id: string } })
    .strategic_plans
  const canEdit =
    userProfile.role === 'admin' ||
    userProfile.role === 'city_manager' ||
    userProfile.department_id === plan.department_id

  if (!canEdit) {
    throw new Error('You do not have permission to reorder objectives in this goal')
  }

  // Update display_order for each objective
  for (let i = 0; i < objectiveIds.length; i++) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('strategic_objectives')
      .update({ display_order: i + 1 })
      .eq('id', objectiveIds[i])
      .eq('strategic_goal_id', goalId)

    if (error) {
      console.error('Error reordering objectives:', error)
      throw new Error('Failed to reorder objectives')
    }
  }

  // Get plan ID for revalidation
  const planId = (goal as { strategic_plan_id: string }).strategic_plan_id
  revalidatePath(`/plans/${planId}`)
  revalidatePath(`/plans/${planId}/edit`)
}
