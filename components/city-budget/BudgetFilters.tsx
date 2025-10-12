'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X, Filter } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { BudgetFilters as FilterType } from '@/app/actions/city-budget'

interface BudgetFiltersProps {
  onFiltersChange: (filters: FilterType) => void
}

interface Department {
  id: string
  name: string
}

interface FiscalYear {
  id: string
  year: number
}

const PRIORITY_OPTIONS = [
  { value: 'NEED', label: 'Need' },
  { value: 'WANT', label: 'Want' },
  { value: 'NICE_TO_HAVE', label: 'Nice to Have' },
] as const

export function BudgetFilters({ onFiltersChange }: BudgetFiltersProps) {
  const [departments, setDepartments] = useState<Department[]>([])
  const [fiscalYears, setFiscalYears] = useState<FiscalYear[]>([])
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([])
  const [selectedFiscalYears, setSelectedFiscalYears] = useState<string[]>([])
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([])
  const [isExpanded, setIsExpanded] = useState(false)

  // Load departments and fiscal years
  useEffect(() => {
    async function loadOptions() {
      const supabase = createClient()

      // Get user's municipality
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('users')
        .select('municipality_id')
        .eq('id', user.id)
        .single()

      if (!profile) return

      // Load departments
      const { data: depts } = await supabase
        .from('departments')
        .select('id, name')
        .eq('municipality_id', profile.municipality_id)
        .order('name')

      if (depts) {
        setDepartments(depts as Department[])
      }

      // Load fiscal years
      const { data: years } = await supabase
        .from('fiscal_years')
        .select('id, year')
        .eq('municipality_id', profile.municipality_id)
        .order('year', { ascending: false })

      if (years) {
        setFiscalYears(years as FiscalYear[])
      }
    }

    loadOptions()
  }, [])

  // Update filters when selections change
  useEffect(() => {
    const filters: FilterType = {}

    if (selectedDepartments.length > 0) {
      filters.department_ids = selectedDepartments
    }

    if (selectedFiscalYears.length > 0) {
      filters.fiscal_year_ids = selectedFiscalYears
    }

    if (selectedPriorities.length > 0) {
      filters.priority_levels = selectedPriorities as ('NEED' | 'WANT' | 'NICE_TO_HAVE')[]
    }

    onFiltersChange(filters)
  }, [selectedDepartments, selectedFiscalYears, selectedPriorities, onFiltersChange])

  const toggleDepartment = (deptId: string) => {
    setSelectedDepartments((prev) =>
      prev.includes(deptId) ? prev.filter((id) => id !== deptId) : [...prev, deptId]
    )
  }

  const toggleFiscalYear = (yearId: string) => {
    setSelectedFiscalYears((prev) =>
      prev.includes(yearId) ? prev.filter((id) => id !== yearId) : [...prev, yearId]
    )
  }

  const togglePriority = (priority: string) => {
    setSelectedPriorities((prev) =>
      prev.includes(priority) ? prev.filter((p) => p !== priority) : [...prev, priority]
    )
  }

  const clearFilters = () => {
    setSelectedDepartments([])
    setSelectedFiscalYears([])
    setSelectedPriorities([])
  }

  const hasActiveFilters =
    selectedDepartments.length > 0 ||
    selectedFiscalYears.length > 0 ||
    selectedPriorities.length > 0

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-2">
                  {selectedDepartments.length +
                    selectedFiscalYears.length +
                    selectedPriorities.length}
                </Badge>
              )}
            </Button>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear All
              </Button>
            )}
          </div>

          {/* Filter Controls */}
          {isExpanded && (
            <div className="grid gap-4 md:grid-cols-3">
              {/* Departments */}
              <div>
                <label className="text-sm font-medium mb-2 block">Departments</label>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {departments.map((dept) => (
                    <label
                      key={dept.id}
                      className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted p-1 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={selectedDepartments.includes(dept.id)}
                        onChange={() => toggleDepartment(dept.id)}
                        className="rounded border-gray-300"
                      />
                      {dept.name}
                    </label>
                  ))}
                </div>
              </div>

              {/* Fiscal Years */}
              <div>
                <label className="text-sm font-medium mb-2 block">Fiscal Years</label>
                <div className="space-y-1">
                  {fiscalYears.map((year) => (
                    <label
                      key={year.id}
                      className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted p-1 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={selectedFiscalYears.includes(year.id)}
                        onChange={() => toggleFiscalYear(year.id)}
                        className="rounded border-gray-300"
                      />
                      FY {year.year}
                    </label>
                  ))}
                </div>
              </div>

              {/* Priorities */}
              <div>
                <label className="text-sm font-medium mb-2 block">Priority Levels</label>
                <div className="space-y-1">
                  {PRIORITY_OPTIONS.map((priority) => (
                    <label
                      key={priority.value}
                      className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted p-1 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={selectedPriorities.includes(priority.value)}
                        onChange={() => togglePriority(priority.value)}
                        className="rounded border-gray-300"
                      />
                      {priority.label}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Active Filters Display */}
          {hasActiveFilters && !isExpanded && (
            <div className="flex flex-wrap gap-2">
              {selectedDepartments.map((deptId) => {
                const dept = departments.find((d) => d.id === deptId)
                return (
                  <Badge key={deptId} variant="secondary" className="gap-1">
                    {dept?.name}
                    <button
                      onClick={() => toggleDepartment(deptId)}
                      className="ml-1 hover:bg-muted rounded-full"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )
              })}
              {selectedFiscalYears.map((yearId) => {
                const year = fiscalYears.find((y) => y.id === yearId)
                return (
                  <Badge key={yearId} variant="secondary" className="gap-1">
                    FY {year?.year}
                    <button
                      onClick={() => toggleFiscalYear(yearId)}
                      className="ml-1 hover:bg-muted rounded-full"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )
              })}
              {selectedPriorities.map((priority) => (
                <Badge key={priority} variant="secondary" className="gap-1">
                  {PRIORITY_OPTIONS.find((p) => p.value === priority)?.label}
                  <button
                    onClick={() => togglePriority(priority)}
                    className="ml-1 hover:bg-muted rounded-full"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
