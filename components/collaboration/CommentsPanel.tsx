'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import {
  MessageCircle,
  Send,
  MoreHorizontal,
  Edit3,
  Trash2,
  Check,
  X,
  Smile,
  Paperclip,
  AtSign,
  Reply,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Laugh,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useToast } from '@/hooks/use-toast'
import { type Comment as CollabComment, type CommentReaction } from '@/lib/collaboration/collaboration-engine'
import { createComment, getComments, type CommentEntityType, type Comment as ActionComment } from '@/app/actions/comments'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'

interface CommentsPanelProps {
  resourceId: string
  resourceType: 'plan' | 'goal' | 'initiative' | 'dashboard'
  currentUserId: string
  currentUserName: string
  currentUserAvatar?: string
  onMention?: (userId: string) => void
}

// Map collaboration resourceType to comment entity type
function mapResourceTypeToEntityType(resourceType: string): CommentEntityType {
  switch (resourceType) {
    case 'plan':
      return 'strategic_plan'
    case 'goal':
      return 'goal'
    case 'initiative':
      return 'initiative'
    case 'dashboard':
      return 'milestone' // or create a new type if needed
    default:
      return 'strategic_plan'
  }
}

// Extend CollabComment to include replies
interface ExtendedComment extends CollabComment {
  replies?: ExtendedComment[]
}

// Convert ActionComment to ExtendedComment format (recursive for replies)
function adaptActionCommentToCollabComment(comment: ActionComment, resourceType: string = 'plan'): ExtendedComment {
  return {
    id: comment.id,
    resourceId: comment.entity_id,
    resourceType: resourceType as any,
    parentId: comment.parent_comment_id || undefined,
    authorId: comment.author_id,
    authorName: comment.author_name,
    authorAvatar: undefined,
    content: comment.content,
    mentions: [],
    attachments: [],
    reactions: [],
    resolved: comment.is_resolved,
    resolvedBy: undefined,
    resolvedAt: undefined,
    position: undefined,
    createdAt: new Date(comment.created_at),
    updatedAt: new Date(comment.updated_at),
    replies: comment.replies ? comment.replies.map(reply => adaptActionCommentToCollabComment(reply, resourceType)) : []
  }
}

const REACTION_EMOJIS = [
  { emoji: '👍', label: 'thumbs up' },
  { emoji: '❤️', label: 'heart' },
  { emoji: '😂', label: 'laugh' },
  { emoji: '😮', label: 'wow' },
  { emoji: '😢', label: 'sad' },
  { emoji: '😡', label: 'angry' },
]

export function CommentsPanel({
  resourceId,
  resourceType,
  currentUserId,
  currentUserName,
  currentUserAvatar,
  onMention,
}: CommentsPanelProps) {
  const [comments, setComments] = useState<ExtendedComment[]>([])
  const [newComment, setNewComment] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [editingComment, setEditingComment] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { toast } = useToast()

  // Load comments
  useEffect(() => {
    loadComments()
  }, [resourceId, resourceType])

  const loadComments = async () => {
    setLoading(true)
    try {
      const entityType = mapResourceTypeToEntityType(resourceType)
      const commentsData = await getComments(entityType, resourceId)
      
      // Convert ActionComment format to CollabComment format
      const adaptedComments = commentsData.map(comment => 
        adaptActionCommentToCollabComment(comment, resourceType)
      )
      
      setComments(adaptedComments)
    } catch (error) {
      console.error('Failed to load comments:', error)
      toast({
        title: 'Error loading comments',
        description: 'Unable to load comments. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const submitComment = async () => {
    if (!newComment.trim()) return

    setSubmitting(true)
    try {
      const entityType = mapResourceTypeToEntityType(resourceType)
      
      // Verify authentication client-side first
      const supabase = createBrowserSupabaseClient()
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (!user) {
        console.error('CommentsPanel: No authenticated user found')
        toast({
          title: 'Authentication required',
          description: 'Please log in to post comments.',
          variant: 'destructive',
        })
        return
      }
      
      console.log('CommentsPanel: Submitting comment with data:', {
        entity_type: entityType,
        entity_id: resourceId,
        parent_comment_id: replyingTo,
        content: newComment,
        user_id: user.id,
      })
      
      // Use direct API call with cookie-based authentication
      const response = await fetch('/api/collaboration/comments', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          resourceId,
          resourceType: entityType,
          parentId: replyingTo,
          content: newComment,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`)
      }
      
      // Reload comments after successful creation
      await loadComments()
      
      setNewComment('')
      setReplyingTo(null)
      toast({
        title: 'Comment posted',
        description: 'Your comment has been added successfully.',
      })
    } catch (error) {
      console.error('Failed to submit comment:', error)
      toast({
        title: 'Error posting comment',
        description: 'Unable to post comment. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const updateComment = async (commentId: string, content: string) => {
    try {
      const response = await fetch(`/api/collaboration/comments/${commentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          mentions: extractMentions(content),
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setComments(prev =>
          prev.map(comment =>
            comment.id === commentId ? data.comment : comment
          )
        )
        setEditingComment(null)
        toast({
          title: 'Comment updated',
          description: 'Your comment has been updated successfully.',
        })
      }
    } catch (error) {
      console.error('Failed to update comment:', error)
      toast({
        title: 'Error updating comment',
        description: 'Unable to update comment. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const deleteComment = async (commentId: string) => {
    try {
      const response = await fetch(`/api/collaboration/comments/${commentId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setComments(prev => prev.filter(comment => comment.id !== commentId))
        toast({
          title: 'Comment deleted',
          description: 'Your comment has been deleted successfully.',
        })
      }
    } catch (error) {
      console.error('Failed to delete comment:', error)
      toast({
        title: 'Error deleting comment',
        description: 'Unable to delete comment. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const toggleReaction = async (commentId: string, emoji: string) => {
    try {
      const comment = comments.find(c => c.id === commentId)
      if (!comment) return

      const existingReaction = comment.reactions.find(
        r => r.emoji === emoji && r.userId === currentUserId
      )

      let newReactions: CommentReaction[]
      if (existingReaction) {
        // Remove reaction
        newReactions = comment.reactions.filter(
          r => !(r.emoji === emoji && r.userId === currentUserId)
        )
      } else {
        // Add reaction
        newReactions = [
          ...comment.reactions,
          {
            emoji,
            userId: currentUserId,
            userName: currentUserName,
            createdAt: new Date(),
          },
        ]
      }

      const response = await fetch(`/api/collaboration/comments/${commentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reactions: newReactions }),
      })

      if (response.ok) {
        const data = await response.json()
        setComments(prev =>
          prev.map(c => (c.id === commentId ? data.comment : c))
        )
      }
    } catch (error) {
      console.error('Failed to toggle reaction:', error)
    }
  }

  const resolveComment = async (commentId: string) => {
    try {
      const response = await fetch(`/api/collaboration/comments/${commentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resolved: true,
          resolvedBy: currentUserId,
          resolvedAt: new Date(),
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setComments(prev =>
          prev.map(c => (c.id === commentId ? data.comment : c))
        )
        toast({
          title: 'Comment resolved',
          description: 'Comment has been marked as resolved.',
        })
      }
    } catch (error) {
      console.error('Failed to resolve comment:', error)
    }
  }

  const extractMentions = (text: string): string[] => {
    const mentionRegex = /@(\w+)/g
    const mentions: string[] = []
    let match

    while ((match = mentionRegex.exec(text)) !== null) {
      mentions.push(match[1])
    }

    return mentions
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      submitComment()
    }
  }

  const renderComment = (comment: ExtendedComment, isReply = false) => {
    const isAuthor = comment.authorId === currentUserId
    const isEditing = editingComment === comment.id
    const replies = comment.replies || []
    
    return (
      <div
        key={comment.id}
        className={`space-y-3 ${isReply ? 'ml-8 pl-4 border-l-2 border-gray-200' : ''}`}
      >
        <div className="flex space-x-3">
          <Avatar className="w-8 h-8">
            <AvatarImage src={comment.authorAvatar} />
            <AvatarFallback>
              {comment.authorName.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <span className="font-medium text-sm">{comment.authorName}</span>
              <span className="text-xs text-gray-500">
                {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
              </span>
              {comment.resolved && (
                <Badge variant="secondary" className="text-xs">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Resolved
                </Badge>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-2">
                <Textarea
                  value={comment.content}
                  onChange={(e) => {
                    const updatedComments = comments.map(c =>
                      c.id === comment.id ? { ...c, content: e.target.value } : c
                    )
                    setComments(updatedComments)
                  }}
                  className="min-h-[80px] text-sm"
                  placeholder="Edit your comment..."
                />
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    onClick={() => updateComment(comment.id, comment.content)}
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingComment(null)}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="text-sm text-gray-900 break-words">
                  {comment.content}
                </div>

                {/* Reactions */}
                {comment.reactions.length > 0 && (
                  <div className="flex items-center space-x-1 mt-2">
                    {REACTION_EMOJIS.map(({ emoji }) => {
                      const reactions = comment.reactions.filter(r => r.emoji === emoji)
                      if (reactions.length === 0) return null

                      const hasUserReacted = reactions.some(r => r.userId === currentUserId)

                      return (
                        <Button
                          key={emoji}
                          variant={hasUserReacted ? 'default' : 'ghost'}
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => toggleReaction(comment.id, emoji)}
                        >
                          {emoji} {reactions.length}
                        </Button>
                      )
                    })}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center space-x-2 mt-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 px-2">
                        <Smile className="w-3 h-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {REACTION_EMOJIS.map(({ emoji, label }) => (
                        <DropdownMenuItem
                          key={emoji}
                          onClick={() => toggleReaction(comment.id, emoji)}
                        >
                          {emoji} {label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={() => setReplyingTo(comment.id)}
                  >
                    <Reply className="w-3 h-3 mr-1" />
                    Reply
                  </Button>

                  {!comment.resolved && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={() => resolveComment(comment.id)}
                    >
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Resolve
                    </Button>
                  )}

                  {isAuthor && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <MoreHorizontal className="w-3 h-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditingComment(comment.id)}>
                          <Edit3 className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => deleteComment(comment.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Replies */}
        {replies.length > 0 && (
          <div className="space-y-3">
            {replies.map(reply => renderComment(reply, true))}
          </div>
        )}

        {/* Reply form */}
        {replyingTo === comment.id && (
          <div className="ml-11 space-y-2">
            <Textarea
              ref={textareaRef}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyPress={handleKeyPress}
              className="min-h-[80px] text-sm"
              placeholder="Write a reply..."
            />
            <div className="flex justify-between items-center">
              <div className="flex space-x-2">
                <Button variant="ghost" size="sm">
                  <Paperclip className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={onMention}>
                  <AtSign className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setReplyingTo(null)
                    setNewComment('')
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={submitComment}
                  disabled={!newComment.trim() || submitting}
                >
                  <Send className="w-4 h-4 mr-1" />
                  Reply
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  const topLevelComments = comments.filter(comment => !comment.parentId)
  const unresolvedCount = comments.filter(comment => !comment.resolved).length

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center space-x-2">
            <MessageCircle className="w-5 h-5" />
            <span>Comments</span>
            {comments.length > 0 && (
              <Badge variant="secondary">{comments.length}</Badge>
            )}
          </CardTitle>
          {unresolvedCount > 0 && (
            <Badge variant="outline" className="text-xs">
              <AlertCircle className="w-3 h-3 mr-1" />
              {unresolvedCount} unresolved
            </Badge>
          )}
        </div>
        <CardDescription>
          Discuss this {resourceType} with your team
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col space-y-4">
        {/* Comments List */}
        <ScrollArea className="flex-1 pr-4">
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex space-x-3 animate-pulse">
                  <div className="w-8 h-8 bg-gray-200 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-1/4" />
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : topLevelComments.length > 0 ? (
            <div className="space-y-4">
              {topLevelComments.map(comment => renderComment(comment))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
              <MessageCircle className="w-12 h-12 mb-4 opacity-20" />
              <p className="text-sm text-center">
                No comments yet. Start the conversation!
              </p>
            </div>
          )}
        </ScrollArea>

        {!replyingTo && (
          <>
            <Separator />
            
            {/* New Comment Form */}
            <div className="space-y-3">
              <div className="flex space-x-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={currentUserAvatar} />
                  <AvatarFallback>
                    {currentUserName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Textarea
                    ref={textareaRef}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="min-h-[80px] resize-none"
                    placeholder="Add a comment..."
                  />
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm">
                    <Paperclip className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={onMention}>
                    <AtSign className="w-4 h-4" />
                  </Button>
                </div>
                <Button
                  onClick={submitComment}
                  disabled={!newComment.trim() || submitting}
                  className="flex items-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? 'Posting...' : 'Comment'}</span>
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}