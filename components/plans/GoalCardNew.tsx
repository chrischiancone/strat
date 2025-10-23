'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
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
import {
  getStrategicObjectives,
  type StrategicObjective,
} from '@/app/actions/strategic-objectives'
import {
  getStrategicDeliverables,
  type StrategicDeliverable,
} from '@/app/actions/strategic-deliverables'
import { useToast } from '@/hooks/use-toast'
import { 
  ChevronDown, 
  ChevronUp, 
  Edit, 
  Trash2, 
  GripVertical, 
  Target,
  CheckCircle2,
  Circle,
  Clock,
  XCircle
} from 'lucide-react'
import { format } from 'date-fns'

interface ObjectiveWithDeliverables extends StrategicObjective {
  deliverables: StrategicDeliverable[]
}

interface GoalCardNewProps {
  goal: StrategicGoal
  onEdit: () => void
  onDelete: () => void
  onMoveUp?: () => void
  onMoveDown?: () => void
  isFirst?: boolean
  isLast?: boolean
}

export function GoalCardNew({
  goal,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: GoalCardNewProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [objectives, setObjectives] = useState<ObjectiveWithDeliverables[]>([])
  const [isLoadingObjectives, setIsLoadingObjectives] = useState(false)
  const { toast } = useToast()

  // Load objectives and deliverables when expanded
  useEffect(() => {
    if (isExpanded && objectives.length === 0) {
      loadObjectivesWithDeliverables()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isExpanded])

  const loadObjectivesWithDeliverables = async () => {
    setIsLoadingObjectives(true)
    try {
      const objs = await getStrategicObjectives(goal.id)
      
      // Load deliverables for each objective
      const objsWithDeliverables = await Promise.all(
        objs.map(async (obj) => {
          const deliverables = await getStrategicDeliverables(obj.id)
          return {
            ...obj,
            deliverables,
          }
        })
      )
      
      setObjectives(objsWithDeliverables)
    } catch (error) {
      console.error('Error loading objectives:', error)
      toast({
        title: 'Error',
        description: 'Failed to load objectives and deliverables',
        variant: 'destructive',
      })
    } finally {
      setIsLoadingObjectives(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteStrategicGoal(goal.id)
      setShowDeleteDialog(false)
      toast({
        title: 'Deleted',
        description: 'Goal deleted successfully',
      })
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-600" />
      case 'deferred':
        return <XCircle className="h-4 w-4 text-gray-400" />
      default:
        return <Circle className="h-4 w-4 text-gray-300" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-700 bg-green-50'
      case 'in_progress':
        return 'text-blue-700 bg-blue-50'
      case 'deferred':
        return 'text-gray-700 bg-gray-50'
      default:
        return 'text-gray-600 bg-gray-50'
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
                  G{goal.goal_number}: {goal.title}
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

            {/* Objectives and Deliverables */}
            <div className="border-t pt-4">
              <div className="flex items-center gap-2 mb-3">
                <Target className="h-4 w-4 text-blue-600" />
                <h4 className="font-semibold text-sm text-gray-700">
                  Objectives & Deliverables
                </h4>
              </div>
              
              {isLoadingObjectives ? (
                <div className="text-sm text-gray-500 py-4">
                  Loading objectives...
                </div>
              ) : objectives.length === 0 ? (
                <div className="text-sm text-gray-500 py-4 text-center border border-dashed border-gray-300 rounded-lg">
                  No objectives defined yet
                </div>
              ) : (
                <div className="space-y-4">
                  {objectives.map((objective) => (
                    <div
                      key={objective.id}
                      className="rounded-lg border border-blue-200 bg-blue-50 p-4"
                    >
                      {/* Objective Header */}
                      <div className="flex items-start gap-2 mb-3">
                        <div className="flex-1">
                          <div className="font-semibold text-sm text-blue-900">
                            {objective.objective_number}: {objective.title}
                          </div>
                          {objective.description && (
                            <p className="text-xs text-blue-700 mt-1">
                              {objective.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Deliverables */}
                      {objective.deliverables.length > 0 && (
                        <div className="pl-4 space-y-2">
                          {objective.deliverables.map((deliverable) => (
                            <div
                              key={deliverable.id}
                              className="rounded-md border border-green-200 bg-white p-3"
                            >
                              <div className="flex items-start gap-2">
                                {getStatusIcon(deliverable.status)}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-medium text-sm text-gray-900">
                                      {deliverable.deliverable_number}:
                                    </span>
                                    <span className="text-sm text-gray-700">
                                      {deliverable.title}
                                    </span>
                                    <span
                                      className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(
                                        deliverable.status
                                      )}`}
                                    >
                                      {deliverable.status.replace('_', ' ')}
                                    </span>
                                  </div>
                                  {deliverable.description && (
                                    <p className="text-xs text-gray-600 mt-1">
                                      {deliverable.description}
                                    </p>
                                  )}
                                  {deliverable.target_date && (
                                    <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                                      <Clock className="h-3 w-3" />
                                      Target:{' '}
                                      {format(
                                        new Date(deliverable.target_date),
                                        'MMM d, yyyy'
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add Initiative under Objective */}
                      <div className="mt-3 flex justify-end">
                        <Link
                          href={`/plans/${goal.strategic_plan_id}/initiatives/new?goalId=${goal.id}&objectiveId=${objective.id}`}
                        >
                          <Button size="sm" variant="outline">
                            + Add Initiative
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Legacy fields for backward compatibility */}
            {goal.objectives && goal.objectives.length > 0 && objectives.length === 0 && (
              <div className="border-t pt-4">
                <h4 className="font-semibold text-sm text-gray-700 mb-2">
                  Legacy SMART Objectives
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

            {goal.success_measures && goal.success_measures.length > 0 && objectives.length === 0 && (
              <div>
                <h4 className="font-semibold text-sm text-gray-700 mb-2">
                  Legacy Success Measures
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
              ) : objectives.length > 0 ? (
                <span className="block mt-2 text-orange-600 font-semibold">
                  Warning: This goal has {objectives.length} objective
                  {objectives.length !== 1 ? 's' : ''} with deliverables. All
                  objectives and deliverables will also be deleted.
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
