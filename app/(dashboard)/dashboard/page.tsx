import { Suspense } from 'react'
import { DashboardContent } from '@/components/dashboard/DashboardContent'
import { DashboardSkeleton } from '@/components/ui/skeleton'

export default async function DashboardPage() {
  return (
    <div className="flex h-full flex-col">
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </div>
  )
}
