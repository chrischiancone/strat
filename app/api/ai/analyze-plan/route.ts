import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { aiAnalytics, type PlanAnalysis } from '@/lib/ai/analytics-engine'
import { logger } from '@/lib/logger'
import { InputValidator, SecurityAudit } from '@/lib/security'

export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const supabase = createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get request body
    const body = await request.json()
    const { planId } = body

    // Validate input
    if (!planId || typeof planId !== 'string') {
      return NextResponse.json({ error: 'Plan ID is required' }, { status: 400 })
    }

    if (!InputValidator.isValidUUID(planId)) {
      return NextResponse.json({ error: 'Invalid plan ID format' }, { status: 400 })
    }

    // Security audit
    SecurityAudit.auditUserInput(body, user.id)

    // Fetch plan data from database
    const { data: plan, error: planError } = await supabase
      .from('plans')
      .select(`
        id,
        title,
        description,
        fiscal_year,
        status,
        created_at,
        updated_at,
        goals (
          id,
          title,
          description,
          target_date,
          status,
          initiatives (
            id,
            title,
            description,
            status,
            timeline,
            expected_costs
          )
        )
      `)
      .eq('id', planId)
      .single()

    if (planError || !plan) {
      logger.error('Plan not found for analysis', { planId, error: planError })
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }

    // Check user permissions
    const { data: userProfile } = await supabase
      .from('users')
      .select('role, department_id')
      .eq('id', user.id)
      .single()

    if (!userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 403 })
    }

    // Transform plan data for AI analysis
    const planData = {
      id: plan.id,
      title: plan.title,
      description: plan.description,
      goals: plan.goals?.map((goal: any) => ({
        id: goal.id,
        title: goal.title,
        description: goal.description,
        targetDate: goal.target_date,
        status: goal.status,
        initiatives: goal.initiatives?.map((initiative: any) => ({
          title: initiative.title,
          description: initiative.description,
          budget: initiative.expected_costs || 0,
          timeline: initiative.timeline,
          status: initiative.status,
        })) || [],
      })) || [],
      budget: {
        total: plan.goals?.reduce((total: number, goal: any) => {
          return total + (goal.initiatives?.reduce((goalTotal: number, init: any) => 
            goalTotal + (init.expected_costs || 0), 0) || 0)
        }, 0) || 0,
        allocated: plan.goals?.reduce((total: number, goal: any) => {
          return total + (goal.initiatives?.reduce((goalTotal: number, init: any) => 
            goalTotal + (init.expected_costs || 0), 0) || 0)
        }, 0) || 0,
        spent: 0, // Would need actual spending data
      },
      timeline: {
        startDate: plan.created_at,
        endDate: plan.goals?.reduce((latest: string, goal: any) => {
          const goalDate = goal.target_date || plan.created_at
          return goalDate > latest ? goalDate : latest
        }, plan.created_at) || plan.created_at,
      },
    }

    // Perform AI analysis
    logger.info('Starting AI analysis for plan', { 
      planId, 
      userId: user.id,
      goalCount: planData.goals.length 
    })

    const analysis: PlanAnalysis = await aiAnalytics.analyzePlan(planData)

    // Store analysis results in database for caching
    const { error: insertError } = await supabase
      .from('ai_analyses')
      .upsert({
        plan_id: planId,
        analysis_type: 'plan_analysis',
        results: analysis,
        user_id: user.id,
        created_at: new Date().toISOString(),
      })

    if (insertError) {
      logger.warn('Failed to cache analysis results', { error: insertError })
    }

    // Log successful analysis
    logger.info('AI plan analysis completed successfully', {
      planId,
      userId: user.id,
      overallScore: analysis.overallScore,
      riskCount: analysis.risks.length,
      opportunityCount: analysis.opportunities.length,
    })

    return NextResponse.json({
      success: true,
      analysis,
      timestamp: new Date().toISOString(),
    })

  } catch (error) {
    logger.error('AI plan analysis failed', { error })
    SecurityAudit.logSecurityEvent('AI_ANALYSIS_ERROR', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: (await createServerSupabaseClient().auth.getUser()).data.user?.id,
    }, 'medium')

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

    if (!planId || !InputValidator.isValidUUID(planId)) {
      return NextResponse.json({ error: 'Valid plan ID is required' }, { status: 400 })
    }

    // Check if cached analysis exists
    const { data: cachedAnalysis, error: cacheError } = await supabase
      .from('ai_analyses')
      .select('results, created_at')
      .eq('plan_id', planId)
      .eq('analysis_type', 'plan_analysis')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (!cacheError && cachedAnalysis) {
      // Check if analysis is less than 24 hours old
      const analysisAge = Date.now() - new Date(cachedAnalysis.created_at).getTime()
      const maxAge = 24 * 60 * 60 * 1000 // 24 hours

      if (analysisAge < maxAge) {
        logger.info('Returning cached AI analysis', { planId, age: analysisAge })
        return NextResponse.json({
          success: true,
          analysis: cachedAnalysis.results,
          cached: true,
          timestamp: cachedAnalysis.created_at,
        })
      }
    }

    // No valid cached analysis found
    return NextResponse.json({
      success: false,
      message: 'No recent analysis found. Please run a new analysis.',
      cached: false,
    }, { status: 404 })

  } catch (error) {
    logger.error('Failed to retrieve AI analysis', { error })
    return NextResponse.json(
      { error: 'Failed to retrieve analysis' },
      { status: 500 }
    )
  }
}