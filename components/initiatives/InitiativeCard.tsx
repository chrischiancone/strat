'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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
import { deleteInitiative, type Initiative } from '@/app/actions/initiatives'
import { useToast } from '@/hooks/use-toast'
import { ChevronDown, ChevronUp, Edit, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface InitiativeCardProps {
  initiative: Initiative
  onEdit: () => void
  onDelete: () => void
}

export function InitiativeCard({
  initiative,
  onEdit,
  onDelete,
}: InitiativeCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteInitiative(initiative.id)
      toast({
        title: 'Deleted',
        description: 'Initiative deleted successfully',
      })
      onDelete()
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to delete initiative',
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'NEED':
        return 'bg-red-100 text-red-800'
      case 'WANT':
        return 'bg-yellow-100 text-yellow-800'
      case 'NICE_TO_HAVE':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'not_started':
        return 'bg-gray-100 text-gray-800'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'at_risk':
        return 'bg-orange-100 text-orange-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'deferred':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatStatus = (status: string) => {
    return status
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const totalCost =
    initiative.total_year_1_cost +
    initiative.total_year_2_cost +
    initiative.total_year_3_cost

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Badge className={getPriorityBadgeColor(initiative.priority_level)}>
                  {initiative.priority_level}
                </Badge>
                <Badge className={getStatusBadgeColor(initiative.status)}>
                  {formatStatus(initiative.status)}
                </Badge>
                {initiative.rank_within_priority > 0 && (
                  <span className="text-xs text-gray-500">
                    Rank: {initiative.rank_within_priority}
                  </span>
                )}
              </div>
              <CardTitle className="text-base">
                {initiative.initiative_number}: {initiative.name}
              </CardTitle>
              <CardDescription className="mt-1">
                {initiative.responsible_party && (
                  <span>Responsible: {initiative.responsible_party}</span>
                )}
                {totalCost > 0 && (
                  <span className="ml-2">
                    • Total Cost: ${totalCost.toLocaleString()}
                  </span>
                )}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={onEdit}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        {isExpanded && (
          <CardContent className="space-y-4">
            {/* Description */}
            {initiative.description && (
              <div>
                <h4 className="font-semibold text-sm text-gray-700 mb-2">
                  Description
                </h4>
                <p className="text-sm text-gray-600">{initiative.description}</p>
              </div>
            )}

            {/* Rationale */}
            {initiative.rationale && (
              <div>
                <h4 className="font-semibold text-sm text-gray-700 mb-2">
                  Rationale
                </h4>
                <p className="text-sm text-gray-600">{initiative.rationale}</p>
              </div>
            )}

            {/* Expected Outcomes */}
            {initiative.expected_outcomes &&
              initiative.expected_outcomes.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm text-gray-700 mb-2">
                    Expected Outcomes
                  </h4>
                  <ul className="list-disc list-inside space-y-1">
                    {initiative.expected_outcomes.map((outcome, index) => (
                      <li key={index} className="text-sm text-gray-600">
                        {outcome}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
          </CardContent>
        )}
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Initiative?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{initiative.name}&quot;?
              <span className="block mt-2">This action cannot be undone.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Deleting...' : 'Delete Initiative'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
