'use client'

import React, { memo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  BarChart3, 
  LineChart, 
  PieChart, 
  Table,
  Gauge,
  TrendingUp,
  TrendingDown,
  Hash,
  Settings,
  Trash2,
  MoreHorizontal,
  Activity,
  Target,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  LineChart as RechartsLineChart,
  Line,
  PieChart as RechartsPieChart,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  RadialBarChart,
  RadialBar,
  ScatterChart,
  Scatter,
  FunnelChart,
  Funnel,
} from 'recharts'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { type Widget } from '@/lib/reporting/dashboard-engine'

interface DashboardWidgetProps {
  widget: Widget
  data: unknown[]
  loading?: boolean
  onEdit?: () => void
  onDelete?: () => void
  onRefresh?: () => void
  readOnly?: boolean
}

// Color schemes for charts
const COLOR_SCHEMES = {
  default: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'],
  blue: ['#dbeafe', '#bfdbfe', '#93c5fd', '#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8', '#1e40af'],
  green: ['#dcfce7', '#bbf7d0', '#86efac', '#4ade80', '#22c55e', '#16a34a', '#15803d', '#166534'],
  purple: ['#f3e8ff', '#e9d5ff', '#d8b4fe', '#c084fc', '#a855f7', '#9333ea', '#7c3aed', '#6d28d9'],
}

export const DashboardWidget = memo(function DashboardWidget({
  widget,
  data,
  loading = false,
  onEdit,
  onDelete,
  onRefresh,
  readOnly = false,
}: DashboardWidgetProps) {
  // Format data based on widget configuration
  const formatData = (rawData: unknown[]) => {
    if (!Array.isArray(rawData)) return []
    
    return rawData.map((item, index) => {
      if (typeof item === 'object' && item !== null) {
        return { ...item, _index: index }
      }
      return { value: item, _index: index }
    })
  }

  // Format values based on widget configuration
  const formatValue = (value: unknown, format?: string): string => {
    if (value === null || value === undefined) return 'N/A'
    
    const numValue = typeof value === 'number' ? value : parseFloat(String(value))
    
    if (isNaN(numValue)) return String(value)
    
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(numValue)
      
      case 'percentage':
        return `${numValue.toFixed(1)}%`
      
      case 'number':
        return new Intl.NumberFormat('en-US').format(numValue)
      
      default:
        return String(value)
    }
  }

  // Get trend direction and color
  const getTrendInfo = (value: number, target?: number) => {
    if (!target) return { icon: Activity, color: 'text-gray-500', direction: 'neutral' as const }
    
    const percentage = ((value - target) / target) * 100
    
    if (percentage > 5) {
      return { icon: TrendingUp, color: 'text-green-600', direction: 'up' as const, percentage: percentage.toFixed(1) }
    } else if (percentage < -5) {
      return { icon: TrendingDown, color: 'text-red-600', direction: 'down' as const, percentage: Math.abs(percentage).toFixed(1) }
    }
    
    return { icon: Activity, color: 'text-gray-500', direction: 'neutral' as const, percentage: '0' }
  }

  // Render different widget types
  const renderWidget = () => {
    const formattedData = formatData(data)
    
    if (loading) {
      return (
        <div className="space-y-3">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      )
    }

    switch (widget.type) {
      case 'metric':
        return renderMetricWidget(formattedData)
      
      case 'chart':
        return renderChartWidget(formattedData)
      
      case 'table':
        return renderTableWidget(formattedData)
      
      case 'gauge':
        return renderGaugeWidget(formattedData)
      
      case 'kpi':
        return renderKPIWidget(formattedData)
      
      case 'progress':
        return renderProgressWidget(formattedData)
      
      default:
        return (
          <div className="flex items-center justify-center h-32 text-gray-500">
            <div className="text-center">
              <Hash className="w-8 h-8 mx-auto mb-2" />
              <p>Unsupported widget type</p>
            </div>
          </div>
        )
    }
  }

  const renderMetricWidget = (data: any[]) => {
    const value = data[0]?.value || data[0]?.[widget.config.yAxis || 'value'] || 0
    const target = widget.config.target
    const trendInfo = getTrendInfo(value, target)
    
    return (
      <div className="text-center space-y-2">
        <div className="text-3xl font-bold text-gray-900">
          {formatValue(value, widget.config.format)}
        </div>
        {target && (
          <div className="flex items-center justify-center space-x-2 text-sm">
            <trendInfo.icon className={`w-4 h-4 ${trendInfo.color}`} />
            <span className={trendInfo.color}>
              {trendInfo.direction === 'neutral' ? 'On target' : `${trendInfo.percentage}%`}
            </span>
            {target && (
              <span className="text-gray-500">
                vs target {formatValue(target, widget.config.format)}
              </span>
            )}
          </div>
        )}
      </div>
    )
  }

  const renderChartWidget = (data: any[]) => {
    const { chartType = 'bar', xAxis = 'name', yAxis = 'value', colorScheme = 'default' } = widget.config
    const colors = COLOR_SCHEMES[colorScheme as keyof typeof COLOR_SCHEMES] || COLOR_SCHEMES.default

    if (data.length === 0) {
      return (
        <div className="flex items-center justify-center h-32 text-gray-500">
          <div className="text-center">
            <BarChart3 className="w-8 h-8 mx-auto mb-2" />
            <p>No data available</p>
          </div>
        </div>
      )
    }

    switch (chartType) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <RechartsLineChart data={data}>
              {widget.config.showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis dataKey={xAxis} />
              <YAxis />
              <Tooltip />
              {widget.config.showLegend && <Legend />}
              <Line 
                type="monotone" 
                dataKey={yAxis} 
                stroke={colors[0]} 
                strokeWidth={2}
                dot={{ fill: colors[0] }}
              />
            </RechartsLineChart>
          </ResponsiveContainer>
        )
      
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={data}>
              {widget.config.showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis dataKey={xAxis} />
              <YAxis />
              <Tooltip />
              {widget.config.showLegend && <Legend />}
              <Area 
                type="monotone" 
                dataKey={yAxis} 
                stroke={colors[0]} 
                fill={colors[0]}
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        )
      
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <RechartsPieChart>
              <Tooltip />
              {widget.config.showLegend && <Legend />}
              <RechartsPieChart.Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={widget.config.showLabels}
                outerRadius={80}
                fill="#8884d8"
                dataKey={yAxis}
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </RechartsPieChart.Pie>
            </RechartsPieChart>
          </ResponsiveContainer>
        )
      
      case 'bar':
      default:
        return (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data}>
              {widget.config.showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis dataKey={xAxis} />
              <YAxis />
              <Tooltip />
              {widget.config.showLegend && <Legend />}
              <Bar dataKey={yAxis} fill={colors[0]} />
            </BarChart>
          </ResponsiveContainer>
        )
    }
  }

  const renderTableWidget = (data: any[]) => {
    const { columns = [], pageSize = 10 } = widget.config
    
    if (data.length === 0) {
      return (
        <div className="flex items-center justify-center h-32 text-gray-500">
          <div className="text-center">
            <Table className="w-8 h-8 mx-auto mb-2" />
            <p>No data available</p>
          </div>
        </div>
      )
    }

    // Auto-generate columns if none specified
    const tableColumns = columns.length > 0 ? columns : Object.keys(data[0] || {})
      .filter(key => !key.startsWith('_'))
      .slice(0, 4)
      .map(key => ({ key, label: key.charAt(0).toUpperCase() + key.slice(1), type: 'text' }))

    const displayData = data.slice(0, pageSize)

    return (
      <div className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                {tableColumns.map((column: any) => (
                  <th key={column.key} className="px-2 py-1 text-left font-medium text-gray-700">
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayData.map((row, index) => (
                <tr key={index} className="border-b border-gray-100">
                  {tableColumns.map((column: any) => (
                    <td key={column.key} className="px-2 py-1 text-gray-900">
                      {formatValue(row[column.key], column.format || column.type)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {data.length > pageSize && (
          <div className="mt-2 text-xs text-gray-500 text-center">
            Showing {pageSize} of {data.length} records
          </div>
        )}
      </div>
    )
  }

  const renderGaugeWidget = (data: any[]) => {
    const value = data[0]?.value || data[0]?.[widget.config.yAxis || 'value'] || 0
    const max = widget.config.target || 100
    const percentage = Math.min((value / max) * 100, 100)
    
    const { warning = 70, critical = 90 } = widget.config.thresholds || {}
    
    let color = 'text-green-600'
    let bgColor = 'bg-green-100'
    
    if (percentage >= critical) {
      color = 'text-red-600'
      bgColor = 'bg-red-100'
    } else if (percentage >= warning) {
      color = 'text-yellow-600'
      bgColor = 'bg-yellow-100'
    }

    return (
      <div className="text-center space-y-4">
        <div className={`w-24 h-24 mx-auto rounded-full ${bgColor} flex items-center justify-center`}>
          <div className={`text-2xl font-bold ${color}`}>
            {percentage.toFixed(0)}%
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-lg font-semibold">
            {formatValue(value, widget.config.format)}
          </div>
          <div className="text-sm text-gray-500">
            of {formatValue(max, widget.config.format)} target
          </div>
        </div>
      </div>
    )
  }

  const renderKPIWidget = (data: any[]) => {
    const currentValue = data[0]?.current || data[0]?.value || 0
    const previousValue = data[0]?.previous || 0
    const target = data[0]?.target || widget.config.target
    
    const change = previousValue ? ((currentValue - previousValue) / previousValue) * 100 : 0
    const changeIcon = change > 0 ? TrendingUp : change < 0 ? TrendingDown : Activity
    const changeColor = change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-500'
    
    const targetProgress = target ? (currentValue / target) * 100 : 0
    
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold">
            {formatValue(currentValue, widget.config.format)}
          </div>
          <div className={`flex items-center space-x-1 ${changeColor}`}>
            {React.createElement(changeIcon, { className: 'w-4 h-4' })}
            <span className="text-sm font-medium">
              {Math.abs(change).toFixed(1)}%
            </span>
          </div>
        </div>
        
        {target && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Progress to target</span>
              <span className="font-medium">{targetProgress.toFixed(0)}%</span>
            </div>
            <Progress value={Math.min(targetProgress, 100)} className="h-2" />
            <div className="text-xs text-gray-500">
              Target: {formatValue(target, widget.config.format)}
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderProgressWidget = (data: any[]) => {
    const completed = data[0]?.completed || 0
    const total = data[0]?.total || 100
    const percentage = (completed / total) * 100
    
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Progress</span>
          <span className="text-sm text-gray-600">
            {completed} / {total}
          </span>
        </div>
        <Progress value={percentage} className="h-3" />
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">{percentage.toFixed(1)}% complete</span>
          <div className="flex items-center space-x-1">
            {percentage >= 100 ? (
              <>
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-green-600">Complete</span>
              </>
            ) : percentage >= 90 ? (
              <>
                <Target className="w-4 h-4 text-blue-600" />
                <span className="text-blue-600">Near completion</span>
              </>
            ) : percentage < 25 ? (
              <>
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span className="text-red-600">Behind schedule</span>
              </>
            ) : (
              <>
                <Activity className="w-4 h-4 text-gray-500" />
                <span className="text-gray-500">In progress</span>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">{widget.title}</CardTitle>
          {!readOnly && (onEdit || onDelete) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onRefresh && (
                  <DropdownMenuItem onClick={onRefresh}>
                    <Activity className="mr-2 h-4 w-4" />
                    Refresh
                  </DropdownMenuItem>
                )}
                {onEdit && (
                  <DropdownMenuItem onClick={onEdit}>
                    <Settings className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem onClick={onDelete} className="text-red-600">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        {widget.description && (
          <CardDescription className="text-xs">{widget.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        {renderWidget()}
      </CardContent>
    </Card>
  )
})

export default DashboardWidget