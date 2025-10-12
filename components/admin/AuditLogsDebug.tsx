'use client'

import { useEffect, useState } from 'react'
import { createClientSupabaseClient } from '@/lib/supabase/client'

interface DebugInfo {
  userRole: string | null
  userAuth: boolean
  auditLogsTableExists: boolean
  hasPermissions: boolean
  sampleCount: number
  error: string | null
}

export function AuditLogsDebug() {
  const [debug, setDebug] = useState<DebugInfo>({
    userRole: null,
    userAuth: false,
    auditLogsTableExists: false,
    hasPermissions: false,
    sampleCount: 0,
    error: null
  })

  useEffect(() => {
    async function checkDebugInfo() {
      try {
        const supabase = createClientSupabaseClient()
        
        // Check user authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !user) {
          setDebug(prev => ({ 
            ...prev, 
            error: 'Authentication failed',
            userAuth: false 
          }))
          return
        }

        // Check user role
        const { data: userProfile } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single()

        const userRole = userProfile?.role || null
        const hasPermissions = userRole && ['admin', 'city_manager'].includes(userRole)

        // Test audit logs table access
        const { data, error: auditError, count } = await supabase
          .from('audit_logs')
          .select('id', { count: 'exact', head: true })
          .limit(1)

        setDebug({
          userRole,
          userAuth: true,
          auditLogsTableExists: !auditError,
          hasPermissions: !!hasPermissions,
          sampleCount: count || 0,
          error: auditError ? auditError.message : null
        })

      } catch (err) {
        setDebug(prev => ({
          ...prev,
          error: err instanceof Error ? err.message : 'Unknown error occurred'
        }))
      }
    }

    checkDebugInfo()
  }, [])

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <h3 className="text-lg font-semibold text-yellow-800 mb-3">Debug Information</h3>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="font-medium">User authenticated:</span>
          <span className={`ml-2 ${debug.userAuth ? 'text-green-600' : 'text-red-600'}`}>
            {debug.userAuth ? '✓ Yes' : '✗ No'}
          </span>
        </div>
        
        <div>
          <span className="font-medium">User role:</span>
          <span className="ml-2 font-mono text-blue-600">
            {debug.userRole || 'N/A'}
          </span>
        </div>
        
        <div>
          <span className="font-medium">Has permissions:</span>
          <span className={`ml-2 ${debug.hasPermissions ? 'text-green-600' : 'text-red-600'}`}>
            {debug.hasPermissions ? '✓ Yes' : '✗ No'}
          </span>
        </div>
        
        <div>
          <span className="font-medium">Audit logs table:</span>
          <span className={`ml-2 ${debug.auditLogsTableExists ? 'text-green-600' : 'text-red-600'}`}>
            {debug.auditLogsTableExists ? '✓ Accessible' : '✗ Not accessible'}
          </span>
        </div>
        
        <div className="col-span-2">
          <span className="font-medium">Sample count:</span>
          <span className="ml-2 font-mono text-blue-600">
            {debug.sampleCount} records
          </span>
        </div>
        
        {debug.error && (
          <div className="col-span-2">
            <span className="font-medium text-red-600">Error:</span>
            <pre className="ml-2 text-xs bg-red-50 p-2 rounded mt-1 text-red-700">
              {debug.error}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}