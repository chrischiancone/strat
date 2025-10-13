import { NextRequest, NextResponse } from 'next/server'
import { 
  getActivityFeed, 
  checkResourceAccess,
  createServerClient
} from '@/lib/collaboration/db-helpers'

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    const resourceId = searchParams.get('resourceId')
    const resourceType = searchParams.get('resourceType')
    const filterUserId = searchParams.get('userId')
    const limit = parseInt(searchParams.get('limit') || '100')
    const includeSystem = searchParams.get('includeSystem') !== 'false' // Default true

    // Build filters object
    const filters: any = { limit }
    
    if (sessionId) {
      filters.sessionId = sessionId
    }
    
    if (resourceId && resourceType) {
      // Check if user has access to this resource
      const hasAccess = await checkResourceAccess(userId, resourceType, resourceId)
      if (!hasAccess) {
        return NextResponse.json(
          { error: 'Access denied to resource' },
          { status: 403 }
        )
      }
      
      filters.resourceId = resourceId
      filters.resourceType = resourceType
    }
    
    if (filterUserId) {
      filters.userId = filterUserId
    }

    // Get activity feed
    let activities = await getActivityFeed(filters)

    // Filter out system activities if requested
    if (!includeSystem) {
      activities = activities.filter(activity => 
        !['viewed', 'presence_update'].includes(activity.action)
      )
    }

    // Group activities by date for easier consumption
    const groupedActivities = activities.reduce((groups, activity) => {
      const date = activity.timestamp.toISOString().split('T')[0] // YYYY-MM-DD
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(activity)
      return groups
    }, {} as Record<string, typeof activities>)

    // Calculate activity statistics
    const stats = {
      total: activities.length,
      byAction: activities.reduce((acc, activity) => {
        acc[activity.action] = (acc[activity.action] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      byUser: activities.reduce((acc, activity) => {
        acc[activity.actorName] = (acc[activity.actorName] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      dateRange: activities.length > 0 ? {
        earliest: activities[activities.length - 1].timestamp,
        latest: activities[0].timestamp,
      } : null,
    }

    // Recent activities (last 24 hours)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const recentActivities = activities.filter(
      activity => activity.timestamp >= twentyFourHoursAgo
    )

    return NextResponse.json({
      activities,
      grouped: groupedActivities,
      recent: recentActivities,
      stats,
      filters: {
        sessionId,
        resourceId,
        resourceType,
        userId: filterUserId,
        limit,
        includeSystem,
      },
      pagination: {
        limit,
        hasMore: activities.length === limit,
      }
    })
  } catch (error) {
    console.error('Error fetching activity feed:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { 
      sessionId, 
      resourceId, 
      resourceType, 
      action, 
      description,
      metadata 
    } = body

    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      )
    }

    // If resource specified, check access
    if (resourceId && resourceType) {
      const hasAccess = await checkResourceAccess(userId, resourceType, resourceId)
      if (!hasAccess) {
        return NextResponse.json(
          { error: 'Access denied to resource' },
          { status: 403 }
        )
      }
    }

    // Create activity entry (using the helper we already defined)
    const { createActivity } = await import('@/lib/collaboration/db-helpers')
    
    const activity = await createActivity({
      sessionId,
      resourceId,
      resourceType,
      userId,
      action,
      description,
      metadata,
    })

    return NextResponse.json({ 
      activity,
      success: true 
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating activity:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Additional endpoint for activity analytics
export async function PUT(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { operation } = body

    if (operation === 'analytics') {
      const { resourceId, resourceType, days = 7 } = body

      // Check resource access if specified
      if (resourceId && resourceType) {
        const hasAccess = await checkResourceAccess(userId, resourceType, resourceId)
        if (!hasAccess) {
          return NextResponse.json(
            { error: 'Access denied to resource' },
            { status: 403 }
          )
        }
      }

      // Get activities for the specified period
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const supabase = createServerClient()
      let query = supabase
        .from('activity_log')
        .select(`
          action,
          created_at,
          user_id,
          users!user_id(full_name)
        `)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false })

      if (resourceId) {
        query = query.eq('resource_id', resourceId)
      }
      if (resourceType) {
        query = query.eq('resource_type', resourceType)
      }

      const { data: activities, error } = await query

      if (error) throw error

      // Calculate analytics
      const analytics = {
        totalActivities: activities.length,
        uniqueUsers: new Set(activities.map(a => a.user_id)).size,
        dailyBreakdown: activities.reduce((acc, activity) => {
          const date = activity.created_at.split('T')[0]
          acc[date] = (acc[date] || 0) + 1
          return acc
        }, {} as Record<string, number>),
        actionBreakdown: activities.reduce((acc, activity) => {
          acc[activity.action] = (acc[activity.action] || 0) + 1
          return acc
        }, {} as Record<string, number>),
        topUsers: Object.entries(
          activities.reduce((acc, activity) => {
            const userName = activity.users?.full_name || 'Unknown'
            acc[userName] = (acc[userName] || 0) + 1
            return acc
          }, {} as Record<string, number>)
        )
          .sort(([, a], [, b]) => b - a)
          .slice(0, 10)
          .map(([name, count]) => ({ name, count })),
        period: {
          start: startDate,
          end: new Date(),
          days,
        }
      }

      return NextResponse.json({ analytics })
    }

    return NextResponse.json(
      { error: 'Invalid operation' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error in activity analytics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}