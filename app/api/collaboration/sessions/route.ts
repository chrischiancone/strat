import { NextRequest, NextResponse } from 'next/server'
import { 
  checkResourceAccess, 
  getUserById,
  createServerClient,
  createActivity
} from '@/lib/collaboration/db-helpers'
import { CollaborationEngine } from '@/lib/collaboration/collaboration-engine'

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

    if (sessionId) {
      // Get specific session info
      const collaborationEngine = CollaborationEngine.getInstance()
      
      try {
        const participants = await collaborationEngine.getSessionParticipants(sessionId)
        
        return NextResponse.json({
          sessionId,
          participants,
          participantCount: participants.length,
          isActive: participants.length > 0,
        })
      } catch (error) {
        return NextResponse.json(
          { error: 'Session not found' },
          { status: 404 }
        )
      }
    } else if (resourceId && resourceType) {
      // Get or create session for resource
      const hasAccess = await checkResourceAccess(userId, resourceType, resourceId)
      if (!hasAccess) {
        return NextResponse.json(
          { error: 'Access denied to resource' },
          { status: 403 }
        )
      }

      const collaborationEngine = CollaborationEngine.getInstance()
      const newSessionId = await collaborationEngine.createSession(
        resourceId,
        resourceType,
        userId
      )

      return NextResponse.json({
        sessionId: newSessionId,
        resourceId,
        resourceType,
        created: true,
      })
    } else {
      // Get all active sessions for user
      const supabase = createServerClient()
      const { data: sessions, error } = await supabase
        .from('collaboration_sessions')
        .select(`
          *,
          participants:collaboration_participants(
            user_id,
            users!user_id(full_name, avatar_url)
          )
        `)
        .contains('participant_ids', [userId])
        .eq('active', true)
        .order('created_at', { ascending: false })

      if (error) throw error

      return NextResponse.json({ 
        sessions: sessions || [],
        count: sessions?.length || 0 
      })
    }
  } catch (error) {
    console.error('Error in session management:', error)
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
    const { action, sessionId, resourceId, resourceType, participant } = body

    const collaborationEngine = CollaborationEngine.getInstance()
    const user = await getUserById(userId)

    switch (action) {
      case 'join': {
        if (!sessionId) {
          return NextResponse.json(
            { error: 'Session ID required for join action' },
            { status: 400 }
          )
        }

        const participantData = {
          userId,
          name: user.full_name,
          avatar: user.avatar_url,
          role: 'editor', // Could be dynamic based on permissions
          joinedAt: new Date(),
        }

        await collaborationEngine.joinSession(sessionId, participantData)

        // Create activity log
        await createActivity({
          sessionId,
          userId,
          action: 'user_joined',
          description: `${user.full_name} joined the collaboration session`,
        })

        return NextResponse.json({
          success: true,
          sessionId,
          participant: participantData,
        })
      }

      case 'leave': {
        if (!sessionId) {
          return NextResponse.json(
            { error: 'Session ID required for leave action' },
            { status: 400 }
          )
        }

        await collaborationEngine.leaveSession(sessionId, userId)

        // Create activity log
        await createActivity({
          sessionId,
          userId,
          action: 'user_left',
          description: `${user.full_name} left the collaboration session`,
        })

        return NextResponse.json({
          success: true,
          sessionId,
        })
      }

      case 'create': {
        if (!resourceId || !resourceType) {
          return NextResponse.json(
            { error: 'Resource ID and type required for create action' },
            { status: 400 }
          )
        }

        // Check resource access
        const hasAccess = await checkResourceAccess(userId, resourceType, resourceId)
        if (!hasAccess) {
          return NextResponse.json(
            { error: 'Access denied to resource' },
            { status: 403 }
          )
        }

        const newSessionId = await collaborationEngine.createSession(
          resourceId,
          resourceType,
          userId
        )

        // Auto-join the creator
        const participantData = {
          userId,
          name: user.full_name,
          avatar: user.avatar_url,
          role: 'editor',
          joinedAt: new Date(),
        }

        await collaborationEngine.joinSession(newSessionId, participantData)

        return NextResponse.json({
          success: true,
          sessionId: newSessionId,
          resourceId,
          resourceType,
          creator: participantData,
        })
      }

      case 'updatePresence': {
        if (!sessionId) {
          return NextResponse.json(
            { error: 'Session ID required for presence update' },
            { status: 400 }
          )
        }

        const { presence } = body
        if (!presence) {
          return NextResponse.json(
            { error: 'Presence data required' },
            { status: 400 }
          )
        }

        await collaborationEngine.updatePresence(sessionId, userId, presence)

        return NextResponse.json({
          success: true,
          sessionId,
          presence,
        })
      }

      case 'broadcastEvent': {
        if (!sessionId) {
          return NextResponse.json(
            { error: 'Session ID required for event broadcast' },
            { status: 400 }
          )
        }

        const { event, data } = body
        if (!event) {
          return NextResponse.json(
            { error: 'Event type required' },
            { status: 400 }
          )
        }

        // Emit the event to all session participants
        collaborationEngine.emit(event, {
          sessionId,
          userId,
          userName: user.full_name,
          ...data,
        })

        return NextResponse.json({
          success: true,
          event,
          sessionId,
        })
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Error in session action:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
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

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID required' },
        { status: 400 }
      )
    }

    const user = await getUserById(userId)
    const collaborationEngine = CollaborationEngine.getInstance()

    // End the collaboration session
    await collaborationEngine.endSession(sessionId, userId)

    // Create activity log
    await createActivity({
      sessionId,
      userId,
      action: 'session_ended',
      description: `${user.full_name} ended the collaboration session`,
    })

    return NextResponse.json({
      success: true,
      sessionId,
      message: 'Session ended successfully',
    })
  } catch (error) {
    console.error('Error ending session:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}