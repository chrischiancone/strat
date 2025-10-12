'use client'

import { useState, useEffect, useCallback } from 'react'
import { Comment, CommentEntityType, getComments, getUnresolvedCount } from '@/app/actions/comments'
import { CommentForm } from './CommentForm'
import { CommentList } from './CommentList'
import { MessageSquare } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface CommentsSectionProps {
  entityType: CommentEntityType
  entityId: string
  currentUserId: string
  currentUserRole?: string
  entityOwnerId?: string
}

export function CommentsSection({
  entityType,
  entityId,
  currentUserId,
  currentUserRole,
  entityOwnerId,
}: CommentsSectionProps) {
  const router = useRouter()
  const [comments, setComments] = useState<Comment[]>([])
  const [unresolvedCount, setUnresolvedCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const loadComments = useCallback(async () => {
    try {
      const [commentsData, count] = await Promise.all([
        getComments(entityType, entityId),
        getUnresolvedCount(entityType, entityId),
      ])
      setComments(commentsData)
      setUnresolvedCount(count)
    } catch (error) {
      console.error('Error loading comments:', error)
    } finally {
      setIsLoading(false)
    }
  }, [entityType, entityId])

  useEffect(() => {
    loadComments()
  }, [entityType, entityId, loadComments])

  const handleCommentSuccess = () => {
    router.refresh()
    loadComments()
  }

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900">Comments</h2>
          {unresolvedCount > 0 && (
            <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
              {unresolvedCount} unresolved
            </span>
          )}
        </div>
      </div>

      {/* Add Comment Form */}
      <div className="mb-6">
        <CommentForm
          entityType={entityType}
          entityId={entityId}
          onSuccess={handleCommentSuccess}
        />
      </div>

      {/* Comments List */}
      {isLoading ? (
        <div className="py-8 text-center text-sm text-gray-500">Loading comments...</div>
      ) : (
        <CommentList
          comments={comments}
          entityType={entityType}
          entityId={entityId}
          currentUserId={currentUserId}
          currentUserRole={currentUserRole}
          entityOwnerId={entityOwnerId}
        />
      )}
    </div>
  )
}
