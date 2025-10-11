'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { DashboardData } from '@/app/actions/dashboard'

interface BudgetByYearChartProps {
  data: DashboardData
}

export function BudgetByYearChart({ data }: BudgetByYearChartProps) {
  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`
    }
    return `$${value.toFixed(0)}`
  }

  const chartData = [
    {
      year: `FY${data.plan.fiscal_year_start.slice(2, 4)}`,
      budget: data.budgetByYear.year_1,
    },
    {
      year: `FY${String(parseInt(data.plan.fiscal_year_start) + 1).slice(2, 4)}`,
      budget: data.budgetByYear.year_2,
    },
    {
      year: `FY${data.plan.fiscal_year_end.slice(2, 4)}`,
      budget: data.budgetByYear.year_3,
    },
  ]

  const totalBudget =
    data.budgetByYear.year_1 + data.budgetByYear.year_2 + data.budgetByYear.year_3

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Budget by Fiscal Year</CardTitle>
      </CardHeader>
      <CardContent>
        {totalBudget > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis tickFormatter={formatCurrency} />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  labelStyle={{ color: '#000' }}
                />
                <Bar dataKey="budget" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {chartData.map((item) => (
                <div key={item.year} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{item.year}</span>
                  <span className="font-medium">{formatCurrency(item.budget)}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex h-[300px] items-center justify-center">
            <p className="text-sm text-muted-foreground">
              No budget data available. Add budgets to initiatives to see the chart.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
