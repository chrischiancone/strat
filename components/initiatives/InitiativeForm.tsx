'use client'

import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  createInitiative,
  updateInitiative,
  type Initiative,
  type PriorityLevel,
} from '@/app/actions/initiatives'
import { PRIORITY_LEVELS } from '@/lib/constants/strategic-planning'
import { useToast } from '@/hooks/use-toast'
import { X, Plus } from 'lucide-react'
import {
  CouncilInitiativeLinkDialog,
  type CouncilLinkData,
} from './CouncilInitiativeLinkDialog'

interface InitiativeFormProps {
  goalId: string
  goalNumber: number
  goalTitle: string
  departmentId: string
  fiscalYearId: string
  initiative?: Initiative
  suggestedNumber?: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function InitiativeForm({
  goalId,
  goalNumber,
  goalTitle,
  departmentId,
  fiscalYearId,
  initiative,
  suggestedNumber = '',
  onSuccess,
  onCancel,
}: InitiativeFormProps) {
  const [initiativeNumber, setInitiativeNumber] = useState(
    initiative?.initiative_number || suggestedNumber
  )
  const [name, setName] = useState(initiative?.name || '')
  const [description, setDescription] = useState(initiative?.description || '')
  const [rationale, setRationale] = useState(initiative?.rationale || '')
  const [priorityLevel, setPriorityLevel] = useState<PriorityLevel>(
    initiative?.priority_level || 'NEED'
  )
  const [rank, setRank] = useState(
    initiative?.rank_within_priority?.toString() || '1'
  )
  const [outcomes, setOutcomes] = useState<string[]>(
    initiative?.expected_outcomes || ['']
  )
  const [responsibleParty, setResponsibleParty] = useState(
    initiative?.responsible_party || ''
  )
  const [isSaving, setIsSaving] = useState(false)
  const [showCouncilDialog, setShowCouncilDialog] = useState(false)
  const [pendingPriorityLevel, setPendingPriorityLevel] = useState<PriorityLevel | null>(null)
  const [councilLinkData, setCouncilLinkData] = useState<CouncilLinkData | undefined>()
  const { toast } = useToast()

  const handleAddOutcome = () => {
    setOutcomes([...outcomes, ''])
  }

  const handleRemoveOutcome = (index: number) => {
    setOutcomes(outcomes.filter((_, i) => i !== index))
  }

  const handleOutcomeChange = (index: number, value: string) => {
    const newOutcomes = [...outcomes]
    newOutcomes[index] = value
    setOutcomes(newOutcomes)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      // Filter out empty outcomes
      const filteredOutcomes = outcomes.filter((o) => o.trim() !== '')

      // Validation
      if (!initiativeNumber.trim()) {
        toast({
          title: 'Validation Error',
          description: 'Initiative number is required',
          variant: 'destructive',
        })
        return
      }

      if (!name.trim()) {
        toast({
          title: 'Validation Error',
          description: 'Initiative name is required',
          variant: 'destructive',
        })
        return
      }

      if (!description.trim()) {
        toast({
          title: 'Validation Error',
          description: 'Description is required',
          variant: 'destructive',
        })
        return
      }

      if (!rationale.trim()) {
        toast({
          title: 'Validation Error',
          description: 'Rationale is required',
          variant: 'destructive',
        })
        return
      }

      if (filteredOutcomes.length === 0) {
        toast({
          title: 'Validation Error',
          description: 'At least one expected outcome is required',
          variant: 'destructive',
        })
        return
      }

      const rankNumber = parseInt(rank)
      if (isNaN(rankNumber) || rankNumber < 1) {
        toast({
          title: 'Validation Error',
          description: 'Rank must be a positive number',
          variant: 'destructive',
        })
        return
      }

      if (initiative) {
        // Update existing initiative
        await updateInitiative({
          id: initiative.id,
          initiative_number: initiativeNumber.trim(),
          name: name.trim(),
          description: description.trim(),
          rationale: rationale.trim(),
          priority_level: priorityLevel,
          rank_within_priority: rankNumber,
          expected_outcomes: filteredOutcomes,
          responsible_party: responsibleParty.trim() || undefined,
        })

        toast({
          title: 'Saved',
          description: 'Initiative updated successfully',
        })
      } else {
        // Create new initiative
        await createInitiative({
          strategic_goal_id: goalId,
          lead_department_id: departmentId,
          fiscal_year_id: fiscalYearId,
          initiative_number: initiativeNumber.trim(),
          name: name.trim(),
          description: description.trim(),
          rationale: rationale.trim(),
          priority_level: priorityLevel,
          rank_within_priority: rankNumber,
          expected_outcomes: filteredOutcomes,
          responsible_party: responsibleParty.trim() || undefined,
        })

        toast({
          title: 'Created',
          description: 'Initiative created successfully',
        })
      }

      onSuccess?.()
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to save initiative',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Goal Info (Read-only) */}
      <div className="rounded-md bg-gray-50 border border-gray-200 p-3">
        <p className="text-sm text-gray-700">
          <span className="font-semibold">Goal:</span> {goalNumber}. {goalTitle}
        </p>
      </div>

      {/* Initiative Number */}
      <div>
        <Label htmlFor="initiative_number">Initiative Number *</Label>
        <Input
          id="initiative_number"
          value={initiativeNumber}
          onChange={(e) => setInitiativeNumber(e.target.value)}
          disabled={isSaving}
          placeholder={`e.g., ${goalNumber}.1`}
          className="mt-1"
          required
        />
        <p className="mt-1 text-sm text-gray-500">
          Format: {goalNumber}.X (e.g., {goalNumber}.1, {goalNumber}.2)
        </p>
      </div>

      {/* Name */}
      <div>
        <Label htmlFor="name">Initiative Name *</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isSaving}
          placeholder="e.g., Emergency Response System Upgrade"
          className="mt-1"
          required
        />
      </div>

      {/* Priority Level */}
      <div>
        <Label>Priority Level *</Label>
        <RadioGroup
          value={priorityLevel}
          onValueChange={(value) => {
            const newPriority = value as PriorityLevel
            setPendingPriorityLevel(newPriority)
            setShowCouncilDialog(true)
          }}
          disabled={isSaving}
          className="mt-2 space-y-3"
        >
          {PRIORITY_LEVELS.map((level) => (
            <div key={level.value} className="flex items-start space-x-3">
              <RadioGroupItem value={level.value} id={level.value} />
              <div className="flex-1">
                <Label
                  htmlFor={level.value}
                  className="font-semibold cursor-pointer"
                >
                  {level.label}
                </Label>
                <p className="text-sm text-gray-500">{level.description}</p>
              </div>
            </div>
          ))}
        </RadioGroup>
        {councilLinkData && councilLinkData.councilPriorities.length > 0 && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm font-medium text-blue-900 mb-1">
              Linked to Council Priorities:
            </p>
            <p className="text-sm text-blue-800">
              {councilLinkData.councilPriorities.join(', ')}
            </p>
          </div>
        )}
      </div>

      {/* Rank */}
      <div>
        <Label htmlFor="rank">Rank Within Priority *</Label>
        <Input
          id="rank"
          type="number"
          min="1"
          value={rank}
          onChange={(e) => setRank(e.target.value)}
          disabled={isSaving}
          className="mt-1"
          required
        />
        <p className="mt-1 text-sm text-gray-500">
          Lower numbers appear first within the same priority level
        </p>
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isSaving}
          placeholder="Describe what this initiative entails..."
          rows={4}
          className="mt-1"
          required
        />
      </div>

      {/* Rationale */}
      <div>
        <Label htmlFor="rationale">Rationale *</Label>
        <Textarea
          id="rationale"
          value={rationale}
          onChange={(e) => setRationale(e.target.value)}
          disabled={isSaving}
          placeholder="Why is this initiative needed? What problem does it solve?"
          rows={3}
          className="mt-1"
          required
        />
      </div>

      {/* Expected Outcomes */}
      <div>
        <Label>Expected Outcomes *</Label>
        <p className="mt-1 text-sm text-gray-500">
          What specific outcomes do you expect from this initiative?
        </p>
        <div className="mt-2 space-y-2">
          {outcomes.map((outcome, index) => (
            <div key={index} className="flex items-start gap-2">
              <span className="mt-2 text-sm text-gray-500">•</span>
              <Input
                value={outcome}
                onChange={(e) => handleOutcomeChange(index, e.target.value)}
                disabled={isSaving}
                placeholder="e.g., Reduce response time by 20%"
                className="flex-1"
              />
              {outcomes.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveOutcome(index)}
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
          onClick={handleAddOutcome}
          disabled={isSaving}
          className="mt-2"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Outcome
        </Button>
      </div>

      {/* Responsible Party */}
      <div>
        <Label htmlFor="responsible_party">Responsible Party</Label>
        <Input
          id="responsible_party"
          value={responsibleParty}
          onChange={(e) => setResponsibleParty(e.target.value)}
          disabled={isSaving}
          placeholder="e.g., Deputy Chief Smith"
          className="mt-1"
        />
        <p className="mt-1 text-sm text-gray-500">
          Optional: Person or team responsible for this initiative
        </p>
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
          {isSaving
            ? 'Saving...'
            : initiative
              ? 'Update Initiative'
              : 'Create Initiative'}
        </Button>
      </div>

      {/* Council Initiative Link Dialog */}
      <CouncilInitiativeLinkDialog
        open={showCouncilDialog}
        onOpenChange={(open) => {
          setShowCouncilDialog(open)
          if (!open) {
            setPendingPriorityLevel(null)
          }
        }}
        priorityLevel={pendingPriorityLevel || priorityLevel}
        onConfirm={(data) => {
          setCouncilLinkData(data)
          if (pendingPriorityLevel) {
            setPriorityLevel(pendingPriorityLevel)
            setPendingPriorityLevel(null)
          }
        }}
        initialData={councilLinkData}
      />
    </form>
  )
}
