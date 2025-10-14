import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Pencil } from 'lucide-react'
import { getDashboardData } from '@/app/actions/dashboard'
import { DashboardStats } from '@/components/dashboard/DashboardStats'
import { BudgetByYearChart } from '@/components/dashboard/BudgetByYearChart'
import { BudgetBySourceChart } from '@/components/dashboard/BudgetBySourceChart'
import { KpiProgressList } from '@/components/dashboard/KpiProgressList'
import { SwotAnalysisDisplay } from '@/components/plans/SwotAnalysisDisplay'
import { EnvironmentalScanDisplay } from '@/components/plans/EnvironmentalScanDisplay'
import { BenchmarkingDataDisplay } from '@/components/plans/BenchmarkingDataDisplay'
import { ExecutiveSummaryDisplay } from '@/components/plans/ExecutiveSummaryDisplay'
import { GeneratePlanPdfButton } from '@/components/plans/GeneratePlanPdfButton'
import { GoalsDisplay } from '@/components/plans/GoalsDisplay'
import { InitiativesDisplay } from '@/components/initiatives/InitiativesDisplay'
import { CommentsSection } from '@/components/comments/CommentsSection'
import { PlanStatusBadge } from '@/components/plans/PlanStatusBadge'
import { PlanApprovalActions } from '@/components/plans/PlanApprovalActions'
import { ApprovalHistory } from '@/components/plans/ApprovalHistory'
// import { CollaborationWrapper } from '@/components/collaboration'
import type { PlanStatus } from '@/app/actions/plan-approval'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function PlanDashboardPage({ params }: PageProps) {
  const { id } = await params

  let dashboardData
  let userRole: string | null = null
  let userId: string | null = null
  let isOwner = false

  try {
    dashboardData = await getDashboardData(id)

    // Get user role to determine permissions
    const { createServerSupabaseClient } = await import('@/lib/supabase/server')
    const supabase = createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      userId = user.id
      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single<{ role: string }>()

      userRole = profile?.role || null
      isOwner = dashboardData.plan.created_by === user.id
    }
  } catch (error) {
    console.error('Error loading dashboard:', error)
    notFound()
  }


  // City Manager has read-only access
  const canEdit = userRole !== 'city_manager'
  const backLink = userRole === 'city_manager' ? '/city-manager' : '/plans'

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Temporarily disabled CollaborationWrapper */}
      {/*
      <CollaborationWrapper
        resourceId={id}
        resourceType="plan"
        currentUserId={userId || ''}
        currentUserName="User" // TODO: Get real user name
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
          console.log('Invite user clicked')
        }}
        onMention={(mentionUserId) => {
          // TODO: Handle user mention
          console.log('Mention user:', mentionUserId)
        }}
      >
      */}
      <div className="space-y-6">
        {/* Header */}
        <div className="-mx-6 -mt-6 border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={backLink}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <div className="text-xs text-gray-500 mb-1">
                {userRole === 'city_manager' ? (
                  <>City Manager Dashboard &gt; {dashboardData.plan.department_name}</>
                ) : (
                  <>My Plans</>
                )}
              </div>
              <h1 className="text-2xl font-semibold text-gray-900">
                {dashboardData.plan.title || 'Strategic Plan'}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                {dashboardData.plan.department_name} • FY{' '}
                {dashboardData.plan.fiscal_year_start} -{' '}
                {dashboardData.plan.fiscal_year_end}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <PlanStatusBadge status={dashboardData.plan.status as PlanStatus} />

            {/* Approval Actions */}
            {userId && (
              <PlanApprovalActions
                planId={id}
                currentStatus={dashboardData.plan.status as PlanStatus}
                userRole={userRole || ''}
                isOwner={isOwner}
              />
            )}

            {/* PDF Export Button */}
            <GeneratePlanPdfButton
              planId={id}
              planTitle={dashboardData.plan.title}
              departmentName={dashboardData.plan.department_name}
              variant="outline"
              size="sm"
            />
            
            {canEdit && (
              <Link href={`/plans/${id}/edit`}>
                <Button variant="outline">
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit Plan
                </Button>
              </Link>
            )}
            {!canEdit && userRole === 'city_manager' && (
              <span className="text-sm text-gray-500 italic">Read-only view</span>
            )}
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="space-y-6">
        {/* Key Metrics and Initiative Breakdown */}
        <DashboardStats data={dashboardData} />

        {/* Executive Summary */}
        {dashboardData.plan.executive_summary && (
          <ExecutiveSummaryDisplay summary={dashboardData.plan.executive_summary} />
        )}

        {/* Strategic Goals */}
        <GoalsDisplay planId={id} />

        {/* Strategic Initiatives */}
        <InitiativesDisplay planId={id} />

        {/* SWOT Analysis */}
        {dashboardData.plan.swot_analysis && (
          <SwotAnalysisDisplay swot={dashboardData.plan.swot_analysis} />
        )}

        {/* Environmental Scan */}
        {dashboardData.plan.environmental_scan && (
          <EnvironmentalScanDisplay scan={dashboardData.plan.environmental_scan} />
        )}

        {/* Benchmarking Data */}
        {dashboardData.plan.benchmarking_data && (
          <BenchmarkingDataDisplay data={dashboardData.plan.benchmarking_data} />
        )}

        {/* Budget Charts */}
        <div className="grid gap-6 md:grid-cols-2">
          <BudgetByYearChart data={dashboardData} />
          <BudgetBySourceChart data={dashboardData} />
        </div>

        {/* KPI Progress */}
        <KpiProgressList data={dashboardData} />

        {/* Approval History */}
        <ApprovalHistory planId={id} />

        {/* Comments Section */}
        {userId && (
          <CommentsSection
            entityType="strategic_plan"
            entityId={id}
            currentUserId={userId}
            currentUserRole={userRole || undefined}
            entityOwnerId={dashboardData.plan.created_by}
          />
        )}
        </div>
      </div>
      {/* End temporarily disabled CollaborationWrapper */}
    </div>
  )
}
