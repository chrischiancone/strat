'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { deleteInitiative, type Initiative } from '@/app/actions/initiatives'
import { getFundingSources } from '@/app/actions/initiative-budgets'
import {
  getInitiativeKpis,
  createInitiativeKpi,
  updateInitiativeKpi,
  deleteInitiativeKpi,
  type InitiativeKpi,
} from '@/app/actions/initiative-kpis'
import { InitiativeFinancialForm } from './InitiativeFinancialForm'
import { InitiativeKpisForm } from './InitiativeKpisForm'
import { useToast } from '@/hooks/use-toast'
import { ChevronDown, ChevronUp, Edit, Trash2, DollarSign } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface InitiativeCardProps {
  initiative: Initiative
  fiscalYearId: string
  onEdit: () => void
  onDelete: () => void
}

export function InitiativeCard({
  initiative,
  fiscalYearId,
  onEdit,
  onDelete,
}: InitiativeCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showBudgetDialog, setShowBudgetDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [fundingStatus, setFundingStatus] = useState<{
    totalFunding: number
    difference: number
  } | null>(null)
  const [kpis, setKpis] = useState<InitiativeKpi[]>([])
  const [isLoadingKpis, setIsLoadingKpis] = useState(false)
  const { toast} = useToast()

  const loadFundingStatus = useCallback(async () => {
    try {
      const sources = await getFundingSources(initiative.id)
      const totalFunding = sources.reduce((sum, s) => sum + s.amount, 0)
      const totalBudget =
        initiative.total_year_1_cost +
        initiative.total_year_2_cost +
        initiative.total_year_3_cost

      setFundingStatus({
        totalFunding,
        difference: totalFunding - totalBudget,
      })
    } catch (error) {
      console.error('Error loading funding status:', error)
    }
  }, [initiative.id, initiative.total_year_1_cost, initiative.total_year_2_cost, initiative.total_year_3_cost])

  const loadKpis = useCallback(async () => {
    setIsLoadingKpis(true)
    try {
      const kpisData = await getInitiativeKpis(initiative.id)
      setKpis(kpisData)
    } catch (error) {
      console.error('Error loading KPIs:', error)
    } finally {
      setIsLoadingKpis(false)
    }
  }, [initiative.id])

  // Load funding status when component mounts or budget changes
  useEffect(() => {
    const totalBudget =
      initiative.total_year_1_cost +
      initiative.total_year_2_cost +
      initiative.total_year_3_cost

    if (totalBudget > 0) {
      loadFundingStatus()
    }
  }, [loadFundingStatus, initiative.total_year_1_cost, initiative.total_year_2_cost, initiative.total_year_3_cost])

  // Load KPIs when card is expanded
  useEffect(() => {
    if (isExpanded) {
      loadKpis()
    }
  }, [isExpanded, loadKpis])

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteInitiative(initiative.id)
      toast({
        title: 'Deleted',
        description: 'Initiative deleted successfully',
      })
      onDelete()
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to delete initiative',
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  const handleBudgetDialogClose = () => {
    setShowBudgetDialog(false)
    loadFundingStatus() // Refresh funding status when dialog closes
  }

  const handleAddKpi = async (kpi: Omit<InitiativeKpi, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      await createInitiativeKpi({
        initiative_id: kpi.initiative_id,
        metric_name: kpi.metric_name,
        measurement_frequency: kpi.measurement_frequency,
        baseline_value: kpi.baseline_value,
        year_1_target: kpi.year_1_target,
        year_2_target: kpi.year_2_target,
        year_3_target: kpi.year_3_target,
        data_source: kpi.data_source,
        responsible_party: kpi.responsible_party,
      })
      await loadKpis()
      return { id: '' } // Return value not used, but required by interface
    } catch (error) {
      throw error
    }
  }

  const handleUpdateKpi = async (id: string, kpi: Partial<InitiativeKpi>) => {
    try {
      await updateInitiativeKpi({
        id,
        metric_name: kpi.metric_name,
        measurement_frequency: kpi.measurement_frequency,
        baseline_value: kpi.baseline_value,
        year_1_target: kpi.year_1_target,
        year_2_target: kpi.year_2_target,
        year_3_target: kpi.year_3_target,
        data_source: kpi.data_source,
        responsible_party: kpi.responsible_party,
      })
      await loadKpis()
    } catch (error) {
      throw error
    }
  }

  const handleDeleteKpi = async (id: string) => {
    try {
      await deleteInitiativeKpi(id)
      await loadKpis()
    } catch (error) {
      throw error
    }
  }

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'NEED':
        return 'bg-red-100 text-red-800'
      case 'WANT':
        return 'bg-yellow-100 text-yellow-800'
      case 'NICE_TO_HAVE':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'not_started':
        return 'bg-gray-100 text-gray-800'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'at_risk':
        return 'bg-orange-100 text-orange-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'deferred':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatStatus = (status: string) => {
    return status
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const getFundingStatusBadge = () => {
    if (!fundingStatus) return null

    const { difference } = fundingStatus
    const isBalanced = Math.abs(difference) < 0.01
    const isUnderFunded = difference < -0.01
    const isOverFunded = difference > 0.01

    if (isBalanced) {
      return (
        <Badge className="bg-green-100 text-green-800">✓ Funded</Badge>
      )
    } else if (isUnderFunded) {
      return (
        <Badge className="bg-red-100 text-red-800">⚠ Under-funded</Badge>
      )
    } else if (isOverFunded) {
      return (
        <Badge className="bg-orange-100 text-orange-800">⚠ Over-funded</Badge>
      )
    }
    return null
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const totalCost =
    initiative.total_year_1_cost +
    initiative.total_year_2_cost +
    initiative.total_year_3_cost

  // Type guard for budget breakdown
  const budgetBreakdown = (() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const budget = initiative.financial_analysis as any
    if (!budget || typeof budget !== 'object') return undefined
    if (!budget.year_1 || !budget.year_2 || !budget.year_3) return undefined
    return budget
  })()

  // Type guard for ROI analysis
  const roiAnalysis = (() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const roi = initiative.roi_analysis as any
    if (!roi || typeof roi !== 'object') return undefined
    if (!roi.financial || !roi.non_financial) return undefined
    return roi
  })()

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Badge className={getPriorityBadgeColor(initiative.priority_level)}>
                  {initiative.priority_level}
                </Badge>
                <Badge className={getStatusBadgeColor(initiative.status)}>
                  {formatStatus(initiative.status)}
                </Badge>
                {totalCost > 0 && getFundingStatusBadge()}
                {initiative.rank_within_priority > 0 && (
                  <span className="text-xs text-gray-500">
                    Rank: {initiative.rank_within_priority}
                  </span>
                )}
              </div>
              <CardTitle className="text-base">
                {initiative.initiative_number}: {initiative.name}
              </CardTitle>
              <CardDescription className="mt-1">
                {initiative.responsible_party && (
                  <span>Responsible: {initiative.responsible_party}</span>
                )}
                {totalCost > 0 && (
                  <span className={initiative.responsible_party ? 'ml-2' : ''}>
                    {initiative.responsible_party && '• '}
                    Total Cost: {formatCurrency(totalCost)}
                  </span>
                )}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowBudgetDialog(true)}
                title="Manage Budget"
              >
                <DollarSign className="h-4 w-4" />
              </Button>
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
            {initiative.description && (
              <div>
                <h4 className="font-semibold text-sm text-gray-700 mb-2">
                  Description
                </h4>
                <p className="text-sm text-gray-600">{initiative.description}</p>
              </div>
            )}

            {/* Rationale */}
            {initiative.rationale && (
              <div>
                <h4 className="font-semibold text-sm text-gray-700 mb-2">
                  Rationale
                </h4>
                <p className="text-sm text-gray-600">{initiative.rationale}</p>
              </div>
            )}

            {/* Expected Outcomes */}
            {initiative.expected_outcomes &&
              initiative.expected_outcomes.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm text-gray-700 mb-2">
                    Expected Outcomes
                  </h4>
                  <ul className="list-disc list-inside space-y-1">
                    {initiative.expected_outcomes.map((outcome, index) => (
                      <li key={index} className="text-sm text-gray-600">
                        {outcome}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            {/* ROI Summary */}
            {roiAnalysis && (
              <div className="border-t border-gray-200 pt-4">
                <h4 className="font-semibold text-sm text-gray-700 mb-2">
                  Return on Investment
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Financial ROI */}
                  {roiAnalysis.financial && (
                    <div className="rounded-md bg-blue-50 border border-blue-200 p-3">
                      <p className="text-xs font-semibold text-blue-900 mb-2">
                        Financial Impact
                      </p>
                      <div className="space-y-1 text-sm text-blue-800">
                        <p>
                          <span className="font-semibold">3-Year Impact:</span>{' '}
                          {formatCurrency(roiAnalysis.financial.three_year_impact)}
                        </p>
                        {roiAnalysis.financial.payback_months > 0 && (
                          <p>
                            <span className="font-semibold">Payback:</span>{' '}
                            {roiAnalysis.financial.payback_months} months
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Non-Financial ROI */}
                  {roiAnalysis.non_financial && (
                    <div className="rounded-md bg-green-50 border border-green-200 p-3">
                      <p className="text-xs font-semibold text-green-900 mb-2">
                        Non-Financial Benefits
                      </p>
                      <ul className="space-y-1 text-xs text-green-800">
                        {roiAnalysis.non_financial.service_quality && (
                          <li>• Service Quality Improvement</li>
                        )}
                        {roiAnalysis.non_financial.efficiency_gains && (
                          <li>• Efficiency Gains</li>
                        )}
                        {roiAnalysis.non_financial.risk_reduction && (
                          <li>• Risk Reduction</li>
                        )}
                        {roiAnalysis.non_financial.citizen_satisfaction && (
                          <li>• Citizen Satisfaction Impact</li>
                        )}
                        {roiAnalysis.non_financial.employee_impact && (
                          <li>• Employee Impact</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* KPIs Section */}
            {!isLoadingKpis && (
              <div className="border-t border-gray-200 pt-4">
                <InitiativeKpisForm
                  initiativeId={initiative.id}
                  kpis={kpis}
                  onAdd={handleAddKpi}
                  onUpdate={handleUpdateKpi}
                  onDelete={handleDeleteKpi}
                />
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Initiative?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{initiative.name}&quot;?
              <span className="block mt-2">This action cannot be undone.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Deleting...' : 'Delete Initiative'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Budget Management Dialog */}
      <Dialog open={showBudgetDialog} onOpenChange={handleBudgetDialogClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Financial Analysis</DialogTitle>
            <DialogDescription>
              Manage budget breakdown and funding sources for {initiative.initiative_number}: {initiative.name}
            </DialogDescription>
          </DialogHeader>
          <InitiativeFinancialForm
            initiativeId={initiative.id}
            fiscalYearId={fiscalYearId}
            initialBudget={budgetBreakdown}
            initialRoi={roiAnalysis}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
