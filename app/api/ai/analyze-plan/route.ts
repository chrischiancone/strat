import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { getDashboardData } from '@/app/actions/dashboard'

export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const supabase = createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let planId = ''
    try {
      const body = await request.json()
      planId = body.planId
    } catch {
      // Use query param if body parsing fails
      const { searchParams } = new URL(request.url)
      planId = searchParams.get('planId') || ''
    }

    logger.info('AI plan analysis requested', { planId, userId: user.id })

    // Compute a data-driven analysis using real plan stats
    const data = await getDashboardData(planId)

    const totalInitiatives = Object.values(data.initiativesByStatus).reduce((sum, n) => sum + n, 0)
    const completed = data.initiativesByStatus.completed
    const atRisk = data.initiativesByStatus.at_risk

    const completionRate = totalInitiatives > 0 ? Math.round((completed / totalInitiatives) * 100) : 0
    const hasKpis = (data.kpiProgress?.length || 0) > 0

    // Simple score based on completion, risk, and KPI presence
    const kpiScore = hasKpis ? 15 : 0
    const riskPenalty = Math.min(20, atRisk * 5)
    const baseScore = Math.min(100, Math.max(0, Math.round(completionRate * 0.7 + kpiScore - riskPenalty)))

    const strengths: string[] = []
    if (completionRate >= 50) strengths.push('Solid completion progress across initiatives')
    if (hasKpis) strengths.push('KPIs defined to track performance')
    if (data.goalCount > 0) strengths.push(`${data.goalCount} strategic goals provide clear direction`)

    const weaknesses: string[] = []
    if (totalInitiatives === 0) weaknesses.push('No initiatives defined yet')
    if (!hasKpis) weaknesses.push('No plan- or goal-level KPIs configured')
    if (data.initiativesByPriority.NEED === 0) weaknesses.push('No NEED-priority initiatives identified')

    const risks = atRisk > 0 ? [
      {
        id: crypto.randomUUID(),
        type: 'alert',
        severity: atRisk >= 3 ? 'high' : 'medium',
        title: 'Initiatives at Risk',
        description: `${atRisk} initiative${atRisk === 1 ? '' : 's'} flagged as at risk.`,
        confidence: 70,
        data: { category: 'delivery', impact: atRisk >= 3 ? 'high' : 'medium' },
        recommendations: [
          'Review risk logs and mitigation plans',
          'Reallocate resources to unblock critical work',
          'Increase status check-in cadence'
        ],
        createdAt: new Date(),
      }
    ] : []

    const opportunities = [] as any[]
    if (!hasKpis) {
      opportunities.push({
        id: crypto.randomUUID(),
        type: 'opportunity',
        severity: 'medium',
        title: 'Establish KPI tracking',
        description: 'Add KPIs at plan, goal, or initiative level to monitor progress.',
        confidence: 85,
        data: { category: 'monitoring', impact: 'high' },
        recommendations: ['Define measurable targets', 'Automate KPI data collection'],
        createdAt: new Date(),
      })
    }

    const insights = [
      {
        id: crypto.randomUUID(),
        type: 'recommendation',
        severity: completionRate < 50 ? 'high' : 'medium',
        title: completionRate < 50 ? 'Accelerate initiative execution' : 'Maintain execution momentum',
        description: completionRate < 50
          ? 'Less than half of initiatives are complete. Focus on removing blockers and prioritizing high-impact work.'
          : 'Completion rate is trending well. Continue monitoring and address risks proactively.',
        confidence: 80,
        data: { category: 'execution' },
        recommendations: completionRate < 50
          ? ['Identify top blockers', 'Prioritize NEED initiatives', 'Add weekly check-ins']
          : ['Keep cadence of reviews', 'Retire stale work', 'Shift resources to at-risk items'],
        createdAt: new Date(),
      }
    ]

    const analysis = {
      planId,
      overallScore: baseScore,
      strengths,
      weaknesses,
      risks,
      opportunities,
      insights
    }

    logger.info('AI plan analysis completed (data-driven)', { planId, userId: user.id })

    return NextResponse.json({
      success: true,
      analysis,
      timestamp: new Date().toISOString(),
    })

  } catch (error) {
    logger.error('AI plan analysis failed', { error })
    return NextResponse.json(
      { error: 'Failed to analyze plan' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Authentication check
    const supabase = createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get plan ID from URL params
    const { searchParams } = new URL(request.url)
    const planId = searchParams.get('planId')

    if (!planId) {
      return NextResponse.json({ error: 'Plan ID is required' }, { status: 400 })
    }

    logger.info('AI plan analysis requested via GET', { planId, userId: user.id })

    const data = await getDashboardData(planId)
    const totalInitiatives = Object.values(data.initiativesByStatus).reduce((sum, n) => sum + n, 0)
    const completed = data.initiativesByStatus.completed
    const atRisk = data.initiativesByStatus.at_risk
    const completionRate = totalInitiatives > 0 ? Math.round((completed / totalInitiatives) * 100) : 0
    const hasKpis = (data.kpiProgress?.length || 0) > 0

    const kpiScore = hasKpis ? 15 : 0
    const riskPenalty = Math.min(20, atRisk * 5)
    const baseScore = Math.min(100, Math.max(0, Math.round(completionRate * 0.7 + kpiScore - riskPenalty)))

    const analysis = {
      planId,
      overallScore: baseScore,
      strengths: [
        ...(completionRate >= 50 ? ['Solid completion progress across initiatives'] : []),
        ...(hasKpis ? ['KPIs defined to track performance'] : []),
      ],
      weaknesses: [
        ...(totalInitiatives === 0 ? ['No initiatives defined yet'] : []),
        ...(!hasKpis ? ['No plan- or goal-level KPIs configured'] : []),
      ],
      risks: atRisk > 0 ? [{
        id: crypto.randomUUID(),
        type: 'alert',
        severity: atRisk >= 3 ? 'high' : 'medium',
        title: 'Initiatives at Risk',
        description: `${atRisk} initiative${atRisk === 1 ? '' : 's'} flagged as at risk.`,
        confidence: 70,
        data: { category: 'delivery' },
        recommendations: ['Review risk logs and mitigation plans']
      }] : [],
      opportunities: hasKpis ? [] : [{
        id: crypto.randomUUID(),
        type: 'opportunity',
        severity: 'medium',
        title: 'Establish KPI tracking',
        description: 'Add KPIs at plan, goal, or initiative level to monitor progress.',
        confidence: 85,
        data: { category: 'monitoring' },
        recommendations: ['Define measurable targets']
      }],
      insights: []
    }

    return NextResponse.json({
      success: true,
      analysis,
      timestamp: new Date().toISOString(),
      cached: false
    })

  } catch (error) {
    logger.error('AI plan analysis failed', { error })
    return NextResponse.json(
      { error: 'Failed to analyze plan' },
      { status: 500 }
    )
  }
}
