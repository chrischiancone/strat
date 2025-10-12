'use client'

import { useState, useEffect } from 'react'
import { BudgetSummaryCards } from './BudgetSummaryCards'
import { BudgetByYearChart } from './BudgetByYearChart'
import { BudgetByDepartmentChart } from './BudgetByDepartmentChart'
import { BudgetByFundingSourceChart } from './BudgetByFundingSourceChart'
import { TopInitiativesTable } from './TopInitiativesTable'
import { BudgetFilters } from './BudgetFilters'
import { getCityWideBudget, type CityWideBudgetData, type BudgetFilters as FilterType } from '@/app/actions/city-budget'
import { Loader2 } from 'lucide-react'

export function BudgetDashboardContent() {
  const [data, setData] = useState<CityWideBudgetData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<FilterType>({})

  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      setError(null)
      try {
        const budgetData = await getCityWideBudget(filters)
        setData(budgetData)
      } catch (err) {
        console.error('Error loading budget data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load budget data')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [filters])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-sm text-red-800">{error}</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 text-center">
        <p className="text-sm text-muted-foreground">No budget data available</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <BudgetFilters onFiltersChange={setFilters} />

      {/* Summary Cards */}
      <BudgetSummaryCards data={data} />

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <BudgetByYearChart data={data.budgetByYear} />
        <BudgetByFundingSourceChart data={data.budgetByFundingSource} />
      </div>

      {/* Department Chart - Full Width */}
      <BudgetByDepartmentChart data={data.budgetByDepartment} />

      {/* Top Initiatives Table */}
      <TopInitiativesTable data={data.topInitiatives} />
    </div>
  )
}
