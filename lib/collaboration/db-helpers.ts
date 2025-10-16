import { createClient } from '@supabase/supabase-js'
import { type Database } from '@/types/supabase'
import { type Comment, type Notification, type ActivityFeedItem } from './collaboration-engine'

// Create a server-side Supabase client
export function createServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  
  return createClient<Database>(supabaseUrl, supabaseServiceKey)
}

// User and permission helpers
export async function getUserById(userId: string) {
  const supabase = createServerClient()
  
  const { data: user, error } = await supabase
    .from('users')
    .select('id, full_name, email, avatar_url, role, department_id')
    .eq('id', userId)
    .single()
  
  if (error) throw error
  return user
}

export async function checkResourceAccess(
  userId: string, 
  resourceType: string, 
  resourceId: string
): Promise<boolean> {
  const supabase = createServerClient()
  
  // Get user's department
  const user = await getUserById(userId)
  if (!user) return false
  
  // Check if resource belongs to user's department or is public
  let query
  switch (resourceType) {
    case 'plan':
      query = supabase
        .from('strategic_plans')
        .select('department_id')
        .eq('id', resourceId)
      break
    case 'goal':
      query = supabase
        .from('strategic_goals')
        .select('strategic_plans!inner(department_id)')
        .eq('id', resourceId)
      break
    case 'initiative':
      query = supabase
        .from('initiatives')
        .select('strategic_goals!inner(strategic_plans!inner(department_id))')
        .eq('id', resourceId)
      break
    default:
      return false
  }
  
  const { data, error } = await query.single()
  if (error) return false
  
  // Extract department_id from nested structure
  let resourceDepartmentId
  if (resourceType === 'plan') {
    resourceDepartmentId = data.department_id
  } else if (resourceType === 'goal') {
    resourceDepartmentId = (data as any).strategic_plans?.department_id
  } else {
    resourceDepartmentId = (data as any).strategic_goals?.strategic_plans?.department_id
  }
  
  // Allow access if same department or user is admin/super_admin
  return (
    resourceDepartmentId === user.department_id ||
    ['admin', 'super_admin'].includes(user.role)
  )
}

// Comment database operations
export async function createComment(commentData: {
  resourceId: string
  resourceType: string
  parentId?: string
  authorId: string
  content: string
  mentions?: string[]
}): Promise<Comment> {
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .from('comments')
    .insert({
      entity_id: commentData.resourceId,
      entity_type: commentData.resourceType,
      parent_comment_id: commentData.parentId,
      author_id: commentData.authorId,
      content: commentData.content,
      is_resolved: false,
    })
    .select(`
      *,
      users!author_id(full_name, email)
    `)
    .single()
  
  if (error) throw error
  
  return transformComment(data)
}

export async function getComments(
  resourceId: string,
  resourceType: string
): Promise<Comment[]> {
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .from('comments')
    .select(`
      *,
      users!author_id(full_name, email)
    `)
    .eq('entity_id', resourceId)
    .eq('entity_type', resourceType)
    .is('parent_comment_id', null)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  
  return (data || []).map(transformComment)
}

export async function updateComment(
  commentId: string,
  updates: Partial<{
    content: string
    reactions: any[]
    resolved: boolean
    resolvedBy: string
    resolvedAt: Date
  }>
): Promise<Comment> {
  const supabase = createServerClient()
  
  const updateData: any = {}
  if (updates.content !== undefined) updateData.content = updates.content
  if (updates.reactions !== undefined) updateData.reactions = updates.reactions
  if (updates.resolved !== undefined) updateData.resolved = updates.resolved
  if (updates.resolvedBy !== undefined) updateData.resolved_by = updates.resolvedBy
  if (updates.resolvedAt !== undefined) updateData.resolved_at = updates.resolvedAt.toISOString()
  
  const { data, error } = await supabase
    .from('comments')
    .update(updateData)
    .eq('id', commentId)
    .select(`
      *,
      author:users!author_id(id, full_name, avatar_url),
      replies:comments!parent_id(
        *,
        author:users!author_id(id, full_name, avatar_url)
      )
    `)
    .single()
  
  if (error) throw error
  
  return transformComment(data)
}

export async function deleteComment(commentId: string): Promise<void> {
  const supabase = createServerClient()
  
  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId)
  
  if (error) throw error
}

// Notification database operations
export async function getUserNotifications(
  userId: string,
  limit = 50
): Promise<Notification[]> {
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)
  
  if (error) throw error
  
  return data.map(transformNotification)
}

export async function markNotificationAsRead(notificationId: string): Promise<void> {
  const supabase = createServerClient()
  
  const { error } = await supabase
    .from('notifications')
    .update({ read: true, read_at: new Date().toISOString() })
    .eq('id', notificationId)
  
  if (error) throw error
}

export async function createNotification(notificationData: {
  userId: string
  type: string
  title: string
  message: string
  resourceType?: string
  resourceId?: string
  actionUrl?: string
  priority?: string
  actors?: any[]
}): Promise<Notification> {
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .from('notifications')
    .insert({
      user_id: notificationData.userId,
      type: notificationData.type,
      title: notificationData.title,
      message: notificationData.message,
      resource_type: notificationData.resourceType,
      resource_id: notificationData.resourceId,
      action_url: notificationData.actionUrl,
      priority: notificationData.priority || 'medium',
      actors: notificationData.actors || [],
      read: false,
    })
    .select('*')
    .single()
  
  if (error) throw error
  
  return transformNotification(data)
}

// Activity feed database operations
export async function getActivityFeed(filters: {
  sessionId?: string
  resourceId?: string
  resourceType?: string
  userId?: string
  limit?: number
}): Promise<ActivityFeedItem[]> {
  const supabase = createServerClient()
  
  let query = supabase
    .from('activity_log')
    .select(`
      *,
      actor:users!user_id(id, full_name, avatar_url)
    `)
    .order('created_at', { ascending: false })
  
  if (filters.sessionId) {
    query = query.eq('session_id', filters.sessionId)
  }
  
  if (filters.resourceId) {
    query = query.eq('resource_id', filters.resourceId)
  }
  
  if (filters.resourceType) {
    query = query.eq('resource_type', filters.resourceType)
  }
  
  if (filters.userId) {
    query = query.eq('user_id', filters.userId)
  }
  
  query = query.limit(filters.limit || 100)
  
  const { data, error } = await query
  
  if (error) throw error
  
  return data.map(transformActivity)
}

export async function createActivity(activityData: {
  sessionId?: string
  resourceId?: string
  resourceType?: string
  userId: string
  action: string
  description?: string
  metadata?: any
}): Promise<ActivityFeedItem> {
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .from('activity_log')
    .insert({
      session_id: activityData.sessionId,
      resource_id: activityData.resourceId,
      resource_type: activityData.resourceType,
      user_id: activityData.userId,
      action: activityData.action,
      description: activityData.description,
      metadata: activityData.metadata || {},
    })
    .select(`
      *,
      actor:users!user_id(id, full_name, avatar_url)
    `)
    .single()
  
  if (error) throw error
  
  return transformActivity(data)
}

// Data transformation helpers
function transformComment(data: any): Comment {
  return {
    id: data.id,
    resourceId: data.entity_id,
    resourceType: data.entity_type,
    parentId: data.parent_comment_id,
    authorId: data.author_id,
    authorName: data.users?.full_name || 'Unknown User',
    authorAvatar: undefined,
    content: data.content,
    mentions: [],
    attachments: [],
    reactions: [],
    resolved: data.is_resolved,
    resolvedBy: undefined,
    resolvedAt: undefined,
    position: undefined,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  }
}

function transformNotification(data: any): Notification {
  return {
    id: data.id,
    userId: data.user_id,
    type: data.type,
    title: data.title,
    message: data.message,
    resourceType: data.resource_type,
    resourceId: data.resource_id,
    actionUrl: data.action_url,
    priority: data.priority,
    actors: data.actors || [],
    read: data.read,
    readAt: data.read_at ? new Date(data.read_at) : undefined,
    createdAt: new Date(data.created_at),
  }
}

function transformActivity(data: any): ActivityFeedItem {
  return {
    id: data.id,
    sessionId: data.session_id,
    resourceId: data.resource_id,
    resourceType: data.resource_type,
    userId: data.user_id,
    actorName: data.actor.full_name,
    actorAvatar: data.actor.avatar_url,
    action: data.action,
    description: data.description,
    metadata: data.metadata || {},
    timestamp: new Date(data.created_at),
  }
}