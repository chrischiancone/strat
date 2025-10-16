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
import { InitiativeCard } from './InitiativeCard'
import { InitiativeForm } from './InitiativeForm'
import {
  getInitiatives,
  type Initiative,
  type PriorityLevel,
} from '@/app/actions/initiatives'
import { getStrategicGoals, type StrategicGoal } from '@/app/actions/strategic-goals'
import { Plus, RefreshCw } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface InitiativesSectionProps {
  planId: string
  departmentId: string
  fiscalYearId: string
}

export function InitiativesSection({
  planId,
  departmentId,
  fiscalYearId,
}: InitiativesSectionProps) {
  const [goals, setGoals] = useState<StrategicGoal[]>([])
  const [initiatives, setInitiatives] = useState<Initiative[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState<StrategicGoal | null>(null)
  const [editingInitiative, setEditingInitiative] = useState<Initiative | null>(
    null
  )
  const { toast } = useToast()

  const loadData = async () => {
    try {
      console.log('InitiativesSection: Loading data for planId:', planId)
      const [goalsData, initiativesData] = await Promise.all([
        getStrategicGoals(planId),
        getInitiatives(planId),
      ])
      console.log('InitiativesSection: Goals data received:', goalsData)
      console.log('InitiativesSection: Initiatives data received:', initiativesData)
      setGoals(goalsData)
      setInitiatives(initiativesData)
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to load data',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Add a small delay to ensure goals have been loaded first
    const timer = setTimeout(() => {
      loadData()
    }, 100)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planId])

  const handleAddInitiative = (goal: StrategicGoal) => {
    setSelectedGoal(goal)
    setShowCreateDialog(true)
  }

  const handleCreateSuccess = () => {
    setShowCreateDialog(false)
    setSelectedGoal(null)
    loadData()
  }

  const handleEditSuccess = () => {
    setEditingInitiative(null)
    loadData()
  }

  const handleDelete = () => {
    loadData()
  }

  const getInitiativesByGoalAndPriority = (
    goalId: string,
    priority: PriorityLevel
  ) => {
    return initiatives.filter(
      (i) => i.strategic_goal_id === goalId && i.priority_level === priority
    )
  }

  const suggestInitiativeNumber = (goalNumber: number) => {
    const goalInitiatives = initiatives.filter(
      (i) => i.initiative_number.startsWith(`${goalNumber}.`)
    )
    if (goalInitiatives.length === 0) {
      return `${goalNumber}.1`
    }
    const numbers = goalInitiatives
      .map((i) => {
        const parts = i.initiative_number.split('.')
        return parts.length === 2 ? parseInt(parts[1]) : 0
      })
      .filter((n) => !isNaN(n))
    const maxNumber = Math.max(...numbers)
    return `${goalNumber}.${maxNumber + 1}`
  }

  if (isLoading) {
    return (
      <div className="space-y-6 rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Initiatives</h2>
        </div>
        <div className="text-center text-sm text-gray-500">
          Loading initiatives...
        </div>
      </div>
    )
  }

  if (goals.length === 0) {
    console.log('InitiativesSection: No goals found, showing empty state. Goals array:', goals)
    return (
      <div className="space-y-6 rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Initiatives</h2>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              setIsLoading(true)
              loadData()
            }}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
          <p className="text-sm text-gray-600">
            No goals defined yet. Create goals first before adding initiatives.
          </p>
        </div>
      </div>
    )
  }

  console.log('InitiativesSection: Rendering initiatives section with goals:', goals.length)
  return (
    <>
      <div className="space-y-6 rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Initiatives</h2>
            <p className="mt-1 text-sm text-gray-500">
              Create initiatives under each goal
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {goals.map((goal) => {
            const needsInitiatives = getInitiativesByGoalAndPriority(
              goal.id,
              'NEED'
            )
            const wantsInitiatives = getInitiativesByGoalAndPriority(
              goal.id,
              'WANT'
            )
            const niceToHaveInitiatives = getInitiativesByGoalAndPriority(
              goal.id,
              'NICE_TO_HAVE'
            )
            const totalInitiatives =
              needsInitiatives.length +
              wantsInitiatives.length +
              niceToHaveInitiatives.length

            return (
              <div
                key={goal.id}
                className="rounded-lg border border-gray-200 bg-gray-50 p-4"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">
                    Goal {goal.goal_number}: {goal.title}
                  </h3>
                  <Button
                    size="sm"
                    onClick={() => handleAddInitiative(goal)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Initiative
                  </Button>
                </div>

                {totalInitiatives === 0 ? (
                  <div className="rounded-md border border-dashed border-gray-300 bg-white p-4 text-center">
                    <p className="text-sm text-gray-500">
                      No initiatives yet. Click &quot;Add Initiative&quot; to
                      create one.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* NEEDS */}
                    {needsInitiatives.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-red-700 mb-2">
                          📌 NEEDS ({needsInitiatives.length})
                        </h4>
                        <div className="space-y-2">
                          {needsInitiatives.map((initiative) => (
                            <InitiativeCard
                              key={initiative.id}
                              initiative={initiative}
                              fiscalYearId={fiscalYearId}
                              onEdit={() => setEditingInitiative(initiative)}
                              onDelete={handleDelete}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* WANTS */}
                    {wantsInitiatives.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-yellow-700 mb-2">
                          💡 WANTS ({wantsInitiatives.length})
                        </h4>
                        <div className="space-y-2">
                          {wantsInitiatives.map((initiative) => (
                            <InitiativeCard
                              key={initiative.id}
                              initiative={initiative}
                              fiscalYearId={fiscalYearId}
                              onEdit={() => setEditingInitiative(initiative)}
                              onDelete={handleDelete}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* NICE TO HAVES */}
                    {niceToHaveInitiatives.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-green-700 mb-2">
                          ⭐ NICE TO HAVES ({niceToHaveInitiatives.length})
                        </h4>
                        <div className="space-y-2">
                          {niceToHaveInitiatives.map((initiative) => (
                            <InitiativeCard
                              key={initiative.id}
                              initiative={initiative}
                              fiscalYearId={fiscalYearId}
                              onEdit={() => setEditingInitiative(initiative)}
                              onDelete={handleDelete}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Create Initiative Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Initiative</DialogTitle>
            <DialogDescription>
              Create a new initiative under this goal
            </DialogDescription>
          </DialogHeader>
          {selectedGoal && (
            <InitiativeForm
              goalId={selectedGoal.id}
              goalNumber={selectedGoal.goal_number}
              goalTitle={selectedGoal.title}
              departmentId={departmentId}
              fiscalYearId={fiscalYearId}
              suggestedNumber={suggestInitiativeNumber(selectedGoal.goal_number)}
              onSuccess={handleCreateSuccess}
              onCancel={() => {
                setShowCreateDialog(false)
                setSelectedGoal(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Initiative Dialog */}
      <Dialog
        open={!!editingInitiative}
        onOpenChange={() => setEditingInitiative(null)}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Initiative</DialogTitle>
            <DialogDescription>Update initiative information</DialogDescription>
          </DialogHeader>
          {editingInitiative && (
            <InitiativeForm
              goalId={editingInitiative.strategic_goal_id}
              goalNumber={editingInitiative.goal?.goal_number || 0}
              goalTitle={editingInitiative.goal?.title || ''}
              departmentId={departmentId}
              fiscalYearId={fiscalYearId}
              initiative={editingInitiative}
              onSuccess={handleEditSuccess}
              onCancel={() => setEditingInitiative(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
