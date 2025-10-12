'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowUpDown, ChevronLeft, ChevronRight, ExternalLink, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StatusBadge, PriorityBadge } from '@/components/ui/badge'
import { NoResultsEmptyState } from '@/components/ui/empty-state'
import { toggleBudgetValidation } from '@/app/actions/finance-budgets'
import type { InitiativeBudgetRow } from '@/app/actions/finance-budgets'

interface InitiativeBudgetsTableProps {
  initiatives: InitiativeBudgetRow[]
  totalCount: number
  currentPage: number
  pageSize: number
  onPageChange: (page: number) => void
  onSort: (sortBy: string, sortOrder: 'asc' | 'desc') => void
  currentSortBy?: string
  currentSortOrder?: 'asc' | 'desc'
}

export function InitiativeBudgetsTable({
  initiatives,
  totalCount,
  currentPage,
  pageSize,
  onPageChange,
  onSort,
  currentSortBy = 'total_cost',
  currentSortOrder = 'desc',
}: InitiativeBudgetsTableProps) {
  const [validatingIds, setValidatingIds] = useState<Set<string>>(new Set())

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const handleSort = (field: string) => {
    if (currentSortBy === field) {
      // Toggle order
      onSort(field, currentSortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      // New field, default to desc for numeric, asc for text
      onSort(field, field === 'total_cost' ? 'desc' : 'asc')
    }
  }

  const handleToggleValidation = async (initiativeId: string, currentlyValidated: boolean) => {
    setValidatingIds((prev) => new Set(prev).add(initiativeId))
    try {
      const result = await toggleBudgetValidation(initiativeId, !currentlyValidated)
      if (result.success) {
        // Trigger a refresh by calling onSort with current values
        onSort(currentSortBy, currentSortOrder)
      } else {
        alert(result.error || 'Failed to update validation status')
      }
    } catch (error) {
      console.error('Error toggling validation:', error)
      alert('Failed to update validation status')
    } finally {
      setValidatingIds((prev) => {
        const next = new Set(prev)
        next.delete(initiativeId)
        return next
      })
    }
  }

  const SortButton = ({ field, label }: { field: string; label: string }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 hover:text-gray-900"
    >
      {label}
      <ArrowUpDown className="h-3 w-3" />
      {currentSortBy === field && (
        <span className="ml-1 text-xs">
          {currentSortOrder === 'asc' ? '↑' : '↓'}
        </span>
      )}
    </button>
  )

  const totalPages = Math.ceil(totalCount / pageSize)

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                <SortButton field="department_name" label="Department" />
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                <SortButton field="initiative_name" label="Initiative" />
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                <SortButton field="priority_level" label="Priority" />
              </th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Status</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Year 1</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Year 2</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Year 3</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                <SortButton field="total_cost" label="Total" />
              </th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Funding</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Validated</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {initiatives.length === 0 ? (
              <tr>
                <td colSpan={11} className="px-4 py-8">
                  <NoResultsEmptyState />
                </td>
              </tr>
            ) : (
              initiatives.map((init) => (
                <tr key={init.initiative_id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">{init.department_name}</td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-gray-900">{init.initiative_name}</div>
                    <div className="text-xs text-gray-500">{init.goal_title}</div>
                  </td>
                  <td className="px-4 py-3">
                    <PriorityBadge priority={init.priority_level as 'NEED' | 'WANT' | 'NICE_TO_HAVE'} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <StatusBadge status={init.status as 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD' | 'CANCELLED'} />
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-gray-900">
                    {formatCurrency(init.year_1_cost)}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-gray-900">
                    {formatCurrency(init.year_2_cost)}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-gray-900">
                    {formatCurrency(init.year_3_cost)}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                    {formatCurrency(init.total_cost)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {init.funding_sources.length > 0 ? (
                      <div className="flex flex-wrap justify-center gap-1">
                        {init.funding_sources.slice(0, 2).map((source, idx) => (
                          <span
                            key={idx}
                            className="inline-flex rounded bg-blue-100 px-2 py-1 text-xs text-blue-800"
                          >
                            {source}
                          </span>
                        ))}
                        {init.funding_sources.length > 2 && (
                          <span className="text-xs text-gray-500">
                            +{init.funding_sources.length - 2}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">None</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() =>
                        handleToggleValidation(init.initiative_id, init.budget_validated_by !== null)
                      }
                      disabled={validatingIds.has(init.initiative_id)}
                      className={`inline-flex items-center justify-center rounded-md p-1 transition-colors ${
                        init.budget_validated_by
                          ? 'text-green-600 hover:bg-green-50'
                          : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
                      } ${validatingIds.has(init.initiative_id) ? 'opacity-50' : ''}`}
                      title={
                        init.budget_validated_by
                          ? 'Budget validated - Click to mark as pending'
                          : 'Click to validate budget'
                      }
                    >
                      <CheckCircle className="h-5 w-5" />
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Link
                      href={`/plans/${init.plan_id}/initiatives/${init.initiative_id}`}
                      className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                    >
                      View
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3">
          <div className="text-sm text-gray-700">
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, totalCount)} of {totalCount} initiatives
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
