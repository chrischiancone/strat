/**
 * Real-time Collaboration Engine
 * Provides live editing, comments, notifications, and activity feeds
 */

import { logger } from '../logger'
import { createError } from '../errorHandler'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import { Database } from '@/types/database'

// Client-side Supabase client for collaboration features
const createClientSupabaseClient = createBrowserSupabaseClient

// Types for Collaboration System
export interface CollaborationSession {
  id: string
  resourceId: string // Plan, Goal, Initiative, or Dashboard ID
  resourceType: 'plan' | 'goal' | 'initiative' | 'dashboard'
  participants: SessionParticipant[]
  activeEditors: string[] // User IDs currently editing
  createdAt: Date
  updatedAt: Date
  expiresAt: Date
}

export interface SessionParticipant {
  userId: string
  userName: string
  userEmail: string
  avatar?: string
  role: 'editor' | 'viewer' | 'owner'
  status: 'online' | 'away' | 'offline'
  cursor?: CursorPosition
  lastSeen: Date
  joinedAt: Date
}

export interface CursorPosition {
  x: number
  y: number
  elementId?: string
  selection?: TextSelection
}

export interface TextSelection {
  start: number
  end: number
  text: string
}

export interface Comment {
  id: string
  resourceId: string
  resourceType: 'plan' | 'goal' | 'initiative' | 'dashboard'
  parentId?: string // For threaded comments
  authorId: string
  authorName: string
  authorAvatar?: string
  content: string
  mentions: string[] // User IDs mentioned in comment
  attachments: CommentAttachment[]
  reactions: CommentReaction[]
  resolved: boolean
  resolvedBy?: string
  resolvedAt?: Date
  position?: CommentPosition // For positioned comments
  createdAt: Date
  updatedAt: Date
}

export interface CommentAttachment {
  id: string
  name: string
  type: string
  size: number
  url: string
}

export interface CommentReaction {
  emoji: string
  userId: string
  userName: string
  createdAt: Date
}

export interface CommentPosition {
  elementId: string
  x: number
  y: number
  context?: string // Surrounding text or element description
}

export interface Notification {
  id: string
  userId: string
  type: 'mention' | 'comment' | 'edit' | 'assignment' | 'deadline' | 'approval' | 'system'
  title: string
  message: string
  resourceId: string
  resourceType: 'plan' | 'goal' | 'initiative' | 'dashboard' | 'comment'
  actionUrl?: string
  actionText?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  read: boolean
  readAt?: Date
  data?: Record<string, unknown>
  createdAt: Date
  expiresAt?: Date
}

export interface ActivityFeedItem {
  id: string
  type: 'create' | 'update' | 'delete' | 'comment' | 'assign' | 'complete' | 'approve' | 'reject'
  actorId: string
  actorName: string
  actorAvatar?: string
  resourceId: string
  resourceType: 'plan' | 'goal' | 'initiative' | 'dashboard'
  resourceTitle: string
  action: string
  description: string
  changes?: ActivityChange[]
  metadata?: Record<string, unknown>
  createdAt: Date
}

export interface ActivityChange {
  field: string
  fieldLabel: string
  oldValue?: unknown
  newValue?: unknown
  changeType: 'added' | 'updated' | 'removed'
}

export interface LiveEdit {
  id: string
  sessionId: string
  editorId: string
  resourceId: string
  resourceType: 'plan' | 'goal' | 'initiative' | 'dashboard'
  operation: 'insert' | 'delete' | 'update' | 'move'
  path: string // JSON path to the edited field
  oldValue?: unknown
  newValue?: unknown
  timestamp: Date
  applied: boolean
}

export interface PresenceInfo {
  userId: string
  userName: string
  userAvatar?: string
  status: 'online' | 'away' | 'offline'
  currentResource?: {
    id: string
    type: 'plan' | 'goal' | 'initiative' | 'dashboard'
    title: string
  }
  lastActivity: Date
  cursor?: CursorPosition
}

// WebSocket Event Types
export type CollaborationEvent = 
  | { type: 'user_joined'; data: SessionParticipant }
  | { type: 'user_left'; data: { userId: string } }
  | { type: 'cursor_move'; data: { userId: string; cursor: CursorPosition } }
  | { type: 'live_edit'; data: LiveEdit }
  | { type: 'comment_added'; data: Comment }
  | { type: 'comment_updated'; data: Comment }
  | { type: 'comment_deleted'; data: { commentId: string } }
  | { type: 'notification'; data: Notification }
  | { type: 'presence_update'; data: PresenceInfo }

// Main Collaboration Engine Class
export class CollaborationEngine {
  private static instance: CollaborationEngine
  private activeSessions = new Map<string, CollaborationSession>()
  private userPresence = new Map<string, PresenceInfo>()
  private wsConnections = new Map<string, WebSocket>()
  // Simple in-memory event emitter for client components
  private listeners = new Map<string, Set<(payload: any) => void>>()

static getInstance(): CollaborationEngine {
    if (!CollaborationEngine.instance) {
      CollaborationEngine.instance = new CollaborationEngine()
    }
    return CollaborationEngine.instance
  }

  // Lightweight event subscription API used by UI components
  on(event: string, callback: (payload: any) => void): () => void {
    const set = this.listeners.get(event) || new Set<(payload: any) => void>()
    set.add(callback)
    this.listeners.set(event, set)
    // Return unsubscribe
    return () => {
      const current = this.listeners.get(event)
      if (current) {
        current.delete(callback)
        if (current.size === 0) this.listeners.delete(event)
      }
    }
  }

  emit(event: string, payload: any): void {
    const set = this.listeners.get(event)
    if (!set || set.size === 0) return
    // Clone to avoid mutation during iteration
    Array.from(set).forEach(fn => {
      try { fn(payload) } catch {}
    })
  }

  // Session Management
  async createSession(
    resourceId: string, 
    resourceType: CollaborationSession['resourceType'], 
    userId: string
  ): Promise<CollaborationSession> {
    try {
      const supabase = createClientSupabaseClient()
      
      // Get user info
      const { data: user } = await supabase
        .from('users')
        .select('id, full_name, email, avatar_url')
        .eq('id', userId)
        .single()

      if (!user) {
        throw createError.notFound('User not found')
      }

      // Check if session already exists
      let existingSession = this.activeSessions.get(`${resourceType}:${resourceId}`)
      
      if (existingSession) {
        // Add user to existing session
        const participant: SessionParticipant = {
          userId: user.id,
          userName: user.full_name || user.email,
          userEmail: user.email,
          avatar: user.avatar_url,
          role: 'editor', // Would be determined by permissions
          status: 'online',
          lastSeen: new Date(),
          joinedAt: new Date(),
        }

        if (!existingSession.participants.find(p => p.userId === userId)) {
          existingSession.participants.push(participant)
          existingSession.updatedAt = new Date()
        }

        this.broadcastToSession(existingSession.id, {
          type: 'user_joined',
          data: participant,
        })

        return existingSession
      }

      // Create new session
      const session: CollaborationSession = {
        id: crypto.randomUUID(),
        resourceId,
        resourceType,
        participants: [{
          userId: user.id,
          userName: user.full_name || user.email,
          userEmail: user.email,
          avatar: user.avatar_url,
          role: 'owner',
          status: 'online',
          lastSeen: new Date(),
          joinedAt: new Date(),
        }],
        activeEditors: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      }

      this.activeSessions.set(`${resourceType}:${resourceId}`, session)

      // Store in database
      await supabase
        .from('collaboration_sessions')
        .insert({
          id: session.id,
          resource_id: resourceId,
          resource_type: resourceType,
          participants: session.participants,
          active_editors: session.activeEditors,
          created_at: session.createdAt,
          updated_at: session.updatedAt,
          expires_at: session.expiresAt,
        })

      logger.info('Collaboration session created', { 
        sessionId: session.id, 
        resourceId, 
        resourceType 
      })
      
      // Emit participant joined for initial participant
      this.emit('participantJoined', { sessionId: session.id, participant: session.participants[0] })

      return session

    } catch (error) {
      logger.error('Failed to create collaboration session', { error, resourceId, resourceType })
      throw createError.server('Failed to create collaboration session')
    }
  }

  async joinSession(sessionId: string, userId: string): Promise<CollaborationSession> {
    try {
      const supabase = createClientSupabaseClient()
      
      // Get session
      let session = Array.from(this.activeSessions.values()).find(s => s.id === sessionId)
      
      if (!session) {
        // Try to load from database
        const { data: sessionData } = await supabase
          .from('collaboration_sessions')
          .select('*')
          .eq('id', sessionId)
          .single()

        if (sessionData) {
          session = {
            id: sessionData.id,
            resourceId: sessionData.resource_id,
            resourceType: sessionData.resource_type,
            participants: sessionData.participants,
            activeEditors: sessionData.active_editors,
            createdAt: new Date(sessionData.created_at),
            updatedAt: new Date(sessionData.updated_at),
            expiresAt: new Date(sessionData.expires_at),
          }
          this.activeSessions.set(`${session.resourceType}:${session.resourceId}`, session)
        }
      }

      if (!session) {
        throw createError.notFound('Session not found')
      }

      // Check if session expired
      if (session.expiresAt < new Date()) {
        this.cleanupSession(sessionId)
        throw createError.gone('Session has expired')
      }

      // Get user info
      const { data: user } = await supabase
        .from('users')
        .select('id, full_name, email, avatar_url')
        .eq('id', userId)
        .single()

      if (!user) {
        throw createError.notFound('User not found')
      }

      // Add user to session if not already present
      let participant = session.participants.find(p => p.userId === userId)
      
      if (!participant) {
        participant = {
          userId: user.id,
          userName: user.full_name || user.email,
          userEmail: user.email,
          avatar: user.avatar_url,
          role: 'editor',
          status: 'online',
          lastSeen: new Date(),
          joinedAt: new Date(),
        }
        session.participants.push(participant)

        // Broadcast user joined
        this.broadcastToSession(sessionId, {
          type: 'user_joined',
          data: participant,
        })
      } else {
        // Update existing participant status
        participant.status = 'online'
        participant.lastSeen = new Date()
      }

      session.updatedAt = new Date()

      logger.info('User joined collaboration session', { 
        sessionId, 
        userId,
        resourceId: session.resourceId 
      })

      return session

    } catch (error) {
      logger.error('Failed to join collaboration session', { error, sessionId, userId })
      throw createError.server('Failed to join collaboration session')
    }
  }

  async leaveSession(sessionId: string, userId: string): Promise<void> {
    try {
      const session = Array.from(this.activeSessions.values()).find(s => s.id === sessionId)
      
      if (!session) return

      // Remove user from active editors
      session.activeEditors = session.activeEditors.filter(id => id !== userId)

      // Update participant status
      const participant = session.participants.find(p => p.userId === userId)
      if (participant) {
        participant.status = 'offline'
        participant.lastSeen = new Date()
      }

      // Broadcast user left
      this.broadcastToSession(sessionId, {
        type: 'user_left',
        data: { userId },
      })
      // Emit locally
      this.emit('participantLeft', { sessionId, userId })

      // Clean up if no active participants
      const hasActiveParticipants = session.participants.some(p => p.status === 'online')
      if (!hasActiveParticipants) {
        setTimeout(() => this.cleanupSession(sessionId), 5 * 60 * 1000) // 5 minutes delay
      }

      logger.info('User left collaboration session', { sessionId, userId })

    } catch (error) {
      logger.error('Failed to leave collaboration session', { error, sessionId, userId })
    }
  }

  // Comment System
  async addComment(commentData: Omit<Comment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Comment> {
    try {
      const supabase = createClientSupabaseClient()

      const comment: Comment = {
        ...commentData,
        id: crypto.randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      // Store in database
      await supabase
        .from('comments')
        .insert({
          id: comment.id,
          resource_id: comment.resourceId,
          resource_type: comment.resourceType,
          parent_id: comment.parentId,
          author_id: comment.authorId,
          author_name: comment.authorName,
          author_avatar: comment.authorAvatar,
          content: comment.content,
          mentions: comment.mentions,
          attachments: comment.attachments,
          reactions: comment.reactions,
          resolved: comment.resolved,
          resolved_by: comment.resolvedBy,
          resolved_at: comment.resolvedAt,
          position: comment.position,
          created_at: comment.createdAt,
          updated_at: comment.updatedAt,
        })

      // Create notifications for mentions
      await this.createMentionNotifications(comment)

      // Broadcast to session
      const sessionKey = `${comment.resourceType}:${comment.resourceId}`
      const session = this.activeSessions.get(sessionKey)
      if (session) {
        this.broadcastToSession(session.id, {
          type: 'comment_added',
          data: comment,
        })
      }
      // Emit locally
      this.emit('comment', comment)

      // Add to activity feed
      await this.addActivityItem({
        type: 'comment',
        actorId: comment.authorId,
        actorName: comment.authorName,
        actorAvatar: comment.authorAvatar,
        resourceId: comment.resourceId,
        resourceType: comment.resourceType,
        resourceTitle: await this.getResourceTitle(comment.resourceId, comment.resourceType),
        action: 'commented on',
        description: comment.content.substring(0, 100) + (comment.content.length > 100 ? '...' : ''),
      })

      logger.info('Comment added', { 
        commentId: comment.id, 
        resourceId: comment.resourceId,
        authorId: comment.authorId 
      })

      return comment

    } catch (error) {
      logger.error('Failed to add comment', { error })
      throw createError.server('Failed to add comment')
    }
  }

  async updateComment(commentId: string, updates: Partial<Comment>, userId: string): Promise<Comment> {
    try {
      const supabase = createClientSupabaseClient()

      // Get existing comment
      const { data: existingComment } = await supabase
        .from('comments')
        .select('*')
        .eq('id', commentId)
        .single()

      if (!existingComment) {
        throw createError.notFound('Comment not found')
      }

      // Check permissions
      if (existingComment.author_id !== userId) {
        throw createError.forbidden('Cannot update comment by another user')
      }

      const updatedComment: Comment = {
        id: existingComment.id,
        resourceId: existingComment.resource_id,
        resourceType: existingComment.resource_type,
        parentId: existingComment.parent_id,
        authorId: existingComment.author_id,
        authorName: existingComment.author_name,
        authorAvatar: existingComment.author_avatar,
        content: updates.content || existingComment.content,
        mentions: updates.mentions || existingComment.mentions,
        attachments: updates.attachments || existingComment.attachments,
        reactions: updates.reactions || existingComment.reactions,
        resolved: updates.resolved !== undefined ? updates.resolved : existingComment.resolved,
        resolvedBy: updates.resolvedBy || existingComment.resolved_by,
        resolvedAt: updates.resolvedAt ? new Date(updates.resolvedAt) : 
                   existingComment.resolved_at ? new Date(existingComment.resolved_at) : undefined,
        position: updates.position || existingComment.position,
        createdAt: new Date(existingComment.created_at),
        updatedAt: new Date(),
      }

      // Update in database
      await supabase
        .from('comments')
        .update({
          content: updatedComment.content,
          mentions: updatedComment.mentions,
          attachments: updatedComment.attachments,
          reactions: updatedComment.reactions,
          resolved: updatedComment.resolved,
          resolved_by: updatedComment.resolvedBy,
          resolved_at: updatedComment.resolvedAt,
          position: updatedComment.position,
          updated_at: updatedComment.updatedAt,
        })
        .eq('id', commentId)

      // Broadcast update
      const sessionKey = `${updatedComment.resourceType}:${updatedComment.resourceId}`
      const session = this.activeSessions.get(sessionKey)
      if (session) {
        this.broadcastToSession(session.id, {
          type: 'comment_updated',
          data: updatedComment,
        })
      }

      logger.info('Comment updated', { commentId, userId })

      return updatedComment

    } catch (error) {
      logger.error('Failed to update comment', { error, commentId })
      throw createError.server('Failed to update comment')
    }
  }

  // Notification System
  async getUserNotifications(userId: string, limit = 50): Promise<Notification[]> {
    try {
      const supabase = createClientSupabaseClient()
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)
      if (error) throw error
      return (data || []).map((n: any) => ({
        id: n.id,
        userId: n.user_id,
        type: n.type,
        title: n.title,
        message: n.message,
        resourceId: n.resource_id,
        resourceType: n.resource_type,
        actionUrl: n.action_url,
        actionText: n.action_text,
        priority: n.priority || 'medium',
        read: n.read,
        readAt: n.read_at ? new Date(n.read_at) : undefined,
        data: n.data || {},
        createdAt: new Date(n.created_at),
        expiresAt: n.expires_at ? new Date(n.expires_at) : undefined,
      }))
    } catch (error) {
      logger.error('Failed to get user notifications', { error, userId })
      return []
    }
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      const supabase = createClientSupabaseClient()
      const { error } = await supabase
        .from('notifications')
        .update({ read: true, read_at: new Date().toISOString() })
        .eq('id', notificationId)
      if (error) throw error
    } catch (error) {
      logger.error('Failed to mark notification as read', { error, notificationId })
      throw createError.server('Failed to update notification')
    }
  }

  async createNotification(notificationData: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification> {
    try {
      const supabase = createClientSupabaseClient()

      const notification: Notification = {
        ...notificationData,
        id: crypto.randomUUID(),
        createdAt: new Date(),
      }

      // Store in database
      await supabase
        .from('notifications')
        .insert({
          id: notification.id,
          user_id: notification.userId,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          resource_id: notification.resourceId,
          resource_type: notification.resourceType,
          action_url: notification.actionUrl,
          action_text: notification.actionText,
          priority: notification.priority,
          read: notification.read,
          read_at: notification.readAt,
          data: notification.data,
          created_at: notification.createdAt,
          expires_at: notification.expiresAt,
        })

      // Send real-time notification if user is online
      const userPresence = this.userPresence.get(notification.userId)
      if (userPresence && userPresence.status === 'online') {
        this.sendNotificationToUser(notification.userId, {
          type: 'notification',
          data: notification,
        })
      }

      logger.info('Notification created', { 
        notificationId: notification.id, 
        userId: notification.userId,
        type: notification.type 
      })
      
      // Emit locally
      this.emit('notification', notification)

      return notification

    } catch (error) {
      logger.error('Failed to create notification', { error })
      throw createError.server('Failed to create notification')
    }
  }

  // Activity Feed
  async addActivityItem(itemData: Omit<ActivityFeedItem, 'id' | 'createdAt'>): Promise<ActivityFeedItem> {
    try {
      const supabase = createClientSupabaseClient()

      const activityItem: ActivityFeedItem = {
        ...itemData,
        id: crypto.randomUUID(),
        createdAt: new Date(),
      }

      // Store in database
      await supabase
        .from('activity_feed')
        .insert({
          id: activityItem.id,
          type: activityItem.type,
          actor_id: activityItem.actorId,
          actor_name: activityItem.actorName,
          actor_avatar: activityItem.actorAvatar,
          resource_id: activityItem.resourceId,
          resource_type: activityItem.resourceType,
          resource_title: activityItem.resourceTitle,
          action: activityItem.action,
          description: activityItem.description,
          changes: activityItem.changes,
          metadata: activityItem.metadata,
          created_at: activityItem.createdAt,
        })

      logger.info('Activity item added', { 
        activityId: activityItem.id, 
        type: activityItem.type,
        actorId: activityItem.actorId 
      })

      // Emit locally
      this.emit('activity', activityItem)

      return activityItem

    } catch (error) {
      logger.error('Failed to add activity item', { error })
      throw createError.server('Failed to add activity item')
    }
  }

  // Live Editing
  async applyLiveEdit(edit: Omit<LiveEdit, 'id' | 'timestamp' | 'applied'>): Promise<void> {
    try {
      const liveEdit: LiveEdit = {
        ...edit,
        id: crypto.randomUUID(),
        timestamp: new Date(),
        applied: false,
      }

      // Broadcast to session participants
      const session = Array.from(this.activeSessions.values())
        .find(s => s.id === edit.sessionId)

      if (session) {
        this.broadcastToSession(session.id, {
          type: 'live_edit',
          data: liveEdit,
        })

        // Add editor to active editors if not already present
        if (!session.activeEditors.includes(edit.editorId)) {
          session.activeEditors.push(edit.editorId)
        }
      }

      logger.info('Live edit applied', { 
        editId: liveEdit.id, 
        sessionId: edit.sessionId,
        editorId: edit.editorId 
      })

    } catch (error) {
      logger.error('Failed to apply live edit', { error })
      throw createError.server('Failed to apply live edit')
    }
  }

  // Presence System
  updateUserPresence(userId: string, presence: Partial<PresenceInfo>): void {
    const currentPresence = this.userPresence.get(userId)
    const updatedPresence: PresenceInfo = {
      userId,
      userName: presence.userName || currentPresence?.userName || '',
      userAvatar: presence.userAvatar || currentPresence?.userAvatar,
      status: presence.status || currentPresence?.status || 'online',
      currentResource: presence.currentResource || currentPresence?.currentResource,
      lastActivity: new Date(),
      cursor: presence.cursor || currentPresence?.cursor,
    }

    this.userPresence.set(userId, updatedPresence)

    // Broadcast presence update to relevant sessions
    this.broadcastPresenceUpdate(updatedPresence)
    // Emit locally for UI consumers
    this.emit('presenceUpdate', updatedPresence)

    logger.info('User presence updated', { userId, status: updatedPresence.status })
  }

  // Helper Methods
  private async createMentionNotifications(comment: Comment): Promise<void> {
    for (const mentionedUserId of comment.mentions) {
      await this.createNotification({
        userId: mentionedUserId,
        type: 'mention',
        title: `You were mentioned by ${comment.authorName}`,
        message: comment.content,
        resourceId: comment.resourceId,
        resourceType: comment.resourceType,
        actionUrl: `/plans/${comment.resourceId}#comment-${comment.id}`,
        actionText: 'View Comment',
        priority: 'medium',
        read: false,
      })
    }
  }

  private async getResourceTitle(resourceId: string, resourceType: string): Promise<string> {
    try {
      const supabase = createClientSupabaseClient()
      const tableName = resourceType === 'plan' ? 'plans' : 
                       resourceType === 'goal' ? 'goals' :
                       resourceType === 'initiative' ? 'initiatives' : 'dashboards'

      const { data } = await supabase
        .from(tableName)
        .select('title, name')
        .eq('id', resourceId)
        .single()

      return data?.title || data?.name || 'Unknown Resource'
    } catch {
      return 'Unknown Resource'
    }
  }

  private broadcastToSession(sessionId: string, event: CollaborationEvent): void {
    const session = Array.from(this.activeSessions.values())
      .find(s => s.id === sessionId)

    if (!session) return

    session.participants.forEach(participant => {
      const ws = this.wsConnections.get(participant.userId)
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(event))
      }
    })
  }

  private sendNotificationToUser(userId: string, event: CollaborationEvent): void {
    const ws = this.wsConnections.get(userId)
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(event))
    }
  }

  private broadcastPresenceUpdate(presence: PresenceInfo): void {
    // Find all sessions where this user is a participant
    Array.from(this.activeSessions.values()).forEach(session => {
      const isParticipant = session.participants.some(p => p.userId === presence.userId)
      if (isParticipant) {
        this.broadcastToSession(session.id, {
          type: 'presence_update',
          data: presence,
        })
      }
    })
  }

  getSessionParticipants(sessionId: string): SessionParticipant[] {
    const session = Array.from(this.activeSessions.values()).find(s => s.id === sessionId)
    return session ? session.participants : []
  }

  private cleanupSession(sessionId: string): void {
    const session = Array.from(this.activeSessions.values())
      .find(s => s.id === sessionId)

    if (session) {
      const sessionKey = `${session.resourceType}:${session.resourceId}`
      this.activeSessions.delete(sessionKey)
      logger.info('Collaboration session cleaned up', { sessionId })
    }
  }

  // WebSocket Management (would be integrated with your WebSocket server)
  addWebSocketConnection(userId: string, ws: WebSocket): void {
    this.wsConnections.set(userId, ws)
    
    ws.onclose = () => {
      this.wsConnections.delete(userId)
      this.updateUserPresence(userId, { status: 'offline' })
    }

    this.updateUserPresence(userId, { status: 'online' })
  }

  removeWebSocketConnection(userId: string): void {
    this.wsConnections.delete(userId)
    this.updateUserPresence(userId, { status: 'offline' })
  }
}

// Export singleton instance
export const collaborationEngine = CollaborationEngine.getInstance()
