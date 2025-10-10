'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deactivateUser, reactivateUser } from '@/app/actions/users'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface UserActionsMenuProps {
  userId: string
  userName: string
  userEmail: string
  isActive: boolean
}

export function UserActionsMenu({
  userId,
  userName,
  userEmail,
  isActive,
}: UserActionsMenuProps) {
  const router = useRouter()
  const [isDeactivateDialogOpen, setIsDeactivateDialogOpen] = useState(false)
  const [isReactivateDialogOpen, setIsReactivateDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDeactivate = async () => {
    setIsSubmitting(true)
    setError(null)

    try {
      const result = await deactivateUser(userId)

      if (result.error) {
        setError(result.error)
        setIsSubmitting(false)
        return
      }

      setIsDeactivateDialogOpen(false)
      setIsSubmitting(false)
      router.refresh()
    } catch {
      setError('An unexpected error occurred')
      setIsSubmitting(false)
    }
  }

  const handleReactivate = async () => {
    setIsSubmitting(true)
    setError(null)

    try {
      const result = await reactivateUser(userId)

      if (result.error) {
        setError(result.error)
        setIsSubmitting(false)
        return
      }

      setIsReactivateDialogOpen(false)
      setIsSubmitting(false)
      router.refresh()
    } catch {
      setError('An unexpected error occurred')
      setIsSubmitting(false)
    }
  }

  return (
    <>
      {isActive ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsDeactivateDialogOpen(true)}
          className="text-red-600 hover:text-red-700"
        >
          Deactivate
        </Button>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsReactivateDialogOpen(true)}
          className="text-green-600 hover:text-green-700"
        >
          Reactivate
        </Button>
      )}

      {/* Deactivate Confirmation Dialog */}
      <Dialog open={isDeactivateDialogOpen} onOpenChange={setIsDeactivateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deactivate User?</DialogTitle>
            <DialogDescription>
              Are you sure you want to deactivate{' '}
              <strong>{userName}</strong> ({userEmail})?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600">
              This user will not be able to log in until reactivated. Their data
              and historical records will remain intact.
            </p>
          </div>
          {error && (
            <div className="rounded-md bg-red-50 p-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeactivateDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeactivate}
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? 'Deactivating...' : 'Deactivate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reactivate Confirmation Dialog */}
      <Dialog open={isReactivateDialogOpen} onOpenChange={setIsReactivateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reactivate User?</DialogTitle>
            <DialogDescription>
              Are you sure you want to reactivate{' '}
              <strong>{userName}</strong> ({userEmail})?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600">
              This user will be able to log in and access the system again.
            </p>
          </div>
          {error && (
            <div className="rounded-md bg-red-50 p-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsReactivateDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleReactivate}
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? 'Reactivating...' : 'Reactivate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
