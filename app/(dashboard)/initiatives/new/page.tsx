import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { getStrategicPlans, getFiscalYears } from '@/app/actions/strategic-plans'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { GeneralAddInitiativeForm } from '@/components/initiatives/GeneralAddInitiativeForm'

export default async function GeneralAddInitiativePage() {
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

  // Check if user has permission to add initiatives
  const canAddInitiatives = 
    profile.role === 'admin' ||
    profile.role === 'city_manager' ||
    profile.role === 'department_director'

  if (!canAddInitiatives) {
    notFound()
  }

  try {
    // Get user's accessible strategic plans
    const plans = await getStrategicPlans()
    
    if (plans.length === 0) {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Add Initiative
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Create a new strategic initiative
              </p>
            </div>
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          </div>

          <div className="mx-auto max-w-2xl">
            <div className="rounded-lg bg-white p-8 shadow text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Strategic Plans Found
              </h3>
              <p className="text-gray-600 mb-4">
                You need to create a strategic plan before you can add initiatives.
              </p>
              <Link href="/plans">
                <Button>
                  View Strategic Plans
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )
    }

    // Get fiscal years for cost estimation
    const fiscalYears = await getFiscalYears()

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Add Initiative
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Create a new strategic initiative for any of your plans
            </p>
          </div>
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <div className="mx-auto max-w-3xl">
          <GeneralAddInitiativeForm
            plans={plans}
            departmentId={profile.department_id!}
            fiscalYears={fiscalYears}
          />
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error loading add initiative page:', error)
    notFound()
  }
}