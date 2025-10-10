'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { DepartmentWithStats } from '@/app/actions/departments'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'

interface DepartmentsTableProps {
  departments: DepartmentWithStats[]
  sortBy: string
  sortOrder: 'asc' | 'desc'
}

export function DepartmentsTable({
  departments,
  sortBy,
  sortOrder,
}: DepartmentsTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSort = (column: string) => {
    const params = new URLSearchParams(searchParams.toString())
    const newSortOrder =
      sortBy === column && sortOrder === 'asc' ? 'desc' : 'asc'
    params.set('sortBy', column)
    params.set('sortOrder', newSortOrder)
    router.push(`/admin/departments?${params.toString()}`)
  }

  const getSortIcon = (column: string) => {
    if (sortBy !== column) return '↕'
    return sortOrder === 'asc' ? '↑' : '↓'
  }

  if (departments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-sm text-gray-500">No departments found</p>
        <p className="mt-1 text-xs text-gray-400">
          Try adjusting your filters or create a new department
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
                onClick={() => handleSort('name')}
                className="flex items-center gap-1 font-medium hover:text-gray-900"
              >
                Name {getSortIcon('name')}
              </button>
            </TableHead>
            <TableHead>
              <button
                onClick={() => handleSort('director_name')}
                className="flex items-center gap-1 font-medium hover:text-gray-900"
              >
                Director {getSortIcon('director_name')}
              </button>
            </TableHead>
            <TableHead>Email</TableHead>
            <TableHead className="text-center">
              <button
                onClick={() => handleSort('staff_count')}
                className="flex items-center gap-1 font-medium hover:text-gray-900"
              >
                Staff {getSortIcon('staff_count')}
              </button>
            </TableHead>
            <TableHead className="text-center">
              <button
                onClick={() => handleSort('plans_count')}
                className="flex items-center gap-1 font-medium hover:text-gray-900"
              >
                Plans {getSortIcon('plans_count')}
              </button>
            </TableHead>
            <TableHead>
              <button
                onClick={() => handleSort('is_active')}
                className="flex items-center gap-1 font-medium hover:text-gray-900"
              >
                Status {getSortIcon('is_active')}
              </button>
            </TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {departments.map((dept) => (
            <TableRow key={dept.id}>
              <TableCell className="font-medium">
                {dept.name}
                {dept.mission_statement && (
                  <div className="text-xs text-gray-500 max-w-xs truncate">
                    {dept.mission_statement}
                  </div>
                )}
              </TableCell>
              <TableCell className="text-sm text-gray-900">
                {dept.director_name || '—'}
              </TableCell>
              <TableCell className="text-sm text-gray-600">
                {dept.director_email || '—'}
              </TableCell>
              <TableCell className="text-center text-sm text-gray-900">
                {dept.staff_count}
              </TableCell>
              <TableCell className="text-center text-sm text-gray-900">
                {dept.plans_count}
              </TableCell>
              <TableCell>
                <span
                  className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                    dept.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {dept.is_active ? 'Active' : 'Inactive'}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <Link href={`/admin/departments/${dept.id}`}>
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
          Showing <span className="font-medium">{departments.length}</span>{' '}
          {departments.length === 1 ? 'department' : 'departments'}
        </div>
      </div>
    </div>
  )
}
