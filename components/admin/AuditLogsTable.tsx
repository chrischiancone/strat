'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AuditLog } from '@/app/actions/audit-logs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ChevronDownIcon, 
  ChevronRightIcon, 
  DownloadIcon,
  EyeIcon,
  ClockIcon
} from 'lucide-react'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
interface AuditLogsTableProps {
  logs: AuditLog[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export function AuditLogsTable({
  logs,
  total,
  page,
  limit,
  totalPages,
}: AuditLogsTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [isExporting, setIsExporting] = useState(false)

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  const formatAction = (action: string) => {
    return action
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const formatEntityType = (entityType: string) => {
    return entityType
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', newPage.toString())
    router.push(`/admin/audit-logs?${params.toString()}`)
  }

  const toggleRowExpansion = (logId: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId)
    } else {
      newExpanded.add(logId)
    }
    setExpandedRows(newExpanded)
  }

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const params = new URLSearchParams(searchParams.toString())
      
      // Call server action to generate CSV
      const response = await fetch(`/api/audit-logs/export?${params.toString()}`)
      if (!response.ok) throw new Error('Export failed')
      
      const csvData = await response.text()
      
      const blob = new Blob([csvData], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to export audit logs:', error)
      alert('Failed to export audit logs. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  const formatValue = (value: unknown): string => {
    if (value === null || value === undefined) return 'null'
    if (typeof value === 'object') return JSON.stringify(value, null, 2)
    if (typeof value === 'boolean') return value ? 'true' : 'false'
    return String(value)
  }

  const getActionBadgeVariant = (action: string) => {
    switch (action) {
      case 'insert': return 'default'
      case 'update': return 'secondary'
      case 'delete': return 'destructive'
      default: return 'outline'
    }
  }

  const getFieldChanges = (log: AuditLog) => {
    if (!log.old_values || !log.new_values) return []
    
    // Generate field changes locally
    const changes: Array<{
      field: string
      oldValue: unknown
      newValue: unknown
      type: 'added' | 'modified' | 'removed'
    }> = []

    const oldFields = Object.keys(log.old_values || {})
    const newFields = Object.keys(log.new_values || {})
    const allFields = [...new Set([...oldFields, ...newFields])]

    for (const field of allFields) {
      const oldValue = log.old_values?.[field]
      const newValue = log.new_values?.[field]

      if (oldValue === undefined && newValue !== undefined) {
        changes.push({ field, oldValue: null, newValue, type: 'added' })
      } else if (oldValue !== undefined && newValue === undefined) {
        changes.push({ field, oldValue, newValue: null, type: 'removed' })
      } else if (oldValue !== newValue) {
        changes.push({ field, oldValue, newValue, type: 'modified' })
      }
    }

    return changes
  }

  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-sm text-gray-500">No audit logs found</p>
        <p className="mt-1 text-xs text-gray-400">
          Try adjusting your filters
        </p>
      </div>
    )
  }

  return (
    <div>
      {/* Export Button */}
      <div className="mb-4 flex justify-end">
        <Button
          onClick={handleExport}
          disabled={isExporting}
          size="sm"
          variant="outline"
        >
          <DownloadIcon className="h-4 w-4 mr-2" />
          {isExporting ? 'Exporting...' : 'Export CSV'}
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12"></TableHead>
            <TableHead>Timestamp</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Entity Type</TableHead>
            <TableHead>Entity ID</TableHead>
            <TableHead>IP Address</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => {
            const isExpanded = expandedRows.has(log.id)
            const fieldChanges = getFieldChanges(log)
            
            return (
              <Collapsible key={log.id} open={isExpanded} onOpenChange={() => toggleRowExpansion(log.id)}>
                <CollapsibleTrigger asChild>
                  <TableRow className="cursor-pointer hover:bg-gray-50">
                    <TableCell className="w-12">
                      {isExpanded ? (
                        <ChevronDownIcon className="h-4 w-4" />
                      ) : (
                        <ChevronRightIcon className="h-4 w-4" />
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-gray-900">
                      <div className="flex items-center gap-2">
                        <ClockIcon className="h-3 w-3 text-gray-400" />
                        {formatTimestamp(log.created_at)}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      <div>
                        <div className="font-medium text-gray-900">
                          {log.user_name || 'System'}
                        </div>
                        {log.user_email && (
                          <div className="text-xs text-gray-500">{log.user_email}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      <Badge variant={getActionBadgeVariant(log.action)}>
                        {formatAction(log.action)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-700">
                      {formatEntityType(log.entity_type)}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-gray-600">
                      {log.entity_id.substring(0, 8)}...
                    </TableCell>
                    <TableCell className="text-xs text-gray-500">
                      {log.ip_address || 'N/A'}
                    </TableCell>
                  </TableRow>
                </CollapsibleTrigger>
                
                <CollapsibleContent asChild>
                  <tr>
                    <td colSpan={7} className="p-0">
                      <div className="bg-gray-50 border-t border-gray-200 px-4 py-3">
                        <div className="space-y-3">
                          {/* Basic Info */}
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-gray-600">Full Entity ID:</span>
                              <div className="font-mono text-xs bg-white p-2 rounded border mt-1">
                                {log.entity_id}
                              </div>
                            </div>
                            <div>
                              <span className="font-medium text-gray-600">User Agent:</span>
                              <div className="text-xs bg-white p-2 rounded border mt-1 truncate">
                                {log.user_agent || 'N/A'}
                              </div>
                            </div>
                          </div>

                          {/* Field Changes */}
                          {fieldChanges.length > 0 && (
                            <div>
                              <h4 className="font-medium text-gray-700 mb-2">Field Changes:</h4>
                              <div className="space-y-2">
                                {fieldChanges.map((change, idx) => (
                                  <div key={idx} className="bg-white p-3 rounded border text-sm">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-mono font-medium">{change.field}</span>
                                      <Badge 
                                        variant={change.type === 'added' ? 'default' : 
                                                change.type === 'removed' ? 'destructive' : 'secondary'}
                                        className="text-xs"
                                      >
                                        {change.type}
                                      </Badge>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                      <div>
                                        <span className="text-gray-500">Old:</span>
                                        <pre className="bg-red-50 p-2 rounded mt-1 overflow-auto max-h-20">
                                          {formatValue(change.oldValue)}
                                        </pre>
                                      </div>
                                      <div>
                                        <span className="text-gray-500">New:</span>
                                        <pre className="bg-green-50 p-2 rounded mt-1 overflow-auto max-h-20">
                                          {formatValue(change.newValue)}
                                        </pre>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Raw Data */}
                          {(log.old_values || log.new_values) && (
                            <div>
                              <h4 className="font-medium text-gray-700 mb-2">Raw Data:</h4>
                              <div className="grid grid-cols-2 gap-4 text-xs">
                                {log.old_values && (
                                  <div>
                                    <span className="text-gray-500">Old Values:</span>
                                    <pre className="bg-white p-2 rounded border mt-1 overflow-auto max-h-40">
                                      {JSON.stringify(log.old_values, null, 2)}
                                    </pre>
                                  </div>
                                )}
                                {log.new_values && (
                                  <div>
                                    <span className="text-gray-500">New Values:</span>
                                    <pre className="bg-white p-2 rounded border mt-1 overflow-auto max-h-40">
                                      {JSON.stringify(log.new_values, null, 2)}
                                    </pre>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                </CollapsibleContent>
              </Collapsible>
            )
          })}
        </TableBody>
      </Table>

      <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-4 py-3">
        <div className="text-sm text-gray-700">
          Showing <span className="font-medium">{(page - 1) * limit + 1}</span> to{' '}
          <span className="font-medium">
            {Math.min(page * limit, total)}
          </span>{' '}
          of <span className="font-medium">{total}</span> log
          {total === 1 ? '' : 's'}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
          >
            Previous
          </Button>
          <div className="flex items-center px-3 text-sm text-gray-700">
            Page {page} of {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
