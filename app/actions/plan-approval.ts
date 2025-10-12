'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
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

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  // Get user profile and role
  const { data: profile } = await supabase
    .from('users')
    .select('role, first_name, last_name')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return { success: false, error: 'User profile not found' }
  }

  // Only City Manager can approve plans
  if (newStatus === 'approved' && profile.role !== 'city_manager') {
    return { success: false, error: 'Only City Manager can approve plans' }
  }

  // Get current plan status
  const { data: currentPlan, error: planError } = await supabase
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

  const { error: updateError } = await supabase
    .from('strategic_plans')
    .update(updateData)
    .eq('id', planId)

  if (updateError) {
    console.error('Error updating plan status:', updateError)
    return { success: false, error: 'Failed to update plan status' }
  }

  // Log to audit_logs
  await supabase.from('audit_logs').insert({
    entity_type: 'strategic_plan',
    entity_id: planId,
    action: 'status_change',
    user_id: user.id,
    changes: {
      previous_status: previousStatus,
      new_status: newStatus,
      notes: notes || null,
    },
    metadata: {
      plan_title: currentPlan.title,
      user_name: `${profile.first_name} ${profile.last_name}`,
      user_role: profile.role,
    },
  })

  // Revalidate relevant paths
  revalidatePath(`/plans/${planId}`)
  revalidatePath('/plans')
  revalidatePath('/city-manager')

  return { success: true }
}

/**
 * Get approval history for a plan
 */
export async function getApprovalHistory(planId: string): Promise<ApprovalHistoryEntry[]> {
  const supabase = createServerSupabaseClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  // Get audit logs for status changes
  const { data: logs, error } = await supabase
    .from('audit_logs')
    .select('id, entity_id, action, user_id, changes, metadata, created_at')
    .eq('entity_type', 'strategic_plan')
    .eq('entity_id', planId)
    .eq('action', 'status_change')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching approval history:', error)
    return []
  }

  type AuditLog = {
    id: string
    entity_id: string
    action: string
    user_id: string
    changes: {
      previous_status: PlanStatus | null
      new_status: PlanStatus
      notes: string | null
    }
    metadata: {
      user_name: string
    }
    created_at: string
  }

  const typedLogs = (logs || []) as AuditLog[]

  return typedLogs.map((log) => ({
    id: log.id,
    plan_id: log.entity_id,
    previous_status: log.changes.previous_status,
    new_status: log.changes.new_status,
    changed_by: log.user_id,
    changed_by_name: log.metadata.user_name,
    changed_at: log.created_at,
    notes: log.changes.notes,
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
