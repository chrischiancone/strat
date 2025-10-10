'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface Department {
  id: string
  name: string
}

interface UsersFiltersProps {
  departments: Department[]
  currentFilters: {
    role?: string
    department?: string
    status?: string
    search?: string
  }
}

const roles = [
  { value: 'admin', label: 'Admin' },
  { value: 'department_director', label: 'Department Director' },
  { value: 'staff', label: 'Staff' },
  { value: 'city_manager', label: 'City Manager' },
  { value: 'finance', label: 'Finance' },
  { value: 'council', label: 'Council' },
  { value: 'public', label: 'Public' },
]

const statuses = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

export function UsersFilters({
  departments,
  currentFilters,
}: UsersFiltersProps) {
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
    params.delete('page') // Reset to page 1 when filtering
    startTransition(() => {
      router.push(`/admin/users?${params.toString()}`)
    })
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateFilter('search', search)
  }

  const clearFilters = () => {
    setSearch('')
    startTransition(() => {
      router.push('/admin/users')
    })
  }

  const activeFilterCount = [
    currentFilters.role,
    currentFilters.department,
    currentFilters.status,
    currentFilters.search,
  ].filter(Boolean).length

  return (
    <div className="border-b border-gray-200 bg-white px-4 py-3">
      <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px]">
          <Input
            type="search"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full"
          />
        </div>

        <select
          value={currentFilters.role || ''}
          onChange={(e) => updateFilter('role', e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          disabled={isPending}
        >
          <option value="">All Roles</option>
          {roles.map((role) => (
            <option key={role.value} value={role.value}>
              {role.label}
            </option>
          ))}
        </select>

        <select
          value={currentFilters.department || ''}
          onChange={(e) => updateFilter('department', e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          disabled={isPending}
        >
          <option value="">All Departments</option>
          {departments.map((dept) => (
            <option key={dept.id} value={dept.id}>
              {dept.name}
            </option>
          ))}
        </select>

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
