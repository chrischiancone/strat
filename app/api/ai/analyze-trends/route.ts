import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const supabase = createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get request body (but don't require it for now)
    let body = {}
    try {
      body = await request.json()
    } catch {
      // Use defaults if no body provided
    }

    logger.info('AI trend analysis requested', { userId: user.id })

    // Return mock trend analysis data since OpenAI is not configured
    const mockTrends = {
      trends: [
        {
          category: 'Budget',
          metric: 'budget_utilization',
          trend: 'increasing' as const,
          changeRate: 12.5,
          description: 'Budget utilization has increased by 12.5% over the last quarter.',
          recommendations: [
            'Monitor spending closely',
            'Review budget allocations',
            'Consider reallocation of funds'
          ]
        },
        {
          category: 'Goals',
          metric: 'goal_completion_rate',
          trend: 'stable' as const,
          changeRate: 2.1,
          description: 'Goal completion rates remain stable with slight improvement.',
          recommendations: [
            'Maintain current momentum',
            'Focus on lagging initiatives',
            'Celebrate recent completions'
          ]
        },
        {
          category: 'Initiatives',
          metric: 'initiative_count',
          trend: 'decreasing' as const,
          changeRate: -8.3,
          description: 'Number of active initiatives has decreased by 8.3%.',
          recommendations: [
            'Evaluate resource allocation',
            'Consider launching new initiatives',
            'Review strategic priorities'
          ]
        }
      ],
      metadata: {
        analysisDate: new Date().toISOString(),
        confidence: 'medium',
        dataPoints: 24,
        timeframe: 'monthly'
      }
    }

    logger.info('AI trend analysis completed (mock data)', { userId: user.id })

    return NextResponse.json({
      success: true,
      ...mockTrends
    })

  } catch (error) {
    logger.error('AI trend analysis failed', { error })
    return NextResponse.json(
      { error: 'Failed to analyze trends' },
      { status: 500 }
    )
  }
}
