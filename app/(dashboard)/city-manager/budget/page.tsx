import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { BudgetDashboardContent } from '@/components/city-budget/BudgetDashboardContent'
import { GenerateReportButton } from '@/components/city-manager/GenerateReportButton'
import { ExportBudgetButton } from '@/components/city-budget/ExportBudgetButton'
import { getFiscalYears } from '@/app/actions/strategic-plans'
import { getDepartments } from '@/app/actions/users'

export default async function CityBudgetDashboardPage() {
  // Verify user has access
  const { createServerSupabaseClient } = await import('@/lib/supabase/server')
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

  if (!profile || (profile.role !== 'city_manager' && profile.role !== 'admin')) {
    notFound()
  }

  // Fetch data for report button
  const [fiscalYears, departments] = await Promise.all([getFiscalYears(), getDepartments()])

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/city-manager">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <div className="text-xs text-gray-500 mb-1">City Manager Dashboard</div>
              <h1 className="text-2xl font-semibold text-gray-900">
                City-Wide Budget Dashboard
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Consolidated budget analysis across all departments
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ExportBudgetButton fiscalYears={fiscalYears} departments={departments} />
            <GenerateReportButton fiscalYears={fiscalYears} departments={departments} />
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="flex-1 overflow-auto bg-gray-50">
        <div className="mx-auto max-w-7xl p-6">
          <BudgetDashboardContent />
        </div>
      </div>
    </div>
  )
}
