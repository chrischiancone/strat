'use client'

import { useState } from 'react'
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
import { CITY_PRIORITIES } from '@/lib/constants/strategic-planning'
import { useToast } from '@/hooks/use-toast'
import { X, Plus } from 'lucide-react'

interface GoalFormProps {
  planId: string
  goal?: StrategicGoal
  nextGoalNumber?: number
  onSuccess?: () => void
  onCancel?: () => void
}

export function GoalForm({
  planId,
  goal,
  nextGoalNumber = 1,
  onSuccess,
  onCancel,
}: GoalFormProps) {
  const [goalNumber, setGoalNumber] = useState(
    goal?.goal_number?.toString() || nextGoalNumber.toString()
  )
  const [title, setTitle] = useState(goal?.title || '')
  const [description, setDescription] = useState(goal?.description || '')
  const [cityPriority, setCityPriority] = useState(
    goal?.city_priority_alignment || ''
  )
  const [objectives, setObjectives] = useState<string[]>(
    goal?.objectives || ['']
  )
  const [successMeasures, setSuccessMeasures] = useState<string[]>(
    goal?.success_measures || ['']
  )
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  const handleAddObjective = () => {
    setObjectives([...objectives, ''])
  }

  const handleRemoveObjective = (index: number) => {
    setObjectives(objectives.filter((_, i) => i !== index))
  }

  const handleObjectiveChange = (index: number, value: string) => {
    const newObjectives = [...objectives]
    newObjectives[index] = value
    setObjectives(newObjectives)
  }

  const handleAddMeasure = () => {
    setSuccessMeasures([...successMeasures, ''])
  }

  const handleRemoveMeasure = (index: number) => {
    setSuccessMeasures(successMeasures.filter((_, i) => i !== index))
  }

  const handleMeasureChange = (index: number, value: string) => {
    const newMeasures = [...successMeasures]
    newMeasures[index] = value
    setSuccessMeasures(newMeasures)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      // Filter out empty objectives and measures
      const filteredObjectives = objectives.filter((obj) => obj.trim() !== '')
      const filteredMeasures = successMeasures.filter((m) => m.trim() !== '')

      // Validation
      if (!title.trim()) {
        toast({
          title: 'Validation Error',
          description: 'Goal title is required',
          variant: 'destructive',
        })
        return
      }

      if (!description.trim()) {
        toast({
          title: 'Validation Error',
          description: 'Goal description is required',
          variant: 'destructive',
        })
        return
      }

      if (!cityPriority) {
        toast({
          title: 'Validation Error',
          description: 'City priority alignment is required',
          variant: 'destructive',
        })
        return
      }

      if (filteredObjectives.length === 0) {
        toast({
          title: 'Validation Error',
          description: 'At least one SMART objective is required',
          variant: 'destructive',
        })
        return
      }

      if (filteredMeasures.length === 0) {
        toast({
          title: 'Validation Error',
          description: 'At least one success measure is required',
          variant: 'destructive',
        })
        return
      }

      if (goal) {
        // Update existing goal
        await updateStrategicGoal({
          id: goal.id,
          goal_number: parseInt(goalNumber),
          title: title.trim(),
          description: description.trim(),
          city_priority_alignment: cityPriority,
          objectives: filteredObjectives,
          success_measures: filteredMeasures,
        })

        toast({
          title: 'Saved',
          description: 'Goal updated successfully',
        })
      } else {
        // Create new goal
        await createStrategicGoal({
          strategic_plan_id: planId,
          goal_number: parseInt(goalNumber),
          title: title.trim(),
          description: description.trim(),
          city_priority_alignment: cityPriority,
          objectives: filteredObjectives,
          success_measures: filteredMeasures,
        })

        toast({
          title: 'Created',
          description: 'Goal created successfully',
        })
      }

      onSuccess?.()
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to save goal',
        variant: 'destructive',
      })
    } finally {
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
          placeholder="e.g., Enhance Public Safety"
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
          rows={4}
          className="mt-1"
          required
        />
      </div>

      {/* SMART Objectives */}
      <div>
        <Label>SMART Objectives *</Label>
        <p className="mt-1 text-sm text-gray-500">
          Specific, Measurable, Achievable, Relevant, Time-bound objectives
        </p>
        <div className="mt-2 space-y-2">
          {objectives.map((objective, index) => (
            <div key={index} className="flex items-start gap-2">
              <span className="mt-2 text-sm text-gray-500">•</span>
              <Input
                value={objective}
                onChange={(e) => handleObjectiveChange(index, e.target.value)}
                disabled={isSaving}
                placeholder="e.g., Reduce response time by 15% by Q4 2026"
                className="flex-1"
              />
              {objectives.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveObjective(index)}
                  disabled={isSaving}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddObjective}
          disabled={isSaving}
          className="mt-2"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Objective
        </Button>
      </div>

      {/* Success Measures */}
      <div>
        <Label>Success Measures *</Label>
        <p className="mt-1 text-sm text-gray-500">
          How will you measure success for this goal?
        </p>
        <div className="mt-2 space-y-2">
          {successMeasures.map((measure, index) => (
            <div key={index} className="flex items-start gap-2">
              <span className="mt-2 text-sm text-gray-500">•</span>
              <Input
                value={measure}
                onChange={(e) => handleMeasureChange(index, e.target.value)}
                disabled={isSaving}
                placeholder="e.g., Citizen satisfaction score ≥ 4.5/5.0"
                className="flex-1"
              />
              {successMeasures.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveMeasure(index)}
                  disabled={isSaving}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddMeasure}
          disabled={isSaving}
          className="mt-2"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Measure
        </Button>
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
