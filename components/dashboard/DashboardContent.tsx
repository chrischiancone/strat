import Link from 'next/link'
import { getMainDashboardStats } from '@/app/actions/dashboard'
import { 
  Target, 
  FileText, 
  DollarSign, 
  TrendingUp, 
  ArrowRight, 
  Clock,
  Users,
  Building2,
  PlusIcon,
  CalendarIcon,
  ActivityIcon
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/ui/badge'
import { PageHeader } from '@/components/layouts/PageHeader'
import { PageContainer, GridLayout } from '@/components/layouts/PageContainer'
import { MetricCard, ListCard, QuickActionCard, ListItem } from '@/components/ui/cards-enhanced'
import { SimpleDashboardStats } from '@/components/dashboard/SimpleDashboardStats'

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

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'approved':
      case 'completed':
        return 'success' as const
      case 'draft':
      case 'in_progress':
      case 'pending':
        return 'warning' as const
      case 'inactive':
      case 'rejected':
      case 'cancelled':
        return 'error' as const
      default:
        return 'neutral' as const
    }
  }

  // Transform data for simple dashboard stats
  const dashboardStats = {
    users: {
      total: data.stats.totalInitiatives, // Using initiatives as a proxy for activity
      active: data.stats.activeInitiatives,
      inactive: data.stats.totalInitiatives - data.stats.activeInitiatives,
      trend: 'up' as const,
      trendValue: 12
    },
    departments: {
      total: data.userInfo.departmentName ? 1 : 0,
      trend: 'stable' as const,
      trendValue: 0
    },
    fiscalYear: {
      current: new Date().getFullYear()
    },
    strategicPlans: {
      total: data.stats.totalPlans,
      draft: Math.max(0, data.stats.totalPlans - data.stats.activePlans),
      submitted: data.stats.activePlans,
      approved: data.stats.activePlans,
      trend: 'up' as const,
      trendValue: 8
    },
    auditLogs: {
      recent: 24,
      trend: 'up' as const,
      trendValue: 15
    }
  }

  // Transform recent plans for ListCard
  const recentPlansItems: ListItem[] = data.recentPlans.map((plan) => ({
    id: plan.id,
    title: plan.title,
    subtitle: plan.department_name,
    description: `Updated ${formatDate(plan.updated_at)}`,
    status: plan.status as 'active' | 'inactive' | 'pending' | 'completed' | 'error',
    icon: <FileText className="h-5 w-5" />,
    metadata: [
      {
        label: 'Updated',
        value: formatDate(plan.updated_at),
        icon: <Clock className="h-3 w-3" />
      }
    ]
  }))

  // Transform recent initiatives for ListCard
  const recentInitiativesItems: ListItem[] = data.recentInitiatives.map((initiative) => ({
    id: initiative.id,
    title: initiative.name,
    subtitle: initiative.plan_title,
    status: initiative.status as 'active' | 'inactive' | 'pending' | 'completed' | 'error',
    icon: <Target className="h-5 w-5" />
  }))

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title={`${getGreeting()}, ${data.userInfo.name}`}
        description={`${getRoleLabel(data.userInfo.role)}${data.userInfo.departmentName ? ` • ${data.userInfo.departmentName}` : ''}`}
        breadcrumbs={[
          { label: 'Dashboard', current: true }
        ]}
        actions={
          <div className="flex gap-2">
            <Link href="/plans">
              <Button variant="outline">
                <Target className="mr-2 h-4 w-4" />
                View Plans
              </Button>
            </Link>
            <Link href="/plans">
              <Button>
                <PlusIcon className="mr-2 h-4 w-4" />
                New Plan
              </Button>
            </Link>
          </div>
        }
      />

      <PageContainer>
        {/* Enhanced Statistics */}
        <SimpleDashboardStats stats={dashboardStats} />
        
        {/* Metric Cards Row */}
        <GridLayout columns={4} gap="lg" className="mb-8">
          <MetricCard
            title="Strategic Plans"
            value={data.stats.totalPlans}
            subtitle={`${data.stats.activePlans} active`}
            icon={<FileText className="h-6 w-6" />}
            trend={{
              direction: 'up',
              value: 8,
              period: 'this month'
            }}
            color="blue"
          />
          
          <MetricCard
            title="Initiatives"
            value={data.stats.totalInitiatives}
            subtitle={`${data.stats.activeInitiatives} in progress`}
            icon={<Target className="h-6 w-6" />}
            trend={{
              direction: 'up',
              value: 12,
              period: 'this month'
            }}
            color="green"
          />
          
          <MetricCard
            title="Total Budget"
            value={formatCurrency(data.stats.totalBudget)}
            subtitle="3-year projection"
            icon={<DollarSign className="h-6 w-6" />}
            trend={{
              direction: 'up',
              value: 5,
              period: 'vs last year'
            }}
            color="purple"
          />
          
          <MetricCard
            title="Completion Rate"
            value={`${data.stats.totalInitiatives > 0
              ? Math.round(
                  ((data.stats.totalInitiatives - data.stats.activeInitiatives) /
                    data.stats.totalInitiatives) *
                    100
                )
              : 0}%`}
            subtitle="Overall progress"
            icon={<TrendingUp className="h-6 w-6" />}
            trend={{
              direction: 'up',
              value: 3,
              period: 'this quarter'
            }}
            color="orange"
          />
        </GridLayout>

        {/* Recent Activity Section */}
        <GridLayout columns={2} gap="lg" className="mb-8">
          <ListCard
            title="Recent Plans"
            items={recentPlansItems}
            maxItems={5}
          />
          
          <ListCard
            title="Recent Initiatives"
            items={recentInitiativesItems}
            maxItems={5}
          />
        </GridLayout>

        {/* Quick Actions */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900">Quick Actions</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <a href="/plans" className="block">
              <div className="rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50">
                <FileText className="h-8 w-8 text-primary-600" />
                <h3 className="mt-2 font-medium text-gray-900">Strategic Plans</h3>
                <p className="mt-1 text-sm text-gray-600">View and manage strategic plans</p>
              </div>
            </a>
            
            <a href="/finance" className="block">
              <div className="rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50">
                <DollarSign className="h-8 w-8 text-green-600" />
                <h3 className="mt-2 font-medium text-gray-900">Budget Dashboard</h3>
                <p className="mt-1 text-sm text-gray-600">Review initiative budgets and financial data</p>
              </div>
            </a>
            
            <a href="/plans" className="block">
              <div className="rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50">
                <ActivityIcon className="h-8 w-8 text-blue-600" />
                <h3 className="mt-2 font-medium text-gray-900">Department Activity</h3>
                <p className="mt-1 text-sm text-gray-600">Monitor departmental progress and activities</p>
              </div>
            </a>
            
            <a href="/plans" className="block">
              <div className="rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50">
                <TrendingUp className="h-8 w-8 text-purple-600" />
                <h3 className="mt-2 font-medium text-gray-900">Reports & Analytics</h3>
                <p className="mt-1 text-sm text-gray-600">Generate reports and view analytics</p>
              </div>
            </a>
            
            {(data.userInfo.role === 'admin' || data.userInfo.role === 'city_manager') && (
              <>
                <a href="/admin/users" className="block">
                  <div className="rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50">
                    <Users className="h-8 w-8 text-blue-600" />
                    <h3 className="mt-2 font-medium text-gray-900">User Management</h3>
                    <p className="mt-1 text-sm text-gray-600">Manage users and roles</p>
                  </div>
                </a>
                
                <a href="/admin/departments" className="block">
                  <div className="rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50">
                    <Building2 className="h-8 w-8 text-purple-600" />
                    <h3 className="mt-2 font-medium text-gray-900">Departments</h3>
                    <p className="mt-1 text-sm text-gray-600">Manage departments and structures</p>
                  </div>
                </a>
                
                <a href="/admin/settings" className="block">
                  <div className="rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50">
                    <CalendarIcon className="h-8 w-8 text-orange-600" />
                    <h3 className="mt-2 font-medium text-gray-900">System Settings</h3>
                    <p className="mt-1 text-sm text-gray-600">Configure system preferences</p>
                  </div>
                </a>
                
                <a href="/admin/audit-logs" className="block">
                  <div className="rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50">
                    <ActivityIcon className="h-8 w-8 text-pink-600" />
                    <h3 className="mt-2 font-medium text-gray-900">Audit Logs</h3>
                    <p className="mt-1 text-sm text-gray-600">View system activity and changes</p>
                  </div>
                </a>
              </>
            )}
          </div>
        </div>
      </PageContainer>
    </div>
  )
}
