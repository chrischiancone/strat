'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { FiscalYear } from '@/app/actions/fiscal-years'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'

interface FiscalYearsTableProps {
  fiscalYears: FiscalYear[]
  sortBy: string
  sortOrder: 'asc' | 'desc'
}

export function FiscalYearsTable({
  fiscalYears,
  sortBy,
  sortOrder,
}: FiscalYearsTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSort = (column: string) => {
    const params = new URLSearchParams(searchParams.toString())
    const newSortOrder =
      sortBy === column && sortOrder === 'asc' ? 'desc' : 'asc'
    params.set('sortBy', column)
    params.set('sortOrder', newSortOrder)
    router.push(`/admin/fiscal-years?${params.toString()}`)
  }

  const getSortIcon = (column: string) => {
    if (sortBy !== column) return '↕'
    return sortOrder === 'asc' ? '↑' : '↓'
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    })
  }

  if (fiscalYears.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-sm text-gray-500">No fiscal years found</p>
        <p className="mt-1 text-xs text-gray-400">
          Create a fiscal year to get started
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
                onClick={() => handleSort('year')}
                className="flex items-center gap-1 font-medium hover:text-gray-900"
              >
                Year {getSortIcon('year')}
              </button>
            </TableHead>
            <TableHead>
              <button
                onClick={() => handleSort('start_date')}
                className="flex items-center gap-1 font-medium hover:text-gray-900"
              >
                Start Date {getSortIcon('start_date')}
              </button>
            </TableHead>
            <TableHead>
              <button
                onClick={() => handleSort('end_date')}
                className="flex items-center gap-1 font-medium hover:text-gray-900"
              >
                End Date {getSortIcon('end_date')}
              </button>
            </TableHead>
            <TableHead>
              <button
                onClick={() => handleSort('is_current')}
                className="flex items-center gap-1 font-medium hover:text-gray-900"
              >
                Status {getSortIcon('is_current')}
              </button>
            </TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {fiscalYears.map((fy) => (
            <TableRow key={fy.id} className={fy.is_current ? 'bg-blue-50' : ''}>
              <TableCell className="font-medium">
                {fy.year}
                {fy.is_current && (
                  <span className="ml-2 text-xs">⭐</span>
                )}
              </TableCell>
              <TableCell className="text-sm text-gray-900">
                {formatDate(fy.start_date)}
              </TableCell>
              <TableCell className="text-sm text-gray-900">
                {formatDate(fy.end_date)}
              </TableCell>
              <TableCell>
                <span
                  className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                    fy.is_current
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {fy.is_current ? 'Current' : 'Inactive'}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <Link href={`/admin/fiscal-years/${fy.id}`}>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="border-t border-gray-200 bg-gray-50 px-4 py-3">
        <div className="text-sm text-gray-700">
          Showing <span className="font-medium">{fiscalYears.length}</span>{' '}
          {fiscalYears.length === 1 ? 'fiscal year' : 'fiscal years'}
        </div>
      </div>
    </div>
  )
}
