import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { getDashboardData } from '@/app/actions/dashboard'
import { getStrategicGoals } from '@/app/actions/strategic-goals'
import { getFiscalYears } from '@/app/actions/strategic-plans'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { AddInitiativeForm } from '@/components/initiatives/AddInitiativeForm'

interface PageProps {
  params: Promise<{
    id: string
  }>
  searchParams: Promise<{
    goalId?: string
    objectiveId?: string
  }>
}

export default async function AddInitiativePage({ params, searchParams }: PageProps) {
  const { id: planId } = await params
  const { goalId, objectiveId } = await searchParams

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
    .select('role, department_id')
    .eq('id', user.id)
    .single<{ role: string; department_id: string | null }>()

  if (!profile) {
    notFound()
  }

  try {
    // Get plan data and verify permissions
    const dashboardData = await getDashboardData(planId)
    
    // Check if user can edit this plan
    const canEdit = 
      profile.role === 'admin' ||
      profile.role === 'city_manager' ||
      profile.department_id === dashboardData.plan.department_name // Note: This might need adjustment based on actual data structure

    if (!canEdit) {
      notFound()
    }

    // Get strategic goals for this plan
    const goals = await getStrategicGoals(planId)
    
    if (goals.length === 0) {
      return (
        <div className="flex h-full flex-col">
          <div className="border-b border-gray-200 bg-white px-6 py-4">
            <div className="flex items-center gap-4">
              <Link href={`/plans/${planId}`}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  Add Initiative
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  {dashboardData.plan.title}
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1 bg-gray-50 p-6">
            <div className="mx-auto max-w-2xl">
              <div className="rounded-lg bg-white p-8 shadow text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Strategic Goals Found
                </h3>
                <p className="text-gray-600 mb-4">
                  You need to define strategic goals before you can add initiatives.
                </p>
                <Link href={`/plans/${planId}/edit`}>
                  <Button>
                    Add Strategic Goals
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )
    }

    // Get fiscal years for cost estimation
    const fiscalYears = await getFiscalYears()

    // Note: selectedGoalId is passed to the form component instead

    return (
      <div className="flex h-full flex-col">
        <div className="border-b border-gray-200 bg-white px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href={`/plans/${planId}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Add Initiative
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                {dashboardData.plan.title} • {dashboardData.plan.department_name}
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-gray-50 p-6">
          <div className="mx-auto max-w-3xl">
            <AddInitiativeForm
              planId={planId}
              goals={goals}
              selectedGoalId={goalId}
              selectedObjectiveId={objectiveId}
              departmentId={profile.department_id!}
              fiscalYears={fiscalYears}
            />
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error loading add initiative page:', error)
    notFound()
  }
}