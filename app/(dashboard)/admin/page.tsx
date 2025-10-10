import { Suspense } from 'react'
import { getDashboardStats } from '@/app/actions/admin'
import { DashboardStats } from '@/components/admin/DashboardStats'
import { QuickActions } from '@/components/admin/QuickActions'

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="h-32 animate-pulse rounded-lg bg-gray-100"
        />
      ))}
    </div>
  )
}

function QuickActionsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="h-36 animate-pulse rounded-lg bg-gray-100"
        />
      ))}
    </div>
  )
}

async function DashboardStatsContent() {
  const stats = await getDashboardStats()
  return <DashboardStats stats={stats} />
}

export default async function AdminDashboardPage() {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Admin Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Monitor system activity and access admin functions
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-gray-50">
        <div className="mx-auto max-w-7xl p-6 space-y-8">
          {/* Statistics Section */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              System Statistics
            </h2>
            <Suspense fallback={<StatsSkeleton />}>
              <DashboardStatsContent />
            </Suspense>
          </section>

          {/* Quick Actions Section */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Quick Actions
            </h2>
            <Suspense fallback={<QuickActionsSkeleton />}>
              <QuickActions />
            </Suspense>
          </section>
        </div>
      </div>
    </div>
  )
}
