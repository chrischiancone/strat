'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export interface BudgetBreakdown {
  year_1: {
    personnel: number
    equipment: number
    services: number
    training: number
    materials: number
    other: number
    total: number
  }
  year_2: {
    personnel: number
    equipment: number
    services: number
    training: number
    materials: number
    other: number
    total: number
  }
  year_3: {
    personnel: number
    equipment: number
    services: number
    training: number
    materials: number
    other: number
    total: number
  }
  grand_total: number
}

export interface FundingSource {
  id: string
  initiative_id: string
  fiscal_year_id: string
  funding_source: string
  amount: number
  funding_status: string
  notes: string | null
  created_at: string
  updated_at: string
}

export interface AddFundingSourceInput {
  initiative_id: string
  fiscal_year_id: string
  funding_source: string
  amount: number
  funding_status: string
  notes?: string
}

export interface UpdateFundingSourceInput {
  id: string
  funding_source?: string
  amount?: number
  funding_status?: string
  notes?: string
}

export interface RoiAnalysis {
  financial: {
    annual_savings: number
    annual_revenue: number
    payback_months: number
    three_year_impact: number
  }
  non_financial: {
    service_quality: string
    efficiency_gains: string
    risk_reduction: string
    citizen_satisfaction: string
    employee_impact: string
  }
}

export async function updateInitiativeBudget(
  initiativeId: string,
  budget: BudgetBreakdown
): Promise<void> {
  const supabase = createServerSupabaseClient()
  const adminSupabase = createAdminSupabaseClient()

  // Get current user
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser()

  if (!currentUser) {
    throw new Error('Unauthorized')
  }

  // Fetch initiative and related plan info using admin client (bypass RLS)
  const { data: initiative, error: initErr } = await adminSupabase
    .from('initiatives')
    .select('id, strategic_goal_id, strategic_goals!inner(strategic_plans!inner(department_id, id))')
    .eq('id', initiativeId)
    .maybeSingle()

  if (!initiative || initErr) {
    console.error('updateInitiativeBudget: initiative lookup failed', { initiativeId, initErr })
    throw new Error('Initiative not found')
  }

  // Get user profile via admin client
  const { data: userProfile, error: profileErr } = await adminSupabase
    .from('users')
    .select('role, department_id')
    .eq('id', currentUser.id)
    .maybeSingle<{ role: string; department_id: string | null }>()

  if (!userProfile || profileErr) {
    console.error('updateInitiativeBudget: user profile lookup failed', profileErr)
    throw new Error('User profile not found')
  }

  const plan = (
    initiative as {
      strategic_goals: { strategic_plans: { department_id: string; id: string } }
    }
  ).strategic_goals.strategic_plans

  const canEdit =
    userProfile.role === 'admin' ||
    userProfile.role === 'city_manager' ||
    userProfile.department_id === plan.department_id

  if (!canEdit) {
    throw new Error('You do not have permission to edit this initiative budget')
  }

  // Update budget using admin client (we already validated permissions)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (adminSupabase as any)
    .from('initiatives')
    .update({
      financial_analysis: budget,
      total_year_1_cost: budget.year_1.total,
      total_year_2_cost: budget.year_2.total,
      total_year_3_cost: budget.year_3.total,
    })
    .eq('id', initiativeId)

  if (error) {
    console.error('Error updating initiative budget:', error)
    throw new Error('Failed to update initiative budget')
  }

  // Revalidate paths
  const planId = plan.id
  if (planId) {
    revalidatePath(`/plans/${planId}`)
    revalidatePath(`/plans/${planId}/edit`)
  }
}

export async function getFundingSources(
  initiativeId: string
): Promise<FundingSource[]> {
  const supabase = createServerSupabaseClient()
  const adminSupabase = createAdminSupabaseClient()

  // Get current user
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser()

  if (!currentUser) {
    throw new Error('Unauthorized')
  }

  // Read via admin client to avoid RLS issues
  const { data, error } = await adminSupabase
    .from('initiative_budgets')
    .select('*')
    .eq('initiative_id', initiativeId)
    .not('funding_source', 'is', null)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching funding sources:', error)
    throw new Error('Failed to fetch funding sources')
  }

  return (data || []) as FundingSource[]
}

export async function addFundingSource(
  input: AddFundingSourceInput
): Promise<{ id: string }> {
  const supabase = createServerSupabaseClient()
  const adminSupabase = createAdminSupabaseClient()

  // Get current user
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser()

  if (!currentUser) {
    throw new Error('Unauthorized')
  }

  console.log('addFundingSource: input received', input)

  // Check permissions using admin client
  const { data: initiative, error: initErr } = await adminSupabase
    .from('initiatives')
    .select('id, strategic_goals!inner(strategic_plans!inner(department_id, id))')
    .eq('id', input.initiative_id)
    .maybeSingle()

  if (!initiative || initErr) {
    console.error('addFundingSource: initiative not found or error', { initErr, initiativeId: input.initiative_id })
    throw new Error('Initiative not found')
  }

  const { data: userProfile, error: profileErr } = await adminSupabase
    .from('users')
    .select('role, department_id')
    .eq('id', currentUser.id)
    .maybeSingle<{ role: string; department_id: string | null }>()

  if (!userProfile || profileErr) {
    console.error('addFundingSource: user profile lookup failed', profileErr)
    throw new Error('User profile not found')
  }

  const plan = (
    initiative as {
      strategic_goals: { strategic_plans: { department_id: string; id: string } }
    }
  ).strategic_goals.strategic_plans

  const canEdit =
    userProfile.role === 'admin' ||
    userProfile.role === 'city_manager' ||
    userProfile.department_id === plan.department_id

  if (!canEdit) {
    throw new Error('You do not have permission to add funding sources')
  }

  // Add funding source using admin client
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = (await (adminSupabase as any)
    .from('initiative_budgets')
    .insert({
      initiative_id: input.initiative_id,
      fiscal_year_id: input.fiscal_year_id,
      category: 'other',
      funding_source: input.funding_source,
      amount: input.amount,
      funding_status: input.funding_status,
      notes: input.notes || null,
    })
    .select('id')
    .single()) as { data: { id: string } | null; error: unknown }

  if (error) {
    console.error('Error adding funding source:', error)
    throw new Error('Failed to add funding source')
  }

  if (!data) {
    throw new Error('No data returned after adding funding source')
  }

  // Revalidate paths
  const planId = plan.id
  if (planId) {
    revalidatePath(`/plans/${planId}`)
    revalidatePath(`/plans/${planId}/edit`)
  }

  return { id: data.id }
}

export async function updateFundingSource(
  input: UpdateFundingSourceInput
): Promise<void> {
  const supabase = createServerSupabaseClient()
  const adminSupabase = createAdminSupabaseClient()

  // Get current user
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser()

  if (!currentUser) {
    throw new Error('Unauthorized')
  }

  // Get funding source and check permissions via admin client
  const { data: fundingSource } = await adminSupabase
    .from('initiative_budgets')
    .select('initiative_id, initiatives!inner(strategic_goals!inner(strategic_plans!inner(department_id, id)))')
    .eq('id', input.id)
    .maybeSingle()

  if (!fundingSource) {
    throw new Error('Funding source not found')
  }

  const { data: userProfile } = await adminSupabase
    .from('users')
    .select('role, department_id')
    .eq('id', currentUser.id)
    .maybeSingle<{ role: string; department_id: string | null }>()

  if (!userProfile) {
    throw new Error('User profile not found')
  }

  const plan = (
    fundingSource as {
      initiatives: {
        strategic_goals: { strategic_plans: { department_id: string; id: string } }
      }
    }
  ).initiatives.strategic_goals.strategic_plans

  const canEdit =
    userProfile.role === 'admin' ||
    userProfile.role === 'city_manager' ||
    userProfile.department_id === plan.department_id

  if (!canEdit) {
    throw new Error('You do not have permission to edit this funding source')
  }

  // Build update data
  const updateData: { [key: string]: string | number | undefined } = {}
  if (input.funding_source !== undefined)
    updateData.funding_source = input.funding_source
  if (input.amount !== undefined) updateData.amount = input.amount
  if (input.funding_status !== undefined)
    updateData.funding_status = input.funding_status
  if (input.notes !== undefined) updateData.notes = input.notes

  // Update funding source using admin client
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (adminSupabase as any)
    .from('initiative_budgets')
    .update(updateData)
    .eq('id', input.id)

  if (error) {
    console.error('Error updating funding source:', error)
    throw new Error('Failed to update funding source')
  }

  // Revalidate paths
  const planId = plan.id
  if (planId) {
    revalidatePath(`/plans/${planId}`)
    revalidatePath(`/plans/${planId}/edit`)
  }
}

export async function deleteFundingSource(id: string): Promise<void> {
  const supabase = createServerSupabaseClient()
  const adminSupabase = createAdminSupabaseClient()

  // Get current user
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser()

  if (!currentUser) {
    throw new Error('Unauthorized')
  }

  // Get funding source and check permissions via admin client
  const { data: fundingSource } = await adminSupabase
    .from('initiative_budgets')
    .select('initiative_id, initiatives!inner(strategic_goals!inner(strategic_plans!inner(department_id, id)))')
    .eq('id', id)
    .maybeSingle()

  if (!fundingSource) {
    throw new Error('Funding source not found')
  }

  const { data: userProfile } = await adminSupabase
    .from('users')
    .select('role, department_id')
    .eq('id', currentUser.id)
    .maybeSingle<{ role: string; department_id: string | null }>()

  if (!userProfile) {
    throw new Error('User profile not found')
  }

  const plan = (
    fundingSource as {
      initiatives: {
        strategic_goals: { strategic_plans: { department_id: string; id: string } }
      }
    }
  ).initiatives.strategic_goals.strategic_plans

  const canEdit =
    userProfile.role === 'admin' ||
    userProfile.role === 'city_manager' ||
    userProfile.department_id === plan.department_id

  if (!canEdit) {
    throw new Error('You do not have permission to delete this funding source')
  }

  // Delete funding source with admin client
  const { error } = await adminSupabase
    .from('initiative_budgets')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting funding source:', error)
    throw new Error('Failed to delete funding source')
  }

  // Revalidate paths
  const planId = plan.id
  if (planId) {
    revalidatePath(`/plans/${planId}`)
    revalidatePath(`/plans/${planId}/edit`)
  }
}

export async function updateInitiativeRoi(
  initiativeId: string,
  roi: RoiAnalysis
): Promise<void> {
  const supabase = createServerSupabaseClient()
  const adminSupabase = createAdminSupabaseClient()

  // Get current user
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser()

  if (!currentUser) {
    throw new Error('Unauthorized')
  }

  // Check permissions using admin client
  const { data: initiative } = await adminSupabase
    .from('initiatives')
    .select('id, strategic_goals!inner(strategic_plans!inner(department_id, id))')
    .eq('id', initiativeId)
    .maybeSingle()

  if (!initiative) {
    throw new Error('Initiative not found')
  }

  const { data: userProfile } = await adminSupabase
    .from('users')
    .select('role, department_id')
    .eq('id', currentUser.id)
    .maybeSingle<{ role: string; department_id: string | null }>()

  if (!userProfile) {
    throw new Error('User profile not found')
  }

  const plan = (
    initiative as {
      strategic_goals: { strategic_plans: { department_id: string; id: string } }
    }
  ).strategic_goals.strategic_plans

  const canEdit =
    userProfile.role === 'admin' ||
    userProfile.role === 'city_manager' ||
    userProfile.department_id === plan.department_id

  if (!canEdit) {
    throw new Error('You do not have permission to edit this initiative ROI')
  }

  // Update ROI using admin client
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (adminSupabase as any)
    .from('initiatives')
    .update({
      roi_analysis: roi,
    })
    .eq('id', initiativeId)

  if (error) {
    console.error('Error updating initiative ROI:', error)
    throw new Error('Failed to update initiative ROI')
  }

  // Revalidate paths
  const planId = plan.id
  if (planId) {
    revalidatePath(`/plans/${planId}`)
    revalidatePath(`/plans/${planId}/edit`)
  }
}
