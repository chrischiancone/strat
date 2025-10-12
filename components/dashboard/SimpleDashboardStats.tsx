'use client'

import React from 'react'
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
    current: string | number | null
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

interface SimpleDashboardStatsProps {
  stats: DashboardStats
}

export function SimpleDashboardStats({ stats }: SimpleDashboardStatsProps) {
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
      value: stats.fiscalYear.current || 'None Set',
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

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {statCards.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Simple Progress Bars */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ContentCard>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Plans Overview</h3>
            <p className="text-sm text-gray-600">Distribution of plan statuses</p>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Approved</span>
              <span className="text-sm font-medium text-green-600">{stats.strategicPlans.approved}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full" 
                style={{ width: `${stats.strategicPlans.total > 0 ? (stats.strategicPlans.approved / stats.strategicPlans.total) * 100 : 0}%` }}
              ></div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Submitted</span>
              <span className="text-sm font-medium text-blue-600">{stats.strategicPlans.submitted}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${stats.strategicPlans.total > 0 ? (stats.strategicPlans.submitted / stats.strategicPlans.total) * 100 : 0}%` }}
              ></div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Draft</span>
              <span className="text-sm font-medium text-gray-600">{stats.strategicPlans.draft}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gray-600 h-2 rounded-full" 
                style={{ width: `${stats.strategicPlans.total > 0 ? (stats.strategicPlans.draft / stats.strategicPlans.total) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        </ContentCard>

        <ContentCard>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Activity Trends</h3>
            <p className="text-sm text-gray-600">Recent system activity</p>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Plans Created</p>
                  <p className="text-xs text-gray-500">+{stats.strategicPlans.trendValue}% this month</p>
                </div>
              </div>
              <span className="text-sm font-bold text-green-600">↗️</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">User Activity</p>
                  <p className="text-xs text-gray-500">+{stats.users.trendValue}% this week</p>
                </div>
              </div>
              <span className="text-sm font-bold text-blue-600">📈</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <Activity className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">System Activity</p>
                  <p className="text-xs text-gray-500">{stats.auditLogs.recent} events today</p>
                </div>
              </div>
              <span className="text-sm font-bold text-purple-600">⚡</span>
            </div>
          </div>
        </ContentCard>

        <ContentCard>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Quick Stats</h3>
            <p className="text-sm text-gray-600">Key performance indicators</p>
          </div>
          <div className="space-y-4">
            <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{stats.strategicPlans.total}</div>
              <div className="text-sm text-gray-600">Total Plans</div>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{stats.users.active}</div>
              <div className="text-sm text-gray-600">Active Users</div>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-r from-orange-50 to-pink-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {stats.fiscalYear.current || new Date().getFullYear()}
              </div>
              <div className="text-sm text-gray-600">Current Year</div>
            </div>
          </div>
        </ContentCard>
      </div>
    </div>
  )
}