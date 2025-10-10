'use client'

import Link from 'next/link'
import { StrategicPlan } from '@/app/actions/strategic-plans'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Eye, Pencil } from 'lucide-react'

interface PlansTableProps {
  plans: StrategicPlan[]
}

export function PlansTable({ plans }: PlansTableProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const getStatusBadge = (status: string) => {
    const statusStyles: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      under_review: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      active: 'bg-blue-100 text-blue-800',
      archived: 'bg-gray-100 text-gray-600',
    }

    const statusLabels: Record<string, string> = {
      draft: 'Draft',
      under_review: 'Under Review',
      approved: 'Approved',
      active: 'Active',
      archived: 'Archived',
    }

    return (
      <span
        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
          statusStyles[status] || statusStyles.draft
        }`}
      >
        {statusLabels[status] || status}
      </span>
    )
  }

  return (
    <div className="rounded-lg bg-white shadow">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Fiscal Years</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {plans.map((plan) => (
            <TableRow key={plan.id}>
              <TableCell className="font-medium">
                {plan.title || 'Untitled Plan'}
              </TableCell>
              <TableCell>{plan.department_name}</TableCell>
              <TableCell>
                {plan.start_year} - {plan.end_year}
              </TableCell>
              <TableCell>{getStatusBadge(plan.status)}</TableCell>
              <TableCell className="text-sm text-gray-600">
                {formatDate(plan.updated_at)}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Link href={`/plans/${plan.id}`}>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                  {plan.status === 'draft' && (
                    <Link href={`/plans/${plan.id}/edit`}>
                      <Button variant="ghost" size="sm">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
