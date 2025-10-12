import Link from 'next/link'
import { getMainDashboardStats } from '@/app/actions/dashboard'
import { Target, FileText, DollarSign, TrendingUp, ArrowRight, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/ui/badge'

export async function DashboardContent() {
  const data = await getMainDashboardStats()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      admin: 'Administrator',
      finance: 'Finance Manager',
      city_manager: 'City Manager',
      department_head: 'Department Head',
      staff: 'Staff Member',
    }
    return labels[role] || role
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="mx-auto max-w-7xl p-6 space-y-6">
        {/* Welcome Header */}
        <div className="rounded-lg border border-gray-200 bg-gradient-to-r from-primary-600 to-primary-700 p-8 text-white shadow-lg">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-primary-100">{getGreeting()},</p>
              <h1 className="mt-1 text-3xl font-bold">{data.userInfo.name}</h1>
              <p className="mt-2 text-sm text-primary-100">
                {getRoleLabel(data.userInfo.role)}
                {data.userInfo.departmentName && (
                  <span> • {data.userInfo.departmentName}</span>
                )}
              </p>
            </div>
            <div className="hidden sm:block">
              <div className="flex gap-2">
                <Link href="/plans">
                  <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                    <Target className="mr-2 h-4 w-4" />
                    View Plans
                  </Button>
                </Link>
                <Link href="/finance">
                  <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                    <DollarSign className="mr-2 h-4 w-4" />
                    Budgets
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Plans</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{data.stats.totalPlans}</p>
                <p className="mt-1 text-xs text-gray-500">
                  {data.stats.activePlans} active
                </p>
              </div>
              <div className="rounded-full bg-blue-100 p-3">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Initiatives</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{data.stats.totalInitiatives}</p>
                <p className="mt-1 text-xs text-gray-500">
                  {data.stats.activeInitiatives} in progress
                </p>
              </div>
              <div className="rounded-full bg-green-100 p-3">
                <Target className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Budget</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {formatCurrency(data.stats.totalBudget)}
                </p>
                <p className="mt-1 text-xs text-gray-500">3-year projection</p>
              </div>
              <div className="rounded-full bg-purple-100 p-3">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {data.stats.totalInitiatives > 0
                    ? Math.round(
                        ((data.stats.totalInitiatives - data.stats.activeInitiatives) /
                          data.stats.totalInitiatives) *
                          100
                      )
                    : 0}
                  %
                </p>
                <p className="mt-1 text-xs text-gray-500">Overall progress</p>
              </div>
              <div className="rounded-full bg-accent-100 p-3">
                <TrendingUp className="h-6 w-6 text-accent-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Plans */}
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Recent Plans</h2>
                <Link href="/plans">
                  <Button variant="ghost" size="sm">
                    View All
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="p-6">
              {data.recentPlans.length > 0 ? (
                <div className="space-y-4">
                  {data.recentPlans.map((plan) => (
                    <Link
                      key={plan.id}
                      href={`/plans/${plan.id}`}
                      className="block rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{plan.title}</h3>
                          <p className="mt-1 text-sm text-gray-600">{plan.department_name}</p>
                        </div>
                        <StatusBadge status={plan.status} />
                      </div>
                      <div className="mt-2 flex items-center text-xs text-gray-500">
                        <Clock className="mr-1 h-3 w-3" />
                        Updated {formatDate(plan.updated_at)}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">No plans yet</p>
                  <Link href="/plans">
                    <Button className="mt-4" variant="outline" size="sm">
                      Create Plan
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Recent Initiatives */}
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Recent Initiatives</h2>
                <Link href="/plans">
                  <Button variant="ghost" size="sm">
                    View All
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="p-6">
              {data.recentInitiatives.length > 0 ? (
                <div className="space-y-4">
                  {data.recentInitiatives.map((initiative) => (
                    <Link
                      key={initiative.id}
                      href={`/plans/${initiative.plan_id}/initiatives/${initiative.id}`}
                      className="block rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{initiative.name}</h3>
                          <p className="mt-1 text-sm text-gray-600">{initiative.plan_title}</p>
                        </div>
                        <StatusBadge status={initiative.status} />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <Target className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">No initiatives yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link href="/plans">
              <div className="rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50">
                <FileText className="h-8 w-8 text-primary-600" />
                <h3 className="mt-2 font-medium text-gray-900">Strategic Plans</h3>
                <p className="mt-1 text-sm text-gray-600">View and manage plans</p>
              </div>
            </Link>
            <Link href="/finance">
              <div className="rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50">
                <DollarSign className="h-8 w-8 text-green-600" />
                <h3 className="mt-2 font-medium text-gray-900">Budget Dashboard</h3>
                <p className="mt-1 text-sm text-gray-600">Review initiative budgets</p>
              </div>
            </Link>
            {(data.userInfo.role === 'admin' || data.userInfo.role === 'city_manager') && (
              <>
                <Link href="/admin/users">
                  <div className="rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50">
                    <svg
                      className="h-8 w-8 text-blue-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                    <h3 className="mt-2 font-medium text-gray-900">User Management</h3>
                    <p className="mt-1 text-sm text-gray-600">Manage users and roles</p>
                  </div>
                </Link>
                <Link href="/admin/departments">
                  <div className="rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50">
                    <svg
                      className="h-8 w-8 text-purple-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                    <h3 className="mt-2 font-medium text-gray-900">Departments</h3>
                    <p className="mt-1 text-sm text-gray-600">Manage departments</p>
                  </div>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
