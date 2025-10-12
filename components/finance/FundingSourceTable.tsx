'use client'

import { useState } from 'react'
import { FundingSourceRow } from '@/app/actions/funding-sources'
import { ChevronDown, ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface FundingSourceTableProps {
  fundingSources: FundingSourceRow[]
}

export function FundingSourceTable({ fundingSources }: FundingSourceTableProps) {
  const [expandedSource, setExpandedSource] = useState<string | null>(null)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const toggleExpand = (source: string) => {
    setExpandedSource(expandedSource === source ? null : source)
  }

  if (fundingSources.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Funding Source Breakdown</h2>
        <div className="py-8 text-center text-sm text-gray-500">
          No funding source data available
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900">Funding Source Breakdown</h2>
        <p className="mt-1 text-sm text-gray-500">
          Click on a funding source to view initiatives
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
                Funding Source
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
                # Initiatives
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Secured
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Pending
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Expand</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {fundingSources.map((source) => (
              <>
                <tr
                  key={source.funding_source}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => toggleExpand(source.funding_source)}
                >
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    <div className="flex items-center">
                      {expandedSource === source.funding_source ? (
                        <ChevronDown className="mr-2 h-4 w-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="mr-2 h-4 w-4 text-gray-400" />
                      )}
                      {source.funding_source}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                    {formatCurrency(source.total_amount)}
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-500">
                    {source.initiative_count}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-green-600">
                    {formatCurrency(source.secured_amount)}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-amber-600">
                    {formatCurrency(source.pending_amount)}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-gray-400">
                    <span className="text-xs">Click to expand</span>
                  </td>
                </tr>
                {expandedSource === source.funding_source && (
                  <tr>
                    <td colSpan={6} className="bg-gray-50 px-6 py-4">
                      <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-gray-900">
                          Initiatives using {source.funding_source}:
                        </h3>
                        {source.initiatives.length === 0 ? (
                          <p className="text-sm text-gray-500">No initiatives found</p>
                        ) : (
                          <div className="space-y-2">
                            {source.initiatives.map((initiative) => (
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
                                  <p className="text-xs text-gray-500">{initiative.department_name}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-semibold text-gray-900">
                                    {formatCurrency(initiative.total_cost)}
                                  </p>
                                  <p className="text-xs text-gray-500 capitalize">
                                    {initiative.funding_status.replace(/_/g, ' ')}
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
