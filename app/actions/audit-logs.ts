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
    sortBy = 'created_at',
    sortOrder = 'desc',
    page = 1,
    limit = 50,
  } = filters

  // Get current user to fetch their municipality_id
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
    .select('municipality_id')
    .eq('id', currentUser.id)
    .single<{ municipality_id: string }>()

  if (!currentUserProfile) {
    return {
      logs: [],
      total: 0,
      page,
      limit,
      totalPages: 0,
    }
  }

  // Build base query with user join
  let query = supabase
    .from('audit_logs')
    .select(
      `
      id,
      user_id,
      action,
      entity_type,
      entity_id,
      details,
      created_at,
      users:user_id (
        full_name,
        email
      )
    `,
      { count: 'exact' }
    )
    .eq('municipality_id', currentUserProfile.municipality_id)

  // Apply filters
  if (startDate) {
    query = query.gte('created_at', startDate)
  }

  if (endDate) {
    query = query.lte('created_at', endDate)
  }

  if (userId) {
    query = query.eq('user_id', userId)
  }

  if (action) {
    query = query.eq('action', action)
  }

  if (entityType) {
    query = query.eq('entity_type', entityType)
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
    throw new Error('Failed to fetch audit logs')
  }

  // Transform data to include user name and email
  interface AuditLogQueryResult {
    id: string
    user_id: string | null
    action: string
    entity_type: string
    entity_id: string
    details: Record<string, unknown> | null
    created_at: string
    users: { full_name: string | null; email: string | null } | null
  }

  const logs: AuditLog[] = (data as unknown as AuditLogQueryResult[] || []).map((log) => ({
    id: log.id,
    user_id: log.user_id,
    action: log.action,
    entity_type: log.entity_type,
    entity_id: log.entity_id,
    details: log.details,
    created_at: log.created_at,
    user_name: log.users?.full_name || null,
    user_email: log.users?.email || null,
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
