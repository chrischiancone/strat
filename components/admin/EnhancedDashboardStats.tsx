import React from 'react'
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts'
import { 
  Users, 
  Building2, 
  Calendar, 
  FileText, 
  Activity, 
  TrendingUp,
  TrendingDown,
  ArrowUpIcon,
  ArrowDownIcon,
  MinusIcon
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ContentCard } from '@/components/layouts/PageContainer'

interface DashboardStats {
  users: {
    total: number
    active: number
    inactive: number
    trend: 'up' | 'down' | 'stable'
    trendValue: number
  }
  departments: {
    total: number
    trend: 'up' | 'down' | 'stable'
    trendValue: number
  }
  fiscalYear: {
    current: number | null
  }
  strategicPlans: {
    total: number
    draft: number
    submitted: number
    approved: number
    trend: 'up' | 'down' | 'stable'
    trendValue: number
  }
  auditLogs: {
    recent: number
    trend: 'up' | 'down' | 'stable'
    trendValue: number
  }
}

interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ElementType
  trend?: 'up' | 'down' | 'stable'
  trendValue?: number
  color: {
    bg: string
    icon: string
    accent: string
  }
}

function StatsCard({ title, value, subtitle, icon: Icon, trend, trendValue, color }: StatsCardProps) {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <ArrowUpIcon className="h-3 w-3 text-green-600" />
      case 'down':
        return <ArrowDownIcon className="h-3 w-3 text-red-600" />
      default:
        return <MinusIcon className="h-3 w-3 text-gray-400" />
    }
  }

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-600'
      case 'down':
        return 'text-red-600'
      default:
        return 'text-gray-500'
    }
  }

  return (
    <ContentCard className={cn('relative overflow-hidden', color.bg)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
          <div className="flex items-baseline space-x-2">
            <p className="text-3xl font-bold text-gray-900">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
            {trend && trendValue !== undefined && (
              <div className={cn('flex items-center text-sm font-medium', getTrendColor())}>
                {getTrendIcon()}
                <span className="ml-1">{Math.abs(trendValue)}%</span>
              </div>
            )}
          </div>
          {subtitle && (
            <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
          )}
        </div>
        <div className={cn('p-3 rounded-lg', color.accent)}>
          <Icon className={cn('h-6 w-6', color.icon)} />
        </div>
      </div>
    </ContentCard>
  )
}

interface EnhancedDashboardStatsProps {
  stats: DashboardStats
  chartData?: {
    monthlyPlans: Array<{ month: string; plans: number; approved: number }>
    userActivity: Array<{ day: string; active: number }>
    plansByStatus: Array<{ name: string; value: number; color: string }>
  }
}

export function EnhancedDashboardStats({ stats, chartData }: EnhancedDashboardStatsProps) {
  const statCards = [
    {
      title: 'Total Users',
      value: stats.users.total,
      subtitle: `${stats.users.active} active, ${stats.users.inactive} inactive`,
      icon: Users,
      trend: stats.users.trend,
      trendValue: stats.users.trendValue,
      color: {
        bg: 'bg-gradient-to-br from-blue-50 to-blue-100/50',
        icon: 'text-blue-600',
        accent: 'bg-blue-100/50'
      }
    },
    {
      title: 'Departments',
      value: stats.departments.total,
      icon: Building2,
      trend: stats.departments.trend,
      trendValue: stats.departments.trendValue,
      color: {
        bg: 'bg-gradient-to-br from-green-50 to-green-100/50',
        icon: 'text-green-600',
        accent: 'bg-green-100/50'
      }
    },
    {
      title: 'Current Fiscal Year',
      value: stats.fiscalYear.current?.toString() || 'None Set',
      icon: Calendar,
      color: {
        bg: 'bg-gradient-to-br from-purple-50 to-purple-100/50',
        icon: 'text-purple-600',
        accent: 'bg-purple-100/50'
      }
    },
    {
      title: 'Strategic Plans',
      value: stats.strategicPlans.total,
      subtitle: `${stats.strategicPlans.approved} approved, ${stats.strategicPlans.draft} draft`,
      icon: FileText,
      trend: stats.strategicPlans.trend,
      trendValue: stats.strategicPlans.trendValue,
      color: {
        bg: 'bg-gradient-to-br from-orange-50 to-orange-100/50',
        icon: 'text-orange-600',
        accent: 'bg-orange-100/50'
      }
    },
    {
      title: 'Recent Activity',
      value: stats.auditLogs.recent,
      subtitle: 'Last 24 hours',
      icon: Activity,
      trend: stats.auditLogs.trend,
      trendValue: stats.auditLogs.trendValue,
      color: {
        bg: 'bg-gradient-to-br from-pink-50 to-pink-100/50',
        icon: 'text-pink-600',
        accent: 'bg-pink-100/50'
      }
    }
  ]

  const defaultChartData = {
    monthlyPlans: [
      { month: 'Jan', plans: 12, approved: 8 },
      { month: 'Feb', plans: 15, approved: 11 },
      { month: 'Mar', plans: 18, approved: 14 },
      { month: 'Apr', plans: 22, approved: 16 },
      { month: 'May', plans: 25, approved: 20 },
      { month: 'Jun', plans: 28, approved: 24 }
    ],
    userActivity: [
      { day: 'Mon', active: 85 },
      { day: 'Tue', active: 92 },
      { day: 'Wed', active: 78 },
      { day: 'Thu', active: 96 },
      { day: 'Fri', active: 88 },
      { day: 'Sat', active: 45 },
      { day: 'Sun', active: 32 }
    ],
    plansByStatus: [
      { name: 'Approved', value: stats.strategicPlans.approved, color: '#22c55e' },
      { name: 'Submitted', value: stats.strategicPlans.submitted, color: '#f59e0b' },
      { name: 'Draft', value: stats.strategicPlans.draft, color: '#6b7280' }
    ]
  }

  const data = chartData || defaultChartData

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {statCards.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Monthly Plans Trend */}
        <ContentCard className="lg:col-span-2">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Strategic Plans Trend</h3>
            <p className="text-sm text-gray-600">Monthly plan submissions and approvals</p>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.monthlyPlans}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="plans"
                  stackId="1"
                  stroke="#3b82f6"
                  fill="#dbeafe"
                  name="Total Plans"
                />
                <Area
                  type="monotone"
                  dataKey="approved"
                  stackId="1"
                  stroke="#22c55e"
                  fill="#dcfce7"
                  name="Approved"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ContentCard>

        {/* Plans by Status */}
        <ContentCard>
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Plans by Status</h3>
            <p className="text-sm text-gray-600">Current distribution</p>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.plansByStatus}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {data.plansByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ContentCard>

        {/* User Activity */}
        <ContentCard className="xl:col-span-3">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Daily User Activity</h3>
            <p className="text-sm text-gray-600">Active users per day this week</p>
          </div>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.userActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis 
                  dataKey="day" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="active"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  name="Active Users"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ContentCard>
      </div>
    </div>
  )
}