import { Suspense } from 'react'
import { getAuditLogs } from '@/app/actions/audit-logs'
import { AuditLogsTable } from '@/components/admin/AuditLogsTable'
import { AuditLogsFilters } from '@/components/admin/AuditLogsFilters'

interface PageProps {
  searchParams: Promise<{
    action?: string
    entityType?: string
    page?: string
  }>
}

export default async function AuditLogsPage({ searchParams }: PageProps) {
  const params = await searchParams

  const result = await getAuditLogs({
    action: params.action,
    entityType: params.entityType,
    page: params.page ? parseInt(params.page) : 1,
  })

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Audit Logs</h1>
          <p className="mt-1 text-sm text-gray-500">
            View system activity and track changes
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-gray-50">
        <div className="mx-auto max-w-7xl p-6">
          <div className="rounded-lg bg-white shadow">
            <Suspense fallback={<div className="p-4">Loading filters...</div>}>
              <AuditLogsFilters
                currentFilters={{
                  action: params.action,
                  entityType: params.entityType,
                }}
              />
            </Suspense>

            <AuditLogsTable
              logs={result.logs}
              total={result.total}
              page={result.page}
              limit={result.limit}
              totalPages={result.totalPages}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
