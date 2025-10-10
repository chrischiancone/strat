'use client'

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
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Timestamp</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Entity Type</TableHead>
            <TableHead>Entity ID</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell className="text-sm text-gray-900">
                {formatTimestamp(log.created_at)}
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
              <TableCell className="text-sm text-gray-900">
                {formatAction(log.action)}
              </TableCell>
              <TableCell className="text-sm text-gray-700">
                {formatEntityType(log.entity_type)}
              </TableCell>
              <TableCell className="font-mono text-xs text-gray-600">
                {log.entity_id.substring(0, 8)}...
              </TableCell>
            </TableRow>
          ))}
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
