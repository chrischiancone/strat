import { NextRequest, NextResponse } from 'next/server'
import { 
  getComments, 
  createComment, 
  checkResourceAccess, 
  getUserById,
  createNotification,
  createActivity
} from '@/lib/collaboration/db-helpers'
import { CollaborationEngine } from '@/lib/collaboration/collaboration-engine'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const resourceId = searchParams.get('resourceId')
    const resourceType = searchParams.get('resourceType')
    const userId = request.headers.get('x-user-id') // Assume auth middleware sets this

    if (!resourceId || !resourceType) {
      return NextResponse.json(
        { error: 'Missing resourceId or resourceType' },
        { status: 400 }
      )
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if user has access to this resource
    const hasAccess = await checkResourceAccess(userId, resourceType, resourceId)
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    const comments = await getComments(resourceId, resourceType)

    return NextResponse.json({ comments })
  } catch (error) {
    console.error('Error fetching comments:', error)
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
    const { resourceId, resourceType, parentId, content, mentions } = body

    if (!resourceId || !resourceType || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if user has access to this resource
    const hasAccess = await checkResourceAccess(userId, resourceType, resourceId)
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Create the comment
    const comment = await createComment({
      resourceId,
      resourceType,
      parentId,
      authorId: userId,
      content,
      mentions,
    })

    // Get the author info for activity/notifications
    const author = await getUserById(userId)

    // Create activity log entry
    await createActivity({
      resourceId,
      resourceType,
      userId,
      action: 'comment_added',
      description: `${author.full_name} added a comment`,
      metadata: {
        commentId: comment.id,
        isReply: !!parentId,
      },
    })

    // Create notifications for mentions
    if (mentions && mentions.length > 0) {
      const collaborationEngine = CollaborationEngine.getInstance()
      
      for (const mentionedUserId of mentions) {
        // Create notification
        await createNotification({
          userId: mentionedUserId,
          type: 'mention',
          title: 'You were mentioned in a comment',
          message: `${author.full_name} mentioned you in a comment on ${resourceType}`,
          resourceType,
          resourceId,
          priority: 'high',
          actors: [{
            id: author.id,
            name: author.full_name,
            avatar: author.avatar_url,
          }],
        })

        // Broadcast real-time notification
        collaborationEngine.emit('notification', {
          userId: mentionedUserId,
          type: 'mention',
          title: 'You were mentioned in a comment',
          message: `${author.full_name} mentioned you`,
          resourceType,
          resourceId,
        })
      }
    }

    // Broadcast real-time comment update
    const collaborationEngine = CollaborationEngine.getInstance()
    collaborationEngine.emit('comment', {
      resourceId,
      resourceType,
      comment,
      action: 'created',
    })

    return NextResponse.json({ comment }, { status: 201 })
  } catch (error) {
    console.error('Error creating comment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}