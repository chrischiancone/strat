'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface DepartmentsFiltersProps {
  currentFilters: {
    status?: string
    search?: string
  }
}

const statuses = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

export function DepartmentsFilters({
  currentFilters,
}: DepartmentsFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [search, setSearch] = useState(currentFilters.search || '')

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    startTransition(() => {
      router.push(`/admin/departments?${params.toString()}`)
    })
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateFilter('search', search)
  }

  const clearFilters = () => {
    setSearch('')
    startTransition(() => {
      router.push('/admin/departments')
    })
  }

  const activeFilterCount = [
    currentFilters.status,
    currentFilters.search,
  ].filter(Boolean).length

  return (
    <div className="border-b border-gray-200 bg-white px-4 py-3">
      <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px]">
          <Input
            type="search"
            placeholder="Search by department name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full"
          />
        </div>

        <select
          value={currentFilters.status || ''}
          onChange={(e) => updateFilter('status', e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          disabled={isPending}
        >
          <option value="">All Status</option>
          {statuses.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>

        <Button type="submit" variant="outline" size="sm" disabled={isPending}>
          Search
        </Button>

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
      </form>
    </div>
  )
}
