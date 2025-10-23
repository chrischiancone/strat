'use client'

import { useState, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Select as UiSelect, SelectContent as UiSelectContent, SelectItem as UiSelectItem, SelectTrigger as UiSelectTrigger, SelectValue as UiSelectValue } from '@/components/ui/select'
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
import type { DeliverableWithContext } from '@/app/actions/strategic-deliverables'

interface InitiativeFormProps {
  planId: string
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
  planId,
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
  const [objectiveId, setObjectiveId] = useState<string>('')
  const [deliverables, setDeliverables] = useState<DeliverableWithContext[]>([])
  const [selectedDeliverableId, setSelectedDeliverableId] = useState<string>('')
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
  const [isKeyInitiative, setIsKeyInitiative] = useState(
    initiative?.is_key_initiative || false
  )
  const [isSaving, setIsSaving] = useState(false)
  const [showCouncilDialog, setShowCouncilDialog] = useState(false)
  const [pendingPriorityLevel, setPendingPriorityLevel] = useState<PriorityLevel | null>(null)
  const [councilLinkData, setCouncilLinkData] = useState<CouncilLinkData | undefined>()
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)

  // Ensure client-side mount before rendering Radix Select to avoid hydration issues in Dialog
  useEffect(() => setMounted(true), [])

  // If priority is NEED on load and no council link data, show dialog
  useEffect(() => {
    if (mounted && priorityLevel === 'NEED' && !councilLinkData && !initiative) {
      setShowCouncilDialog(true)
    }
  }, [mounted, priorityLevel, councilLinkData, initiative])

  // Load deliverables for this plan and filter by this goal
  // We only allow selecting deliverables that belong to the current goal
  // to keep integrity with "Add initiative under this goal"
  useEffect(() => {
    const load = async () => {
      try {
        const { getDeliverablesForPlan } = await import('@/app/actions/strategic-deliverables')
        const all = await getDeliverablesForPlan(planId)
        const filtered = all.filter((d) => d.strategic_goal_id === goalId)
        // Sort by objective number
        filtered.sort((a, b) => a.objective_number.localeCompare(b.objective_number, undefined, { numeric: true }))
        setDeliverables(filtered)
      } catch (e) {
        console.error('Failed to load deliverables for plan', e)
      }
    }
    if (mounted) load()
  }, [planId, goalId, mounted])

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

      if (!selectedDeliverableId) {
        toast({
          title: 'Validation Error',
          description: 'Please select a deliverable for the initiative name',
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
          is_key_initiative: isKeyInitiative,
        })

        toast({
          title: 'Saved',
          description: 'Initiative updated successfully',
        })
      } else {
        // Create new initiative
        await createInitiative({
          strategic_goal_id: goalId,
          strategic_objective_id: objectiveId || undefined,
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
          is_key_initiative: isKeyInitiative,
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

      {/* Name from Deliverables */}
      <div>
        <Label htmlFor="name">Initiative Name *</Label>
        {mounted ? (
          <UiSelect
            key={`deliverables-select-${deliverables.length}`}
            value={selectedDeliverableId}
            onValueChange={(val) => {
              setSelectedDeliverableId(val)
              const d = deliverables.find((x) => x.id === val)
              if (d) {
                setName(d.title)
                setObjectiveId(d.strategic_objective_id)
              }
            }}
          >
            <UiSelectTrigger className="mt-1">
              <UiSelectValue placeholder={name || 'Select from deliverables...'} />
            </UiSelectTrigger>
            <UiSelectContent>
              {deliverables.length === 0 ? (
                <UiSelectItem value="__no_deliverables__" disabled>
                  No deliverables available for this goal
                </UiSelectItem>
              ) : (
                deliverables.map((d) => (
                  <UiSelectItem key={d.id} value={d.id}>
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">{d.title}</span>
                      <span className="text-xs text-gray-500">{d.objective_number}</span>
                    </div>
                  </UiSelectItem>
                ))
              )}
            </UiSelectContent>
          </UiSelect>
        ) : (
          <Input disabled placeholder="Loading deliverables..." className="mt-1" />
        )}
        <p className="mt-1 text-xs text-gray-500">Choose an existing deliverable title under this goal.</p>
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

      {/* Key Initiative */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="is_key_initiative"
          checked={isKeyInitiative}
          onCheckedChange={(checked) => setIsKeyInitiative(checked === true)}
          disabled={isSaving}
        />
        <Label htmlFor="is_key_initiative" className="text-sm font-medium cursor-pointer">
          Mark as Key Initiative
        </Label>
      </div>
      <p className="text-xs text-gray-500 -mt-4 ml-6">
        Key initiatives are highlighted in the strategic plan and reports
      </p>

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
