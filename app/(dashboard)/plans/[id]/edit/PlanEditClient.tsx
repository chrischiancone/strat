'use client'

import { useRouter } from 'next/navigation'
import { CollaborationWrapper } from '@/components/collaboration'
import { PlanMetadataForm } from '@/components/plans/PlanMetadataForm'
import { DepartmentInfoForm } from '@/components/plans/DepartmentInfoForm'
import { StaffingLevelsForm } from '@/components/plans/StaffingLevelsForm'
import { SwotAnalysisSection } from '@/components/plans/SwotAnalysisSection'
import { EnvironmentalScanSection } from '@/components/plans/EnvironmentalScanSection'
import { BenchmarkingDataSection } from '@/components/plans/BenchmarkingDataSection'
import { GoalsSection } from '@/components/plans/GoalsSection'
import { InitiativesSection } from '@/components/initiatives/InitiativesSection'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Eye } from 'lucide-react'
import { StrategicPlanForEdit } from '@/app/actions/strategic-plans'

interface PlanEditClientProps {
  plan: StrategicPlanForEdit
  currentUser: {
    id: string
    name: string
    avatar?: string
  }
}

export function PlanEditClient({ plan, currentUser }: PlanEditClientProps) {
  const router = useRouter()

  const handleNavigate = (type: string, resourceId: string): string => {
    switch (type) {
      case 'goal':
        return `/goals/${resourceId}`
      case 'initiative':
        return `/initiatives/${resourceId}`
      default:
        return `/${type}s/${resourceId}`
    }
  }

  const handleInviteUser = () => {
    // TODO: Implement user invitation
    console.log('Invite user to collaborate')
  }

  const handleMention = (userId: string) => {
    // TODO: Handle user mentions
    console.log('Mention user:', userId)
  }

  return (
    <CollaborationWrapper
      resourceId={plan.id}
      resourceType="plan"
      currentUserId={currentUser.id}
      currentUserName={currentUser.name}
      currentUserAvatar={currentUser.avatar}
      showPresenceInline={true}
      defaultSidebarOpen={false}
      onNavigate={handleNavigate}
      onInviteUser={handleInviteUser}
      onMention={handleMention}
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
              <Link href={`/plans/${plan.id}`}>
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
              planId={plan.id}
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
              planId={plan.id}
              initialSwot={plan.swot_analysis || undefined}
            />

            {/* Environmental Scan */}
            <EnvironmentalScanSection
              planId={plan.id}
              initialScan={plan.environmental_scan || undefined}
              department_id={plan.department.id}
            />

            {/* Benchmarking Data */}
            <BenchmarkingDataSection
              planId={plan.id}
              initialData={plan.benchmarking_data || undefined}
            />

            {/* Strategic Goals */}
            <GoalsSection planId={plan.id} />

            {/* Initiatives */}
            <InitiativesSection
              planId={plan.id}
              departmentId={plan.department_id}
              fiscalYearId={plan.start_fiscal_year_id}
            />
          </div>
        </div>
      </div>
    </CollaborationWrapper>
  )
}