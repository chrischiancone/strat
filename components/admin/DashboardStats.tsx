import { DashboardStats as Stats } from '@/app/actions/admin'
import { Users, Building2, Calendar, FileText, Activity } from 'lucide-react'

interface DashboardStatsProps {
  stats: Stats
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const statCards = [
    {
      label: 'Users',
      value: stats.users.total.toLocaleString(),
      breakdown: `${stats.users.active} active / ${stats.users.inactive} inactive`,
      icon: Users,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      label: 'Departments',
      value: stats.departments.total.toLocaleString(),
      breakdown: null,
      icon: Building2,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
    },
    {
      label: 'Current Fiscal Year',
      value: stats.fiscalYear.current?.toString() || 'None',
      breakdown: null,
      icon: Calendar,
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
    {
      label: 'Strategic Plans',
      value: stats.strategicPlans.total.toLocaleString(),
      breakdown: `${stats.strategicPlans.draft} draft / ${stats.strategicPlans.submitted} submitted / ${stats.strategicPlans.approved} approved`,
      icon: FileText,
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
    },
    {
      label: 'Recent Activity',
      value: stats.auditLogs.recent.toLocaleString(),
      breakdown: 'Audit logs (last 24h)',
      icon: Activity,
      bgColor: 'bg-pink-50',
      iconColor: 'text-pink-600',
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {statCards.map((stat) => {
        const Icon = stat.icon
        return (
          <div
            key={stat.label}
            className={`rounded-lg ${stat.bgColor} p-6 shadow-sm`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="mt-2 text-3xl font-semibold text-gray-900">
                  {stat.value}
                </p>
                {stat.breakdown && (
                  <p className="mt-1 text-xs text-gray-500">{stat.breakdown}</p>
                )}
              </div>
              <Icon className={`h-8 w-8 ${stat.iconColor}`} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
