'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { DashboardData } from '@/app/actions/dashboard'

interface DashboardStatsProps {
  data: DashboardData
}

export function DashboardStats({ data }: DashboardStatsProps) {
  const totalInitiatives =
    data.initiativesByPriority.NEED +
    data.initiativesByPriority.WANT +
    data.initiativesByPriority.NICE_TO_HAVE

  const totalBudget =
    data.budgetByYear.year_1 +
    data.budgetByYear.year_2 +
    data.budgetByYear.year_3

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`
    }
    return `$${amount.toFixed(0)}`
  }

  return (
    <>
      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Strategic Goals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.goalCount}</div>
            <p className="text-xs text-muted-foreground">
              Defined for {data.plan.fiscal_year_start} - {data.plan.fiscal_year_end}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Initiatives</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInitiatives}</div>
            <p className="text-xs text-muted-foreground">
              Across all strategic goals
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalBudget)}</div>
            <p className="text-xs text-muted-foreground">
              3-year strategic plan budget
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Initiatives by Priority and Status */}
      <div className="grid gap-4 md:grid-cols-2 mt-4">
        {/* Initiatives by Priority */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Initiatives by Priority</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500"></div>
                <span className="text-sm font-medium">NEEDS</span>
              </div>
              <span className="text-2xl font-bold">{data.initiativesByPriority.NEED}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                <span className="text-sm font-medium">WANTS</span>
              </div>
              <span className="text-2xl font-bold">{data.initiativesByPriority.WANT}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
                <span className="text-sm font-medium">NICE TO HAVES</span>
              </div>
              <span className="text-2xl font-bold">{data.initiativesByPriority.NICE_TO_HAVE}</span>
            </div>

            {totalInitiatives === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No initiatives defined yet
              </p>
            )}
          </CardContent>
        </Card>

        {/* Initiatives by Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Initiatives by Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-gray-400"></div>
                <span className="text-sm font-medium">Not Started</span>
              </div>
              <span className="text-2xl font-bold">{data.initiativesByStatus.not_started}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                <span className="text-sm font-medium">In Progress</span>
              </div>
              <span className="text-2xl font-bold">{data.initiativesByStatus.in_progress}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-orange-500"></div>
                <span className="text-sm font-medium">At Risk</span>
              </div>
              <span className="text-2xl font-bold">{data.initiativesByStatus.at_risk}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-600"></div>
                <span className="text-sm font-medium">Completed</span>
              </div>
              <span className="text-2xl font-bold">{data.initiativesByStatus.completed}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-purple-500"></div>
                <span className="text-sm font-medium">Deferred</span>
              </div>
              <span className="text-2xl font-bold">{data.initiativesByStatus.deferred}</span>
            </div>

            {totalInitiatives === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No initiatives defined yet
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
