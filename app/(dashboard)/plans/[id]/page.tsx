import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Pencil } from 'lucide-react'
import { getDashboardData } from '@/app/actions/dashboard'
import { DashboardStats } from '@/components/dashboard/DashboardStats'
import { BudgetByYearChart } from '@/components/dashboard/BudgetByYearChart'
import { BudgetBySourceChart } from '@/components/dashboard/BudgetBySourceChart'
import { KpiProgressList } from '@/components/dashboard/KpiProgressList'
import { SwotAnalysisDisplay } from '@/components/plans/SwotAnalysisDisplay'
import { EnvironmentalScanDisplay } from '@/components/plans/EnvironmentalScanDisplay'
import { BenchmarkingDataDisplay } from '@/components/plans/BenchmarkingDataDisplay'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function PlanDashboardPage({ params }: PageProps) {
  const { id } = await params

  let dashboardData
  try {
    dashboardData = await getDashboardData(id)
  } catch (error) {
    console.error('Error loading dashboard:', error)
    notFound()
  }

  const formatStatus = (status: string) => {
    return status
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/plans">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                {dashboardData.plan.title || 'Strategic Plan'}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                {dashboardData.plan.department_name} • FY{' '}
                {dashboardData.plan.fiscal_year_start} -{' '}
                {dashboardData.plan.fiscal_year_end}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
              {formatStatus(dashboardData.plan.status)}
            </span>
            <Link href={`/plans/${id}/edit`}>
              <Button>
                <Pencil className="mr-2 h-4 w-4" />
                Edit Plan
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="flex-1 overflow-auto bg-gray-50">
        <div className="mx-auto max-w-7xl p-6">
          <div className="space-y-6">
            {/* Key Metrics and Initiative Breakdown */}
            <DashboardStats data={dashboardData} />

            {/* SWOT Analysis */}
            {dashboardData.plan.swot_analysis && (
              <SwotAnalysisDisplay swot={dashboardData.plan.swot_analysis} />
            )}

            {/* Environmental Scan */}
            {dashboardData.plan.environmental_scan && (
              <EnvironmentalScanDisplay scan={dashboardData.plan.environmental_scan} />
            )}

            {/* Benchmarking Data */}
            {dashboardData.plan.benchmarking_data && (
              <BenchmarkingDataDisplay data={dashboardData.plan.benchmarking_data} />
            )}

            {/* Budget Charts */}
            <div className="grid gap-6 md:grid-cols-2">
              <BudgetByYearChart data={dashboardData} />
              <BudgetBySourceChart data={dashboardData} />
            </div>

            {/* KPI Progress */}
            <KpiProgressList data={dashboardData} />
          </div>
        </div>
      </div>
    </div>
  )
}
