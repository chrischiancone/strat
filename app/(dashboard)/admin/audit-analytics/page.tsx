import { Suspense } from 'react'
import { AuditLogsDashboard } from '@/components/admin/AuditLogsDashboard'
import { PageHeader } from '@/components/layouts/PageHeader'
import { PageContainer } from '@/components/layouts/PageContainer'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </div>
              <Skeleton className="h-8 w-16 mt-2" />
              <Skeleton className="h-3 w-20 mt-1" />
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Charts Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-48 mb-4" />
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-6 w-28 mb-2" />
            <Skeleton className="h-4 w-36 mb-4" />
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center space-x-3">
                    <Skeleton className="h-5 w-16" />
                    <div>
                      <Skeleton className="h-4 w-24 mb-1" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                  <Skeleton className="h-3 w-12" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function AuditAnalyticsPage() {
  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title="Audit Analytics"
        description="Comprehensive audit log analytics and system insights"
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Audit Analytics', current: true }
        ]}
      />

      <PageContainer>
        <Suspense fallback={<DashboardSkeleton />}>
          <AuditLogsDashboard />
        </Suspense>
      </PageContainer>
    </div>
  )
}