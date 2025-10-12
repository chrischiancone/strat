import { Suspense } from 'react'
import { getAuditLogs } from '@/app/actions/audit-logs'
import { AuditLogsTable } from '@/components/admin/AuditLogsTable'
import { AuditLogsFilters } from '@/components/admin/AuditLogsFilters'
import { AuditLogsDebug } from '@/components/admin/AuditLogsDebug'
import { PageHeader } from '@/components/layouts/PageHeader'
import { PageContainer, ContentCard } from '@/components/layouts/PageContainer'
import { TableSkeleton, NoDataEmptyState } from '@/components/ui/loading-states'
import { ShieldIcon } from 'lucide-react'

interface PageProps {
  searchParams: Promise<{
    action?: string
    entityType?: string
    page?: string
  }>
}

async function AuditLogsContent({ searchParams }: PageProps) {
  const params = await searchParams

  try {
    const result = await getAuditLogs({
      action: params.action,
      entityType: params.entityType,
      page: params.page ? parseInt(params.page) : 1,
    })

    return (
      <div className="flex h-full flex-col">
        <PageHeader
          title="Audit Logs"
          description="View system activity and track changes"
          breadcrumbs={[
            { label: 'Admin', href: '/admin' },
            { label: 'Audit Logs', current: true }
          ]}
        />

        <PageContainer>
          <AuditLogsDebug />
          {result.logs.length === 0 ? (
            <ContentCard>
              <NoDataEmptyState 
                resourceName="Audit Logs"
                action={
                  <p className="text-sm text-gray-500 mt-2">
                    System activity will appear here as users interact with the application.
                  </p>
                }
              />
            </ContentCard>
          ) : (
            <ContentCard padding="none">
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
            </ContentCard>
          )}
        </PageContainer>
      </div>
    )
  } catch (error) {
    console.error('Error loading audit logs:', error)
    return (
      <div className="flex h-full flex-col">
        <PageHeader
          title="Audit Logs"
          description="View system activity and track changes"
          breadcrumbs={[
            { label: 'Admin', href: '/admin' },
            { label: 'Audit Logs', current: true }
          ]}
        />
        <PageContainer>
          <ContentCard>
            <NoDataEmptyState 
              variant="error"
              title="Unable to load audit logs"
              description="There was an error loading the audit logs. Please try again or contact support if the problem persists."
              action={
                <button 
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <ShieldIcon className="h-4 w-4" />
                  Try Again
                </button>
              }
            />
          </ContentCard>
        </PageContainer>
      </div>
    )
  }
}

function AuditLogsSkeleton() {
  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title="Audit Logs"
        description="View system activity and track changes"
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Audit Logs', current: true }
        ]}
      />
      <PageContainer>
        <TableSkeleton rows={10} columns={6} />
      </PageContainer>
    </div>
  )
}

export default async function AuditLogsPage({ searchParams }: PageProps) {
  return (
    <Suspense fallback={<AuditLogsSkeleton />}>
      <AuditLogsContent searchParams={searchParams} />
    </Suspense>
  )
}
