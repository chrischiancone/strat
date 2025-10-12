'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { FiscalYear } from '@/app/actions/strategic-plans'
import { Button } from '@/components/ui/button'

interface DashboardFiltersProps {
  fiscalYears: FiscalYear[]
  departments: { id: string; name: string }[]
  currentFilters: {
    status?: string
    fiscal_year?: string
    department?: string
  }
}

export function DashboardFilters({
  fiscalYears,
  departments,
  currentFilters,
}: DashboardFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }

    // Reset sorting when changing filters
    params.delete('sortBy')
    params.delete('sortOrder')

    router.push(`${pathname}?${params.toString()}`)
  }

  const clearFilters = () => {
    router.push(pathname)
  }

  const hasFilters = currentFilters.status || currentFilters.fiscal_year || currentFilters.department

  return (
    <div className="border-b border-gray-200 bg-gray-50 p-4">
      <div className="flex flex-wrap items-center gap-4">
        {/* Status Filter */}
        <div>
          <label htmlFor="status-filter" className="block text-xs font-medium text-gray-700">
            Status
          </label>
          <select
            id="status-filter"
            value={currentFilters.status || ''}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="under_review">Under Review</option>
            <option value="approved">Approved</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        {/* Fiscal Year Filter */}
        <div>
          <label htmlFor="fiscal-year-filter" className="block text-xs font-medium text-gray-700">
            Fiscal Year
          </label>
          <select
            id="fiscal-year-filter"
            value={currentFilters.fiscal_year || ''}
            onChange={(e) => handleFilterChange('fiscal_year', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Fiscal Years</option>
            {fiscalYears.map((fy) => (
              <option key={fy.id} value={fy.id}>
                FY {fy.year}
              </option>
            ))}
          </select>
        </div>

        {/* Department Filter */}
        <div>
          <label htmlFor="department-filter" className="block text-xs font-medium text-gray-700">
            Department
          </label>
          <select
            id="department-filter"
            value={currentFilters.department || ''}
            onChange={(e) => handleFilterChange('department', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Departments</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>

        {/* Clear Filters Button */}
        {hasFilters && (
          <div className="flex items-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="mt-5"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
