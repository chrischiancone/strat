import { NextRequest, NextResponse } from 'next/server'
import { renderToStream } from '@react-pdf/renderer'
import { DepartmentPlanDocument } from '@/lib/pdf/DepartmentPlanDocument'
import { getDashboardData } from '@/app/actions/dashboard'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()
    const { planId } = body

    if (!planId) {
      return NextResponse.json(
        { error: 'Plan ID is required' },
        { status: 400 }
      )
    }

    // Verify user authentication
    const supabase = createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user profile
    const { data: userProfile } = await supabase
      .from('users')
      .select('full_name, department_id')
      .eq('id', user.id)
      .single()

    // Get dashboard data (this includes all the main plan data)
    const dashboardData = await getDashboardData(planId)

    // Use admin client for additional data queries
    const adminClient = createAdminSupabaseClient()

    // Get executive summary
    const { data: planData } = await adminClient
      .from('strategic_plans')
      .select('executive_summary')
      .eq('id', planId)
      .single()

    // Get strategic goals with complete data
    const { data: goals } = await adminClient
      .from('strategic_goals')
      .select(`
        id, 
        goal_number,
        title,
        description, 
        city_priority_alignment,
        objectives,
        success_measures,
        display_order
      `)
      .eq('strategic_plan_id', planId)
      .order('display_order', { ascending: true })

    const goalIds = goals?.map(g => g.id) || []

    // Get initiatives with goal names
    let initiatives: Array<{
      id: string
      name: string
      description: string | null
      priority_level: string
      status: string
      responsible_party: string | null
      total_cost: number
      goal_name: string
    }> = []

    if (goalIds.length > 0) {
      const { data: initiativesData } = await adminClient
        .from('initiatives')
        .select(`
          id,
          name,
          description,
          priority_level,
          status,
          responsible_party,
          total_year_1_cost,
          total_year_2_cost,
          total_year_3_cost,
          strategic_goals(name)
        `)
        .in('strategic_goal_id', goalIds)
        .order('priority_level', { ascending: true })
        .order('total_year_1_cost', { ascending: false })

      initiatives = (initiativesData || []).map((init: any) => ({
        id: init.id,
        name: init.name,
        description: init.description,
        priority_level: init.priority_level,
        status: init.status,
        responsible_party: init.responsible_party,
        total_cost: (init.total_year_1_cost || 0) + (init.total_year_2_cost || 0) + (init.total_year_3_cost || 0),
        goal_name: init.strategic_goals?.name || 'Unknown Goal'
      }))
    }

    // Generate PDF
    const stream = await renderToStream(
      <DepartmentPlanDocument 
        data={dashboardData}
        executiveSummary={planData?.executive_summary}
        generatedBy={userProfile?.full_name || 'Unknown User'}
        initiatives={initiatives}
        goals={goals || []}
      />
    )

    // Convert stream to buffer
    const chunks: Uint8Array[] = []
    for await (const chunk of stream as AsyncIterable<Uint8Array>) {
      chunks.push(chunk)
    }
    const buffer = Buffer.concat(chunks)

    // Generate filename with department and timestamp
    const timestamp = new Date().toISOString().split('T')[0]
    const departmentName = dashboardData.plan.department_name.replace(/\s+/g, '-')
    const filename = `Strategic-Plan-${departmentName}-${timestamp}.pdf`

    // Return PDF as response
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.length.toString(),
      },
    })
  } catch (error) {
    console.error('Error generating department plan PDF:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to generate report',
      },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'