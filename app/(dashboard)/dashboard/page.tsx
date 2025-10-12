import { Suspense } from 'react'
import { DashboardContent } from '@/components/dashboard/DashboardContent'
import { PageHeader } from '@/components/layouts/PageHeader'
import { PageContainer } from '@/components/layouts/PageContainer'
import { CardSkeleton } from '@/components/ui/loading-states'

function DashboardSkeleton() {
  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title="Loading..."
        description="Please wait while we load your dashboard"
        breadcrumbs={[
          { label: 'Dashboard', current: true }
        ]}
      />
      <PageContainer>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} lines={2} />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2 mt-8">
          <CardSkeleton lines={5} />
          <CardSkeleton lines={5} />
        </div>
      </PageContainer>
    </div>
  )
}

export default async function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  )
}
