'use client'

import { useState, useEffect, useCallback } from 'react'
import { FundingSourceFilters, FundingSourceSummary, getFundingSourceData } from '@/app/actions/funding-sources-simple'
import { FundingSourcePieChart } from './FundingSourcePieChart'
import { FundingSourceTable } from './FundingSourceTable'
import { AlertTriangle, DollarSign, TrendingUp, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface FundingSourceDashboardContentProps {
  fiscalYears: Array<{ id: string; year: number }>
}

export function FundingSourceDashboardContent({ fiscalYears }: FundingSourceDashboardContentProps) {
  const [data, setData] = useState<FundingSourceSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [selectedFiscalYears, setSelectedFiscalYears] = useState<string[]>([])
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])

  const loadData = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const filters: FundingSourceFilters = {}

      if (selectedFiscalYears.length > 0) {
        filters.fiscal_year_ids = selectedFiscalYears
      }

      if (selectedStatuses.length > 0) {
        filters.funding_status = selectedStatuses
      }

      const result = await getFundingSourceData(filters)
      setData(result)
    } catch (err) {
      console.error('Error loading funding source data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setIsLoading(false)
    }
  }, [selectedFiscalYears, selectedStatuses])

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

  const handleStatusToggle = (status: string) => {
    setSelectedStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    )
  }

  const clearFilters = () => {
    setSelectedFiscalYears([])
    setSelectedStatuses([])
  }

  const activeFilterCount =
    (selectedFiscalYears.length > 0 ? 1 : 0) + (selectedStatuses.length > 0 ? 1 : 0)

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

          {/* Funding Status Filter */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Funding Status</label>
            <div className="space-y-2">
              {['secured', 'requested', 'pending', 'projected'].map((status) => (
                <label key={status} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedStatuses.includes(status)}
                    onChange={() => handleStatusToggle(status)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 capitalize">
                    {status.replace(/_/g, ' ')}
                  </span>
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
            <p className="text-sm text-gray-600">Loading funding source data...</p>
          </div>
        </div>
      ) : data ? (
        <>
          {/* Over-Commitment Alert */}
          {data.general_fund_over_committed && (
            <div className="rounded-lg border border-red-300 bg-red-50 p-6 shadow-sm">
              <div className="flex items-start">
                <AlertTriangle className="h-6 w-6 flex-shrink-0 text-red-600" />
                <div className="ml-3 flex-1">
                  <h3 className="text-lg font-semibold text-red-800">
                    General Fund Over-Committed!
                  </h3>
                  <p className="mt-2 text-sm text-red-700">
                    The General Fund has been allocated{' '}
                    <strong>{formatCurrency(data.general_fund_committed || 0)}</strong> but
                    only has a capacity of{' '}
                    <strong>{formatCurrency(data.general_fund_capacity || 0)}</strong>. This
                    exceeds available funds by{' '}
                    <strong>
                      {formatCurrency((data.general_fund_committed || 0) - (data.general_fund_capacity || 0))}
                    </strong>
                    .
                  </p>
                  <p className="mt-2 text-sm text-red-700">
                    Please review initiatives and adjust funding sources or defer lower-priority
                    items.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Summary Cards */}
          <div className="grid gap-6 md:grid-cols-3">
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
                  <p className="text-sm font-medium text-gray-600">Funding Sources</p>
                  <p className="mt-2 text-2xl font-bold text-gray-900">
                    {data.funding_sources.length}
                  </p>
                </div>
                <TrendingUp className="h-10 w-10 text-green-500" />
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">General Fund Status</p>
                  <p className={`mt-2 text-2xl font-bold ${data.general_fund_over_committed ? 'text-red-600' : 'text-green-600'}`}>
                    {data.general_fund_over_committed ? 'Over Budget' : 'Within Budget'}
                  </p>
                </div>
                {data.general_fund_over_committed ? (
                  <AlertTriangle className="h-10 w-10 text-red-500" />
                ) : (
                  <CheckCircle className="h-10 w-10 text-green-500" />
                )}
              </div>
            </div>
          </div>

          {/* Pie Chart and Table */}
          <div className="grid gap-6 lg:grid-cols-2">
            <FundingSourcePieChart fundingSources={data.funding_sources} />
            <div className="lg:col-span-2">
              <FundingSourceTable fundingSources={data.funding_sources} />
            </div>
          </div>
        </>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center shadow-sm">
          <p className="text-sm text-gray-500">No data available</p>
        </div>
      )}
    </div>
  )
}
