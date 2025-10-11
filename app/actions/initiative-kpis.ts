'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface InitiativeKpi {
  id: string
  initiative_id: string
  metric_name: string
  measurement_frequency: 'monthly' | 'quarterly' | 'annual' | 'continuous'
  baseline_value: string
  year_1_target: string
  year_2_target: string
  year_3_target: string
  data_source: string | null
  responsible_party: string | null
  created_at: string
  updated_at: string
}

export interface CreateKpiInput {
  initiative_id: string
  metric_name: string
  measurement_frequency: string
  baseline_value: string
  year_1_target: string
  year_2_target: string
  year_3_target: string
  data_source?: string | null
  responsible_party?: string | null
}

export interface UpdateKpiInput {
  id: string
  metric_name?: string
  measurement_frequency?: string
  baseline_value?: string
  year_1_target?: string
  year_2_target?: string
  year_3_target?: string
  data_source?: string | null
  responsible_party?: string | null
}

export async function getInitiativeKpis(
  initiativeId: string
): Promise<InitiativeKpi[]> {
  const supabase = createServerSupabaseClient()

  // Get current user
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser()

  if (!currentUser) {
    throw new Error('Unauthorized')
  }

  const { data, error } = await supabase
    .from('initiative_kpis')
    .select('*')
    .eq('initiative_id', initiativeId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching KPIs:', error)
    throw new Error('Failed to fetch KPIs')
  }

  return (data || []) as InitiativeKpi[]
}

export async function createInitiativeKpi(
  input: CreateKpiInput
): Promise<{ id: string }> {
  const supabase = createServerSupabaseClient()

  // Get current user
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser()

  if (!currentUser) {
    throw new Error('Unauthorized')
  }

  // Check permissions
  const { data: initiative } = await supabase
    .from('initiatives')
    .select('strategic_goals!inner(strategic_plans!inner(department_id))')
    .eq('id', input.initiative_id)
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
    throw new Error('You do not have permission to add KPIs to this initiative')
  }

  // Create KPI
  const newKpi = {
    initiative_id: input.initiative_id,
    metric_name: input.metric_name,
    measurement_frequency: input.measurement_frequency,
    baseline_value: input.baseline_value,
    year_1_target: input.year_1_target,
    year_2_target: input.year_2_target,
    year_3_target: input.year_3_target,
    data_source: input.data_source || null,
    responsible_party: input.responsible_party || null,
    strategic_goal_id: null,
    strategic_plan_id: null,
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = (await (supabase as any)
    .from('initiative_kpis')
    .insert(newKpi)
    .select('id')
    .single()) as { data: { id: string } | null; error: unknown }

  if (error) {
    console.error('Error creating KPI:', error)
    throw new Error('Failed to create KPI')
  }

  if (!data) {
    throw new Error('No data returned after creating KPI')
  }

  // Revalidate paths
  const { data: goalData } = await supabase
    .from('initiatives')
    .select('strategic_goal_id, strategic_goals!inner(strategic_plan_id)')
    .eq('id', input.initiative_id)
    .single()

  if (goalData) {
    const planId = (
      goalData as {
        strategic_goals: { strategic_plan_id: string }
      }
    ).strategic_goals.strategic_plan_id

    revalidatePath(`/plans/${planId}`)
    revalidatePath(`/plans/${planId}/edit`)
  }

  return { id: data.id }
}

export async function updateInitiativeKpi(input: UpdateKpiInput): Promise<void> {
  const supabase = createServerSupabaseClient()

  // Get current user
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser()

  if (!currentUser) {
    throw new Error('Unauthorized')
  }

  // Get KPI and check permissions
  const { data: kpi } = await supabase
    .from('initiative_kpis')
    .select('initiative_id, initiatives!inner(strategic_goals!inner(strategic_plans!inner(department_id)))')
    .eq('id', input.id)
    .single()

  if (!kpi) {
    throw new Error('KPI not found')
  }

  const { data: userProfile } = await supabase
    .from('users')
    .select('role, department_id')
    .eq('id', currentUser.id)
    .single<{ role: string; department_id: string | null }>()

  if (!userProfile) {
    throw new Error('User profile not found')
  }

  const plan = (
    kpi as {
      initiatives: {
        strategic_goals: { strategic_plans: { department_id: string } }
      }
    }
  ).initiatives.strategic_goals.strategic_plans

  const canEdit =
    userProfile.role === 'admin' ||
    userProfile.role === 'city_manager' ||
    userProfile.department_id === plan.department_id

  if (!canEdit) {
    throw new Error('You do not have permission to edit this KPI')
  }

  // Build update data
  const updateData: { [key: string]: string | null | undefined } = {}
  if (input.metric_name !== undefined) updateData.metric_name = input.metric_name
  if (input.measurement_frequency !== undefined)
    updateData.measurement_frequency = input.measurement_frequency
  if (input.baseline_value !== undefined)
    updateData.baseline_value = input.baseline_value
  if (input.year_1_target !== undefined)
    updateData.year_1_target = input.year_1_target
  if (input.year_2_target !== undefined)
    updateData.year_2_target = input.year_2_target
  if (input.year_3_target !== undefined)
    updateData.year_3_target = input.year_3_target
  if (input.data_source !== undefined) updateData.data_source = input.data_source
  if (input.responsible_party !== undefined)
    updateData.responsible_party = input.responsible_party

  // Update KPI
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('initiative_kpis')
    .update(updateData)
    .eq('id', input.id)

  if (error) {
    console.error('Error updating KPI:', error)
    throw new Error('Failed to update KPI')
  }

  // Revalidate paths
  const initiativeId = (kpi as { initiative_id: string }).initiative_id
  const { data: goalData } = await supabase
    .from('initiatives')
    .select('strategic_goal_id, strategic_goals!inner(strategic_plan_id)')
    .eq('id', initiativeId)
    .single()

  if (goalData) {
    const planId = (
      goalData as {
        strategic_goals: { strategic_plan_id: string }
      }
    ).strategic_goals.strategic_plan_id

    revalidatePath(`/plans/${planId}`)
    revalidatePath(`/plans/${planId}/edit`)
  }
}

export async function deleteInitiativeKpi(id: string): Promise<void> {
  const supabase = createServerSupabaseClient()

  // Get current user
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser()

  if (!currentUser) {
    throw new Error('Unauthorized')
  }

  // Get KPI and check permissions
  const { data: kpi } = await supabase
    .from('initiative_kpis')
    .select('initiative_id, initiatives!inner(strategic_goals!inner(strategic_plans!inner(department_id)))')
    .eq('id', id)
    .single()

  if (!kpi) {
    throw new Error('KPI not found')
  }

  const { data: userProfile } = await supabase
    .from('users')
    .select('role, department_id')
    .eq('id', currentUser.id)
    .single<{ role: string; department_id: string | null }>()

  if (!userProfile) {
    throw new Error('User profile not found')
  }

  const plan = (
    kpi as {
      initiatives: {
        strategic_goals: { strategic_plans: { department_id: string } }
      }
    }
  ).initiatives.strategic_goals.strategic_plans

  const canEdit =
    userProfile.role === 'admin' ||
    userProfile.role === 'city_manager' ||
    userProfile.department_id === plan.department_id

  if (!canEdit) {
    throw new Error('You do not have permission to delete this KPI')
  }

  // Delete KPI
  const { error } = await supabase
    .from('initiative_kpis')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting KPI:', error)
    throw new Error('Failed to delete KPI')
  }

  // Revalidate paths
  const initiativeId = (kpi as { initiative_id: string }).initiative_id
  const { data: goalData } = await supabase
    .from('initiatives')
    .select('strategic_goal_id, strategic_goals!inner(strategic_plan_id)')
    .eq('id', initiativeId)
    .single()

  if (goalData) {
    const planId = (
      goalData as {
        strategic_goals: { strategic_plan_id: string }
      }
    ).strategic_goals.strategic_plan_id

    revalidatePath(`/plans/${planId}`)
    revalidatePath(`/plans/${planId}/edit`)
  }
}
