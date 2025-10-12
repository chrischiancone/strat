'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { CityManagerPlanSummary } from '@/app/actions/strategic-plans'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'

interface PlansTableProps {
  plans: CityManagerPlanSummary[]
  sortBy: string
  sortOrder: 'asc' | 'desc'
}

export function PlansTable({ plans, sortBy, sortOrder }: PlansTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSort = (column: string) => {
    const params = new URLSearchParams(searchParams.toString())
    const newSortOrder =
      sortBy === column && sortOrder === 'asc' ? 'desc' : 'asc'
    params.set('sortBy', column)
    params.set('sortOrder', newSortOrder)
    router.push(`/city-manager?${params.toString()}`)
  }

  const getSortIcon = (column: string) => {
    if (sortBy !== column) return '↕'
    return sortOrder === 'asc' ? '↑' : '↓'
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const statusColors: { [key: string]: string } = {
    draft: 'bg-gray-100 text-gray-800',
    under_review: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    active: 'bg-blue-100 text-blue-800',
    archived: 'bg-gray-100 text-gray-600',
  }

  const statusLabels: { [key: string]: string } = {
    draft: 'Draft',
    under_review: 'Under Review',
    approved: 'Approved',
    active: 'Active',
    archived: 'Archived',
  }

  if (plans.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-sm text-gray-500">No strategic plans found</p>
        <p className="mt-1 text-xs text-gray-400">
          Try adjusting your filters or check back later
        </p>
      </div>
    )
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <button
                onClick={() => handleSort('department_name')}
                className="flex items-center gap-1 font-medium hover:text-gray-900"
              >
                Department {getSortIcon('department_name')}
              </button>
            </TableHead>
            <TableHead>
              <button
                onClick={() => handleSort('title')}
                className="flex items-center gap-1 font-medium hover:text-gray-900"
              >
                Plan Title {getSortIcon('title')}
              </button>
            </TableHead>
            <TableHead>
              <button
                onClick={() => handleSort('start_year')}
                className="flex items-center gap-1 font-medium hover:text-gray-900"
              >
                Fiscal Years {getSortIcon('start_year')}
              </button>
            </TableHead>
            <TableHead>
              <button
                onClick={() => handleSort('status')}
                className="flex items-center gap-1 font-medium hover:text-gray-900"
              >
                Status {getSortIcon('status')}
              </button>
            </TableHead>
            <TableHead>
              <button
                onClick={() => handleSort('total_budget')}
                className="flex items-center gap-1 font-medium hover:text-gray-900"
              >
                Budget {getSortIcon('total_budget')}
              </button>
            </TableHead>
            <TableHead>
              <button
                onClick={() => handleSort('initiative_count')}
                className="flex items-center gap-1 font-medium hover:text-gray-900"
              >
                Initiatives {getSortIcon('initiative_count')}
              </button>
            </TableHead>
            <TableHead>
              <button
                onClick={() => handleSort('updated_at')}
                className="flex items-center gap-1 font-medium hover:text-gray-900"
              >
                Last Updated {getSortIcon('updated_at')}
              </button>
            </TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {plans.map((plan) => (
            <TableRow key={plan.id}>
              <TableCell className="font-medium">{plan.department_name}</TableCell>
              <TableCell>
                <div className="max-w-xs truncate" title={plan.title || 'Untitled'}>
                  {plan.title || 'Untitled Plan'}
                </div>
              </TableCell>
              <TableCell className="text-sm text-gray-900">
                FY{plan.start_year}-{plan.end_year}
              </TableCell>
              <TableCell>
                <span
                  className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                    statusColors[plan.status]
                  }`}
                >
                  {statusLabels[plan.status]}
                </span>
              </TableCell>
              <TableCell className="text-sm text-gray-900">
                {formatCurrency(plan.total_budget)}
              </TableCell>
              <TableCell className="text-center text-sm text-gray-900">
                {plan.initiative_count}
              </TableCell>
              <TableCell className="text-sm text-gray-500">
                {formatDate(plan.updated_at)}
              </TableCell>
              <TableCell className="text-right">
                <Link href={`/plans/${plan.id}`}>
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="border-t border-gray-200 bg-gray-50 px-4 py-3">
        <div className="text-sm text-gray-700">
          Showing <span className="font-medium">{plans.length}</span>{' '}
          {plans.length === 1 ? 'plan' : 'plans'}
        </div>
      </div>
    </div>
  )
}
