import { Suspense } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { DollarSign, Target } from 'lucide-react'
import { getCityManagerDashboard, getFiscalYears } from '@/app/actions/strategic-plans'
import { getDepartments } from '@/app/actions/users'
import { DashboardStats } from '@/components/city-manager/DashboardStats'
import { PlansTable } from '@/components/city-manager/PlansTable'
import { DashboardFilters } from '@/components/city-manager/DashboardFilters'
import { GenerateReportButton } from '@/components/city-manager/GenerateReportButton'

interface PageProps {
  searchParams: Promise<{
    status?: string
    fiscal_year?: string
    department?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }>
}

export default async function CityManagerDashboard({ searchParams }: PageProps) {
  const params = await searchParams

  // Fetch dashboard data with filters
  const { plans, stats } = await getCityManagerDashboard({
    status: params.status,
    fiscal_year_id: params.fiscal_year,
    department_id: params.department,
    sortBy: params.sortBy,
    sortOrder: params.sortOrder,
  })

  // Fetch filter options
  const [fiscalYears, departments] = await Promise.all([
    getFiscalYears(),
    getDepartments(),
  ])

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Strategic Plans Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">
              Review and manage all department strategic plans
            </p>
          </div>
          <div className="flex items-center gap-2">
            <GenerateReportButton fiscalYears={fiscalYears} departments={departments} />
            <Link href="/city-manager/budget">
              <Button variant="outline">
                <DollarSign className="mr-2 h-4 w-4" />
                Budget
              </Button>
            </Link>
            <Link href="/city-manager/initiatives">
              <Button>
                <Target className="mr-2 h-4 w-4" />
                Initiatives
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-gray-50 p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Summary Stats */}
          <DashboardStats stats={stats} />

          {/* Filters */}
          <div className="rounded-lg bg-white shadow">
            <Suspense fallback={<div className="p-4">Loading filters...</div>}>
              <DashboardFilters
                fiscalYears={fiscalYears}
                departments={departments}
                currentFilters={{
                  status: params.status,
                  fiscal_year: params.fiscal_year,
                  department: params.department,
                }}
              />
            </Suspense>

            {/* Plans Table */}
            <PlansTable
              plans={plans}
              sortBy={params.sortBy || 'updated_at'}
              sortOrder={params.sortOrder || 'desc'}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
