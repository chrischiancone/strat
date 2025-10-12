'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Target, DollarSign, AlertTriangle } from 'lucide-react'
import type { CityWideInitiativesData } from '@/app/actions/city-initiatives'

interface InitiativeSummaryCardsProps {
  data: CityWideInitiativesData
}

export function InitiativeSummaryCards({ data }: InitiativeSummaryCardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Initiatives */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Initiatives</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.summary.total_initiatives}</div>
          <p className="text-xs text-muted-foreground">Across all departments</p>
        </CardContent>
      </Card>

      {/* Total Budget */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(data.summary.total_budget)}</div>
          <p className="text-xs text-muted-foreground">3-year investment</p>
        </CardContent>
      </Card>

      {/* At Risk */}
      <Card className={data.summary.at_risk_count > 0 ? 'border-red-200 bg-red-50' : ''}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">At Risk</CardTitle>
          <AlertTriangle
            className={`h-4 w-4 ${data.summary.at_risk_count > 0 ? 'text-red-600' : 'text-muted-foreground'}`}
          />
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-bold ${data.summary.at_risk_count > 0 ? 'text-red-600' : ''}`}
          >
            {data.summary.at_risk_count}
          </div>
          <p
            className={`text-xs ${data.summary.at_risk_count > 0 ? 'text-red-600' : 'text-muted-foreground'}`}
          >
            {data.summary.at_risk_count > 0 ? 'Requires attention' : 'All on track'}
          </p>
        </CardContent>
      </Card>

      {/* Status Breakdown */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Status Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">In Progress:</span>
              <span className="font-medium">{data.counts.byStatus.in_progress}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Completed:</span>
              <span className="font-medium text-green-600">
                {data.counts.byStatus.completed}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Not Started:</span>
              <span className="font-medium">{data.counts.byStatus.not_started}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
