import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getFiscalYears } from '@/app/actions/strategic-plans'
import { getDepartments } from '@/app/actions/users'
import { FinanceBudgetDashboardContent } from '@/components/finance/FinanceBudgetDashboardContent'
import { Button } from '@/components/ui/button'
import { TrendingUp, Gift, BarChart3 } from 'lucide-react'

export default async function FinanceDashboardPage() {
  // Verify user has access
  const supabase = createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    notFound()
  }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single<{ role: string }>()

  const allowedRoles = ['finance', 'admin', 'city_manager', 'department_director']
  if (!profile || !allowedRoles.includes(profile.role)) {
    notFound()
  }

  // Fetch data for filters
  const [fiscalYears, departments] = await Promise.all([getFiscalYears(), getDepartments()])

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Initiative Budgets</h1>
            <p className="mt-1 text-sm text-gray-500">
              Review and validate initiative budgets across all departments
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/finance/categories">
              <Button variant="outline">
                <BarChart3 className="mr-2 h-4 w-4" />
                Categories
              </Button>
            </Link>
            <Link href="/finance/grants">
              <Button variant="outline">
                <Gift className="mr-2 h-4 w-4" />
                Grants
              </Button>
            </Link>
            <Link href="/finance/funding-sources">
              <Button>
                <TrendingUp className="mr-2 h-4 w-4" />
                Funding Sources
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="flex-1 overflow-auto bg-gray-50">
        <div className="mx-auto max-w-7xl p-6">
          <FinanceBudgetDashboardContent fiscalYears={fiscalYears} departments={departments} />
        </div>
      </div>
    </div>
  )
}
