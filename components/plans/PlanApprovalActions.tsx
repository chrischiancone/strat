'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { CheckCircle, XCircle, Send, FileCheck } from 'lucide-react'
import { toast } from 'sonner'
import {
  type PlanStatus,
  submitPlanForReview,
  approvePlan,
  requestRevisions,
  publishPlan,
} from '@/app/actions/plan-approval'

interface PlanApprovalActionsProps {
  planId: string
  currentStatus: PlanStatus
  userRole: string
  isOwner: boolean
}

export function PlanApprovalActions({
  planId,
  currentStatus,
  userRole,
  isOwner,
}: PlanApprovalActionsProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [showSubmitDialog, setShowSubmitDialog] = useState(false)
  const [showPublishDialog, setShowPublishDialog] = useState(false)
  const [notes, setNotes] = useState('')

  const handleSubmitForReview = async () => {
    setIsLoading(true)
    try {
      const result = await submitPlanForReview(planId)
      if (result.success) {
        toast.success('Plan submitted for review')
        setShowSubmitDialog(false)
        router.refresh()
      } else {
        toast.error(result.error || 'Failed to submit plan')
      }
    } catch (error) {
      toast.error('An error occurred')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprovePlan = async () => {
    setIsLoading(true)
    try {
      const result = await approvePlan(planId, notes.trim() || undefined)
      if (result.success) {
        toast.success('Plan approved')
        setShowApproveDialog(false)
        setNotes('')
        router.refresh()
      } else {
        toast.error(result.error || 'Failed to approve plan')
      }
    } catch (error) {
      toast.error('An error occurred')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRequestRevisions = async () => {
    if (!notes.trim()) {
      toast.error('Please provide feedback for the requested revisions')
      return
    }

    setIsLoading(true)
    try {
      const result = await requestRevisions(planId, notes.trim())
      if (result.success) {
        toast.success('Revisions requested')
        setShowRejectDialog(false)
        setNotes('')
        router.refresh()
      } else {
        toast.error(result.error || 'Failed to request revisions')
      }
    } catch (error) {
      toast.error('An error occurred')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePublishPlan = async () => {
    setIsLoading(true)
    try {
      const result = await publishPlan(planId)
      if (result.success) {
        toast.success('Plan published')
        setShowPublishDialog(false)
        router.refresh()
      } else {
        toast.error(result.error || 'Failed to publish plan')
      }
    } catch (error) {
      toast.error('An error occurred')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  // Determine which actions to show
  const showSubmitButton = isOwner && currentStatus === 'draft'
  const showApproveButton = userRole === 'city_manager' && currentStatus === 'under_review'
  const showRejectButton = userRole === 'city_manager' && currentStatus === 'under_review'
  const showPublishButton =
    (userRole === 'city_manager' || userRole === 'admin') && currentStatus === 'approved'

  if (!showSubmitButton && !showApproveButton && !showRejectButton && !showPublishButton) {
    return null
  }

  return (
    <>
      <div className="flex items-center gap-2">
        {showSubmitButton && (
          <Button onClick={() => setShowSubmitDialog(true)} disabled={isLoading}>
            <Send className="mr-2 h-4 w-4" />
            Submit for Review
          </Button>
        )}

        {showApproveButton && (
          <Button onClick={() => setShowApproveDialog(true)} disabled={isLoading}>
            <CheckCircle className="mr-2 h-4 w-4" />
            Approve Plan
          </Button>
        )}

        {showRejectButton && (
          <Button
            variant="outline"
            onClick={() => setShowRejectDialog(true)}
            disabled={isLoading}
          >
            <XCircle className="mr-2 h-4 w-4" />
            Request Revisions
          </Button>
        )}

        {showPublishButton && (
          <Button onClick={() => setShowPublishDialog(true)} disabled={isLoading}>
            <FileCheck className="mr-2 h-4 w-4" />
            Publish Plan
          </Button>
        )}
      </div>

      {/* Submit for Review Dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Plan for Review?</AlertDialogTitle>
            <AlertDialogDescription>
              This will send the plan to the City Manager for review. You will be able to make
              changes if revisions are requested.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmitForReview} disabled={isLoading}>
              {isLoading ? 'Submitting...' : 'Submit for Review'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Approve Plan Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Plan</DialogTitle>
            <DialogDescription>
              This will approve the plan and allow it to move forward. You can add optional notes
              for the department.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Notes (Optional)</label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any comments or conditions..."
                rows={4}
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleApprovePlan} disabled={isLoading}>
              {isLoading ? 'Approving...' : 'Approve Plan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request Revisions Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Revisions</DialogTitle>
            <DialogDescription>
              This will return the plan to draft status. Please provide specific feedback on what
              needs to be revised.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">
                Feedback <span className="text-red-500">*</span>
              </label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Explain what needs to be revised..."
                rows={4}
                className="mt-1"
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleRequestRevisions} disabled={isLoading || !notes.trim()}>
              {isLoading ? 'Requesting...' : 'Request Revisions'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Publish Plan Dialog */}
      <AlertDialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Publish Plan?</AlertDialogTitle>
            <AlertDialogDescription>
              This will make the plan active and visible to the public (if configured). The plan
              will be marked as published.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handlePublishPlan} disabled={isLoading}>
              {isLoading ? 'Publishing...' : 'Publish Plan'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
