import { getStrategicPlanForEdit } from '@/app/actions/strategic-plans'
import { PlanMetadataForm } from '@/components/plans/PlanMetadataForm'
import { DepartmentInfoForm } from '@/components/plans/DepartmentInfoForm'
import { StaffingLevelsForm } from '@/components/plans/StaffingLevelsForm'
import { SwotAnalysisSection } from '@/components/plans/SwotAnalysisSection'
import { EnvironmentalScanSection } from '@/components/plans/EnvironmentalScanSection'
import { BenchmarkingDataSection } from '@/components/plans/BenchmarkingDataSection'
import { GoalsSection } from '@/components/plans/GoalsSection'
import { InitiativesSection } from '@/components/initiatives/InitiativesSection'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Eye } from 'lucide-react'
import { CollaborationWrapper } from '@/components/collaboration'
import { createServerSupabaseClient } from '@/lib/supabase/server'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function PlanEditPage({ params }: PageProps) {
  const { id } = await params

  let plan
  let currentUser: { id: string; name: string; avatar?: string } | null = null
  
  try {
    plan = await getStrategicPlanForEdit(id)
    
    // Get current user for collaboration
    const supabase = createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      const { data: profile } = await supabase
        .from('users')
        .select('full_name, avatar_url')
        .eq('id', user.id)
        .single()
      
      currentUser = {
        id: user.id,
        name: profile?.full_name || user.email || 'User',
        avatar: profile?.avatar_url
      }
    }
  } catch (error) {
    console.error('Error loading plan:', error)
    notFound()
  }

  // Only wrap with collaboration if user is authenticated
  if (!currentUser) {
    return (
      <div className="flex h-full flex-col">
        <div className="p-6">
          <p>Please log in to edit this plan.</p>
        </div>
      </div>
    )
  }

  return (
    <CollaborationWrapper
      resourceId={id}
      resourceType="plan"
      currentUserId={currentUser.id}
      currentUserName={currentUser.name}
      currentUserAvatar={currentUser.avatar}
      showPresenceInline={true}
      defaultSidebarOpen={false}
      onNavigate={(type, resourceId) => {
        switch (type) {
          case 'goal':
            return `/goals/${resourceId}`
          case 'initiative':
            return `/initiatives/${resourceId}`
          default:
            return `/${type}s/${resourceId}`
        }
      }}
      onInviteUser={() => {
        // TODO: Implement user invitation
        console.log('Invite user to collaborate')
      }}
      onMention={(userId) => {
        // TODO: Handle user mentions
        console.log('Mention user:', userId)
      }}
    >
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/plans">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Edit Strategic Plan
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                {plan.department.name} • {plan.title}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href={`/plans/${id}`}>
              <Button variant="outline">
                <Eye className="mr-2 h-4 w-4" />
                View Plan
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto bg-gray-50">
        <div className="mx-auto max-w-4xl space-y-6 p-6">
          {/* Plan Metadata */}
          <PlanMetadataForm
            planId={id}
            initialData={{
              title: plan.title,
              executive_summary: plan.executive_summary,
              department_vision: plan.department_vision,
            }}
          />

          {/* Department Information */}
          <DepartmentInfoForm
            departmentId={plan.department.id}
            initialData={{
              director_name: plan.department.director_name,
              director_email: plan.department.director_email,
              mission_statement: plan.department.mission_statement,
              core_services: plan.department.core_services,
            }}
          />

          {/* Staffing Levels */}
          <StaffingLevelsForm
            departmentId={plan.department.id}
            initialData={plan.department.current_staffing}
          />

          {/* SWOT Analysis */}
          <SwotAnalysisSection
            planId={id}
            initialSwot={plan.swot_analysis || undefined}
          />

          {/* Environmental Scan */}
          <EnvironmentalScanSection
            planId={id}
            initialScan={plan.environmental_scan || undefined}
            department_id={plan.department.id}
          />

          {/* Benchmarking Data */}
          <BenchmarkingDataSection
            planId={id}
            initialData={plan.benchmarking_data || undefined}
          />

          {/* Strategic Goals */}
          <GoalsSection planId={id} />

          {/* Initiatives */}
          <InitiativesSection
            planId={id}
            departmentId={plan.department_id}
            fiscalYearId={plan.start_fiscal_year_id}
          />
        </div>
      </div>
      </div>
    </CollaborationWrapper>
  )
}
