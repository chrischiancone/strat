'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select as UiSelect, SelectContent as UiSelectContent, SelectItem as UiSelectItem, SelectTrigger as UiSelectTrigger, SelectValue as UiSelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { createInitiative, type PriorityLevel } from '@/app/actions/initiatives'
import type { DeliverableWithContext } from '@/app/actions/strategic-deliverables'
import { useToast } from '@/hooks/use-toast'
import { X, Plus, DollarSign, FileText, Target } from 'lucide-react'
import {
  CouncilInitiativeLinkDialog,
  type CouncilLinkData,
} from './CouncilInitiativeLinkDialog'

interface StrategicGoal {
  id: string
  goal_number: number
  title: string
  description: string
  city_priority_alignment: string
  objectives: string[]
  success_measures: string[]
  initiative_count?: number
}

interface FiscalYear {
  id: string
  year: number
  start_date: string
  end_date: string
  is_current: boolean
}

interface AddInitiativeFormProps {
  planId: string
  goals: StrategicGoal[]
  selectedGoalId?: string
  selectedObjectiveId?: string
  departmentId: string
  fiscalYears: FiscalYear[]
}

export function AddInitiativeForm({
  planId,
  goals,
  selectedGoalId,
  selectedObjectiveId,
  departmentId,
  fiscalYears
}: AddInitiativeFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  
  // Basic initiative information
  const [selectedGoal, setSelectedGoal] = useState<string>(selectedGoalId || '')
  const [initiativeNumber, setInitiativeNumber] = useState('')
  const [name, setName] = useState('')
  const [objectiveId, setObjectiveId] = useState<string>(selectedObjectiveId || '')
  const [deliverables, setDeliverables] = useState<DeliverableWithContext[]>([])
  const [selectedDeliverableId, setSelectedDeliverableId] = useState<string>('')
  const [description, setDescription] = useState('')
  const [rationale, setRationale] = useState('')
  const [priorityLevel, setPriorityLevel] = useState<PriorityLevel>('NEED')
  const [rank, setRank] = useState('1')
  const [responsibleParty, setResponsibleParty] = useState('')
  const [isKeyInitiative, setIsKeyInitiative] = useState(false)
  
  // Expected outcomes
  const [outcomes, setOutcomes] = useState<string[]>([''])
  
  // Cost estimation
  const [year1Cost, setYear1Cost] = useState('')
  const [year2Cost, setYear2Cost] = useState('')
  const [year3Cost, setYear3Cost] = useState('')
  const [costNotes, setCostNotes] = useState('')
  const [fundingSource, setFundingSource] = useState('')
  
  // Additional notes
  const [implementationNotes, setImplementationNotes] = useState('')
  const [risksAndChallenges, setRisksAndChallenges] = useState('')
  
  const [isSaving, setIsSaving] = useState(false)
  const [showCouncilDialog, setShowCouncilDialog] = useState(false)
  const [pendingPriorityLevel, setPendingPriorityLevel] = useState<PriorityLevel | null>(null)
  const [councilLinkData, setCouncilLinkData] = useState<CouncilLinkData | undefined>()

  // Auto-generate initiative number based on selected goal
  useEffect(() => {
    if (selectedGoal) {
      const goal = goals.find(g => g.id === selectedGoal)
      if (goal) {
        const initiativeCount = goal.initiative_count || 0
        const nextNumber = `${goal.goal_number}.${initiativeCount + 1}`
        setInitiativeNumber(nextNumber)
      }
    }
  }, [selectedGoal, goals])

  // Load deliverables for this plan
  useEffect(() => {
    const loadDeliverables = async () => {
      try {
        const { getDeliverablesForPlan } = await import('@/app/actions/strategic-deliverables')
        const data = await getDeliverablesForPlan(planId)
        // Sort by objective number
        data.sort((a, b) => a.objective_number.localeCompare(b.objective_number, undefined, { numeric: true }))
        setDeliverables(data)
      } catch (err) {
        console.error('Failed to load deliverables for plan:', err)
      }
    }
    loadDeliverables()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planId])

  // Get current fiscal year as default
  const currentFiscalYear = fiscalYears.find(fy => fy.is_current) || fiscalYears[0]

  const handleAddOutcome = () => {
    setOutcomes([...outcomes, ''])
  }

  const handleRemoveOutcome = (index: number) => {
    if (outcomes.length > 1) {
      setOutcomes(outcomes.filter((_, i) => i !== index))
    }
  }

  const handleOutcomeChange = (index: number, value: string) => {
    const newOutcomes = [...outcomes]
    newOutcomes[index] = value
    setOutcomes(newOutcomes)
  }

  const _formatCurrency = (amount: number) => {
    const number = parseFloat(value.replace(/[^0-9.-]+/g, ''))
    if (isNaN(number)) return ''
    return number.toLocaleString()
  }

  const parseCurrency = (value: string) => {
    return parseFloat(value.replace(/[^0-9.-]+/g, '')) || 0
  }

  const getTotalCost = () => {
    const year1 = parseCurrency(year1Cost)
    const year2 = parseCurrency(year2Cost)
    const year3 = parseCurrency(year3Cost)
    return year1 + year2 + year3
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      // Validation
      if (!selectedGoal) {
        toast({
          title: 'Validation Error',
          description: 'Please select a strategic goal',
          variant: 'destructive',
        })
        return
      }

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

      // Filter out empty outcomes
      const filteredOutcomes = outcomes.filter((o) => o.trim() !== '')
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

      // Create the initiative
      await createInitiative({
        strategic_goal_id: selectedGoal,
        strategic_objective_id: objectiveId || undefined,
        lead_department_id: departmentId,
        fiscal_year_id: currentFiscalYear?.id || '',
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
        title: 'Success',
        description: 'Initiative created successfully',
      })

      // Redirect to plan view
      router.push(`/plans/${planId}`)
    } catch (error) {
      console.error('Error creating initiative:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create initiative',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const selectedGoalData = goals.find(g => g.id === selectedGoal)

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Goal Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Strategic Goal
          </CardTitle>
          <CardDescription>
            Select the strategic goal this initiative will support
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="goal">Strategic Goal <span className="text-red-500">*</span></Label>
            <Select value={selectedGoal} onValueChange={setSelectedGoal}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select a strategic goal..." />
              </SelectTrigger>
              <SelectContent>
                {goals.map((goal) => (
                  <SelectItem key={goal.id} value={goal.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">Goal {goal.goal_number}: {goal.title}</span>
                      <span className="text-xs text-gray-500">{goal.city_priority_alignment}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Show selected goal details */}
          {selectedGoalData && (
            <div className="rounded-lg border bg-gray-50 p-4">
              <h4 className="font-medium text-sm mb-2">Selected Goal Details</h4>
              <p className="text-sm text-gray-700 mb-2">{selectedGoalData.description}</p>
              
              {selectedGoalData.objectives.length > 0 && (
                <div className="mb-2">
                  <h5 className="text-xs font-medium text-gray-600 mb-1">SMART Objectives:</h5>
                  <ul className="text-xs text-gray-600 space-y-1 ml-4">
                    {selectedGoalData.objectives.map((objective, index) => (
                      <li key={index} className="list-disc">{objective}</li>
                    ))}
                  </ul>
                </div>
              )}

              <Badge variant="secondary" className="text-xs">
                {selectedGoalData.city_priority_alignment}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Basic Initiative Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Initiative Details
          </CardTitle>
          <CardDescription>
            Provide basic information about the initiative
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="initiativeNumber">
                Initiative Number <span className="text-red-500">*</span>
              </Label>
              <Input
                id="initiativeNumber"
                value={initiativeNumber}
                onChange={(e) => setInitiativeNumber(e.target.value)}
                placeholder="e.g., 1.1"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Auto-generated based on selected goal
              </p>
            </div>

            <div>
              <Label htmlFor="rank">
                Priority Rank <span className="text-red-500">*</span>
              </Label>
              <Input
                id="rank"
                type="number"
                min="1"
                value={rank}
                onChange={(e) => setRank(e.target.value)}
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Rank within priority level (1 = highest)
              </p>
            </div>
          </div>

          <div>
            <Label htmlFor="name">
              Initiative Name <span className="text-red-500">*</span>
            </Label>
            <UiSelect
              value={selectedDeliverableId}
              onValueChange={(val) => {
                setSelectedDeliverableId(val)
                const d = deliverables.find((x) => x.id === val)
                if (d) {
                  setName(d.title)
                  setSelectedGoal(d.strategic_goal_id)
                  setObjectiveId(d.strategic_objective_id)
                }
              }}
            >
              <UiSelectTrigger className="mt-1">
                <UiSelectValue placeholder="Select from deliverables..." />
              </UiSelectTrigger>
              <UiSelectContent>
                {deliverables.length === 0 ? (
                  <UiSelectItem value="__no_deliverables__" disabled>
                    No deliverables available
                  </UiSelectItem>
                ) : (
                  deliverables.map((d) => (
                    <UiSelectItem key={d.id} value={d.id}>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">{d.title}</span>
                        <span className="text-xs text-gray-500">G{d.goal_number} • {d.goal_title} • {d.objective_number}</span>
                      </div>
                    </UiSelectItem>
                  ))
                )}
              </UiSelectContent>
            </UiSelect>
            <p className="text-xs text-gray-500 mt-1">
              Choose from existing deliverables for this department. The selected goal will update automatically.
            </p>
          </div>

          <div>
            <Label htmlFor="description">
              Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a detailed description of what this initiative involves..."
              rows={4}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="rationale">
              Rationale <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="rationale"
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
              placeholder="Explain why this initiative is important and how it supports the strategic goal..."
              rows={3}
              className="mt-1"
            />
          </div>

          <div>
            <Label>Priority Level <span className="text-red-500">*</span></Label>
            <RadioGroup
              value={priorityLevel}
              onValueChange={(value: PriorityLevel) => {
                setPendingPriorityLevel(value)
                setShowCouncilDialog(true)
              }}
              className="mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="NEED" id="need" />
                <Label htmlFor="need" className="flex items-center gap-2">
                  <Badge className="bg-red-100 text-red-800">NEED</Badge>
                  <span className="text-sm">Critical/Required</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="WANT" id="want" />
                <Label htmlFor="want" className="flex items-center gap-2">
                  <Badge className="bg-yellow-100 text-yellow-800">WANT</Badge>
                  <span className="text-sm">Important</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="NICE_TO_HAVE" id="nice" />
                <Label htmlFor="nice" className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-800">NICE TO HAVE</Badge>
                  <span className="text-sm">Optional</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label htmlFor="responsibleParty">Responsible Party</Label>
            <Input
              id="responsibleParty"
              value={responsibleParty}
              onChange={(e) => setResponsibleParty(e.target.value)}
              placeholder="e.g., IT Department, John Smith"
              className="mt-1"
            />
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isKeyInitiative"
                checked={isKeyInitiative}
                onCheckedChange={(checked) => setIsKeyInitiative(checked === true)}
              />
              <Label htmlFor="isKeyInitiative" className="text-sm font-medium cursor-pointer">
                Mark as Key Initiative
              </Label>
            </div>
            <p className="text-xs text-gray-500 mt-1 ml-6">
              Key initiatives are highlighted in the strategic plan and reports
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Expected Outcomes */}
      <Card>
        <CardHeader>
          <CardTitle>Expected Outcomes</CardTitle>
          <CardDescription>
            Define the specific, measurable outcomes expected from this initiative
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {outcomes.map((outcome, index) => (
            <div key={index} className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor={`outcome-${index}`}>
                  Outcome {index + 1} {index === 0 && <span className="text-red-500">*</span>}
                </Label>
                <Textarea
                  id={`outcome-${index}`}
                  value={outcome}
                  onChange={(e) => handleOutcomeChange(index, e.target.value)}
                  placeholder="e.g., Reduce customer service response time by 50%"
                  rows={2}
                  className="mt-1"
                />
              </div>
              {outcomes.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleRemoveOutcome(index)}
                  className="mt-6"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          
          <Button
            type="button"
            variant="outline"
            onClick={handleAddOutcome}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Another Outcome
          </Button>
        </CardContent>
      </Card>

      {/* Cost Estimation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Cost Estimation
          </CardTitle>
          <CardDescription>
            Estimate the costs for implementing this initiative across fiscal years
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="year1Cost">Year 1 Cost</Label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <Input
                  id="year1Cost"
                  type="text"
                  value={year1Cost}
                  onChange={(e) => setYear1Cost(e.target.value)}
                  placeholder="0"
                  className="pl-8"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="year2Cost">Year 2 Cost</Label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <Input
                  id="year2Cost"
                  type="text"
                  value={year2Cost}
                  onChange={(e) => setYear2Cost(e.target.value)}
                  placeholder="0"
                  className="pl-8"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="year3Cost">Year 3 Cost</Label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <Input
                  id="year3Cost"
                  type="text"
                  value={year3Cost}
                  onChange={(e) => setYear3Cost(e.target.value)}
                  placeholder="0"
                  className="pl-8"
                />
              </div>
            </div>
          </div>

          {getTotalCost() > 0 && (
            <div className="rounded-lg border bg-blue-50 p-3">
              <div className="flex items-center justify-between">
                <span className="font-medium text-blue-900">Total Estimated Cost:</span>
                <span className="text-lg font-semibold text-blue-900">
                  ${getTotalCost().toLocaleString()}
                </span>
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="fundingSource">Funding Source</Label>
            <Input
              id="fundingSource"
              value={fundingSource}
              onChange={(e) => setFundingSource(e.target.value)}
              placeholder="e.g., General Fund, Federal Grant, Capital Budget"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="costNotes">Cost Estimation Notes</Label>
            <Textarea
              id="costNotes"
              value={costNotes}
              onChange={(e) => setCostNotes(e.target.value)}
              placeholder="Provide details about the cost estimates, assumptions, or breakdown..."
              rows={3}
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Additional Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Notes</CardTitle>
          <CardDescription>
            Provide additional context, implementation details, and considerations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="implementationNotes">Implementation Notes</Label>
            <Textarea
              id="implementationNotes"
              value={implementationNotes}
              onChange={(e) => setImplementationNotes(e.target.value)}
              placeholder="Describe key implementation steps, dependencies, timeline considerations..."
              rows={3}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="risksAndChallenges">Risks & Challenges</Label>
            <Textarea
              id="risksAndChallenges"
              value={risksAndChallenges}
              onChange={(e) => setRisksAndChallenges(e.target.value)}
              placeholder="Identify potential risks, challenges, or obstacles to implementation..."
              rows={3}
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Submit Actions */}
      <div className="flex items-center justify-between border-t border-gray-200 pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/plans/${planId}`)}
          disabled={isSaving}
        >
          Cancel
        </Button>
        
        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={isSaving}
            className="min-w-[120px]"
          >
            {isSaving ? 'Creating...' : 'Create Initiative'}
          </Button>
        </div>
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
