'use client'

import { useState, useEffect } from 'react'
import { Loader2, Download } from 'lucide-react'
import * as XLSX from 'xlsx'
import { BudgetSummaryCards } from './BudgetSummaryCards'
import { BudgetFilters } from './BudgetFilters'
import { InitiativeBudgetsTable } from './InitiativeBudgetsTable'
import { Button } from '@/components/ui/button'
import { CardSkeleton, TableSkeleton } from '@/components/ui/skeleton'
import { ErrorEmptyState, NoDataEmptyState } from '@/components/ui/empty-state'
import {
  getFinanceInitiativeBudgets,
  getFinanceBudgetExportData,
  type FinanceBudgetsData,
  type FinanceBudgetFilters,
} from '@/app/actions/finance-budgets-simple'

interface FinanceBudgetDashboardContentProps {
  fiscalYears: Array<{ id: string; year: number }>
  departments: Array<{ id: string; name: string }>
}

export function FinanceBudgetDashboardContent({
  fiscalYears,
  departments,
}: FinanceBudgetDashboardContentProps) {
  const [data, setData] = useState<FinanceBudgetsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<FinanceBudgetFilters>({})
  const [currentPage, setCurrentPage] = useState(1)
  const [sortBy, setSortBy] = useState('total_cost')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const pageSize = 50

  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      setError(null)
      try {
        const budgetData = await getFinanceInitiativeBudgets(
          filters,
          currentPage,
          pageSize,
          sortBy,
          sortOrder
        )
        setData(budgetData)
      } catch (err) {
        console.error('Error loading budget data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load budget data')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [filters, currentPage, sortBy, sortOrder])

  const handleFiltersChange = (newFilters: FinanceBudgetFilters) => {
    setFilters(newFilters)
    setCurrentPage(1) // Reset to first page when filters change
  }

  const handleSort = (field: string, order: 'asc' | 'desc') => {
    setSortBy(field)
    setSortOrder(order)
  }

  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)
    try {
      // Fetch export data
      const exportData = await getFinanceBudgetExportData(filters)

      // Sheet 1: All Initiatives
      const initiativesData = exportData.initiatives.map((init) => ({
        Department: init.department_name,
        'Initiative Name': init.initiative_name,
        Goal: init.goal_title,
        Priority: init.priority_level,
        Status: init.status,
        'Year 1 Cost': init.year_1_cost,
        'Year 2 Cost': init.year_2_cost,
        'Year 3 Cost': init.year_3_cost,
        'Total Cost': init.total_cost,
        'Funding Sources': init.funding_sources.join(', '),
        'Fiscal Year': init.fiscal_year,
      }))

      const ws1 = XLSX.utils.json_to_sheet(initiativesData)
      ws1['!cols'] = [
        { wch: 25 },
        { wch: 35 },
        { wch: 35 },
        { wch: 12 },
        { wch: 12 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
        { wch: 30 },
        { wch: 12 },
      ]

      // Sheet 2: Budget by Department
      const deptData = exportData.budget_by_department.map((dept) => ({
        Department: dept.department_name,
        'Total Budget': dept.total,
        'Initiative Count': dept.initiative_count,
      }))

      const ws2 = XLSX.utils.json_to_sheet(deptData)
      ws2['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 15 }]

      // Sheet 3: Budget by Funding Source
      const fundingData = exportData.budget_by_funding_source.map((fund) => ({
        'Funding Source': fund.funding_source,
        'Total Budget': fund.total,
        'Initiative Count': fund.initiative_count,
      }))

      const ws3 = XLSX.utils.json_to_sheet(fundingData)
      ws3['!cols'] = [{ wch: 30 }, { wch: 15 }, { wch: 15 }]

      // Sheet 4: Budget by Category
      const categoryData = exportData.budget_by_category.map((cat) => ({
        Category: cat.category_display,
        'Total Budget': cat.total,
        'Initiative Count': cat.initiative_count,
      }))

      const ws4 = XLSX.utils.json_to_sheet(categoryData)
      ws4['!cols'] = [{ wch: 30 }, { wch: 15 }, { wch: 15 }]

      // Sheet 5: Budget by Fiscal Year
      const yearData = exportData.budget_by_fiscal_year.map((year) => ({
        'Fiscal Year': year.fiscal_year,
        'Total Budget': year.total,
        'Initiative Count': year.initiative_count,
      }))

      const ws5 = XLSX.utils.json_to_sheet(yearData)
      ws5['!cols'] = [{ wch: 15 }, { wch: 15 }, { wch: 15 }]

      // Create workbook and add sheets
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws1, 'All Initiatives')
      XLSX.utils.book_append_sheet(wb, ws2, 'By Department')
      XLSX.utils.book_append_sheet(wb, ws3, 'By Funding Source')
      XLSX.utils.book_append_sheet(wb, ws4, 'By Category')
      XLSX.utils.book_append_sheet(wb, ws5, 'By Fiscal Year')

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0]
      const filename = `budget-data-${timestamp}.xlsx`

      // Download file
      XLSX.writeFile(wb, filename)
    } catch (error) {
      console.error('Export failed:', error)
      alert('Failed to export budget data. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  if (isLoading && !data) {
    return (
      <div className="space-y-6">
        {/* Summary Cards Skeleton */}
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
        {/* Table Skeleton */}
        <TableSkeleton rows={10} />
      </div>
    )
  }

  if (error) {
    return <ErrorEmptyState message={error} onRetry={() => window.location.reload()} />
  }

  if (!data) {
    return <NoDataEmptyState resourceName="Budget Data" />
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <BudgetSummaryCards summary={data.summary} />

      {/* Filters and Export */}
      <div className="space-y-4">
        <BudgetFilters
          fiscalYears={fiscalYears}
          departments={departments}
          onFiltersChange={handleFiltersChange}
        />

        {/* Export Button */}
        <div className="flex justify-end">
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export to Excel
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Table */}
      <InitiativeBudgetsTable
        initiatives={data.initiatives}
        totalCount={data.total_count}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onSort={handleSort}
        currentSortBy={sortBy}
        currentSortOrder={sortOrder}
      />
    </div>
  )
}
