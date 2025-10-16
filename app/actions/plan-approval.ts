'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export type PlanStatus = 'draft' | 'under_review' | 'approved' | 'active' | 'archived'

export interface ApprovalHistoryEntry {
  id: string
  plan_id: string
  previous_status: PlanStatus | null
  new_status: PlanStatus
  changed_by: string
  changed_by_name: string
  changed_at: string
  notes: string | null
}

/**
 * Update plan status with approval tracking
 * Only City Manager can approve plans
 */
export async function updatePlanStatus(
  planId: string,
  newStatus: PlanStatus,
  notes?: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createServerSupabaseClient()
  const adminSupabase = createAdminSupabaseClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  // Get user profile and role using admin client
  const { data: profile, error: profileError } = await adminSupabase
    .from('users')
    .select('role, full_name')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile || profileError) {
    console.error('updatePlanStatus: user profile lookup failed', profileError)
    return { success: false, error: 'User profile not found' }
  }

  // Only City Manager can approve plans
  if (newStatus === 'approved' && profile.role !== 'city_manager') {
    return { success: false, error: 'Only City Manager can approve plans' }
  }

  // Get current plan status
  const { data: currentPlan, error: planError } = await adminSupabase
    .from('strategic_plans')
    .select('status, title')
    .eq('id', planId)
    .single()

  if (planError || !currentPlan) {
    return { success: false, error: 'Plan not found' }
  }

  const previousStatus = currentPlan.status as PlanStatus

  // Validate status transitions
  const validTransitions: Record<PlanStatus, PlanStatus[]> = {
    draft: ['under_review'],
    under_review: ['approved', 'draft'],
    approved: ['active', 'under_review'],
    active: ['archived'],
    archived: ['active'],
  }

  if (!validTransitions[previousStatus]?.includes(newStatus)) {
    return {
      success: false,
      error: `Invalid status transition from ${previousStatus} to ${newStatus}`,
    }
  }

  // Update plan status
  const updateData: Record<string, unknown> = {
    status: newStatus,
    updated_at: new Date().toISOString(),
  }

  // If approving, record who and when
  if (newStatus === 'approved') {
    updateData.approved_by = user.id
    updateData.approved_at = new Date().toISOString()
  }

  // If setting to published/active, record publish date
  if (newStatus === 'active' && previousStatus !== 'active') {
    updateData.published_at = new Date().toISOString()
  }

  console.log('updatePlanStatus: Updating plan status', { planId, previousStatus, newStatus, updateData })
  
  const { error: updateError } = await adminSupabase
    .from('strategic_plans')
    .update(updateData)
    .eq('id', planId)

  if (updateError) {
    console.error('Error updating plan status:', updateError)
    return { success: false, error: 'Failed to update plan status' }
  }
  
  console.log('updatePlanStatus: Plan status updated successfully', { planId, newStatus })

  // Log to audit_logs using admin client
  await adminSupabase.from('audit_logs').insert({
    table_name: 'strategic_plans',
    record_id: planId,
    action: 'update',
    changed_by: user.id,
    old_values: {
      status: previousStatus,
    },
    new_values: {
      status: newStatus,
      notes: notes || null,
      plan_title: currentPlan.title,
      changed_by_name: profile.full_name || user.email || 'User',
      changed_by_role: profile.role,
    }
  })

  // Revalidate relevant paths
  revalidatePath(`/plans/${planId}`)
  revalidatePath(`/plans/${planId}/edit`)
  revalidatePath('/plans')
  revalidatePath('/city-manager')
  revalidatePath('/')

  return { success: true }
}

/**
 * Get approval history for a plan
 */
export async function getApprovalHistory(planId: string): Promise<ApprovalHistoryEntry[]> {
  const supabase = createServerSupabaseClient()
  const adminSupabase = createAdminSupabaseClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  // Get audit logs for status changes using admin client
  const { data: logs, error } = await adminSupabase
    .from('audit_logs')
    .select('id, record_id, action, changed_by, old_values, new_values, changed_at')
    .eq('table_name', 'strategic_plans')
    .eq('record_id', planId)
    .eq('action', 'update')
    .order('changed_at', { ascending: false })

  if (error) {
    console.error('Error fetching approval history:', error)
    return []
  }

  type AuditLog = {
    id: string
    record_id: string
    action: string
    changed_by: string
    old_values: {
      status: PlanStatus | null
    }
    new_values: {
      status: PlanStatus
      notes: string | null
      changed_by_name: string
    }
    changed_at: string
  }

  const typedLogs = (logs || []) as AuditLog[]

  return typedLogs.map((log) => ({
    id: log.id,
    plan_id: log.record_id,
    previous_status: log.old_values.status,
    new_status: log.new_values.status,
    changed_by: log.changed_by,
    changed_by_name: log.new_values.changed_by_name,
    changed_at: log.changed_at,
    notes: log.new_values.notes,
  }))
}

/**
 * Submit plan for review (Department Director action)
 */
export async function submitPlanForReview(
  planId: string
): Promise<{ success: boolean; error?: string }> {
  return updatePlanStatus(planId, 'under_review')
}

/**
 * Approve plan (City Manager action)
 */
export async function approvePlan(
  planId: string,
  notes?: string
): Promise<{ success: boolean; error?: string }> {
  return updatePlanStatus(planId, 'approved', notes)
}

/**
 * Request revisions (City Manager action)
 */
export async function requestRevisions(
  planId: string,
  notes: string
): Promise<{ success: boolean; error?: string }> {
  return updatePlanStatus(planId, 'draft', notes)
}

/**
 * Publish plan (make it active/public)
 */
export async function publishPlan(
  planId: string
): Promise<{ success: boolean; error?: string }> {
  return updatePlanStatus(planId, 'active')
}
