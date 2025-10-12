'use client'

import { GrantInitiativeRow } from '@/app/actions/grants'
import Link from 'next/link'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PriorityBadge, FundingStatusBadge } from '@/components/ui/badge'
import { NoDataEmptyState } from '@/components/ui/empty-state'

interface GrantInitiativesTableProps {
  initiatives: GrantInitiativeRow[]
  onExport: () => void
}

export function GrantInitiativesTable({ initiatives, onExport }: GrantInitiativesTableProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (initiatives.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <NoDataEmptyState resourceName="Grant-Funded Initiatives" />
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-200 p-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Grant-Funded Initiatives</h2>
          <p className="mt-1 text-sm text-gray-500">
            {initiatives.length} initiative{initiatives.length !== 1 ? 's' : ''} with grant funding
          </p>
        </div>
        <Button onClick={onExport} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export to Excel
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Department
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Initiative
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Priority
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Grant Source
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Grant Amount
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Total Cost
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                FY
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {initiatives.map((initiative) => (
              <tr key={initiative.initiative_id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">{initiative.department_name}</td>
                <td className="px-6 py-4">
                  <Link
                    href={`/plans/${initiative.plan_id}/initiatives/${initiative.initiative_id}`}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800"
                  >
                    {initiative.initiative_name}
                  </Link>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-center">
                    <PriorityBadge priority={initiative.priority_level as 'NEED' | 'WANT' | 'NICE_TO_HAVE'} />
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{initiative.grant_source}</td>
                <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                  {formatCurrency(initiative.grant_amount)}
                </td>
                <td className="px-6 py-4 text-right text-sm text-gray-500">
                  {formatCurrency(initiative.total_cost)}
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-center">
                    <FundingStatusBadge status={initiative.grant_status as 'secured' | 'requested' | 'pending' | 'projected'} />
                  </div>
                </td>
                <td className="px-6 py-4 text-center text-sm text-gray-500">
                  {initiative.fiscal_year}
                </td>
                <td className="px-6 py-4 text-right text-sm">
                  <Link
                    href={`/plans/${initiative.plan_id}/initiatives/${initiative.initiative_id}`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
