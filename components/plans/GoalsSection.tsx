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
import { generateStrategicGoals, type StrategicGoalSuggestion } from '@/app/actions/ai-research'
import { Plus, Sparkles } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface GoalsSectionProps {
  planId: string
}

export function GoalsSection({ planId }: GoalsSectionProps) {
  const [goals, setGoals] = useState<StrategicGoal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingGoal, setEditingGoal] = useState<StrategicGoal | null>(null)
  const [isGeneratingGoals, setIsGeneratingGoals] = useState(false)
  const [showAiResults, setShowAiResults] = useState(false)
  const [aiSuggestions, setAiSuggestions] = useState<StrategicGoalSuggestion[]>([])
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

  const handleGenerateGoals = async () => {
    setIsGeneratingGoals(true)
    try {
      const suggestions = await generateStrategicGoals(planId)
      setAiSuggestions(suggestions)
      setShowAiResults(true)
      
      toast({
        title: 'AI Research Complete',
        description: `Generated ${suggestions.length} strategic goal suggestions`,
      })
    } catch (error) {
      console.error('AI goal generation error:', error)
      toast({
        title: 'AI Research Failed',
        description: error instanceof Error ? error.message : 'Failed to generate strategic goals',
        variant: 'destructive',
      })
    } finally {
      setIsGeneratingGoals(false)
    }
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
          <div className="flex gap-2">
            <Button
              onClick={handleGenerateGoals}
              disabled={isGeneratingGoals || isLoading}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              {isGeneratingGoals ? 'Generating...' : 'Research with AI'}
            </Button>
            <Button
              onClick={() => setShowCreateDialog(true)}
              disabled={!canAddGoal}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Goal
            </Button>
          </div>
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

      {/* AI Strategic Goals Results Dialog */}
      <Dialog open={showAiResults} onOpenChange={setShowAiResults}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              AI-Generated Strategic Goals
            </DialogTitle>
            <DialogDescription>
              Review AI-generated strategic goals based on your council goals, SWOT analysis, environmental scan, and benchmarking data.
            </DialogDescription>
          </DialogHeader>
          
          <StrategicGoalsAISelector
            suggestions={aiSuggestions}
            planId={planId}
            nextGoalNumber={nextGoalNumber}
            onSuccess={() => {
              setShowAiResults(false)
              setAiSuggestions([])
              loadGoals()
            }}
            onCancel={() => {
              setShowAiResults(false)
              setAiSuggestions([])
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}

// AI Strategic Goals Selector Component
interface StrategicGoalsAISelectorProps {
  suggestions: StrategicGoalSuggestion[]
  planId: string
  nextGoalNumber: number
  onSuccess: () => void
  onCancel: () => void
}

function StrategicGoalsAISelector({
  suggestions,
  planId,
  nextGoalNumber,
  onSuccess,
  onCancel,
}: StrategicGoalsAISelectorProps) {
  const [selectedGoals, setSelectedGoals] = useState<Set<number>>(new Set())
  const [isCreating, setIsCreating] = useState(false)
  const { toast } = useToast()

  const toggleSelection = (index: number) => {
    const newSelected = new Set(selectedGoals)
    if (newSelected.has(index)) {
      newSelected.delete(index)
    } else {
      newSelected.add(index)
    }
    setSelectedGoals(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedGoals.size === suggestions.length) {
      setSelectedGoals(new Set())
    } else {
      setSelectedGoals(new Set(suggestions.map((_, index) => index)))
    }
  }

  const handleCreateSelected = async () => {
    const selected = Array.from(selectedGoals)
      .map(index => suggestions[index])
      .filter(Boolean)

    if (selected.length === 0) return

    setIsCreating(true)
    try {
      // Import the createStrategicGoal function
      const { createStrategicGoal } = await import('@/app/actions/strategic-goals')
      
      // Create goals sequentially to ensure proper goal numbering
      for (let i = 0; i < selected.length; i++) {
        const goal = selected[i]
        const goalNumber = nextGoalNumber + i
        
        await createStrategicGoal({
          strategic_plan_id: planId,
          goal_number: goalNumber,
          title: goal.title,
          description: goal.description,
          city_priority_alignment: goal.city_priority_alignment || '',
          objectives: goal.objectives || [],
          success_measures: goal.success_measures || [],
        })
      }
      
      toast({
        title: 'Success',
        description: `Created ${selected.length} strategic goal${selected.length > 1 ? 's' : ''}`,
      })
      
      onSuccess()
    } catch (error) {
      console.error('Error creating strategic goals:', error)
      toast({
        title: 'Error',
        description: 'Failed to create strategic goals',
        variant: 'destructive',
      })
    } finally {
      setIsCreating(false)
    }
  }

  if (suggestions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No strategic goals generated. Please try again.</p>
        <Button onClick={onCancel} className="mt-4">
          Close
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {suggestions.length} strategic goal suggestion{suggestions.length > 1 ? 's' : ''} generated
        </p>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleSelectAll}
        >
          {selectedGoals.size === suggestions.length ? 'Deselect All' : 'Select All'}
        </Button>
      </div>

      <div className="space-y-6 max-h-96 overflow-y-auto">
        {suggestions.map((suggestion, index) => (
          <div
            key={index}
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              selectedGoals.has(index)
                ? 'bg-purple-50 border-purple-200 shadow-sm'
                : 'bg-white border-gray-200 hover:bg-gray-50'
            }`}
            onClick={() => toggleSelection(index)}
          >
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={selectedGoals.has(index)}
                onChange={() => toggleSelection(index)}
                className="mt-1 accent-purple-500"
              />
              <div className="flex-1 space-y-3">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">
                    Goal {nextGoalNumber + index}: {suggestion.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {suggestion.description}
                  </p>
                </div>
                
                {suggestion.city_priority_alignment && (
                  <div>
                    <h4 className="font-medium text-sm text-purple-700">City Priority Alignment:</h4>
                    <p className="text-sm text-gray-600">{suggestion.city_priority_alignment}</p>
                  </div>
                )}
                
                <div className="grid md:grid-cols-2 gap-4">
                  {suggestion.objectives && suggestion.objectives.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm text-blue-700">Objectives:</h4>
                      <ul className="text-xs text-gray-600 mt-1 list-disc list-inside space-y-1">
                        {suggestion.objectives.slice(0, 3).map((obj, i) => (
                          <li key={i}>{obj}</li>
                        ))}
                        {suggestion.objectives.length > 3 && (
                          <li className="text-gray-400">+{suggestion.objectives.length - 3} more...</li>
                        )}
                      </ul>
                    </div>
                  )}
                  
                  {suggestion.success_measures && suggestion.success_measures.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm text-green-700">Success Measures:</h4>
                      <ul className="text-xs text-gray-600 mt-1 list-disc list-inside space-y-1">
                        {suggestion.success_measures.slice(0, 3).map((measure, i) => (
                          <li key={i}>{measure}</li>
                        ))}
                        {suggestion.success_measures.length > 3 && (
                          <li className="text-gray-400">+{suggestion.success_measures.length - 3} more...</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
                
                {suggestion.rationale && (
                  <div>
                    <h4 className="font-medium text-sm text-orange-700">Rationale:</h4>
                    <p className="text-xs text-gray-600 mt-1">{suggestion.rationale}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-4 border-t">
        <p className="text-sm text-muted-foreground">
          {selectedGoals.size} goal{selectedGoals.size !== 1 ? 's' : ''} selected
        </p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel} disabled={isCreating}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreateSelected}
            disabled={selectedGoals.size === 0 || isCreating}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isCreating ? 'Creating...' : `Create ${selectedGoals.size} Selected Goal${selectedGoals.size !== 1 ? 's' : ''}`}
          </Button>
        </div>
      </div>
    </div>
  )
}
