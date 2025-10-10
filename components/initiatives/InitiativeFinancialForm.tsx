'use client'

import { useState, useEffect, useCallback } from 'react'
import { BudgetBreakdownForm, type BudgetBreakdown } from './BudgetBreakdownForm'
import { FundingSourcesForm, type FundingSource } from './FundingSourcesForm'
import {
  updateInitiativeBudget,
  getFundingSources,
  addFundingSource,
  updateFundingSource,
  deleteFundingSource,
  type AddFundingSourceInput,
} from '@/app/actions/initiative-budgets'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'

interface InitiativeFinancialFormProps {
  initiativeId: string
  fiscalYearId: string
  initialBudget?: BudgetBreakdown
  disabled?: boolean
}

export function InitiativeFinancialForm({
  initiativeId,
  fiscalYearId,
  initialBudget,
  disabled = false,
}: InitiativeFinancialFormProps) {
  const [fundingSources, setFundingSources] = useState<FundingSource[]>([])
  const [currentBudget, setCurrentBudget] = useState<BudgetBreakdown | undefined>(initialBudget)
  const [isLoadingFunding, setIsLoadingFunding] = useState(true)
  const { toast } = useToast()

  const loadFundingSources = useCallback(async () => {
    try {
      const sources = await getFundingSources(initiativeId)
      setFundingSources(sources)
    } catch (error) {
      console.error('Error loading funding sources:', error)
      toast({
        title: 'Error',
        description: 'Failed to load funding sources',
        variant: 'destructive',
      })
    } finally {
      setIsLoadingFunding(false)
    }
  }, [initiativeId, toast])

  // Load funding sources on mount
  useEffect(() => {
    loadFundingSources()
  }, [loadFundingSources])

  const handleSaveBudget = async (budget: BudgetBreakdown) => {
    await updateInitiativeBudget(initiativeId, budget)
    setCurrentBudget(budget)
  }

  const handleAddFundingSource = async (
    source: Omit<FundingSource, 'id'>
  ): Promise<{ id: string }> => {
    const input: AddFundingSourceInput = {
      initiative_id: initiativeId,
      fiscal_year_id: source.fiscal_year_id,
      funding_source: source.funding_source,
      amount: source.amount,
      funding_status: source.funding_status,
    }
    const result = await addFundingSource(input)
    await loadFundingSources()
    return result
  }

  const handleUpdateFundingSource = async (
    id: string,
    source: Partial<FundingSource>
  ): Promise<void> => {
    await updateFundingSource({
      id,
      funding_source: source.funding_source,
      amount: source.amount,
      funding_status: source.funding_status,
    })
    await loadFundingSources()
  }

  const handleDeleteFundingSource = async (id: string): Promise<void> => {
    await deleteFundingSource(id)
    await loadFundingSources()
  }

  const totalBudget = currentBudget?.grand_total || 0

  return (
    <div className="space-y-6">
      <Tabs defaultValue="budget" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="budget">Budget Breakdown</TabsTrigger>
          <TabsTrigger value="funding">Funding Sources</TabsTrigger>
        </TabsList>

        <TabsContent value="budget" className="mt-6">
          <BudgetBreakdownForm
            initialBudget={currentBudget}
            onSave={handleSaveBudget}
            disabled={disabled}
          />
        </TabsContent>

        <TabsContent value="funding" className="mt-6">
          {isLoadingFunding ? (
            <div className="text-center py-8 text-gray-500">
              Loading funding sources...
            </div>
          ) : (
            <FundingSourcesForm
              initiativeId={initiativeId}
              fiscalYearId={fiscalYearId}
              totalBudget={totalBudget}
              fundingSources={fundingSources}
              onAdd={handleAddFundingSource}
              onUpdate={handleUpdateFundingSource}
              onDelete={handleDeleteFundingSource}
              disabled={disabled}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
