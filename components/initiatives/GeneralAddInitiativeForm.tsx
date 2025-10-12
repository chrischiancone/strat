'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Badge } from '@/components/ui/badge'
import { createInitiative, type PriorityLevel } from '@/app/actions/initiatives'
import { getStrategicGoals } from '@/app/actions/strategic-goals'
import { useToast } from '@/hooks/use-toast'
import { X, Plus, DollarSign, FileText, Target, Building2 } from 'lucide-react'
import { StrategicPlan } from '@/app/actions/strategic-plans'

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

interface GeneralAddInitiativeFormProps {
  plans: StrategicPlan[]
  departmentId: string
  fiscalYears: FiscalYear[]
}

export function GeneralAddInitiativeForm({
  plans,
  departmentId,
  fiscalYears
}: GeneralAddInitiativeFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  
  // Plan and goal selection
  const [selectedPlan, setSelectedPlan] = useState<string>('')
  const [goals, setGoals] = useState<StrategicGoal[]>([])
  const [loadingGoals, setLoadingGoals] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState<string>('')
  
  // Basic initiative information
  const [initiativeNumber, setInitiativeNumber] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [rationale, setRationale] = useState('')
  const [priorityLevel, setPriorityLevel] = useState<PriorityLevel>('NEED')
  const [rank, setRank] = useState('1')
  const [responsibleParty, setResponsibleParty] = useState('')
  
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

  // Load goals when plan is selected
  useEffect(() => {
    if (selectedPlan) {
      setLoadingGoals(true)
      setSelectedGoal('')
      setGoals([])
      
      getStrategicGoals(selectedPlan)
        .then((planGoals) => {
          setGoals(planGoals)
        })
        .catch((error) => {
          console.error('Error loading goals:', error)
          toast({
            title: 'Error',
            description: 'Failed to load strategic goals for this plan',
            variant: 'destructive',
          })
        })
        .finally(() => {
          setLoadingGoals(false)
        })
    } else {
      setGoals([])
      setSelectedGoal('')
    }
  }, [selectedPlan, toast])

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

  const formatCurrency = (value: string) => {
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
      if (!selectedPlan) {
        toast({
          title: 'Validation Error',
          description: 'Please select a strategic plan',
          variant: 'destructive',
        })
        return
      }

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
      })

      toast({
        title: 'Success',
        description: 'Initiative created successfully',
      })

      // Redirect to plan view
      router.push(`/plans/${selectedPlan}`)
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

  const selectedPlanData = plans.find(p => p.id === selectedPlan)
  const selectedGoalData = goals.find(g => g.id === selectedGoal)

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Plan Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Strategic Plan
          </CardTitle>
          <CardDescription>
            Select the strategic plan for this initiative
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="plan">Strategic Plan <span className="text-red-500">*</span></Label>
            <Select value={selectedPlan} onValueChange={setSelectedPlan}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select a strategic plan..." />
              </SelectTrigger>
              <SelectContent>
                {plans.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id} className="py-3">
                    <div className="flex flex-col gap-1 w-full">
                      <span className="font-medium text-sm leading-tight">
                        {plan.title || 'Untitled Plan'}
                      </span>
                      <span className="text-xs text-gray-500 leading-tight">
                        {plan.department_name} • {plan.start_year}-{plan.end_year}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Show selected plan details */}
          {selectedPlanData && (
            <div className="rounded-lg border bg-gray-50 p-4">
              <h4 className="font-medium text-sm mb-2">Selected Plan</h4>
              <p className="text-sm text-gray-700">
                {selectedPlanData.title} - {selectedPlanData.department_name}
              </p>
              <p className="text-xs text-gray-600">
                Fiscal Years: {selectedPlanData.start_year}-{selectedPlanData.end_year}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Goal Selection - Only show if plan is selected */}
      {selectedPlan && (
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
            {loadingGoals ? (
              <div className="text-sm text-gray-500 py-4">Loading goals...</div>
            ) : goals.length === 0 ? (
              <div className="rounded-lg border bg-yellow-50 p-4 text-center">
                <p className="text-sm text-yellow-800 mb-2">No strategic goals found for this plan</p>
                <p className="text-xs text-yellow-700">You'll need to add strategic goals to this plan before creating initiatives.</p>
              </div>
            ) : (
              <>
                <div>
                  <Label htmlFor="goal">Strategic Goal <span className="text-red-500">*</span></Label>
                  <Select value={selectedGoal} onValueChange={setSelectedGoal}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select a strategic goal..." />
                    </SelectTrigger>
                    <SelectContent>
                      {goals.map((goal) => (
                        <SelectItem key={goal.id} value={goal.id} className="py-3">
                          <div className="flex flex-col gap-1 w-full">
                            <span className="font-medium text-sm leading-tight">
                              Goal {goal.goal_number}: {goal.title}
                            </span>
                            <span className="text-xs text-gray-500 leading-tight">
                              {goal.city_priority_alignment}
                            </span>
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
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Only show the rest of the form if both plan and goal are selected */}
      {selectedPlan && selectedGoal && (
        <>
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
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Implement Digital Customer Service Portal"
                  className="mt-1"
                />
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
                  onValueChange={(value: PriorityLevel) => setPriorityLevel(value)}
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
                      <Badge className="bg-green-100 text-green-800">NICE</Badge>
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
                  placeholder="Who will be responsible for this initiative?"
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>

          {/* Expected Outcomes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Expected Outcomes
              </CardTitle>
              <CardDescription>
                Define what this initiative will achieve
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {outcomes.map((outcome, index) => (
                <div key={index} className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      value={outcome}
                      onChange={(e) => handleOutcomeChange(index, e.target.value)}
                      placeholder="e.g., Reduce average response time by 50%"
                    />
                  </div>
                  {outcomes.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => handleRemoveOutcome(index)}
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
                Add Outcome
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
                Estimate the costs for this initiative over time
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="year1Cost">Year 1 Cost</Label>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <Input
                      id="year1Cost"
                      value={formatCurrency(year1Cost)}
                      onChange={(e) => setYear1Cost(e.target.value)}
                      placeholder="0"
                      className="pl-7"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="year2Cost">Year 2 Cost</Label>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <Input
                      id="year2Cost"
                      value={formatCurrency(year2Cost)}
                      onChange={(e) => setYear2Cost(e.target.value)}
                      placeholder="0"
                      className="pl-7"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="year3Cost">Year 3 Cost</Label>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <Input
                      id="year3Cost"
                      value={formatCurrency(year3Cost)}
                      onChange={(e) => setYear3Cost(e.target.value)}
                      placeholder="0"
                      className="pl-7"
                    />
                  </div>
                </div>
              </div>

              {(year1Cost || year2Cost || year3Cost) && (
                <div className="rounded-lg border bg-gray-50 p-4">
                  <p className="text-sm font-medium">
                    Total Estimated Cost: ${getTotalCost().toLocaleString()}
                  </p>
                </div>
              )}

              <div>
                <Label htmlFor="fundingSource">Funding Source</Label>
                <Input
                  id="fundingSource"
                  value={fundingSource}
                  onChange={(e) => setFundingSource(e.target.value)}
                  placeholder="e.g., General Fund, Federal Grant, etc."
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="costNotes">Cost Notes</Label>
                <Textarea
                  id="costNotes"
                  value={costNotes}
                  onChange={(e) => setCostNotes(e.target.value)}
                  placeholder="Additional details about cost estimates, assumptions, or methodology..."
                  rows={3}
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>

          {/* Additional Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Additional Notes
              </CardTitle>
              <CardDescription>
                Additional planning and risk information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="implementationNotes">Implementation Notes</Label>
                <Textarea
                  id="implementationNotes"
                  value={implementationNotes}
                  onChange={(e) => setImplementationNotes(e.target.value)}
                  placeholder="Key steps, dependencies, timeline considerations..."
                  rows={4}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="risksAndChallenges">Risks & Challenges</Label>
                <Textarea
                  id="risksAndChallenges"
                  value={risksAndChallenges}
                  onChange={(e) => setRisksAndChallenges(e.target.value)}
                  placeholder="Potential obstacles or challenges to implementation..."
                  rows={4}
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => router.push('/dashboard')}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Creating...' : 'Create Initiative'}
            </Button>
          </div>
        </>
      )}
    </form>
  )
}