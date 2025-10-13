import { NextRequest, NextResponse } from 'next/server'
import { getUserNotifications } from '@/lib/collaboration/db-helpers'

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
    const limit = parseInt(searchParams.get('limit') || '50')
    const unreadOnly = searchParams.get('unreadOnly') === 'true'
    const type = searchParams.get('type') // Filter by notification type
    const priority = searchParams.get('priority') // Filter by priority

    // Get base notifications
    let notifications = await getUserNotifications(userId, limit)

    // Apply client-side filters (could be moved to DB for better performance)
    if (unreadOnly) {
      notifications = notifications.filter(n => !n.read)
    }

    if (type) {
      notifications = notifications.filter(n => n.type === type)
    }

    if (priority) {
      notifications = notifications.filter(n => n.priority === priority)
    }

    // Calculate summary stats
    const stats = {
      total: notifications.length,
      unread: notifications.filter(n => !n.read).length,
      byType: notifications.reduce((acc, n) => {
        acc[n.type] = (acc[n.type] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      byPriority: notifications.reduce((acc, n) => {
        acc[n.priority] = (acc[n.priority] || 0) + 1
        return acc
      }, {} as Record<string, number>),
    }

    return NextResponse.json({ 
      notifications,
      stats,
      pagination: {
        limit,
        hasMore: notifications.length === limit, // Simple pagination indicator
      }
    })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}