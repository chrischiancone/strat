'use client'

import { DashboardSummaryStats } from '@/app/actions/strategic-plans'

interface DashboardStatsProps {
  stats: DashboardSummaryStats
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const statusColors: { [key: string]: string } = {
    draft: 'bg-gray-100 text-gray-800',
    under_review: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    active: 'bg-blue-100 text-blue-800',
    archived: 'bg-gray-100 text-gray-600',
  }

  const statusLabels: { [key: string]: string } = {
    draft: 'Draft',
    under_review: 'Under Review',
    approved: 'Approved',
    active: 'Active',
    archived: 'Archived',
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {/* Total Plans */}
      <div className="rounded-lg bg-white p-6 shadow">
        <div className="text-sm font-medium text-gray-500">Total Plans</div>
        <div className="mt-2 text-3xl font-semibold text-gray-900">
          {stats.total_plans}
        </div>
        <div className="mt-2 text-xs text-gray-500">Across all departments</div>
      </div>

      {/* Total Budget */}
      <div className="rounded-lg bg-white p-6 shadow">
        <div className="text-sm font-medium text-gray-500">Total Budget</div>
        <div className="mt-2 text-3xl font-semibold text-gray-900">
          {formatCurrency(stats.total_budget)}
        </div>
        <div className="mt-2 text-xs text-gray-500">Combined investment</div>
      </div>

      {/* Plans by Status */}
      <div className="rounded-lg bg-white p-6 shadow sm:col-span-2 lg:col-span-1">
        <div className="text-sm font-medium text-gray-500">Plans by Status</div>
        <div className="mt-4 space-y-2">
          {Object.entries(stats.plans_by_status).map(([status, count]) => {
            if (count === 0) return null
            return (
              <div key={status} className="flex items-center justify-between">
                <span
                  className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${statusColors[status]}`}
                >
                  {statusLabels[status]}
                </span>
                <span className="text-sm font-medium text-gray-900">{count}</span>
              </div>
            )
          })}
          {Object.values(stats.plans_by_status).every((count) => count === 0) && (
            <p className="text-sm text-gray-500">No plans found</p>
          )}
        </div>
      </div>
    </div>
  )
}
