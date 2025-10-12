'use client'

import { useState, useEffect } from 'react'
import { InitiativeSummaryCards } from './InitiativeSummaryCards'
import { AtRiskAlert } from './AtRiskAlert'
import { InitiativeCountCharts } from './InitiativeCountCharts'
import { InitiativesTable } from './InitiativesTable'
import { getCityWideInitiatives, type CityWideInitiativesData, type InitiativeFilters } from '@/app/actions/city-initiatives'
import { Loader2 } from 'lucide-react'

export function InitiativesDashboardContent() {
  const [data, setData] = useState<CityWideInitiativesData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<InitiativeFilters>({})
  const [page, setPage] = useState(1)

  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      setError(null)
      try {
        const initiativesData = await getCityWideInitiatives(filters, page, 50)
        setData(initiativesData)
      } catch (err) {
        console.error('Error loading initiatives data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load initiatives data')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [filters, page])

  const handleSearchChange = (search: string) => {
    setFilters((prev) => ({ ...prev, search: search || undefined }))
    setPage(1) // Reset to first page on search
  }

  const handleSortChange = (sortBy: string, sortOrder: 'asc' | 'desc') => {
    setFilters((prev) => ({ ...prev, sortBy, sortOrder }))
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

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
        <p className="text-sm text-muted-foreground">No initiatives data available</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <InitiativeSummaryCards data={data} />

      {/* At-Risk Alert */}
      {data.atRiskInitiatives.length > 0 && (
        <AtRiskAlert initiatives={data.atRiskInitiatives.slice(0, 5)} />
      )}

      {/* Count Charts */}
      <InitiativeCountCharts counts={data.counts} />

      {/* All Initiatives Table */}
      <InitiativesTable
        initiatives={data.initiatives}
        pagination={data.pagination}
        onSearchChange={handleSearchChange}
        onSortChange={handleSortChange}
        onPageChange={handlePageChange}
      />
    </div>
  )
}
