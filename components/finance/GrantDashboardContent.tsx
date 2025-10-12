'use client'

import { useState, useEffect, useCallback } from 'react'
import { GrantFilters, GrantInitiativesData, getGrantInitiatives } from '@/app/actions/grants'
import { GrantInitiativesTable } from './GrantInitiativesTable'
import { DollarSign, FileText, CheckCircle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CardSkeleton, TableSkeleton } from '@/components/ui/skeleton'
import { ErrorEmptyState, NoDataEmptyState } from '@/components/ui/empty-state'
import * as XLSX from 'xlsx'

interface GrantDashboardContentProps {
  fiscalYears: Array<{ id: string; year: number }>
  departments: Array<{ id: string; name: string }>
}

export function GrantDashboardContent({ fiscalYears, departments }: GrantDashboardContentProps) {
  const [data, setData] = useState<GrantInitiativesData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [selectedFiscalYears, setSelectedFiscalYears] = useState<string[]>([])
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([])
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])

  const loadData = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const filters: GrantFilters = {}

      if (selectedFiscalYears.length > 0) {
        filters.fiscal_year_ids = selectedFiscalYears
      }

      if (selectedDepartments.length > 0) {
        filters.department_ids = selectedDepartments
      }

      if (selectedStatuses.length > 0) {
        filters.grant_status = selectedStatuses
      }

      const result = await getGrantInitiatives(filters)
      setData(result)
    } catch (err) {
      console.error('Error loading grant initiatives:', err)
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setIsLoading(false)
    }
  }, [selectedFiscalYears, selectedDepartments, selectedStatuses])

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

  const handleStatusToggle = (status: string) => {
    setSelectedStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    )
  }

  const clearFilters = () => {
    setSelectedFiscalYears([])
    setSelectedDepartments([])
    setSelectedStatuses([])
  }

  const handleExport = () => {
    if (!data || data.initiatives.length === 0) {
      return
    }

    // Prepare data for export
    const exportData = data.initiatives.map((init) => ({
      Department: init.department_name,
      Initiative: init.initiative_name,
      'Grant Source': init.grant_source,
      'Grant Amount': init.grant_amount,
      'Total Cost': init.total_cost,
      'Grant Status': init.grant_status,
      Priority: init.priority_level,
      'Initiative Status': init.status,
      'Fiscal Year': init.fiscal_year,
    }))

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(exportData)

    // Set column widths
    const wscols = [
      { wch: 25 }, // Department
      { wch: 40 }, // Initiative
      { wch: 30 }, // Grant Source
      { wch: 15 }, // Grant Amount
      { wch: 15 }, // Total Cost
      { wch: 15 }, // Grant Status
      { wch: 15 }, // Priority
      { wch: 15 }, // Initiative Status
      { wch: 12 }, // Fiscal Year
    ]
    ws['!cols'] = wscols

    // Create workbook
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Grant Initiatives')

    // Add summary sheet
    const summaryData = [
      { Metric: 'Total Grant Funding', Value: data.summary.total_grant_funding },
      { Metric: 'Total Initiatives', Value: data.summary.total_initiatives },
      { Metric: 'Secured Amount', Value: data.summary.secured_amount },
      { Metric: 'Pending Amount', Value: data.summary.pending_amount },
      {},
      { Metric: 'By Status', Value: '' },
      ...data.summary.by_status.map((s) => ({
        Metric: `  ${s.status}`,
        Value: s.amount,
        Count: s.count,
      })),
      {},
      { Metric: 'By Department', Value: '' },
      ...data.summary.by_department.map((d) => ({
        Metric: `  ${d.department_name}`,
        Value: d.amount,
        Count: d.count,
      })),
    ]

    const wsSummary = XLSX.utils.json_to_sheet(summaryData)
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary')

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().slice(0, 10)
    const filename = `grant-initiatives-${timestamp}.xlsx`

    // Save file
    XLSX.writeFile(wb, filename)
  }

  const activeFilterCount =
    (selectedFiscalYears.length > 0 ? 1 : 0) +
    (selectedDepartments.length > 0 ? 1 : 0) +
    (selectedStatuses.length > 0 ? 1 : 0)

  if (error) {
    return <ErrorEmptyState message={error} onRetry={loadData} />
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

        <div className="grid gap-6 md:grid-cols-3">
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

          {/* Grant Status Filter */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Grant Status</label>
            <div className="space-y-2">
              {['secured', 'requested', 'pending', 'projected'].map((status) => (
                <label key={status} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedStatuses.includes(status)}
                    onChange={() => handleStatusToggle(status)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 capitalize">{status}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <>
          {/* Summary Cards Skeleton */}
          <div className="grid gap-6 md:grid-cols-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
          {/* Table Skeleton */}
          <TableSkeleton rows={8} />
        </>
      ) : data ? (
        <>
          {/* Summary Cards */}
          <div className="grid gap-6 md:grid-cols-4">
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Grant Funding</p>
                  <p className="mt-2 text-2xl font-bold text-gray-900">
                    {formatCurrency(data.summary.total_grant_funding)}
                  </p>
                </div>
                <DollarSign className="h-10 w-10 text-blue-500" />
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Initiatives</p>
                  <p className="mt-2 text-2xl font-bold text-gray-900">
                    {data.summary.total_initiatives}
                  </p>
                </div>
                <FileText className="h-10 w-10 text-green-500" />
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Secured</p>
                  <p className="mt-2 text-2xl font-bold text-green-600">
                    {formatCurrency(data.summary.secured_amount)}
                  </p>
                </div>
                <CheckCircle className="h-10 w-10 text-green-500" />
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="mt-2 text-2xl font-bold text-amber-600">
                    {formatCurrency(data.summary.pending_amount)}
                  </p>
                </div>
                <Clock className="h-10 w-10 text-amber-500" />
              </div>
            </div>
          </div>

          {/* Table */}
          <GrantInitiativesTable initiatives={data.initiatives} onExport={handleExport} />
        </>
      ) : (
        <NoDataEmptyState resourceName="Grant-Funded Initiatives" />
      )}
    </div>
  )
}
