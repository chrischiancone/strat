import { NextRequest, NextResponse } from 'next/server'
import { 
  updateComment, 
  deleteComment, 
  getUserById,
  createActivity,
  createServerClient
} from '@/lib/collaboration/db-helpers'
import { CollaborationEngine } from '@/lib/collaboration/collaboration-engine'

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

    const commentId = params.id
    const body = await request.json()

    // Get the existing comment to check ownership and get context
    const supabase = createServerClient()
    const { data: existingComment, error: fetchError } = await supabase
      .from('comments')
      .select('author_id, resource_id, resource_type')
      .eq('id', commentId)
      .single()

    if (fetchError || !existingComment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      )
    }

    // Check if user owns the comment or has admin privileges
    const user = await getUserById(userId)
    const canEdit = existingComment.author_id === userId || 
                    ['admin', 'super_admin'].includes(user.role)

    if (!canEdit) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Update the comment
    const updatedComment = await updateComment(commentId, body)

    // Create activity log entry for significant updates
    if (body.content) {
      await createActivity({
        resourceId: existingComment.resource_id,
        resourceType: existingComment.resource_type,
        userId,
        action: 'comment_updated',
        description: `${user.full_name} updated their comment`,
        metadata: {
          commentId,
          updatedFields: Object.keys(body),
        },
      })
    }

    // Broadcast real-time update
    const collaborationEngine = CollaborationEngine.getInstance()
    collaborationEngine.emit('comment', {
      resourceId: existingComment.resource_id,
      resourceType: existingComment.resource_type,
      comment: updatedComment,
      action: 'updated',
    })

    return NextResponse.json({ comment: updatedComment })
  } catch (error) {
    console.error('Error updating comment:', error)
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

    const commentId = params.id

    // Get the existing comment to check ownership and get context
    const supabase = createServerClient()
    const { data: existingComment, error: fetchError } = await supabase
      .from('comments')
      .select('author_id, resource_id, resource_type, content')
      .eq('id', commentId)
      .single()

    if (fetchError || !existingComment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      )
    }

    // Check if user owns the comment or has admin privileges
    const user = await getUserById(userId)
    const canDelete = existingComment.author_id === userId || 
                     ['admin', 'super_admin'].includes(user.role)

    if (!canDelete) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Delete the comment
    await deleteComment(commentId)

    // Create activity log entry
    await createActivity({
      resourceId: existingComment.resource_id,
      resourceType: existingComment.resource_type,
      userId,
      action: 'comment_deleted',
      description: `${user.full_name} deleted a comment`,
      metadata: {
        commentId,
        deletedContent: existingComment.content.substring(0, 100), // Store snippet for audit
      },
    })

    // Broadcast real-time update
    const collaborationEngine = CollaborationEngine.getInstance()
    collaborationEngine.emit('comment', {
      resourceId: existingComment.resource_id,
      resourceType: existingComment.resource_type,
      commentId,
      action: 'deleted',
    })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Error deleting comment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}