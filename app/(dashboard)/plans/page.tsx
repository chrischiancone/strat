import { Suspense } from 'react'
import { getStrategicPlans, getFiscalYears } from '@/app/actions/strategic-plans'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { CreatePlanDialog } from '@/components/plans/CreatePlanDialog'
import { PlansTable } from '@/components/plans/PlansTable'
import { ListSkeleton } from '@/components/ui/skeleton'
import { NoDataEmptyState } from '@/components/ui/empty-state'

async function getUserProfile() {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data } = await supabase
    .from('users')
    .select('department_id, role, departments:department_id(name)')
    .eq('id', user.id)
    .single<{
      department_id: string | null
      role: string
      departments: { name: string } | null
    }>()

  return data
}

async function getDepartments() {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  const { data: userProfile } = await supabase
    .from('users')
    .select('municipality_id, role')
    .eq('id', user.id)
    .single<{ municipality_id: string; role: string }>()

  if (!userProfile || userProfile.role !== 'admin') {
    return []
  }

  // Only fetch departments if user is admin
  const { data } = await supabase
    .from('departments')
    .select('id, name')
    .eq('municipality_id', userProfile.municipality_id)
    .eq('is_active', true)
    .order('name')

  return data || []
}

function PlansSkeleton() {
  return (
    <div className="border-b border-gray-200 bg-white px-6 py-4">
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-64 bg-gray-200 rounded" />
        <div className="h-4 w-96 bg-gray-200 rounded" />
      </div>
      <div className="mt-8 p-6">
        <ListSkeleton items={5} />
      </div>
    </div>
  )
}

async function PlansContent() {
  const [plans, fiscalYears, userProfile, departments] = await Promise.all([
    getStrategicPlans(),
    getFiscalYears(),
    getUserProfile(),
    getDepartments(),
  ])

  return (
    <>
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Strategic Plans
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Create and manage your department&apos;s strategic plans
            </p>
          </div>
          <CreatePlanDialog
            fiscalYears={fiscalYears}
            userDepartmentId={userProfile?.department_id || null}
            userDepartmentName={userProfile?.departments?.name || null}
            userRole={userProfile?.role || 'staff'}
            departments={departments}
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-gray-50">
        <div className="mx-auto max-w-7xl p-6">
          {plans.length === 0 ? (
            <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
              <NoDataEmptyState resourceName="Strategic Plans" />
            </div>
          ) : (
            <PlansTable plans={plans} />
          )}
        </div>
      </div>
    </>
  )
}

export default async function PlansPage() {
  return (
    <div className="flex h-full flex-col">
      <Suspense fallback={<PlansSkeleton />}>
        <PlansContent />
      </Suspense>
    </div>
  )
}
