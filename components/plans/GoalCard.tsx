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
import { deleteStrategicGoal, type StrategicGoal } from '@/app/actions/strategic-goals'
import { useToast } from '@/hooks/use-toast'
import { ChevronDown, ChevronUp, Edit, Trash2, GripVertical } from 'lucide-react'

interface GoalCardProps {
  goal: StrategicGoal
  onEdit: () => void
  onDelete: () => void
  onMoveUp?: () => void
  onMoveDown?: () => void
  isFirst?: boolean
  isLast?: boolean
}

export function GoalCard({
  goal,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: GoalCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteStrategicGoal(goal.id)
      setShowDeleteDialog(false)
      toast({
        title: 'Deleted',
        description: 'Goal deleted successfully',
      })
      // Call onDelete after successful deletion to refresh the list
      onDelete()
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to delete goal',
        variant: 'destructive',
      })
      setShowDeleteDialog(false)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <GripVertical className="h-5 w-5 text-gray-400 mt-1 cursor-move" />
              <div className="flex-1">
                <CardTitle className="text-lg">
                  Goal {goal.goal_number}: {goal.title}
                </CardTitle>
                <CardDescription className="mt-1">
                  {goal.city_priority_alignment}
                  {goal.initiative_count !== undefined && (
                    <span className="ml-2">
                      • {goal.initiative_count} initiative
                      {goal.initiative_count !== 1 ? 's' : ''}
                    </span>
                  )}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {onMoveUp && !isFirst && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onMoveUp}
                  title="Move up"
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
              )}
              {onMoveDown && !isLast && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onMoveDown}
                  title="Move down"
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              )}
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
            <div>
              <h4 className="font-semibold text-sm text-gray-700 mb-2">
                Description
              </h4>
              <p className="text-sm text-gray-600">{goal.description}</p>
            </div>

            {/* SMART Objectives */}
            {goal.objectives && goal.objectives.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm text-gray-700 mb-2">
                  SMART Objectives
                </h4>
                <ul className="list-disc list-inside space-y-1">
                  {goal.objectives.map((objective, index) => (
                    <li key={index} className="text-sm text-gray-600">
                      {objective}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Success Measures */}
            {goal.success_measures && goal.success_measures.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm text-gray-700 mb-2">
                  Success Measures
                </h4>
                <ul className="list-disc list-inside space-y-1">
                  {goal.success_measures.map((measure, index) => (
                    <li key={index} className="text-sm text-gray-600">
                      {measure}
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
            <AlertDialogTitle>Delete Goal?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{goal.title}&quot;?
              {goal.initiative_count && goal.initiative_count > 0 ? (
                <span className="block mt-2 text-red-600 font-semibold">
                  Warning: This goal has {goal.initiative_count} initiative
                  {goal.initiative_count !== 1 ? 's' : ''}. You must delete or
                  reassign {goal.initiative_count !== 1 ? 'them' : 'it'} before
                  deleting this goal.
                </span>
              ) : (
                <span className="block mt-2">
                  This action cannot be undone.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={
                isDeleting ||
                (goal.initiative_count !== undefined && goal.initiative_count > 0)
              }
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Deleting...' : 'Delete Goal'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
