'use client'

import { useState, useEffect, useCallback } from 'react'
import { CategoryFilters, CategorySummary, getBudgetCategories } from '@/app/actions/budget-categories'
import { CategoryCharts } from './CategoryCharts'
import { CategoryBreakdownTable } from './CategoryBreakdownTable'
import { DollarSign, Layers } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CategoryDashboardContentProps {
  fiscalYears: Array<{ id: string; year: number }>
  departments: Array<{ id: string; name: string }>
}

export function CategoryDashboardContent({ fiscalYears, departments }: CategoryDashboardContentProps) {
  const [data, setData] = useState<CategorySummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [selectedFiscalYears, setSelectedFiscalYears] = useState<string[]>([])
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([])

  const loadData = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const filters: CategoryFilters = {}

      if (selectedFiscalYears.length > 0) {
        filters.fiscal_year_ids = selectedFiscalYears
      }

      if (selectedDepartments.length > 0) {
        filters.department_ids = selectedDepartments
      }

      const result = await getBudgetCategories(filters)
      setData(result)
    } catch (err) {
      console.error('Error loading budget categories:', err)
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setIsLoading(false)
    }
  }, [selectedFiscalYears, selectedDepartments])

  useEffect(() => {
    loadData()
  }, [loadData])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const handleFiscalYearToggle = (yearId: string) => {
    setSelectedFiscalYears((prev) =>
      prev.includes(yearId) ? prev.filter((id) => id !== yearId) : [...prev, yearId]
    )
  }

  const handleDepartmentToggle = (deptId: string) => {
    setSelectedDepartments((prev) =>
      prev.includes(deptId) ? prev.filter((id) => id !== deptId) : [...prev, deptId]
    )
  }

  const clearFilters = () => {
    setSelectedFiscalYears([])
    setSelectedDepartments([])
  }

  const activeFilterCount =
    (selectedFiscalYears.length > 0 ? 1 : 0) + (selectedDepartments.length > 0 ? 1 : 0)

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          {activeFilterCount > 0 && (
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Clear All ({activeFilterCount})
            </Button>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Fiscal Year Filter */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Fiscal Years</label>
            <div className="space-y-2">
              {fiscalYears.map((fy) => (
                <label key={fy.id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedFiscalYears.includes(fy.id)}
                    onChange={() => handleFiscalYearToggle(fy.id)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">FY {fy.year}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Department Filter */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Departments</label>
            <div className="max-h-48 space-y-2 overflow-y-auto">
              {departments.map((dept) => (
                <label key={dept.id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedDepartments.includes(dept.id)}
                    onChange={() => handleDepartmentToggle(dept.id)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{dept.name}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center rounded-lg border border-gray-200 bg-white p-12 shadow-sm">
          <div className="text-center">
            <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="text-sm text-gray-600">Loading budget categories...</p>
          </div>
        </div>
      ) : data ? (
        <>
          {/* Summary Cards */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Budget</p>
                  <p className="mt-2 text-2xl font-bold text-gray-900">
                    {formatCurrency(data.total_budget)}
                  </p>
                </div>
                <DollarSign className="h-10 w-10 text-blue-500" />
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Categories</p>
                  <p className="mt-2 text-2xl font-bold text-gray-900">
                    {data.categories.length}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {data.categories.reduce((sum, cat) => sum + cat.initiative_count, 0)} total initiatives
                  </p>
                </div>
                <Layers className="h-10 w-10 text-green-500" />
              </div>
            </div>
          </div>

          {/* Charts and Table */}
          <CategoryCharts categories={data.categories} />
          <CategoryBreakdownTable categories={data.categories} />
        </>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center shadow-sm">
          <p className="text-sm text-gray-500">No data available</p>
        </div>
      )}
    </div>
  )
}
