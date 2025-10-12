'use client'

import { useState } from 'react'
import { Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import type { FinanceBudgetFilters } from '@/app/actions/finance-budgets'

interface BudgetFiltersProps {
  fiscalYears: Array<{ id: string; year: number }>
  departments: Array<{ id: string; name: string }>
  onFiltersChange: (filters: FinanceBudgetFilters) => void
}

const PRIORITY_LEVELS = [
  { value: 'NEED', label: 'Need (Critical)' },
  { value: 'WANT', label: 'Want (Important)' },
  { value: 'NICE_TO_HAVE', label: 'Nice to Have' },
]

const FUNDING_SOURCES = [
  { value: 'General Fund', label: 'General Fund' },
  { value: 'Grants', label: 'Grants' },
  { value: 'Bonds', label: 'Bonds' },
  { value: 'Fees', label: 'Fees' },
  { value: 'Other', label: 'Other' },
]

const FUNDING_STATUSES = [
  { value: 'secured', label: 'Secured' },
  { value: 'requested', label: 'Requested' },
  { value: 'pending', label: 'Pending' },
  { value: 'projected', label: 'Projected' },
]

export function BudgetFilters({ fiscalYears, departments, onFiltersChange }: BudgetFiltersProps) {
  const [search, setSearch] = useState('')
  const [selectedFiscalYears, setSelectedFiscalYears] = useState<string[]>([])
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([])
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([])
  const [selectedFundingSources, setSelectedFundingSources] = useState<string[]>([])
  const [selectedFundingStatuses, setSelectedFundingStatuses] = useState<string[]>([])

  const handleApplyFilters = () => {
    onFiltersChange({
      search: search.trim() || undefined,
      fiscal_year_ids: selectedFiscalYears.length > 0 ? selectedFiscalYears : undefined,
      department_ids: selectedDepartments.length > 0 ? selectedDepartments : undefined,
      priority_levels: selectedPriorities.length > 0 ? selectedPriorities : undefined,
      funding_sources: selectedFundingSources.length > 0 ? selectedFundingSources : undefined,
      funding_statuses: selectedFundingStatuses.length > 0 ? selectedFundingStatuses : undefined,
    })
  }

  const handleClearFilters = () => {
    setSearch('')
    setSelectedFiscalYears([])
    setSelectedDepartments([])
    setSelectedPriorities([])
    setSelectedFundingSources([])
    setSelectedFundingStatuses([])
    onFiltersChange({})
  }

  const activeFiltersCount =
    (search ? 1 : 0) +
    selectedFiscalYears.length +
    selectedDepartments.length +
    selectedPriorities.length +
    selectedFundingSources.length +
    selectedFundingStatuses.length

  const toggleSelection = (
    value: string,
    selected: string[],
    setSelected: (values: string[]) => void
  ) => {
    if (selected.includes(value)) {
      setSelected(selected.filter((v) => v !== value))
    } else {
      setSelected([...selected, value])
    }
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        {activeFiltersCount > 0 && (
          <Button variant="ghost" size="sm" onClick={handleClearFilters}>
            <X className="mr-1 h-4 w-4" />
            Clear All ({activeFiltersCount})
          </Button>
        )}
      </div>

      <div className="space-y-6">
        {/* Search */}
        <div>
          <Label htmlFor="search" className="mb-2 text-sm font-medium">
            Search Initiatives
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              id="search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
              placeholder="Search by initiative name..."
              className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
          {/* Fiscal Years */}
          <div>
            <Label className="mb-2 text-sm font-medium">Fiscal Years</Label>
            <div className="space-y-2">
              {fiscalYears.map((fy) => (
                <label key={fy.id} className="flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={selectedFiscalYears.includes(fy.id)}
                    onChange={() =>
                      toggleSelection(fy.id, selectedFiscalYears, setSelectedFiscalYears)
                    }
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">FY {fy.year}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Departments */}
          <div>
            <Label className="mb-2 text-sm font-medium">Departments</Label>
            <div className="max-h-40 space-y-2 overflow-y-auto">
              {departments.map((dept) => (
                <label key={dept.id} className="flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={selectedDepartments.includes(dept.id)}
                    onChange={() =>
                      toggleSelection(dept.id, selectedDepartments, setSelectedDepartments)
                    }
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{dept.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Priority Levels */}
          <div>
            <Label className="mb-2 text-sm font-medium">Priority Levels</Label>
            <div className="space-y-2">
              {PRIORITY_LEVELS.map((priority) => (
                <label key={priority.value} className="flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={selectedPriorities.includes(priority.value)}
                    onChange={() =>
                      toggleSelection(priority.value, selectedPriorities, setSelectedPriorities)
                    }
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{priority.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Funding Sources */}
          <div>
            <Label className="mb-2 text-sm font-medium">Funding Sources</Label>
            <div className="space-y-2">
              {FUNDING_SOURCES.map((source) => (
                <label key={source.value} className="flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={selectedFundingSources.includes(source.value)}
                    onChange={() =>
                      toggleSelection(
                        source.value,
                        selectedFundingSources,
                        setSelectedFundingSources
                      )
                    }
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{source.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Funding Status */}
          <div>
            <Label className="mb-2 text-sm font-medium">Funding Status</Label>
            <div className="space-y-2">
              {FUNDING_STATUSES.map((status) => (
                <label key={status.value} className="flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={selectedFundingStatuses.includes(status.value)}
                    onChange={() =>
                      toggleSelection(
                        status.value,
                        selectedFundingStatuses,
                        setSelectedFundingStatuses
                      )
                    }
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{status.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Apply Button */}
        <div className="flex justify-end">
          <Button onClick={handleApplyFilters}>
            <Search className="mr-2 h-4 w-4" />
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  )
}
