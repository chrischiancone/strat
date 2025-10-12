'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react'
import type { InitiativeSummary } from '@/app/actions/city-initiatives'

interface InitiativesTableProps {
  initiatives: InitiativeSummary[]
  pagination: {
    total: number
    page: number
    pageSize: number
    totalPages: number
  }
  onSearchChange: (search: string) => void
  onSortChange: (sortBy: string, sortOrder: 'asc' | 'desc') => void
  onPageChange: (page: number) => void
}

const PRIORITY_COLORS = {
  NEED: 'bg-red-100 text-red-800',
  WANT: 'bg-yellow-100 text-yellow-800',
  NICE_TO_HAVE: 'bg-green-100 text-green-800',
}

const STATUS_COLORS = {
  not_started: 'bg-gray-100 text-gray-800',
  in_progress: 'bg-blue-100 text-blue-800',
  at_risk: 'bg-red-100 text-red-800',
  completed: 'bg-green-100 text-green-800',
  deferred: 'bg-gray-100 text-gray-600',
}

const STATUS_LABELS = {
  not_started: 'Not Started',
  in_progress: 'In Progress',
  at_risk: 'At Risk',
  completed: 'Completed',
  deferred: 'Deferred',
}

export function InitiativesTable({
  initiatives,
  pagination,
  onSearchChange,
  onSortChange,
  onPageChange,
}: InitiativesTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<string>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    // Debounce search - in production, use a proper debounce library
    const timer = setTimeout(() => {
      onSearchChange(value)
    }, 500)
    return () => clearTimeout(timer)
  }

  const handleSort = (column: string) => {
    let newOrder: 'asc' | 'desc' = 'asc'

    if (sortBy === column) {
      newOrder = sortOrder === 'asc' ? 'desc' : 'asc'
    }

    setSortBy(column)
    setSortOrder(newOrder)
    onSortChange(column, newOrder)
  }

  const SortButton = ({ column, label }: { column: string; label: string }) => (
    <button
      onClick={() => handleSort(column)}
      className="flex items-center gap-1 font-medium hover:text-gray-900"
    >
      {label}
      <ArrowUpDown className="h-3 w-3" />
    </button>
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>All Initiatives</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search initiatives..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-8 w-64"
              />
            </div>
            <span className="text-sm text-muted-foreground">
              {pagination.total} initiative{pagination.total !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {initiatives.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No initiatives found matching your criteria
          </p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-3 text-left text-sm">
                      <SortButton column="name" label="Initiative" />
                    </th>
                    <th className="px-4 py-3 text-left text-sm">
                      Department
                    </th>
                    <th className="px-4 py-3 text-left text-sm">
                      Goal
                    </th>
                    <th className="px-4 py-3 text-left text-sm">
                      <SortButton column="priority" label="Priority" />
                    </th>
                    <th className="px-4 py-3 text-left text-sm">
                      <SortButton column="status" label="Status" />
                    </th>
                    <th className="px-4 py-3 text-right text-sm">
                      <SortButton column="budget" label="Total Budget" />
                    </th>
                    <th className="px-4 py-3 text-right text-sm">Year 1</th>
                    <th className="px-4 py-3 text-right text-sm">Year 2</th>
                    <th className="px-4 py-3 text-right text-sm">Year 3</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {initiatives.map((initiative) => (
                    <tr key={initiative.id} className="hover:bg-muted/50">
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium">{initiative.name}</div>
                        {initiative.responsible_party && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Owner: {initiative.responsible_party}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {initiative.department_name}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground max-w-xs truncate">
                        {initiative.goal_title}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          className={
                            PRIORITY_COLORS[
                              initiative.priority_level as keyof typeof PRIORITY_COLORS
                            ]
                          }
                          variant="secondary"
                        >
                          {initiative.priority_level}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          className={
                            STATUS_COLORS[initiative.status as keyof typeof STATUS_COLORS]
                          }
                          variant="secondary"
                        >
                          {STATUS_LABELS[initiative.status as keyof typeof STATUS_LABELS]}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-right">
                        {formatCurrency(initiative.total_cost)}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground text-right">
                        {formatCurrency(initiative.year_1_cost)}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground text-right">
                        {formatCurrency(initiative.year_2_cost)}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground text-right">
                        {formatCurrency(initiative.year_3_cost)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Showing {(pagination.page - 1) * pagination.pageSize + 1} to{' '}
                  {Math.min(pagination.page * pagination.pageSize, pagination.total)} of{' '}
                  {pagination.total} initiatives
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <span className="text-sm">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
