'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'
import { Button } from '@/components/ui/button'

interface AuditLogsFiltersProps {
  currentFilters: {
    action?: string
    entityType?: string
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

  const activeFilterCount = [
    currentFilters.action,
    currentFilters.entityType,
  ].filter(Boolean).length

  return (
    <div className="border-b border-gray-200 bg-white px-4 py-3">
      <div className="flex flex-wrap items-center gap-3">
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

        {activeFilterCount > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            disabled={isPending}
          >
            Clear filters ({activeFilterCount})
          </Button>
        )}
      </div>
    </div>
  )
}
