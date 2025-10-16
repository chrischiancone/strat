import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database'

export type AuditLogAction = 
  | 'insert' | 'update' | 'delete' 
  | 'login' | 'logout' | 'password_change' 
  | 'role_change' | 'permission_grant' | 'permission_revoke'
  | 'export' | 'import' | 'backup' | 'restore'
  | 'bulk_update' | 'bulk_delete'
  | 'security_event' | 'compliance_check'

export interface AuditLogEntry {
  id: string
  table_name: string
  record_id: string
  action: string
  old_values: Record<string, unknown> | null
  new_values: Record<string, unknown> | null
  changed_by: string | null
  changed_at: string
  ip_address: string | null
  user_agent: string | null
  user_name: string | null
  user_email: string | null
}

export interface AuditLogFilters {
  startDate?: string
  endDate?: string
  userId?: string
  action?: string
  entityType?: string
  entityId?: string
  ipAddress?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
  search?: string
}

export interface AuditLogSummary {
  table_name: string
  action: string
  total_count: number
  unique_users: number
  first_occurrence: string
  last_occurrence: string
  count_last_24h: number
  count_last_7d: number
  count_last_30d: number
}

export interface UserActivitySummary {
  user_id: string
  full_name: string | null
  email: string | null
  role: string | null
  total_actions: number
  tables_modified: number
  last_activity: string
  actions_last_24h: number
  actions_last_7d: number
  total_creates: number
  total_updates: number
  total_deletes: number
}

export interface SecurityEvent {
  type: 'suspicious_activity' | 'bulk_changes' | 'after_hours_access' | 'privilege_escalation' | 'data_export'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  user_id: string | null
  ip_address: string | null
  detected_at: string
  audit_log_ids: string[]
  metadata: Record<string, unknown>
}

export class AuditLogService {
  private supabase

  constructor() {
    this.supabase = createServerSupabaseClient()
  }

  /**
   * Get paginated audit logs with filtering and sorting
   */
  async getAuditLogs(filters: AuditLogFilters = {}): Promise<{
    logs: AuditLogEntry[]
    total: number
    page: number
    limit: number
    totalPages: number
  }> {
    const {
      startDate,
      endDate,
      userId,
      action,
      entityType,
      entityId,
      ipAddress,
      search,
      sortBy = 'changed_at',
      sortOrder = 'desc',
      page = 1,
      limit = 50,
    } = filters

    let query = this.supabase
      .from('audit_logs')
      .select(
        `
        id,
        table_name,
        record_id,
        action,
        old_values,
        new_values,
        changed_by,
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
    if (entityId) {
      query = query.eq('record_id', entityId)
    }
    if (ipAddress) {
      query = query.eq('ip_address', ipAddress)
    }
    if (search) {
      query = query.or(`action.ilike.%${search}%,table_name.ilike.%${search}%`)
    }

    // Apply sorting and pagination
    query = query.order(sortBy, { ascending: sortOrder === 'asc' })
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching audit logs:', error)
      throw new Error(`Failed to fetch audit logs: ${error.message}`)
    }

    const logs: AuditLogEntry[] = (data || []).map((log) => ({
      id: log.id,
      table_name: log.table_name,
      record_id: log.record_id,
      action: log.action,
      old_values: log.old_values,
      new_values: log.new_values,
      changed_by: log.changed_by,
      changed_at: log.changed_at,
      ip_address: log.ip_address,
      user_agent: log.user_agent,
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

  /**
   * Create manual audit log entry (for custom events)
   */
  async createAuditLogEntry(entry: {
    tableName: string
    recordId: string
    action: AuditLogAction
    oldValues?: Record<string, unknown>
    newValues?: Record<string, unknown>
    userId?: string
    ipAddress?: string
    userAgent?: string
  }): Promise<void> {
    const { error } = await this.supabase.from('audit_logs').insert({
      table_name: entry.tableName,
      record_id: entry.recordId,
      action: entry.action,
      old_values: entry.oldValues || null,
      new_values: entry.newValues || null,
      changed_by: entry.userId || null,
      ip_address: entry.ipAddress || null,
      user_agent: entry.userAgent || null,
    })

    if (error) {
      console.error('Error creating audit log entry:', error)
      throw new Error(`Failed to create audit log entry: ${error.message}`)
    }
  }

  /**
   * Get audit log summary statistics
   */
  async getAuditLogSummary(): Promise<AuditLogSummary[]> {
    const { data, error } = await this.supabase
      .from('audit_log_summary')
      .select('*')
      .order('total_count', { ascending: false })

    if (error) {
      console.error('Error fetching audit log summary:', error)
      throw new Error(`Failed to fetch audit log summary: ${error.message}`)
    }

    return data || []
  }

  /**
   * Get user activity summary
   */
  async getUserActivitySummary(limit = 50): Promise<UserActivitySummary[]> {
    const { data, error } = await this.supabase
      .from('user_activity_summary')
      .select('*')
      .order('total_actions', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching user activity summary:', error)
      throw new Error(`Failed to fetch user activity summary: ${error.message}`)
    }

    return data || []
  }

  /**
   * Get activity for a specific entity (record)
   */
  async getEntityHistory(
    tableName: string, 
    recordId: string
  ): Promise<AuditLogEntry[]> {
    const { data, error } = await this.supabase
      .from('audit_logs')
      .select(
        `
        id,
        table_name,
        record_id,
        action,
        old_values,
        new_values,
        changed_by,
        changed_at,
        ip_address,
        user_agent,
        users:changed_by (
          full_name,
          email
        )
        `
      )
      .eq('table_name', tableName)
      .eq('record_id', recordId)
      .order('changed_at', { ascending: true })

    if (error) {
      console.error('Error fetching entity history:', error)
      throw new Error(`Failed to fetch entity history: ${error.message}`)
    }

    return (data || []).map((log) => ({
      id: log.id,
      table_name: log.table_name,
      record_id: log.record_id,
      action: log.action,
      old_values: log.old_values,
      new_values: log.new_values,
      changed_by: log.changed_by,
      changed_at: log.changed_at,
      ip_address: log.ip_address,
      user_agent: log.user_agent,
      user_name: log.users?.full_name || null,
      user_email: log.users?.email || null,
    }))
  }

  /**
   * Detect security events based on audit log patterns
   */
  async detectSecurityEvents(
    hoursBack = 24
  ): Promise<SecurityEvent[]> {
    const startTime = new Date(Date.now() - (hoursBack * 60 * 60 * 1000)).toISOString()
    const events: SecurityEvent[] = []

    try {
      // 1. Detect bulk operations (many changes in short time)
      const bulkChanges = await this.supabase
        .rpc('detect_bulk_operations', {
          hours_back: hoursBack,
          threshold: 20
        })

      // 2. Detect after-hours activity
      const afterHoursActivity = await this.supabase
        .from('audit_logs')
        .select('changed_by, changed_at, action, table_name, users:changed_by(full_name, email)')
        .gte('changed_at', startTime)
        .or('extract(hour from changed_at).<8,extract(hour from changed_at).>18')

      // 3. Detect multiple failed login attempts (if tracking those)
      const suspiciousLogins = await this.supabase
        .from('audit_logs')
        .select('changed_by, ip_address, changed_at')
        .eq('action', 'login_failed')
        .gte('changed_at', startTime)

      // Process detected patterns into security events
      // This would be expanded with more sophisticated detection logic

      return events
    } catch (error) {
      console.error('Error detecting security events:', error)
      return []
    }
  }

  /**
   * Export audit logs to CSV
   */
  async exportAuditLogs(filters: AuditLogFilters = {}): Promise<string> {
    const { logs } = await this.getAuditLogs({ ...filters, limit: 10000 })
    
    const headers = [
      'Timestamp',
      'User',
      'Email',
      'Action', 
      'Entity Type',
      'Entity ID',
      'IP Address',
      'User Agent'
    ]

    const rows = logs.map(log => [
      new Date(log.changed_at).toISOString(),
      log.user_name || 'System',
      log.user_email || '',
      log.action,
      log.table_name,
      log.record_id,
      log.ip_address || '',
      log.user_agent || ''
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => 
        row.map(field => 
          typeof field === 'string' && field.includes(',') 
            ? `"${field.replace(/"/g, '""')}"` 
            : field
        ).join(',')
      )
    ].join('\n')

    return csvContent
  }

  /**
   * Get field-level changes between old and new values
   */
  generateFieldChanges(
    oldValues: Record<string, unknown> | null,
    newValues: Record<string, unknown> | null
  ): Array<{
    field: string
    oldValue: unknown
    newValue: unknown
    type: 'added' | 'modified' | 'removed'
  }> {
    const changes: Array<{
      field: string
      oldValue: unknown
      newValue: unknown
      type: 'added' | 'modified' | 'removed'
    }> = []

    if (!oldValues && !newValues) return changes

    const oldFields = Object.keys(oldValues || {})
    const newFields = Object.keys(newValues || {})
    const allFields = [...new Set([...oldFields, ...newFields])]

    for (const field of allFields) {
      const oldValue = oldValues?.[field]
      const newValue = newValues?.[field]

      if (oldValue === undefined && newValue !== undefined) {
        changes.push({
          field,
          oldValue: null,
          newValue,
          type: 'added'
        })
      } else if (oldValue !== undefined && newValue === undefined) {
        changes.push({
          field,
          oldValue,
          newValue: null,
          type: 'removed'
        })
      } else if (oldValue !== newValue) {
        changes.push({
          field,
          oldValue,
          newValue,
          type: 'modified'
        })
      }
    }

    return changes
  }

  /**
   * Get audit statistics for dashboard
   */
  async getDashboardStats(): Promise<{
    totalLogs: number
    logsToday: number
    logsThisWeek: number
    activeUsers: number
    topActions: Array<{ action: string; count: number }>
    recentActivity: AuditLogEntry[]
  }> {
    const today = new Date()
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

    const [
      totalResult,
      todayResult,
      weekResult,
      activeUsersResult,
      topActionsResult,
      recentActivityResult
    ] = await Promise.all([
      // Total logs count
      this.supabase.from('audit_logs').select('*', { count: 'exact', head: true }),
      
      // Today's logs
      this.supabase
        .from('audit_logs')
        .select('*', { count: 'exact', head: true })
        .gte('changed_at', today.toISOString().split('T')[0]),
      
      // This week's logs
      this.supabase
        .from('audit_logs')
        .select('*', { count: 'exact', head: true })
        .gte('changed_at', weekAgo.toISOString()),
      
      // Active users this week
      this.supabase
        .from('audit_logs')
        .select('changed_by', { count: 'exact' })
        .gte('changed_at', weekAgo.toISOString())
        .not('changed_by', 'is', null),
      
      // Top actions
      this.supabase
        .from('audit_logs')
        .select('action')
        .gte('changed_at', weekAgo.toISOString()),
      
      // Recent activity
      this.supabase
        .from('audit_logs')
        .select(`
          id, table_name, record_id, action, changed_by, changed_at,
          users:changed_by(full_name, email)
        `)
        .order('changed_at', { ascending: false })
        .limit(10)
    ])

    // Process top actions
    const actionCounts = new Map<string, number>()
    topActionsResult.data?.forEach(log => {
      const current = actionCounts.get(log.action) || 0
      actionCounts.set(log.action, current + 1)
    })
    
    const topActions = Array.from(actionCounts.entries())
      .map(([action, count]) => ({ action, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    return {
      totalLogs: totalResult.count || 0,
      logsToday: todayResult.count || 0,
      logsThisWeek: weekResult.count || 0,
      activeUsers: activeUsersResult.count || 0,
      topActions,
      recentActivity: (recentActivityResult.data || []).map(log => ({
        id: log.id,
        table_name: log.table_name,
        record_id: log.record_id,
        action: log.action,
        old_values: null,
        new_values: null,
        changed_by: log.changed_by,
        changed_at: log.changed_at,
        ip_address: null,
        user_agent: null,
        user_name: log.users?.full_name || null,
        user_email: log.users?.email || null,
      }))
    }
  }
}

export default AuditLogService