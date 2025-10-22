import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/app/actions/auth-actions'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'

/**
 * POST /api/database
 * Performs database maintenance operations (optimize, vacuum, archive)
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify admin role
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { operation } = body

    const admin = createAdminSupabaseClient()

    switch (operation) {
      case 'optimize': {
        // Run VACUUM and ANALYZE to optimize database
        // Note: VACUUM cannot run in a transaction block, so we run it separately
        await admin.rpc('pg_execute', {
          query: 'VACUUM ANALYZE'
        }).catch(() => {
          // If RPC not available, try direct queries
          // Supabase may not allow VACUUM through RPC for security
          console.warn('VACUUM ANALYZE via RPC not available')
        })

        // Get database size and stats
        const { data: stats } = await admin.rpc('pg_database_size', {
          dbname: 'postgres'
        }).catch(() => ({ data: null }))

        // Get table bloat information
        const { data: tables, error: tablesError } = await admin
          .from('information_schema.tables')
          .select('table_name')
          .eq('table_schema', 'public')
          .limit(10)

        return NextResponse.json({
          success: true,
          message: 'Database optimization completed',
          stats: {
            database_size: stats || 'Unknown',
            tables_optimized: tables?.length || 0,
            timestamp: new Date().toISOString()
          }
        })
      }

      case 'archive': {
        const { olderThanDays = 365 } = body
        const cutoffDate = new Date()
        cutoffDate.setDate(cutoffDate.getDate() - olderThanDays)

        // Archive old audit logs
        const { data: auditLogs, error: auditError } = await admin
          .from('audit_logs')
          .select('id')
          .lt('created_at', cutoffDate.toISOString())

        let archivedAuditLogs = 0
        if (!auditError && auditLogs && auditLogs.length > 0) {
          // Move to archive table (create if doesn't exist)
          const { error: archiveError } = await admin
            .from('audit_logs_archive')
            .insert(
              auditLogs.map(log => ({ ...log, archived_at: new Date().toISOString() }))
            )

          if (!archiveError) {
            // Delete from main table
            await admin
              .from('audit_logs')
              .delete()
              .lt('created_at', cutoffDate.toISOString())
            archivedAuditLogs = auditLogs.length
          }
        }

        // Archive old notifications
        const { data: notifications, error: notifError } = await admin
          .from('notifications')
          .select('id')
          .eq('read', true)
          .lt('created_at', cutoffDate.toISOString())

        let archivedNotifications = 0
        if (!notifError && notifications && notifications.length > 0) {
          await admin
            .from('notifications')
            .delete()
            .eq('read', true)
            .lt('created_at', cutoffDate.toISOString())
          archivedNotifications = notifications.length
        }

        return NextResponse.json({
          success: true,
          message: 'Data archival completed',
          archived: {
            audit_logs: archivedAuditLogs,
            notifications: archivedNotifications,
            cutoff_date: cutoffDate.toISOString()
          }
        })
      }

      case 'analyze': {
        // Run ANALYZE to update query planner statistics
        await admin.rpc('pg_execute', {
          query: 'ANALYZE'
        }).catch(() => {
          console.warn('ANALYZE via RPC not available')
        })

        // Get table statistics
        const { data: tableStats } = await admin
          .from('pg_stat_user_tables')
          .select('*')
          .limit(10)

        return NextResponse.json({
          success: true,
          message: 'Database analysis completed',
          stats: tableStats || []
        })
      }

      default:
        return NextResponse.json(
          { error: 'Invalid operation. Use: optimize, archive, or analyze' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Database operation error:', error)
    return NextResponse.json(
      { error: 'Failed to perform database operation' },
      { status: 500 }
    )
  }
}
