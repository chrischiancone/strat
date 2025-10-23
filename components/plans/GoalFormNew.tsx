'use client'

import { useState, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  createStrategicGoal,
  updateStrategicGoal,
  type StrategicGoal,
} from '@/app/actions/strategic-goals'
import {
  createStrategicObjective,
  type StrategicObjective,
} from '@/app/actions/strategic-objectives'
import {
  createStrategicDeliverable,
} from '@/app/actions/strategic-deliverables'
import { CITY_PRIORITIES } from '@/lib/constants/strategic-planning'
import { useToast } from '@/hooks/use-toast'
import { X, Plus, ChevronDown, ChevronRight } from 'lucide-react'

interface ObjectiveInput {
  objective_number: string
  title: string
  description: string
  deliverables: DeliverableInput[]
  isExpanded: boolean
}

interface DeliverableInput {
  deliverable_number: string
  title: string
  description: string
  target_date: string
}

interface GoalFormNewProps {
  planId: string
  goal?: StrategicGoal & { strategic_objectives?: StrategicObjective[] }
  nextGoalNumber?: number
  onSuccess?: () => void
  onCancel?: () => void
}

export function GoalFormNew({
  planId,
  goal,
  nextGoalNumber = 1,
  onSuccess,
  onCancel,
}: GoalFormNewProps) {
  const [goalNumber, setGoalNumber] = useState(
    goal?.goal_number?.toString() || nextGoalNumber.toString()
  )
  const [title, setTitle] = useState(goal?.title || '')
  const [description, setDescription] = useState(goal?.description || '')
  const [cityPriority, setCityPriority] = useState(
    goal?.city_priority_alignment || ''
  )
  const [objectives, setObjectives] = useState<ObjectiveInput[]>([
    {
      objective_number: 'O1',
      title: '',
      description: '',
      deliverables: [
        {
          deliverable_number: 'D1',
          title: '',
          description: '',
          target_date: '',
        },
      ],
      isExpanded: true,
    },
  ])
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  // Load existing objectives/deliverables when editing
  useEffect(() => {
    const loadExisting = async () => {
      if (!goal) return
      try {
        const [{ getStrategicObjectives }, { getStrategicDeliverables }] = await Promise.all([
          import('@/app/actions/strategic-objectives'),
          import('@/app/actions/strategic-deliverables'),
        ])
        const objs = await getStrategicObjectives(goal.id)
        const results: ObjectiveInput[] = []
        for (const obj of objs) {
          const dels = await getStrategicDeliverables(obj.id)
          results.push({
            objective_number: obj.objective_number,
            title: obj.title,
            description: obj.description || '',
            deliverables: (dels || []).map((d) => ({
              deliverable_number: d.deliverable_number,
              title: d.title,
              description: d.description || '',
              target_date: d.target_date ? String(d.target_date).slice(0, 10) : '',
            })),
            isExpanded: true,
          })
        }
        if (results.length > 0) setObjectives(results)
      } catch (e) {
        console.error('Failed to load existing goal items:', e)
      }
    }
    loadExisting()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goal?.id])

  const handleAddObjective = () => {
    const nextObjNumber = `O${objectives.length + 1}`
    setObjectives([
      ...objectives,
      {
        objective_number: nextObjNumber,
        title: '',
        description: '',
        deliverables: [
          {
            deliverable_number: 'D1',
            title: '',
            description: '',
            target_date: '',
          },
        ],
        isExpanded: true,
      },
    ])
  }

  const handleRemoveObjective = (index: number) => {
    setObjectives(objectives.filter((_, i) => i !== index))
  }

  const handleObjectiveChange = (
    index: number,
    field: keyof Omit<ObjectiveInput, 'deliverables' | 'isExpanded'>,
    value: string
  ) => {
    const newObjectives = [...objectives]
    newObjectives[index] = { ...newObjectives[index], [field]: value }
    setObjectives(newObjectives)
  }

  const toggleObjectiveExpansion = (index: number) => {
    const newObjectives = [...objectives]
    newObjectives[index].isExpanded = !newObjectives[index].isExpanded
    setObjectives(newObjectives)
  }

  const handleAddDeliverable = (objectiveIndex: number) => {
    const newObjectives = [...objectives]
    const nextDelNumber = `D${newObjectives[objectiveIndex].deliverables.length + 1}`
    newObjectives[objectiveIndex].deliverables.push({
      deliverable_number: nextDelNumber,
      title: '',
      description: '',
      target_date: '',
    })
    setObjectives(newObjectives)
  }

  const handleRemoveDeliverable = (
    objectiveIndex: number,
    deliverableIndex: number
  ) => {
    const newObjectives = [...objectives]
    newObjectives[objectiveIndex].deliverables = newObjectives[
      objectiveIndex
    ].deliverables.filter((_, i) => i !== deliverableIndex)
    setObjectives(newObjectives)
  }

  const handleDeliverableChange = (
    objectiveIndex: number,
    deliverableIndex: number,
    field: keyof DeliverableInput,
    value: string
  ) => {
    const newObjectives = [...objectives]
    newObjectives[objectiveIndex].deliverables[deliverableIndex] = {
      ...newObjectives[objectiveIndex].deliverables[deliverableIndex],
      [field]: value,
    }
    setObjectives(newObjectives)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      // Validation
      if (!title.trim()) {
        toast({
          title: 'Validation Error',
          description: 'Goal title is required',
          variant: 'destructive',
        })
        setIsSaving(false)
        return
      }

      if (!description.trim()) {
        toast({
          title: 'Validation Error',
          description: 'Goal description is required',
          variant: 'destructive',
        })
        setIsSaving(false)
        return
      }

      if (!cityPriority) {
        toast({
          title: 'Validation Error',
          description: 'City priority alignment is required',
          variant: 'destructive',
        })
        setIsSaving(false)
        return
      }

      // Filter valid objectives (those with titles)
      const validObjectives = objectives.filter((obj) => obj.title.trim() !== '')

      if (validObjectives.length === 0) {
        toast({
          title: 'Validation Error',
          description: 'At least one objective is required',
          variant: 'destructive',
        })
        setIsSaving(false)
        return
      }

      // Validate that each objective has at least one deliverable
      for (const obj of validObjectives) {
        const validDeliverables = obj.deliverables.filter(
          (d) => d.title.trim() !== ''
        )
        if (validDeliverables.length === 0) {
          toast({
            title: 'Validation Error',
            description: `Objective "${obj.title}" must have at least one deliverable`,
            variant: 'destructive',
          })
          setIsSaving(false)
          return
        }
      }

      let goalId: string

      if (goal) {
        // Update existing goal core fields
        await updateStrategicGoal({
          id: goal.id,
          goal_number: parseInt(goalNumber),
          title: title.trim(),
          description: description.trim(),
          city_priority_alignment: cityPriority,
          objectives: [], // Legacy field
          success_measures: [], // Legacy field
        })
        goalId = goal.id

        // Build payload and upsert children atomically
        const payload = validObjectives.map((o, idx) => ({
          objective_number: o.objective_number || `O${idx + 1}`,
          title: o.title.trim(),
          description: (o.description || '').trim(),
          deliverables: o.deliverables
            .filter((d) => d.title.trim() !== '')
            .map((d, jdx) => ({
              deliverable_number: d.deliverable_number || `D${jdx + 1}`,
              title: d.title.trim(),
              description: (d.description || '').trim(),
              target_date: d.target_date || undefined,
            })),
        }))

        const { upsertGoalChildrenDeep } = await import('@/app/actions/strategic-goals')
        await upsertGoalChildrenDeep({
          goal_id: goalId,
          objectives: payload,
          delete_missing: false,
        })

        toast({
          title: 'Saved',
          description: 'Goal and items updated successfully',
        })
      } else {
        // Create new goal
        // Build payload for deep create
        const payload = validObjectives.map((o, idx) => ({
          objective_number: o.objective_number || `O${idx + 1}`,
          title: o.title.trim(),
          description: (o.description || '').trim(),
          deliverables: o.deliverables
            .filter((d) => d.title.trim() !== '')
            .map((d, jdx) => ({
              deliverable_number: d.deliverable_number || `D${jdx + 1}`,
              title: d.title.trim(),
              description: (d.description || '').trim(),
              target_date: d.target_date || undefined,
            })),
        }))

        // Use transactional deep create RPC
        const { createStrategicGoalDeep } = await import('@/app/actions/strategic-goals')
        const result = await createStrategicGoalDeep({
          strategic_plan_id: planId,
          goal_number: parseInt(goalNumber),
          title: title.trim(),
          description: description.trim(),
          city_priority_alignment: cityPriority,
          objectives: payload,
        })
        goalId = result.id

        toast({
          title: 'Created',
          description: 'Goal created successfully with objectives and deliverables',
        })
      }

      onSuccess?.()
    } catch (error) {
      console.error('Error saving goal:', error)
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to save goal',
        variant: 'destructive',
      })
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Goal Number */}
      <div>
        <Label htmlFor="goal_number">Goal Number *</Label>
        <Input
          id="goal_number"
          type="number"
          min="1"
          max="5"
          value={goalNumber}
          onChange={(e) => setGoalNumber(e.target.value)}
          disabled={isSaving}
          className="mt-1"
          required
        />
        <p className="mt-1 text-sm text-gray-500">
          Unique number for this goal (1-5)
        </p>
      </div>

      {/* Title */}
      <div>
        <Label htmlFor="title">Goal Title *</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isSaving}
          placeholder="e.g., Achieve operational efficiency by leveraging technology"
          className="mt-1"
          required
        />
      </div>

      {/* City Priority Alignment */}
      <div>
        <Label htmlFor="city_priority">City Priority Alignment *</Label>
        <Select
          value={cityPriority}
          onValueChange={setCityPriority}
          disabled={isSaving}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select city priority" />
          </SelectTrigger>
          <SelectContent>
            {CITY_PRIORITIES.map((priority) => (
              <SelectItem key={priority} value={priority}>
                {priority}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isSaving}
          placeholder="Describe this strategic goal..."
          rows={3}
          className="mt-1"
          required
        />
      </div>

      {/* Objectives Section */}
      <div className="space-y-4 border-t pt-4">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base">Objectives *</Label>
            <p className="mt-1 text-sm text-gray-500">
              Define objectives (O1, O2, etc.) with their deliverables
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddObjective}
            disabled={isSaving}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Objective
          </Button>
        </div>

        <div className="space-y-4">
          {objectives.map((objective, objIndex) => (
            <div
              key={objIndex}
              className="rounded-lg border border-blue-200 bg-blue-50 p-4"
            >
              <div className="flex items-start gap-2">
                <button
                  type="button"
                  onClick={() => toggleObjectiveExpansion(objIndex)}
                  className="mt-2 text-blue-600 hover:text-blue-800"
                >
                  {objective.isExpanded ? (
                    <ChevronDown className="h-5 w-5" />
                  ) : (
                    <ChevronRight className="h-5 w-5" />
                  )}
                </button>
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2">
                    <Input
                      value={objective.objective_number}
                      onChange={(e) =>
                        handleObjectiveChange(
                          objIndex,
                          'objective_number',
                          e.target.value
                        )
                      }
                      disabled={isSaving}
                      placeholder="O1"
                      className="w-20 bg-white"
                    />
                    <Input
                      value={objective.title}
                      onChange={(e) =>
                        handleObjectiveChange(objIndex, 'title', e.target.value)
                      }
                      disabled={isSaving}
                      placeholder="Objective title (e.g., Implement Isolved as Leave Administration Software)"
                      className="flex-1 bg-white font-medium"
                    />
                    {objectives.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveObjective(objIndex)}
                        disabled={isSaving}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {objective.isExpanded && (
                    <>
                      <Textarea
                        value={objective.description}
                        onChange={(e) =>
                          handleObjectiveChange(
                            objIndex,
                            'description',
                            e.target.value
                          )
                        }
                        disabled={isSaving}
                        placeholder="Objective description (optional)"
                        rows={2}
                        className="bg-white"
                      />

                      {/* Deliverables */}
                      <div className="space-y-2 pl-4">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm text-green-700">
                            Deliverables
                          </Label>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAddDeliverable(objIndex)}
                            disabled={isSaving}
                          >
                            <Plus className="mr-1 h-3 w-3" />
                            Add Deliverable
                          </Button>
                        </div>
                        {objective.deliverables.map((deliverable, delIndex) => (
                          <div
                            key={delIndex}
                            className="rounded-md border border-green-200 bg-green-50 p-3 space-y-2"
                          >
                            <div className="flex items-center gap-2">
                              <Input
                                value={deliverable.deliverable_number}
                                onChange={(e) =>
                                  handleDeliverableChange(
                                    objIndex,
                                    delIndex,
                                    'deliverable_number',
                                    e.target.value
                                  )
                                }
                                disabled={isSaving}
                                placeholder="D1"
                                className="w-16 bg-white text-sm"
                              />
                              <Input
                                value={deliverable.title}
                                onChange={(e) =>
                                  handleDeliverableChange(
                                    objIndex,
                                    delIndex,
                                    'title',
                                    e.target.value
                                  )
                                }
                                disabled={isSaving}
                                placeholder="Deliverable title (e.g., Go live with Isolved)"
                                className="flex-1 bg-white text-sm"
                              />
                              {objective.deliverables.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleRemoveDeliverable(objIndex, delIndex)
                                  }
                                  disabled={isSaving}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                            <Textarea
                              value={deliverable.description}
                              onChange={(e) =>
                                handleDeliverableChange(
                                  objIndex,
                                  delIndex,
                                  'description',
                                  e.target.value
                                )
                              }
                              disabled={isSaving}
                              placeholder="Deliverable description"
                              rows={2}
                              className="bg-white text-sm"
                            />
                            <Input
                              type="date"
                              value={deliverable.target_date}
                              onChange={(e) =>
                                handleDeliverableChange(
                                  objIndex,
                                  delIndex,
                                  'target_date',
                                  e.target.value
                                )
                              }
                              disabled={isSaving}
                              className="bg-white text-sm"
                              placeholder="Target date (optional)"
                            />
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-2 border-t border-gray-200 pt-4">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSaving}
          >
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSaving}>
          {isSaving ? 'Saving...' : goal ? 'Update Goal' : 'Create Goal'}
        </Button>
      </div>
    </form>
  )
}
