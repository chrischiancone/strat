import { Suspense } from 'react'
import { getStrategicPlans, getFiscalYears } from '@/app/actions/strategic-plans'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'
import { CreatePlanDialog } from '@/components/plans/CreatePlanDialog'
import { PlansTable } from '@/components/plans/PlansTable'
import { PageHeader } from '@/components/layouts/PageHeader'
import { PageContainer, ContentCard } from '@/components/layouts/PageContainer'
import { TableSkeleton, NoDataEmptyState } from '@/components/ui/loading-states'
import { PlusIcon, FileTextIcon } from 'lucide-react'

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
  const serverSupabase = createServerSupabaseClient()
  const { data: { user } } = await serverSupabase.auth.getUser()

  if (!user) {
    return []
  }

  const { data: userProfile } = await serverSupabase
    .from('users')
    .select('municipality_id')
    .eq('id', user.id)
    .single<{ municipality_id: string }>()

  if (!userProfile) {
    return []
  }

  // Use admin client to fetch departments (component will handle role-based display logic)
  const supabase = createAdminSupabaseClient()
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
    <div className="flex h-full flex-col">
      <PageHeader
        title="Strategic Plans"
        description="Create and manage your department's strategic plans"
        breadcrumbs={[
          { label: 'Plans', current: true }
        ]}
      />
      <PageContainer>
        <TableSkeleton rows={5} columns={6} />
      </PageContainer>
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
    <div className="flex h-full flex-col">
      <PageHeader
        title="Strategic Plans"
        description="Create and manage your department's strategic plans"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Plans', current: true }
        ]}
        actions={
          <CreatePlanDialog
            fiscalYears={fiscalYears}
            userDepartmentId={userProfile?.department_id || null}
            userDepartmentName={userProfile?.departments?.name || null}
            userRole={userProfile?.role || 'staff'}
            departments={departments}
          />
        }
      />

      <PageContainer>
        {plans.length === 0 ? (
          <ContentCard>
            <NoDataEmptyState 
              resourceName="Strategic Plans"
              action={
                <CreatePlanDialog
                  fiscalYears={fiscalYears}
                  userDepartmentId={userProfile?.department_id || null}
                  userDepartmentName={userProfile?.departments?.name || null}
                  userRole={userProfile?.role || 'staff'}
                  departments={departments}
                />
              }
            />
          </ContentCard>
        ) : (
          <PlansTable plans={plans} />
        )}
      </PageContainer>
    </div>
  )
}

export default async function PlansPage() {
  return (
    <Suspense fallback={<PlansSkeleton />}>
      <PlansContent />
    </Suspense>
  )
}
