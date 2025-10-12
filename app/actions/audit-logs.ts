'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'

export interface AuditLogFilters {
  startDate?: string
  endDate?: string
  userId?: string
  action?: string
  entityType?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface AuditLog {
  id: string
  user_id: string | null
  action: string
  entity_type: string
  entity_id: string
  details: Record<string, unknown> | null
  created_at: string
  user_name: string | null
  user_email: string | null
  old_values: Record<string, unknown> | null
  new_values: Record<string, unknown> | null
  ip_address: string | null
  user_agent: string | null
}

export interface AuditLogsResponse {
  logs: AuditLog[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export async function getAuditLogs(
  filters: AuditLogFilters = {}
): Promise<AuditLogsResponse> {
  const supabase = createServerSupabaseClient()

  const {
    startDate,
    endDate,
    userId,
    action,
    entityType,
    sortBy = 'changed_at',
    sortOrder = 'desc',
    page = 1,
    limit = 50,
  } = filters

  // Get current user to check permissions
  const { data: { user: currentUser } } = await supabase.auth.getUser()

  if (!currentUser) {
    return {
      logs: [],
      total: 0,
      page,
      limit,
      totalPages: 0,
    }
  }

  const { data: currentUserProfile } = await supabase
    .from('users')
    .select('role')
    .eq('id', currentUser.id)
    .single<{ role: string }>()

  if (!currentUserProfile || !['admin', 'city_manager'].includes(currentUserProfile.role)) {
    return {
      logs: [],
      total: 0,
      page,
      limit,
      totalPages: 0,
    }
  }

  // Build base query with user join - map database columns to expected interface
  let query = supabase
    .from('audit_logs')
    .select(
      `
      id,
      changed_by,
      action,
      table_name,
      record_id,
      old_values,
      new_values,
      changed_at,
      ip_address,
      user_agent,
      users:changed_by (
        full_name,
        email
      )
    `,
      { count: 'exact' }
    )

  // Apply filters
  if (startDate) {
    query = query.gte('changed_at', startDate)
  }

  if (endDate) {
    query = query.lte('changed_at', endDate)
  }

  if (userId) {
    query = query.eq('changed_by', userId)
  }

  if (action) {
    query = query.eq('action', action)
  }

  if (entityType) {
    query = query.eq('table_name', entityType)
  }

  // Apply sorting
  query = query.order(sortBy, { ascending: sortOrder === 'asc' })

  // Apply pagination
  const from = (page - 1) * limit
  const to = from + limit - 1
  query = query.range(from, to)

  const { data, error, count } = await query

  if (error) {
    console.error('Error fetching audit logs:', error)
    // Return empty result instead of throwing error for better UX
    return {
      logs: [],
      total: 0,
      page,
      limit,
      totalPages: 0,
    }
  }

  // Transform data to match expected interface
  interface AuditLogQueryResult {
    id: string
    changed_by: string | null
    action: string
    table_name: string
    record_id: string
    old_values: Record<string, unknown> | null
    new_values: Record<string, unknown> | null
    changed_at: string
    ip_address: string | null
    user_agent: string | null
    users: { full_name: string | null; email: string | null } | null
  }

  const logs: AuditLog[] = (data as unknown as AuditLogQueryResult[] || []).map((log) => ({
    id: log.id,
    user_id: log.changed_by,
    action: log.action,
    entity_type: log.table_name,
    entity_id: log.record_id,
    details: log.new_values,
    created_at: log.changed_at,
    user_name: log.users?.full_name || null,
    user_email: log.users?.email || null,
    old_values: log.old_values,
    new_values: log.new_values,
    ip_address: log.ip_address,
    user_agent: log.user_agent,
  }))

  const total = count || 0
  const totalPages = Math.ceil(total / limit)

  return {
    logs,
    total,
    page,
    limit,
    totalPages,
  }
}
