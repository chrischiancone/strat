'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useTransition, useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CalendarIcon, SearchIcon, FilterIcon } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'

interface AuditLogsFiltersProps {
  currentFilters: {
    action?: string
    entityType?: string
    userId?: string
    startDate?: string
    endDate?: string
    search?: string
  }
}

const actions = [
  { value: 'user_created', label: 'User Created' },
  { value: 'user_updated', label: 'User Updated' },
  { value: 'user_deactivated', label: 'User Deactivated' },
  { value: 'user_reactivated', label: 'User Reactivated' },
  { value: 'department_created', label: 'Department Created' },
  { value: 'department_updated', label: 'Department Updated' },
  { value: 'fiscal_year_created', label: 'Fiscal Year Created' },
  { value: 'fiscal_year_updated', label: 'Fiscal Year Updated' },
  { value: 'municipality_updated', label: 'Municipality Updated' },
]

const entityTypes = [
  { value: 'user', label: 'User' },
  { value: 'department', label: 'Department' },
  { value: 'fiscal_year', label: 'Fiscal Year' },
  { value: 'municipality', label: 'Municipality' },
  { value: 'strategic_plan', label: 'Strategic Plan' },
]

export function AuditLogsFilters({ currentFilters }: AuditLogsFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [searchInput, setSearchInput] = useState(currentFilters.search || '')
  const [startDate, setStartDate] = useState<Date | undefined>(
    currentFilters.startDate ? new Date(currentFilters.startDate) : undefined
  )
  const [endDate, setEndDate] = useState<Date | undefined>(
    currentFilters.endDate ? new Date(currentFilters.endDate) : undefined
  )
  const [showAdvanced, setShowAdvanced] = useState(false)

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    // Reset to page 1 when filtering
    params.delete('page')
    startTransition(() => {
      router.push(`/admin/audit-logs?${params.toString()}`)
    })
  }

  const clearFilters = () => {
    startTransition(() => {
      router.push('/admin/audit-logs')
    })
  }

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== currentFilters.search) {
        updateFilter('search', searchInput)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  const updateDateFilter = (key: 'startDate' | 'endDate', date: Date | undefined) => {
    const dateString = date ? date.toISOString().split('T')[0] : ''
    updateFilter(key, dateString)
    if (key === 'startDate') setStartDate(date)
    if (key === 'endDate') setEndDate(date)
  }

  const setQuickDateRange = (days: number) => {
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - days)
    updateDateFilter('startDate', start)
    updateDateFilter('endDate', end)
  }

  const activeFilterCount = [
    currentFilters.action,
    currentFilters.entityType,
    currentFilters.userId,
    currentFilters.startDate,
    currentFilters.endDate,
    currentFilters.search,
  ].filter(Boolean).length

  return (
    <div className="border-b border-gray-200 bg-white px-4 py-4 space-y-4">
      {/* Main Filters Row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-64">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search actions, entities, or users..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-10"
            disabled={isPending}
          />
        </div>

        {/* Action Filter */}
        <select
          value={currentFilters.action || ''}
          onChange={(e) => updateFilter('action', e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          disabled={isPending}
        >
          <option value="">All Actions</option>
          {actions.map((action) => (
            <option key={action.value} value={action.value}>
              {action.label}
            </option>
          ))}
        </select>

        {/* Entity Type Filter */}
        <select
          value={currentFilters.entityType || ''}
          onChange={(e) => updateFilter('entityType', e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          disabled={isPending}
        >
          <option value="">All Entity Types</option>
          {entityTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>

        {/* Advanced Filters Toggle */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
          disabled={isPending}
        >
          <FilterIcon className="h-4 w-4 mr-2" />
          Advanced {showAdvanced ? '▲' : '▼'}
        </Button>

        {/* Clear Filters */}
        {activeFilterCount > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            disabled={isPending}
          >
            Clear ({activeFilterCount})
          </Button>
        )}
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="space-y-3 border-t border-gray-100 pt-4">
          {/* Date Range Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <Label className="text-sm font-medium text-gray-600">Date Range:</Label>
            
            {/* Quick Date Buttons */}
            <div className="flex gap-1">
              {[1, 7, 30, 90].map((days) => (
                <Button
                  key={days}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setQuickDateRange(days)}
                  className="text-xs px-2 py-1 h-8"
                >
                  {days}d
                </Button>
              ))}
            </div>

            {/* Start Date */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={`justify-start text-left font-normal ${!startDate && 'text-muted-foreground'}`}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, 'MMM d, yyyy') : 'Start date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={(date) => updateDateFilter('startDate', date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            {/* End Date */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={`justify-start text-left font-normal ${!endDate && 'text-muted-foreground'}`}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, 'MMM d, yyyy') : 'End date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={(date) => updateDateFilter('endDate', date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* User Filter */}
          <div className="flex flex-wrap items-center gap-3">
            <Label className="text-sm font-medium text-gray-600">User ID:</Label>
            <Input
              placeholder="Filter by user ID"
              value={currentFilters.userId || ''}
              onChange={(e) => updateFilter('userId', e.target.value)}
              className="w-64"
              disabled={isPending}
            />
          </div>

          {/* Active Filters Display */}
          {activeFilterCount > 0 && (
            <div className="text-sm text-gray-600">
              <span className="font-medium">Active filters:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {currentFilters.search && (
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                    Search: "{currentFilters.search}"
                  </span>
                )}
                {currentFilters.action && (
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                    Action: {actions.find(a => a.value === currentFilters.action)?.label}
                  </span>
                )}
                {currentFilters.entityType && (
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                    Entity: {entityTypes.find(t => t.value === currentFilters.entityType)?.label}
                  </span>
                )}
                {currentFilters.startDate && (
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                    From: {format(new Date(currentFilters.startDate), 'MMM d')}
                  </span>
                )}
                {currentFilters.endDate && (
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                    To: {format(new Date(currentFilters.endDate), 'MMM d')}
                  </span>
                )}
                {currentFilters.userId && (
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                    User: {currentFilters.userId}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
