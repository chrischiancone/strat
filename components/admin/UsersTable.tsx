'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { UserWithDepartment } from '@/app/actions/users'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { formatDistanceToNow } from 'date-fns'
import { UserActionsMenu } from './UserActionsMenu'

interface UsersTableProps {
  users: UserWithDepartment[]
  total: number
  page: number
  totalPages: number
  sortBy: string
  sortOrder: 'asc' | 'desc'
}

const roleColors: Record<string, string> = {
  admin: 'bg-blue-100 text-blue-800',
  department_director: 'bg-purple-100 text-purple-800',
  staff: 'bg-gray-100 text-gray-800',
  city_manager: 'bg-green-100 text-green-800',
  finance: 'bg-yellow-100 text-yellow-800',
  council: 'bg-orange-100 text-orange-800',
  public: 'bg-slate-100 text-slate-800',
}

const roleLabels: Record<string, string> = {
  admin: 'Admin',
  department_director: 'Department Director',
  staff: 'Staff',
  city_manager: 'City Manager',
  finance: 'Finance',
  council: 'Council',
  public: 'Public',
}

export function UsersTable({
  users,
  total,
  page,
  totalPages,
  sortBy,
  sortOrder,
}: UsersTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSort = (column: string) => {
    const params = new URLSearchParams(searchParams.toString())
    const newSortOrder =
      sortBy === column && sortOrder === 'asc' ? 'desc' : 'asc'
    params.set('sortBy', column)
    params.set('sortOrder', newSortOrder)
    router.push(`/admin/users?${params.toString()}`)
  }

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', newPage.toString())
    router.push(`/admin/users?${params.toString()}`)
  }

  const getSortIcon = (column: string) => {
    if (sortBy !== column) return '↕'
    return sortOrder === 'asc' ? '↑' : '↓'
  }

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-sm text-gray-500">No users found</p>
        <p className="mt-1 text-xs text-gray-400">
          Try adjusting your filters or search query
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
                onClick={() => handleSort('full_name')}
                className="flex items-center gap-1 font-medium hover:text-gray-900"
              >
                Name {getSortIcon('full_name')}
              </button>
            </TableHead>
            <TableHead>
              <button
                onClick={() => handleSort('email')}
                className="flex items-center gap-1 font-medium hover:text-gray-900"
              >
                Email {getSortIcon('email')}
              </button>
            </TableHead>
            <TableHead>
              <button
                onClick={() => handleSort('role')}
                className="flex items-center gap-1 font-medium hover:text-gray-900"
              >
                Role {getSortIcon('role')}
              </button>
            </TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Reports To</TableHead>
            <TableHead>
              <button
                onClick={() => handleSort('is_active')}
                className="flex items-center gap-1 font-medium hover:text-gray-900"
              >
                Status {getSortIcon('is_active')}
              </button>
            </TableHead>
            <TableHead>Last Activity</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">
                {user.full_name || 'N/A'}
                {user.title && (
                  <div className="text-xs text-gray-500">{user.title}</div>
                )}
              </TableCell>
              <TableCell className="text-sm text-gray-600">
                {user.email || 'N/A'}
              </TableCell>
              <TableCell>
                <span
                  className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                    roleColors[user.role] || roleColors.public
                  }`}
                >
                  {roleLabels[user.role] || user.role}
                </span>
              </TableCell>
              <TableCell className="text-sm text-gray-600">
                {user.department_name || '—'}
              </TableCell>
              <TableCell className="text-sm text-gray-600">
                {user.supervisor_name || '—'}
              </TableCell>
              <TableCell>
                <span
                  className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                    user.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {user.is_active ? 'Active' : 'Inactive'}
                </span>
              </TableCell>
              <TableCell className="text-sm text-gray-500">
                {user.updated_at
                  ? formatDistanceToNow(new Date(user.updated_at), {
                      addSuffix: true,
                    })
                  : 'Never'}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Link href={`/admin/users/${user.id}`}>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </Link>
                  <UserActionsMenu
                    userId={user.id}
                    userName={user.full_name || 'Unknown User'}
                    userEmail={user.email || 'No email'}
                    isActive={user.is_active ?? true}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-4 py-3">
        <div className="text-sm text-gray-700">
          Showing{' '}
          <span className="font-medium">
            {(page - 1) * 50 + 1}
          </span>{' '}
          to{' '}
          <span className="font-medium">
            {Math.min(page * 50, total)}
          </span>{' '}
          of <span className="font-medium">{total}</span> users
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
          >
            Previous
          </Button>
          <div className="flex items-center px-3 text-sm text-gray-700">
            Page {page} of {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
