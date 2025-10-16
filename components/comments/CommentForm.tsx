'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { createComment, updateComment, CommentEntityType } from '@/app/actions/comments'
import { toast } from 'sonner'

interface CommentFormProps {
  entityType: CommentEntityType
  entityId: string
  parentCommentId?: string
  editCommentId?: string
  editCommentContent?: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function CommentForm({
  entityType,
  entityId,
  parentCommentId,
  editCommentId,
  editCommentContent,
  onSuccess,
  onCancel,
}: CommentFormProps) {
  const [content, setContent] = useState(editCommentContent || '')
  const [isPending, startTransition] = useTransition()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('CommentForm: handleSubmit called', { content, entityType, entityId })

    if (!content.trim()) {
      console.log('CommentForm: Content is empty')
      toast.error('Comment cannot be empty')
      return
    }

    console.log('CommentForm: Starting transition')
    startTransition(async () => {
      try {
        if (editCommentId) {
          console.log('CommentForm: Updating existing comment', editCommentId)
          // Update existing comment
          await updateComment({
            id: editCommentId,
            content: content.trim(),
          })
          toast.success('Comment updated successfully')
        } else {
          console.log('CommentForm: Creating new comment')
          // Create new comment
          const result = await createComment({
            entity_type: entityType,
            entity_id: entityId,
            parent_comment_id: parentCommentId,
            content: content.trim(),
          })
          console.log('CommentForm: Comment created successfully', result)
          toast.success('Comment added successfully')
        }

        setContent('')
        onSuccess?.()
      } catch (error) {
        console.error('CommentForm: Error saving comment', error)
        toast.error(error instanceof Error ? error.message : 'Failed to save comment')
      }
    })
  }

  const isEditing = !!editCommentId
  const isReply = !!parentCommentId && !editCommentId

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label htmlFor="comment-content" className="sr-only">
          {isEditing ? 'Edit comment' : isReply ? 'Reply to comment' : 'Add comment'}
        </label>
        <Textarea
          id="comment-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={isReply ? 'Write a reply...' : 'Write a comment...'}
          rows={3}
          className="resize-none"
          disabled={isPending}
        />
      </div>
      <div className="flex items-center gap-2">
        <Button type="submit" size="sm" disabled={isPending || !content.trim()}>
          {isPending ? 'Saving...' : isEditing ? 'Update' : isReply ? 'Reply' : 'Comment'}
        </Button>
        {(isEditing || isReply) && onCancel && (
          <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={isPending}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  )
}
