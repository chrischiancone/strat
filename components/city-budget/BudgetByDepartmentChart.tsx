'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from 'recharts'
import type { BudgetByDepartment } from '@/app/actions/city-budget'

interface BudgetByDepartmentChartProps {
  data: BudgetByDepartment[]
}

const COLORS = [
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#14b8a6',
  '#06b6d4',
  '#6366f1',
  '#a855f7',
]

export function BudgetByDepartmentChart({ data }: BudgetByDepartmentChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      notation: 'compact',
      compactDisplay: 'short',
    }).format(value)
  }

  const chartData = data.map((item) => ({
    name: item.department_name,
    Budget: item.total,
    initiatives: item.initiative_count,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget by Department</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No department budget data available
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tickFormatter={formatCurrency} />
              <YAxis dataKey="name" type="category" width={150} />
              <Tooltip
                formatter={(value: number, name: string) => {
                  if (name === 'Budget') {
                    return formatCurrency(value)
                  }
                  return value
                }}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                }}
              />
              <Legend />
              <Bar dataKey="Budget" radius={[0, 4, 4, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
