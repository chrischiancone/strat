import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { GrantDashboardContent } from '@/components/finance/GrantDashboardContent'
import { getDepartments } from '@/app/actions/users'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default async function GrantsPage() {
  const supabase = createServerSupabaseClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    notFound()
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single<{ role: string }>()

  if (!profile) {
    notFound()
  }

  // Only Finance and Admin can access
  if (profile.role !== 'finance' && profile.role !== 'admin') {
    notFound()
  }

  // Fetch fiscal years and departments for filters
  const [fiscalYearsData, departments] = await Promise.all([
    supabase.from('fiscal_years').select('id, year').order('year', { ascending: false }),
    getDepartments(),
  ])

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center gap-4">
          <Link href="/finance">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Grant-Funded Initiatives</h1>
            <p className="mt-1 text-sm text-gray-600">
              Track all initiatives with grant funding and application status
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto bg-gray-50">
        <div className="mx-auto max-w-7xl p-6">
          <GrantDashboardContent
            fiscalYears={
              (fiscalYearsData.data || []).map((fy) => ({
                id: (fy as { id: string }).id,
                year: (fy as { year: number }).year,
              }))
            }
            departments={departments}
          />
        </div>
      </div>
    </div>
  )
}
