import { NextRequest, NextResponse } from 'next/server'
import { 
  markNotificationAsRead,
  createServerClient,
  getUserById
} from '@/lib/collaboration/db-helpers'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const notificationId = params.id
    const body = await request.json()

    // Get the existing notification to check ownership
    const supabase = createServerClient()
    const { data: existingNotification, error: fetchError } = await supabase
      .from('notifications')
      .select('user_id')
      .eq('id', notificationId)
      .single()

    if (fetchError || !existingNotification) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      )
    }

    // Check if user owns the notification
    if (existingNotification.user_id !== userId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Handle different update operations
    if (body.read === true || body.markAsRead === true) {
      await markNotificationAsRead(notificationId)
    } else if (body.read === false) {
      // Mark as unread
      const { error } = await supabase
        .from('notifications')
        .update({ read: false, read_at: null })
        .eq('id', notificationId)
      
      if (error) throw error
    }

    // Get updated notification
    const { data: updatedNotification, error: updateError } = await supabase
      .from('notifications')
      .select('*')
      .eq('id', notificationId)
      .single()

    if (updateError) throw updateError

    return NextResponse.json({ 
      notification: updatedNotification,
      success: true 
    })
  } catch (error) {
    console.error('Error updating notification:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const notificationId = params.id

    // Get the existing notification to check ownership
    const supabase = createServerClient()
    const { data: existingNotification, error: fetchError } = await supabase
      .from('notifications')
      .select('user_id, type, title')
      .eq('id', notificationId)
      .single()

    if (fetchError || !existingNotification) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      )
    }

    // Check if user owns the notification
    if (existingNotification.user_id !== userId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Delete the notification
    const { error: deleteError } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)

    if (deleteError) throw deleteError

    return NextResponse.json({ 
      success: true,
      message: 'Notification deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting notification:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Bulk operations endpoint
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Special case: if id is 'bulk', handle bulk operations
    if (params.id === 'bulk') {
      const body = await request.json()
      const { action, notificationIds } = body

      if (!action || !notificationIds || !Array.isArray(notificationIds)) {
        return NextResponse.json(
          { error: 'Invalid bulk operation request' },
          { status: 400 }
        )
      }

      const supabase = createServerClient()

      // Verify all notifications belong to the user
      const { data: notifications, error: fetchError } = await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', userId)
        .in('id', notificationIds)

      if (fetchError) throw fetchError

      if (notifications.length !== notificationIds.length) {
        return NextResponse.json(
          { error: 'Some notifications not found or access denied' },
          { status: 403 }
        )
      }

      let result
      switch (action) {
        case 'markAllRead':
          result = await supabase
            .from('notifications')
            .update({ read: true, read_at: new Date().toISOString() })
            .in('id', notificationIds)
          break
        
        case 'markAllUnread':
          result = await supabase
            .from('notifications')
            .update({ read: false, read_at: null })
            .in('id', notificationIds)
          break
        
        case 'deleteAll':
          result = await supabase
            .from('notifications')
            .delete()
            .in('id', notificationIds)
          break
        
        default:
          return NextResponse.json(
            { error: 'Invalid bulk action' },
            { status: 400 }
          )
      }

      if (result.error) throw result.error

      return NextResponse.json({
        success: true,
        affected: notificationIds.length,
        action
      })
    }

    return NextResponse.json(
      { error: 'Invalid endpoint' },
      { status: 404 }
    )
  } catch (error) {
    console.error('Error in bulk operation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}