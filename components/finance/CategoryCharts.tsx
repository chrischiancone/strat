'use client'

import { CategoryRow } from '@/app/actions/budget-categories'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { useState } from 'react'

interface CategoryChartsProps {
  categories: CategoryRow[]
}

const COLORS = [
  '#3b82f6', // blue-500 - Personnel
  '#10b981', // green-500 - Equipment
  '#f59e0b', // amber-500 - Services
  '#ef4444', // red-500 - Training
  '#8b5cf6', // violet-500 - Materials
  '#ec4899', // pink-500 - Other
]

export function CategoryCharts({ categories }: CategoryChartsProps) {
  const [chartType, setChartType] = useState<'pie' | 'bar'>('pie')

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatCurrencyCompact = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`
    }
    return formatCurrency(value)
  }

  const chartData = categories.map((cat) => ({
    name: cat.category_display,
    value: cat.total_amount,
    count: cat.initiative_count,
  }))

  const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: {
    cx: number
    cy: number
    midAngle: number
    innerRadius: number
    outerRadius: number
    percent: number
  }) => {
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    if (percent < 0.05) return null // Don't show label if less than 5%

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-xs font-semibold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Budget by Category</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setChartType('pie')}
            className={`rounded-md px-3 py-1 text-sm font-medium ${
              chartType === 'pie'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Pie Chart
          </button>
          <button
            onClick={() => setChartType('bar')}
            className={`rounded-md px-3 py-1 text-sm font-medium ${
              chartType === 'bar'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Bar Chart
          </button>
        </div>
      </div>

      {chartData.length === 0 ? (
        <div className="flex h-80 items-center justify-center text-sm text-gray-500">
          No budget data available
        </div>
      ) : chartType === 'pie' ? (
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomLabel}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '0.375rem',
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value, entry: { payload?: { value: number } }) => {
                const amount = entry.payload?.value || 0
                return `${value}: ${formatCurrency(amount)}`
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={100}
              interval={0}
              tick={{ fontSize: 12 }}
            />
            <YAxis tickFormatter={formatCurrencyCompact} />
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '0.375rem',
              }}
            />
            <Bar dataKey="value" fill="#3b82f6">
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
