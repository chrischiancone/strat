'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { GoalCard } from './GoalCard'
import { GoalForm } from './GoalForm'
import {
  getStrategicGoals,
  reorderStrategicGoals,
  type StrategicGoal,
} from '@/app/actions/strategic-goals'
import { Plus } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface GoalsSectionProps {
  planId: string
}

export function GoalsSection({ planId }: GoalsSectionProps) {
  const [goals, setGoals] = useState<StrategicGoal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingGoal, setEditingGoal] = useState<StrategicGoal | null>(null)
  const { toast } = useToast()

  const loadGoals = async () => {
    try {
      const data = await getStrategicGoals(planId)
      setGoals(data)
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to load goals',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadGoals()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planId])

  const handleCreateSuccess = () => {
    setShowCreateDialog(false)
    loadGoals()
  }

  const handleEditSuccess = () => {
    setEditingGoal(null)
    loadGoals()
  }

  const handleDelete = () => {
    loadGoals()
  }

  const handleMoveUp = async (index: number) => {
    if (index === 0) return

    const newGoals = [...goals]
    const temp = newGoals[index]
    newGoals[index] = newGoals[index - 1]
    newGoals[index - 1] = temp

    // Optimistically update UI
    setGoals(newGoals)

    try {
      await reorderStrategicGoals(
        planId,
        newGoals.map((g) => g.id)
      )
      toast({
        title: 'Reordered',
        description: 'Goals reordered successfully',
      })
    } catch {
      // Revert on error
      loadGoals()
      toast({
        title: 'Error',
        description: 'Failed to reorder goals',
        variant: 'destructive',
      })
    }
  }

  const handleMoveDown = async (index: number) => {
    if (index === goals.length - 1) return

    const newGoals = [...goals]
    const temp = newGoals[index]
    newGoals[index] = newGoals[index + 1]
    newGoals[index + 1] = temp

    // Optimistically update UI
    setGoals(newGoals)

    try {
      await reorderStrategicGoals(
        planId,
        newGoals.map((g) => g.id)
      )
      toast({
        title: 'Reordered',
        description: 'Goals reordered successfully',
      })
    } catch {
      // Revert on error
      loadGoals()
      toast({
        title: 'Error',
        description: 'Failed to reorder goals',
        variant: 'destructive',
      })
    }
  }

  // Calculate next goal number
  const nextGoalNumber =
    goals.length > 0 ? Math.max(...goals.map((g) => g.goal_number)) + 1 : 1

  // Check if max goals reached
  const canAddGoal = goals.length < 5

  if (isLoading) {
    return (
      <div className="space-y-6 rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Strategic Goals
          </h2>
        </div>
        <div className="text-center text-sm text-gray-500">Loading goals...</div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6 rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Strategic Goals
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Define 3-5 strategic goals aligned with city priorities
            </p>
          </div>
          <Button
            onClick={() => setShowCreateDialog(true)}
            disabled={!canAddGoal}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Goal
          </Button>
        </div>

        {!canAddGoal && (
          <div className="rounded-md bg-yellow-50 border border-yellow-200 p-3">
            <p className="text-sm text-yellow-800">
              Maximum of 5 goals reached. Delete a goal to add another.
            </p>
          </div>
        )}

        {goals.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
            <p className="text-sm text-gray-600">
              No goals defined yet. Click &quot;Add Goal&quot; to create your first
              strategic goal.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {goals.map((goal, index) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onEdit={() => setEditingGoal(goal)}
                onDelete={handleDelete}
                onMoveUp={() => handleMoveUp(index)}
                onMoveDown={() => handleMoveDown(index)}
                isFirst={index === 0}
                isLast={index === goals.length - 1}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Goal Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Strategic Goal</DialogTitle>
            <DialogDescription>
              Create a new strategic goal for this plan
            </DialogDescription>
          </DialogHeader>
          <GoalForm
            planId={planId}
            nextGoalNumber={nextGoalNumber}
            onSuccess={handleCreateSuccess}
            onCancel={() => setShowCreateDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Goal Dialog */}
      <Dialog open={!!editingGoal} onOpenChange={() => setEditingGoal(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Strategic Goal</DialogTitle>
            <DialogDescription>
              Update goal information
            </DialogDescription>
          </DialogHeader>
          {editingGoal && (
            <GoalForm
              planId={planId}
              goal={editingGoal}
              onSuccess={handleEditSuccess}
              onCancel={() => setEditingGoal(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
