import Link from 'next/link'
import { UserPlus, Building2, History, Users, Calendar } from 'lucide-react'

export function QuickActions() {
  const actions = [
    {
      label: 'Create User',
      description: 'Add a new user to the system',
      href: '/admin/users/new',
      icon: UserPlus,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Manage Departments',
      description: 'View and edit departments',
      href: '/admin/departments',
      icon: Building2,
      iconColor: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'View Audit Logs',
      description: 'Review system activity',
      href: '/admin/audit-logs',
      icon: History,
      iconColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      label: 'Manage Users',
      description: 'View and edit all users',
      href: '/admin/users',
      icon: Users,
      iconColor: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      label: 'Fiscal Years',
      description: 'Manage fiscal years',
      href: '/admin/fiscal-years',
      icon: Calendar,
      iconColor: 'text-pink-600',
      bgColor: 'bg-pink-50',
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {actions.map((action) => {
        const Icon = action.icon
        return (
          <Link key={action.label} href={action.href}>
            <div
              className={`group rounded-lg border border-gray-200 ${action.bgColor} p-6 shadow-sm transition-all hover:scale-105 hover:shadow-md`}
            >
              <div className="flex flex-col items-center text-center">
                <div className={`rounded-full bg-white p-3`}>
                  <Icon className={`h-6 w-6 ${action.iconColor}`} />
                </div>
                <h3 className="mt-4 text-sm font-semibold text-gray-900">
                  {action.label}
                </h3>
                <p className="mt-1 text-xs text-gray-600">
                  {action.description}
                </p>
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
