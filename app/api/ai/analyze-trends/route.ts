import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { aiAnalytics, type TrendAnalysis } from '@/lib/ai/analytics-engine'
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
    const { metrics, departmentId, timeframe } = body

    // Validate input
    if (!Array.isArray(metrics) || metrics.length === 0) {
      return NextResponse.json({ error: 'Metrics array is required' }, { status: 400 })
    }

    if (timeframe && !['monthly', 'quarterly', 'yearly'].includes(timeframe)) {
      return NextResponse.json({ error: 'Invalid timeframe' }, { status: 400 })
    }

    // Security audit
    SecurityAudit.auditUserInput(body, user.id)

    // Check user permissions
    const { data: userProfile } = await supabase
      .from('users')
      .select('role, department_id')
      .eq('id', user.id)
      .single()

    if (!userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 403 })
    }

    // If departmentId is specified, check access
    if (departmentId && departmentId !== userProfile.department_id && userProfile.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied to this department data' }, { status: 403 })
    }

    // Fetch actual data from database to create trend analysis
    const metricsWithData = await Promise.all(
      metrics.map(async (metricName: string) => {
        const data = await fetchMetricData(supabase, metricName, departmentId || userProfile.department_id, timeframe)
        return {
          name: metricName,
          timeframe: timeframe || 'monthly',
          data,
        }
      })
    )

    // Filter out metrics with no data
    const validMetrics = metricsWithData.filter(metric => metric.data.length > 0)

    if (validMetrics.length === 0) {
      return NextResponse.json({ 
        error: 'No data available for the specified metrics and timeframe' 
      }, { status: 404 })
    }

    // Perform AI trend analysis
    logger.info('Starting AI trend analysis', { 
      userId: user.id,
      metricCount: validMetrics.length,
      timeframe 
    })

    const trendAnalyses: TrendAnalysis[] = await aiAnalytics.analyzeTrends(validMetrics)

    // Store analysis results in database for caching
    const { error: insertError } = await supabase
      .from('ai_analyses')
      .insert({
        analysis_type: 'trend_analysis',
        results: {
          trends: trendAnalyses,
          metadata: {
            metrics: validMetrics.map(m => m.name),
            timeframe,
            departmentId: departmentId || userProfile.department_id,
          },
        },
        user_id: user.id,
        created_at: new Date().toISOString(),
      })

    if (insertError) {
      logger.warn('Failed to cache trend analysis results', { error: insertError })
    }

    // Log successful analysis
    logger.info('AI trend analysis completed successfully', {
      userId: user.id,
      metricCount: trendAnalyses.length,
      trendsFound: trendAnalyses.map(t => ({ metric: t.metric, trend: t.trend })),
    })

    return NextResponse.json({
      success: true,
      trends: trendAnalyses,
      metadata: {
        analysisDate: new Date().toISOString(),
        metricCount: trendAnalyses.length,
        timeframe,
      },
    })

  } catch (error) {
    logger.error('AI trend analysis failed', { error })
    SecurityAudit.logSecurityEvent('AI_TREND_ANALYSIS_ERROR', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: (await createServerSupabaseClient().auth.getUser()).data.user?.id,
    }, 'medium')

    return NextResponse.json(
      { error: 'Failed to analyze trends' },
      { status: 500 }
    )
  }
}

// Helper function to fetch metric data from database
async function fetchMetricData(
  supabase: any,
  metricName: string,
  departmentId: string,
  timeframe: string = 'monthly'
): Promise<Array<{ date: string; value: number }>> {
  try {
    // Define metric queries based on metric name
    const metricQueries: Record<string, () => Promise<Array<{ date: string; value: number }>>> = {
      'budget_utilization': async () => {
        const { data } = await supabase
          .from('initiatives')
          .select('created_at, expected_costs')
          .eq('department_id', departmentId)
          .order('created_at')

        return aggregateByTimeframe(data || [], 'expected_costs', timeframe)
      },

      'goal_completion_rate': async () => {
        const { data } = await supabase
          .from('goals')
          .select('created_at, status')
          .eq('department_id', departmentId)
          .order('created_at')

        return calculateCompletionRates(data || [], timeframe)
      },

      'initiative_count': async () => {
        const { data } = await supabase
          .from('initiatives')
          .select('created_at')
          .eq('department_id', departmentId)
          .order('created_at')

        return countByTimeframe(data || [], timeframe)
      },

      'average_timeline': async () => {
        const { data } = await supabase
          .from('initiatives')
          .select('created_at, timeline')
          .eq('department_id', departmentId)
          .not('timeline', 'is', null)
          .order('created_at')

        return calculateAverageTimelines(data || [], timeframe)
      },

      'risk_count': async () => {
        const { data } = await supabase
          .from('ai_analyses')
          .select('created_at, results')
          .eq('analysis_type', 'plan_analysis')
          .order('created_at')

        return extractRiskCounts(data || [], timeframe)
      },
    }

    const queryFunction = metricQueries[metricName]
    if (!queryFunction) {
      logger.warn('Unknown metric requested', { metricName })
      return []
    }

    return await queryFunction()

  } catch (error) {
    logger.error('Failed to fetch metric data', { metricName, error })
    return []
  }
}

// Helper functions for data aggregation
function aggregateByTimeframe(
  data: Array<{ created_at: string; expected_costs?: number }>,
  valueField: string,
  timeframe: string
): Array<{ date: string; value: number }> {
  const grouped = new Map<string, number>()

  data.forEach(item => {
    const date = new Date(item.created_at)
    const key = formatDateForTimeframe(date, timeframe)
    const value = (item as any)[valueField] || 0
    
    grouped.set(key, (grouped.get(key) || 0) + value)
  })

  return Array.from(grouped.entries())
    .map(([date, value]) => ({ date, value }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

function calculateCompletionRates(
  data: Array<{ created_at: string; status: string }>,
  timeframe: string
): Array<{ date: string; value: number }> {
  const grouped = new Map<string, { total: number; completed: number }>()

  data.forEach(item => {
    const date = new Date(item.created_at)
    const key = formatDateForTimeframe(date, timeframe)
    const current = grouped.get(key) || { total: 0, completed: 0 }
    
    current.total += 1
    if (item.status === 'completed') {
      current.completed += 1
    }
    
    grouped.set(key, current)
  })

  return Array.from(grouped.entries())
    .map(([date, { total, completed }]) => ({
      date,
      value: total > 0 ? (completed / total) * 100 : 0
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

function countByTimeframe(
  data: Array<{ created_at: string }>,
  timeframe: string
): Array<{ date: string; value: number }> {
  const grouped = new Map<string, number>()

  data.forEach(item => {
    const date = new Date(item.created_at)
    const key = formatDateForTimeframe(date, timeframe)
    grouped.set(key, (grouped.get(key) || 0) + 1)
  })

  return Array.from(grouped.entries())
    .map(([date, value]) => ({ date, value }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

function calculateAverageTimelines(
  data: Array<{ created_at: string; timeline: string }>,
  timeframe: string
): Array<{ date: string; value: number }> {
  const grouped = new Map<string, number[]>()

  data.forEach(item => {
    const date = new Date(item.created_at)
    const key = formatDateForTimeframe(date, timeframe)
    
    // Parse timeline string to weeks/months
    const timelineWeeks = parseTimelineToWeeks(item.timeline)
    if (timelineWeeks > 0) {
      const current = grouped.get(key) || []
      current.push(timelineWeeks)
      grouped.set(key, current)
    }
  })

  return Array.from(grouped.entries())
    .map(([date, timelines]) => ({
      date,
      value: timelines.length > 0 ? timelines.reduce((a, b) => a + b) / timelines.length : 0
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

function extractRiskCounts(
  data: Array<{ created_at: string; results: any }>,
  timeframe: string
): Array<{ date: string; value: number }> {
  const grouped = new Map<string, number>()

  data.forEach(item => {
    const date = new Date(item.created_at)
    const key = formatDateForTimeframe(date, timeframe)
    const riskCount = item.results?.risks?.length || 0
    grouped.set(key, (grouped.get(key) || 0) + riskCount)
  })

  return Array.from(grouped.entries())
    .map(([date, value]) => ({ date, value }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

function formatDateForTimeframe(date: Date, timeframe: string): string {
  switch (timeframe) {
    case 'yearly':
      return date.getFullYear().toString()
    case 'quarterly':
      const quarter = Math.floor(date.getMonth() / 3) + 1
      return `${date.getFullYear()}-Q${quarter}`
    case 'monthly':
    default:
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
  }
}

function parseTimelineToWeeks(timeline: string): number {
  // Simple parser for timeline strings like "4 weeks", "2 months", etc.
  const match = timeline.toLowerCase().match(/(\d+)\s*(week|month|day)s?/)
  if (!match) return 0

  const value = parseInt(match[1])
  const unit = match[2]

  switch (unit) {
    case 'day':
      return value / 7
    case 'week':
      return value
    case 'month':
      return value * 4.33 // average weeks per month
    default:
      return 0
  }
}