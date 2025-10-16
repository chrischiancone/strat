'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DatePicker } from '@/components/ui/date-picker'
import { Badge } from '@/components/ui/badge'
import { X, Filter } from 'lucide-react'
import { type FilterConfig } from '@/lib/reporting/dashboard-engine'

interface FilterBarProps {
  filters: FilterConfig[]
  values: Record<string, unknown>
  onChange: (values: Record<string, unknown>) => void
}

export function FilterBar({ filters, values, onChange }: FilterBarProps) {
  if (filters.length === 0) {
    return null
  }

  const updateFilter = (filterId: string, value: unknown) => {
    onChange({
      ...values,
      [filterId]: value,
    })
  }

  const clearFilter = (filterId: string) => {
    const newValues = { ...values }
    delete newValues[filterId]
    onChange(newValues)
  }

  const clearAllFilters = () => {
    onChange({})
  }

  const hasActiveFilters = Object.keys(values).length > 0

  const renderFilter = (filter: FilterConfig) => {
    const value = values[filter.id]

    switch (filter.type) {
      case 'text':
        return (
          <div key={filter.id} className="space-y-1">
            <Label className="text-xs font-medium">{filter.label}</Label>
            <Input
              placeholder={`Filter by ${filter.label.toLowerCase()}`}
              value={(value as string) || ''}
              onChange={(e) => updateFilter(filter.id, e.target.value)}
              className="h-8 text-sm"
            />
          </div>
        )

      case 'select':
        return (
          <div key={filter.id} className="space-y-1">
            <Label className="text-xs font-medium">{filter.label}</Label>
            <Select
              value={(value as string) || ''}
              onValueChange={(newValue) => updateFilter(filter.id, newValue)}
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder={`Select ${filter.label.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                {filter.options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )

      case 'multiselect':
        const selectedValues = (value as string[]) || []
        return (
          <div key={filter.id} className="space-y-1">
            <Label className="text-xs font-medium">{filter.label}</Label>
            <div className="space-y-1">
              <Select
                onValueChange={(newValue) => {
                  const currentValues = selectedValues
                  if (!currentValues.includes(newValue)) {
                    updateFilter(filter.id, [...currentValues, newValue])
                  }
                }}
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder={`Select ${filter.label.toLowerCase()}`} />
                </SelectTrigger>
                <SelectContent>
                  {filter.options
                    ?.filter((option) => !selectedValues.includes(option.value))
                    .map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {selectedValues.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {selectedValues.map((selectedValue) => {
                    const option = filter.options?.find((o) => o.value === selectedValue)
                    return (
                      <Badge
                        key={selectedValue}
                        variant="secondary"
                        className="text-xs h-5"
                      >
                        {option?.label || selectedValue}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-3 w-3 p-0 ml-1"
                          onClick={() => {
                            updateFilter(
                              filter.id,
                              selectedValues.filter((v) => v !== selectedValue)
                            )
                          }}
                        >
                          <X className="h-2 w-2" />
                        </Button>
                      </Badge>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )

      case 'number':
        return (
          <div key={filter.id} className="space-y-1">
            <Label className="text-xs font-medium">{filter.label}</Label>
            <Input
              type="number"
              placeholder={`Enter ${filter.label.toLowerCase()}`}
              value={(value as number) || ''}
              onChange={(e) => updateFilter(filter.id, parseFloat(e.target.value) || null)}
              className="h-8 text-sm"
            />
          </div>
        )

      case 'date':
        return (
          <div key={filter.id} className="space-y-1">
            <Label className="text-xs font-medium">{filter.label}</Label>
            <DatePicker
              date={value ? new Date(value as string) : undefined}
              onDateChange={(date) => updateFilter(filter.id, date?.toISOString())}
              placeholder={`Select ${filter.label.toLowerCase()}`}
            />
          </div>
        )

      case 'daterange':
        const dateRange = (value as { from?: string; to?: string }) || {}
        return (
          <div key={filter.id} className="space-y-1">
            <Label className="text-xs font-medium">{filter.label}</Label>
            <div className="flex space-x-2">
              <DatePicker
                date={dateRange.from ? new Date(dateRange.from) : undefined}
                onDateChange={(date) =>
                  updateFilter(filter.id, {
                    ...dateRange,
                    from: date?.toISOString(),
                  })
                }
                placeholder="From"
              />
              <DatePicker
                date={dateRange.to ? new Date(dateRange.to) : undefined}
                onDateChange={(date) =>
                  updateFilter(filter.id, {
                    ...dateRange,
                    to: date?.toISOString(),
                  })
                }
                placeholder="To"
              />
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="bg-white border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <h3 className="text-sm font-medium">Filters</h3>
          {hasActiveFilters && (
            <Badge variant="secondary" className="text-xs">
              {Object.keys(values).length} active
            </Badge>
          )}
        </div>
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearAllFilters}
            className="h-7 text-xs"
          >
            Clear all
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {filters.map(renderFilter)}
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 pt-2 border-t">
          {Object.entries(values)
            .filter(([, value]) => value !== null && value !== undefined && value !== '')
            .map(([filterId, value]) => {
              const filter = filters.find((f) => f.id === filterId)
              if (!filter) return null

              let displayValue: string
              if (filter.type === 'multiselect') {
                displayValue = `${(value as string[]).length} selected`
              } else if (filter.type === 'daterange') {
                const range = value as { from?: string; to?: string }
                displayValue = `${range.from ? new Date(range.from).toLocaleDateString() : '?'} - ${
                  range.to ? new Date(range.to).toLocaleDateString() : '?'
                }`
              } else if (filter.type === 'date') {
                displayValue = new Date(value as string).toLocaleDateString()
              } else {
                displayValue = String(value)
              }

              return (
                <Badge key={filterId} variant="default" className="text-xs">
                  {filter.label}: {displayValue}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-3 w-3 p-0 ml-2 hover:bg-white/20"
                    onClick={() => clearFilter(filterId)}
                  >
                    <X className="h-2 w-2" />
                  </Button>
                </Badge>
              )
            })}
        </div>
      )}
    </div>
  )
}