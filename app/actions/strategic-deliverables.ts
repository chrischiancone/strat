'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export interface StrategicDeliverable {
  id: string
  strategic_objective_id: string
  deliverable_number: string
  title: string
  description: string
  target_date: string | null
  status: 'not_started' | 'in_progress' | 'completed' | 'deferred'
  display_order: number
  created_at: string
  updated_at: string
  created_by: string
}

// Get all deliverables for a plan (department), with objective and goal context
export async function getDeliverablesForPlan(planId: string): Promise<DeliverableWithContext[]> {
  const supabase = createServerSupabaseClient()
  const adminSupabase = createAdminSupabaseClient()

  const { data: auth } = await supabase.auth.getUser()
  if (!auth || !auth.user) throw new Error('Unauthorized')

  const { data, error } = await adminSupabase
    .from('strategic_deliverables')
    .select(`
      id,
      strategic_objective_id,
      deliverable_number,
      title,
      description,
      target_date,
      status,
      display_order,
      created_at,
      updated_at,
      created_by,
      strategic_objectives!inner (
        id,
        objective_number,
        title,
        strategic_goal_id,
        strategic_goals!inner (
          id,
          goal_number,
          title,
          strategic_plan_id
        )
      )
    `)
    .order('deliverable_number', { ascending: true })

  if (error) {
    console.error('Error fetching deliverables for plan:', error)
    throw new Error('Failed to fetch deliverables')
  }

  type Row = {
    id: string
    strategic_objective_id: string
    deliverable_number: string
    title: string
    description: string
    target_date: string | null
    status: 'not_started' | 'in_progress' | 'completed' | 'deferred'
    display_order: number
    created_at: string
    updated_at: string
    created_by: string
    strategic_objectives: {
      id: string
      objective_number: string
      title: string
      strategic_goal_id: string
      strategic_goals: {
        id: string
        goal_number: number
        title: string
        strategic_plan_id: string
      }
    }
  }

  const rows = (data as unknown as Row[]) || []
  return rows
    .filter((r) => r.strategic_objectives.strategic_goals.strategic_plan_id === planId)
    .map((r) => ({
      id: r.id,
      strategic_objective_id: r.strategic_objective_id,
      deliverable_number: r.deliverable_number,
      title: r.title,
      description: r.description,
      target_date: r.target_date,
      status: r.status,
      display_order: r.display_order,
      created_at: r.created_at,
      updated_at: r.updated_at,
      created_by: r.created_by,
      objective_number: r.strategic_objectives.objective_number,
      objective_title: r.strategic_objectives.title,
      strategic_goal_id: r.strategic_objectives.strategic_goal_id,
      goal_number: r.strategic_objectives.strategic_goals.goal_number,
      goal_title: r.strategic_objectives.strategic_goals.title,
    }))
}

export interface DeliverableWithContext extends StrategicDeliverable {
  objective_number: string
  objective_title: string
  strategic_goal_id: string
  goal_number: number
  goal_title: string
}

export interface CreateDeliverableInput {
  strategic_objective_id: string
  deliverable_number: string
  title: string
  description: string
  target_date?: string
}

export interface UpdateDeliverableInput {
  id: string
  deliverable_number?: string
  title?: string
  description?: string
  target_date?: string
  status?: 'not_started' | 'in_progress' | 'completed' | 'deferred'
}

export async function getStrategicDeliverables(
  objectiveId: string
): Promise<StrategicDeliverable[]> {
  const supabase = createServerSupabaseClient()
  const adminSupabase = createAdminSupabaseClient()

  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser()

  if (!currentUser) {
    throw new Error('Unauthorized')
  }

  const { data, error } = await adminSupabase
    .from('strategic_deliverables')
    .select('*')
    .eq('strategic_objective_id', objectiveId)
    .order('display_order', { ascending: true })

  if (error) {
    console.error('Error fetching strategic deliverables:', error)
    throw new Error('Failed to fetch strategic deliverables')
  }

  return data as StrategicDeliverable[]
}

export async function createStrategicDeliverable(
  input: CreateDeliverableInput
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
  const { data: objective } = await adminSupabase
    .from('strategic_objectives')
    .select('strategic_goal_id, strategic_goals!inner(strategic_plan_id, strategic_plans!inner(department_id))')
    .eq('id', input.strategic_objective_id)
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
    throw new Error('You do not have permission to add deliverables to this objective')
  }

  // Get the next display_order
  const { data: maxOrderData } = await adminSupabase
    .from('strategic_deliverables')
    .select('display_order')
    .eq('strategic_objective_id', input.strategic_objective_id)
    .order('display_order', { ascending: false })
    .limit(1)
    .maybeSingle()

  const nextOrder = maxOrderData ? (maxOrderData as { display_order: number }).display_order + 1 : 1

  const newDeliverable = {
    strategic_objective_id: input.strategic_objective_id,
    deliverable_number: input.deliverable_number,
    title: input.title,
    description: input.description,
    target_date: input.target_date || null,
    display_order: nextOrder,
    created_by: currentUser.id,
  }

  const { data, error } = await adminSupabase
    .from('strategic_deliverables')
    .insert(newDeliverable)
    .select('id')
    .single()

  if (error) {
    console.error('Error creating strategic deliverable:', error)
    throw new Error(`Failed to create strategic deliverable: ${error.message}`)
  }

  // Get plan ID for revalidation
  const planId = (objective as { strategic_goals: { strategic_plan_id: string } })
    .strategic_goals.strategic_plan_id
  revalidatePath(`/plans/${planId}`)
  revalidatePath(`/plans/${planId}/edit`)

  return { id: data.id }
}

export async function updateStrategicDeliverable(
  input: UpdateDeliverableInput
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
  const { data: deliverable } = await adminSupabase
    .from('strategic_deliverables')
    .select('strategic_objective_id, strategic_objectives!inner(strategic_goal_id, strategic_goals!inner(strategic_plan_id, strategic_plans!inner(department_id)))')
    .eq('id', input.id)
    .single()

  if (!deliverable) {
    throw new Error('Deliverable not found')
  }

  const { data: userProfile } = await adminSupabase
    .from('users')
    .select('role, department_id')
    .eq('id', currentUser.id)
    .single<{ role: string; department_id: string | null }>()

  if (!userProfile) {
    throw new Error('User profile not found')
  }

  const objective = (deliverable as { strategic_objectives: { strategic_goals: { strategic_plans: { department_id: string } } } })
    .strategic_objectives
  const goal = objective.strategic_goals
  const plan = goal.strategic_plans
  const canEdit =
    userProfile.role === 'admin' ||
    userProfile.role === 'city_manager' ||
    userProfile.department_id === plan.department_id

  if (!canEdit) {
    throw new Error('You do not have permission to edit this deliverable')
  }

  const updateData: { [key: string]: string | null | undefined } = {}
  if (input.deliverable_number !== undefined) updateData.deliverable_number = input.deliverable_number
  if (input.title !== undefined) updateData.title = input.title
  if (input.description !== undefined) updateData.description = input.description
  if (input.target_date !== undefined) updateData.target_date = input.target_date || null
  if (input.status !== undefined) updateData.status = input.status

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('strategic_deliverables')
    .update(updateData)
    .eq('id', input.id)

  if (error) {
    console.error('Error updating strategic deliverable:', error)
    throw new Error('Failed to update strategic deliverable')
  }

  // Get plan ID for revalidation
  const planId = (deliverable as { strategic_objectives: { strategic_goals: { strategic_plan_id: string } } })
    .strategic_objectives.strategic_goals.strategic_plan_id
  revalidatePath(`/plans/${planId}`)
  revalidatePath(`/plans/${planId}/edit`)
}

export async function deleteStrategicDeliverable(deliverableId: string): Promise<void> {
  const supabase = createServerSupabaseClient()
  const adminSupabase = createAdminSupabaseClient()

  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser()

  if (!currentUser) {
    throw new Error('Unauthorized')
  }

  // Check permissions
  const { data: deliverable } = await adminSupabase
    .from('strategic_deliverables')
    .select('strategic_objective_id, strategic_objectives!inner(strategic_goal_id, strategic_goals!inner(strategic_plan_id, strategic_plans!inner(department_id)))')
    .eq('id', deliverableId)
    .single()

  if (!deliverable) {
    throw new Error('Deliverable not found')
  }

  const { data: userProfile } = await adminSupabase
    .from('users')
    .select('role, department_id')
    .eq('id', currentUser.id)
    .single<{ role: string; department_id: string | null }>()

  if (!userProfile) {
    throw new Error('User profile not found')
  }

  const objective = (deliverable as { strategic_objectives: { strategic_goals: { strategic_plans: { department_id: string } } } })
    .strategic_objectives
  const goal = objective.strategic_goals
  const plan = goal.strategic_plans
  const canEdit =
    userProfile.role === 'admin' ||
    userProfile.role === 'city_manager' ||
    userProfile.department_id === plan.department_id

  if (!canEdit) {
    throw new Error('You do not have permission to delete this deliverable')
  }

  const { error } = await supabase
    .from('strategic_deliverables')
    .delete()
    .eq('id', deliverableId)

  if (error) {
    console.error('Error deleting strategic deliverable:', error)
    throw new Error('Failed to delete strategic deliverable')
  }

  // Get plan ID for revalidation
  const planId = (deliverable as { strategic_objectives: { strategic_goals: { strategic_plan_id: string } } })
    .strategic_objectives.strategic_goals.strategic_plan_id
  revalidatePath(`/plans/${planId}`)
  revalidatePath(`/plans/${planId}/edit`)
}

export async function reorderStrategicDeliverables(
  objectiveId: string,
  deliverableIds: string[]
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
    throw new Error('You do not have permission to reorder deliverables in this objective')
  }

  // Update display_order for each deliverable
  for (let i = 0; i < deliverableIds.length; i++) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('strategic_deliverables')
      .update({ display_order: i + 1 })
      .eq('id', deliverableIds[i])
      .eq('strategic_objective_id', objectiveId)

    if (error) {
      console.error('Error reordering deliverables:', error)
      throw new Error('Failed to reorder deliverables')
    }
  }

  // Get plan ID for revalidation
  const planId = (objective as { strategic_goals: { strategic_plan_id: string } })
    .strategic_goals.strategic_plan_id
  revalidatePath(`/plans/${planId}`)
  revalidatePath(`/plans/${planId}/edit`)
}
