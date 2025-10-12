'use client'

import { useState } from 'react'
import { CategoryRow } from '@/app/actions/budget-categories'
import { ChevronDown, ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface CategoryBreakdownTableProps {
  categories: CategoryRow[]
}

export function CategoryBreakdownTable({ categories }: CategoryBreakdownTableProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const toggleExpand = (category: string) => {
    setExpandedCategory(expandedCategory === category ? null : category)
  }

  const totalBudget = categories.reduce((sum, cat) => sum + cat.total_amount, 0)

  if (categories.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Category Breakdown</h2>
        <div className="py-8 text-center text-sm text-gray-500">
          No budget data available
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900">Category Breakdown</h2>
        <p className="mt-1 text-sm text-gray-500">
          Click on a category to view initiatives
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Category
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Total Amount
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                % of Total
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                # Initiatives
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Expand</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {categories.map((category) => {
              const percentage = totalBudget > 0 ? (category.total_amount / totalBudget) * 100 : 0

              return (
                <>
                  <tr
                    key={category.category}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => toggleExpand(category.category)}
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      <div className="flex items-center">
                        {expandedCategory === category.category ? (
                          <ChevronDown className="mr-2 h-4 w-4 text-gray-400" />
                        ) : (
                          <ChevronRight className="mr-2 h-4 w-4 text-gray-400" />
                        )}
                        {category.category_display}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                      {formatCurrency(category.total_amount)}
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600">
                      {percentage.toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-500">
                      {category.initiative_count}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-gray-400">
                      <span className="text-xs">Click to expand</span>
                    </td>
                  </tr>
                  {expandedCategory === category.category && (
                    <tr>
                      <td colSpan={5} className="bg-gray-50 px-6 py-4">
                        <div className="space-y-2">
                          <h3 className="text-sm font-semibold text-gray-900">
                            {category.category_display} Initiatives:
                          </h3>
                          {category.initiatives.length === 0 ? (
                            <p className="text-sm text-gray-500">No initiatives found</p>
                          ) : (
                            <div className="space-y-2">
                              {category.initiatives.map((initiative) => (
                                <div
                                  key={initiative.id}
                                  className="flex items-center justify-between rounded-md bg-white p-3 shadow-sm"
                                >
                                  <div className="flex-1">
                                    <Link
                                      href={`/plans/${initiative.id.split('-')[0]}/initiatives/${initiative.id}`}
                                      className="text-sm font-medium text-blue-600 hover:text-blue-800"
                                    >
                                      {initiative.name}
                                    </Link>
                                    <p className="text-xs text-gray-500">
                                      {initiative.department_name} • FY {initiative.fiscal_year}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm font-semibold text-gray-900">
                                      {formatCurrency(initiative.amount)}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              )
            })}
          </tbody>
          <tfoot className="bg-gray-50">
            <tr>
              <td className="px-6 py-4 text-sm font-bold text-gray-900">Total</td>
              <td className="px-6 py-4 text-right text-sm font-bold text-gray-900">
                {formatCurrency(totalBudget)}
              </td>
              <td className="px-6 py-4 text-center text-sm font-bold text-gray-900">100%</td>
              <td className="px-6 py-4 text-center text-sm font-bold text-gray-900">
                {categories.reduce((sum, cat) => sum + cat.initiative_count, 0)}
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
