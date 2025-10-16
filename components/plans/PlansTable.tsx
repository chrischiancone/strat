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
import { Badge } from '@/components/ui/badge'
import { Eye, Pencil } from 'lucide-react'

interface PlansTableProps {
  plans: StrategicPlan[]
  userRole: string
}

export function PlansTable({ plans, userRole }: PlansTableProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const getPlanStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: 'default' | 'secondary' | 'success' | 'warning' | 'info'; label: string }> = {
      draft: { variant: 'secondary', label: 'Draft' },
      under_review: { variant: 'warning', label: 'Under Review' },
      approved: { variant: 'success', label: 'Approved' },
      active: { variant: 'info', label: 'Active' },
      archived: { variant: 'secondary', label: 'Archived' },
    }

    const config = statusConfig[status] || statusConfig.draft

    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden md:block rounded-lg bg-white shadow">
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
                <TableCell>{getPlanStatusBadge(plan.status)}</TableCell>
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
                    {(plan.status === 'draft' || userRole === 'city_manager' || userRole === 'admin') && (
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

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {plans.map((plan) => (
          <div key={plan.id} className="bg-white rounded-lg shadow p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">
                  {plan.title || 'Untitled Plan'}
                </h3>
                <p className="text-sm text-gray-600 mt-1">{plan.department_name}</p>
              </div>
              <div className="ml-2">
                {getPlanStatusBadge(plan.status)}
              </div>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <div className="text-gray-600">
                <span className="font-medium">FY:</span> {plan.start_year} - {plan.end_year}
              </div>
              <div className="text-gray-500">
                {formatDate(plan.updated_at)}
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t">
              <Link href={`/plans/${plan.id}`} className="flex-1">
                <Button variant="outline" size="sm" className="w-full">
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </Button>
              </Link>
              {(plan.status === 'draft' || userRole === 'city_manager' || userRole === 'admin') && (
                <Link href={`/plans/${plan.id}/edit`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
