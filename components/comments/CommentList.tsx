'use client'

import { useState, useTransition } from 'react'
import { Comment, deleteComment, resolveComment, CommentEntityType } from '@/app/actions/comments'
import { CommentForm } from './CommentForm'
import { Button } from '@/components/ui/button'
import { MessageSquare, MoreVertical, CheckCircle2, Pencil, Trash2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface CommentListProps {
  comments: Comment[]
  entityType: CommentEntityType
  entityId: string
  currentUserId: string
  currentUserRole?: string
  entityOwnerId?: string
  level?: number
}

export function CommentList({
  comments,
  entityType,
  entityId,
  currentUserId,
  currentUserRole,
  entityOwnerId,
  level = 0,
}: CommentListProps) {
  const router = useRouter()
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleDelete = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment? This will also delete all replies.')) {
      return
    }

    startTransition(async () => {
      try {
        await deleteComment(commentId)
        toast.success('Comment deleted successfully')
        // Use a small delay to avoid DOM manipulation conflicts
        setTimeout(() => {
          router.refresh()
        }, 150)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to delete comment')
      }
    })
  }

  const handleResolve = async (commentId: string) => {
    startTransition(async () => {
      try {
        await resolveComment(commentId)
        toast.success('Comment marked as resolved')
        // Use a small delay to avoid DOM manipulation conflicts
        setTimeout(() => {
          router.refresh()
        }, 150)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to resolve comment')
      }
    })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 24) {
      if (diffInHours < 1) {
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
        return diffInMinutes <= 1 ? 'just now' : `${diffInMinutes} minutes ago`
      }
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
    }

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    })
  }

  const getInitials = (name: string) => {
    const parts = name.split(' ')
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
  }

  const canReply = level < 2 // Max 3 levels (0, 1, 2)

  if (comments.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-gray-500">
        No comments yet. Be the first to comment!
      </div>
    )
  }

  return (
    <div className={level > 0 ? 'ml-8 mt-4 border-l-2 border-gray-200 pl-4' : 'space-y-6'}>
      {comments.map((comment) => {
        const isAuthor = comment.author_id === currentUserId
        const canResolve = isAuthor || comment.author_id === entityOwnerId || currentUserRole === 'city_manager'
        const isEditing = editingId === comment.id

        return (
          <div key={comment.id} className={level > 0 ? 'mb-4' : ''}>
            <div className={`rounded-lg ${comment.is_resolved ? 'bg-green-50' : 'bg-gray-50'} p-4`}>
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-sm font-medium text-white">
                    {getInitials(comment.author_name)}
                  </div>
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{comment.author_name}</p>
                      <p className="text-xs text-gray-500">{formatDate(comment.created_at)}</p>
                    </div>

                    {/* Actions Menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {isAuthor && (
                          <>
                            <DropdownMenuItem onClick={() => setEditingId(comment.id)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(comment.id)}
                              className="text-red-600"
                              disabled={isPending}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </>
                        )}
                        {canResolve && !comment.is_resolved && (
                          <DropdownMenuItem onClick={() => handleResolve(comment.id)} disabled={isPending}>
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Mark as Resolved
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Comment Content */}
                  {isEditing ? (
                    <div className="mt-3">
                      <CommentForm
                        entityType={entityType}
                        entityId={entityId}
                        editCommentId={comment.id}
                        editCommentContent={comment.content}
                        onSuccess={() => {
                          setEditingId(null)
                          router.refresh()
                        }}
                        onCancel={() => setEditingId(null)}
                      />
                    </div>
                  ) : (
                    <>
                      <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">{comment.content}</p>

                      {comment.is_resolved && (
                        <div className="mt-2 flex items-center gap-1 text-xs text-green-700">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Resolved</span>
                        </div>
                      )}

                      {/* Reply Button */}
                      {canReply && !comment.is_resolved && (
                        <button
                          onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                          className="mt-2 flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
                        >
                          <MessageSquare className="h-3 w-3" />
                          Reply
                        </button>
                      )}
                    </>
                  )}

                  {/* Reply Form */}
                  {replyingTo === comment.id && (
                    <div className="mt-3">
                      <CommentForm
                        entityType={entityType}
                        entityId={entityId}
                        parentCommentId={comment.id}
                        onSuccess={() => {
                          setReplyingTo(null)
                          router.refresh()
                        }}
                        onCancel={() => setReplyingTo(null)}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Nested Replies */}
            {comment.replies && comment.replies.length > 0 && (
              <CommentList
                comments={comment.replies}
                entityType={entityType}
                entityId={entityId}
                currentUserId={currentUserId}
                currentUserRole={currentUserRole}
                entityOwnerId={entityOwnerId}
                level={level + 1}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
