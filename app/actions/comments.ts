'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type CommentEntityType = 'strategic_plan' | 'initiative' | 'goal' | 'milestone'

export interface Comment {
  id: string
  entity_type: CommentEntityType
  entity_id: string
  parent_comment_id: string | null
  author_id: string
  author_name: string
  author_email: string
  content: string
  is_resolved: boolean
  created_at: string
  updated_at: string
  replies?: Comment[]
}

export interface CreateCommentInput {
  entity_type: CommentEntityType
  entity_id: string
  parent_comment_id?: string
  content: string
}

export interface UpdateCommentInput {
  id: string
  content: string
}

/**
 * Get all comments for an entity with nested replies
 */
export async function getComments(
  entityType: CommentEntityType,
  entityId: string
): Promise<Comment[]> {
  const supabase = createServerSupabaseClient()

  // Get current user
  const { data: { user: currentUser } } = await supabase.auth.getUser()

  if (!currentUser) {
    throw new Error('Unauthorized')
  }

  // Fetch all comments for this entity
  const { data, error } = await supabase
    .from('comments')
    .select(`
      id,
      entity_type,
      entity_id,
      parent_comment_id,
      author_id,
      content,
      is_resolved,
      created_at,
      updated_at,
      users:author_id (
        full_name,
        email
      )
    `)
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching comments:', error)
    throw new Error('Failed to fetch comments')
  }

  interface CommentQueryResult {
    id: string
    entity_type: string
    entity_id: string
    parent_comment_id: string | null
    author_id: string
    content: string
    is_resolved: boolean
    created_at: string
    updated_at: string
    users: { full_name: string; email: string } | null
  }

  const typedComments = (data || []) as unknown as CommentQueryResult[]

  // Transform flat list to nested structure
  const commentsMap = new Map<string, Comment>()
  const rootComments: Comment[] = []

  // First pass: Create all comment objects
  typedComments.forEach((comment) => {
    const commentObj: Comment = {
      id: comment.id,
      entity_type: comment.entity_type as CommentEntityType,
      entity_id: comment.entity_id,
      parent_comment_id: comment.parent_comment_id,
      author_id: comment.author_id,
      author_name: comment.users?.full_name || 'Unknown User',
      author_email: comment.users?.email || '',
      content: comment.content,
      is_resolved: comment.is_resolved,
      created_at: comment.created_at,
      updated_at: comment.updated_at,
      replies: [],
    }
    commentsMap.set(comment.id, commentObj)
  })

  // Second pass: Build tree structure
  commentsMap.forEach((comment) => {
    if (comment.parent_comment_id) {
      const parent = commentsMap.get(comment.parent_comment_id)
      if (parent) {
        parent.replies = parent.replies || []
        parent.replies.push(comment)
      }
    } else {
      rootComments.push(comment)
    }
  })

  return rootComments
}

/**
 * Create a new comment
 */
export async function createComment(
  input: CreateCommentInput
): Promise<{ id: string }> {
  console.log('createComment: Function called with input:', input)
  const supabase = createServerSupabaseClient()

  // Debug cookies
  const { cookies } = await import('next/headers')
  const cookieStore = cookies()
  const allCookies = cookieStore.getAll()
  console.log('createComment: Available cookies:', allCookies.map(c => c.name))
  
  // Get current user
  const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser()
  console.log('createComment: Current user:', currentUser?.id, 'Auth error:', authError)

  if (!currentUser) {
    console.log('createComment: No authenticated user found')
    throw new Error('Unauthorized')
  }

  // Validate content
  if (!input.content.trim()) {
    throw new Error('Comment content cannot be empty')
  }
  
  console.log('createComment: About to insert comment')

  // Create comment
  const insertData = {
    entity_type: input.entity_type,
    entity_id: input.entity_id,
    parent_comment_id: input.parent_comment_id || null,
    author_id: currentUser.id,
    content: input.content.trim(),
    is_resolved: false,
  }
  console.log('createComment: Insert data:', insertData)
  
  const { data, error } = await supabase
    .from('comments')
    .insert(insertData)
    .select('id')
    .single()

  console.log('createComment: Database result:', { data, error })

  if (error) {
    console.error('Error creating comment:', error)
    throw new Error('Failed to create comment')
  }

  if (!data) {
    throw new Error('No data returned after creating comment')
  }

  // Revalidate the page
  revalidatePath(`/plans/${input.entity_id}`)

  return { id: data.id }
}

/**
 * Update a comment (only author can update)
 */
export async function updateComment(
  input: UpdateCommentInput
): Promise<void> {
  const supabase = createServerSupabaseClient()

  // Get current user
  const { data: { user: currentUser } } = await supabase.auth.getUser()

  if (!currentUser) {
    throw new Error('Unauthorized')
  }

  // Validate content
  if (!input.content.trim()) {
    throw new Error('Comment content cannot be empty')
  }

  // Check if user is the author
  interface CommentAuthCheck {
    author_id: string
    entity_id: string
  }

  const { data: comment } = await supabase
    .from('comments')
    .select('author_id, entity_id')
    .eq('id', input.id)
    .single()

  const typedComment = comment as unknown as CommentAuthCheck | null

  if (!typedComment) {
    throw new Error('Comment not found')
  }

  if (typedComment.author_id !== currentUser.id) {
    throw new Error('You can only edit your own comments')
  }

  // Update comment
  const { error } = await supabase
    .from('comments')
    .update({
      content: input.content.trim(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', input.id)

  if (error) {
    console.error('Error updating comment:', error)
    throw new Error('Failed to update comment')
  }

  // Revalidate the page
  revalidatePath(`/plans/${typedComment.entity_id}`)
}

/**
 * Delete a comment (only author can delete)
 */
export async function deleteComment(commentId: string): Promise<void> {
  const supabase = createServerSupabaseClient()

  // Get current user
  const { data: { user: currentUser } } = await supabase.auth.getUser()

  if (!currentUser) {
    throw new Error('Unauthorized')
  }

  // Check if user is the author
  interface CommentAuthCheck {
    author_id: string
    entity_id: string
  }

  const { data: comment } = await supabase
    .from('comments')
    .select('author_id, entity_id')
    .eq('id', commentId)
    .single()

  const typedComment = comment as unknown as CommentAuthCheck | null

  if (!typedComment) {
    throw new Error('Comment not found')
  }

  if (typedComment.author_id !== currentUser.id) {
    throw new Error('You can only delete your own comments')
  }

  // Delete comment (CASCADE will delete replies)
  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId)

  if (error) {
    console.error('Error deleting comment:', error)
    throw new Error('Failed to delete comment')
  }

  // Revalidate the page
  revalidatePath(`/plans/${typedComment.entity_id}`)
}

/**
 * Mark comment as resolved (entity owner or comment author can resolve)
 */
export async function resolveComment(commentId: string): Promise<void> {
  const supabase = createServerSupabaseClient()

  // Get current user
  const { data: { user: currentUser } } = await supabase.auth.getUser()

  if (!currentUser) {
    throw new Error('Unauthorized')
  }

  // Get comment and check permissions
  interface CommentData {
    author_id: string
    entity_id: string
    entity_type: string
  }

  const { data: comment } = await supabase
    .from('comments')
    .select('author_id, entity_id, entity_type')
    .eq('id', commentId)
    .single()

  const typedComment = comment as unknown as CommentData | null

  if (!typedComment) {
    throw new Error('Comment not found')
  }

  // Get user profile to check role and department
  interface UserProfile {
    role: string
    department_id: string | null
  }

  const { data: userProfile } = await supabase
    .from('users')
    .select('role, department_id')
    .eq('id', currentUser.id)
    .single()

  const typedProfile = userProfile as unknown as UserProfile | null

  if (!typedProfile) {
    throw new Error('User profile not found')
  }

  // Check if user can resolve (author or entity owner)
  let canResolve = typedComment.author_id === currentUser.id

  // City Manager and Admin can resolve any comment
  if (typedProfile.role === 'city_manager' || typedProfile.role === 'admin') {
    canResolve = true
  }

  if (!canResolve) {
    // Check if user owns the entity or is in the same department
    if (typedComment.entity_type === 'strategic_plan') {
      interface PlanData {
        created_by: string
        department_id: string
      }

      const { data: plan } = await supabase
        .from('strategic_plans')
        .select('created_by, department_id')
        .eq('id', typedComment.entity_id)
        .single()

      const typedPlan = plan as unknown as PlanData | null

      if (typedPlan) {
        canResolve = typedPlan.created_by === currentUser.id ||
                    typedProfile.department_id === typedPlan.department_id
      }
    } else if (typedComment.entity_type === 'initiative') {
      // For initiatives, check department through goal → strategic_plan → department
      interface InitiativeWithPlan {
        goal: {
          strategic_plan: {
            department_id: string
            created_by: string
          }
        }
      }

      const { data: initiative } = await supabase
        .from('initiatives')
        .select(`
          goal:strategic_goals!inner(
            strategic_plan:strategic_plans!inner(
              department_id,
              created_by
            )
          )
        `)
        .eq('id', typedComment.entity_id)
        .single()

      const typedInitiative = initiative as unknown as InitiativeWithPlan | null

      if (typedInitiative) {
        const plan = typedInitiative.goal.strategic_plan

        // Finance can resolve initiative budget comments
        // Department members can resolve comments on their initiatives
        canResolve = typedProfile.role === 'finance' ||
                    typedProfile.department_id === plan.department_id ||
                    plan.created_by === currentUser.id
      }
    }
  }

  if (!canResolve) {
    throw new Error('You do not have permission to resolve this comment')
  }

  // Mark as resolved
  const { error } = await supabase
    .from('comments')
    .update({ is_resolved: true })
    .eq('id', commentId)

  if (error) {
    console.error('Error resolving comment:', error)
    throw new Error('Failed to resolve comment')
  }

  // Revalidate the page
  revalidatePath(`/plans/${typedComment.entity_id}`)
}

/**
 * Get unresolved comment count for an entity
 */
export async function getUnresolvedCount(
  entityType: CommentEntityType,
  entityId: string
): Promise<number> {
  const supabase = createServerSupabaseClient()

  const { count, error } = await supabase
    .from('comments')
    .select('*', { count: 'exact', head: true })
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .eq('is_resolved', false)

  if (error) {
    console.error('Error counting unresolved comments:', error)
    return 0
  }

  return count || 0
}
