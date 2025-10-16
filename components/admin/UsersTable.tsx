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
      {/* Desktop Table */}
      <div className="hidden lg:block">
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
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4 p-4">
        {users.map((user) => (
          <div key={user.id} className="bg-white rounded-lg shadow border p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">
                  {user.full_name || 'N/A'}
                </h3>
                {user.title && (
                  <p className="text-xs text-gray-500 mt-0.5">{user.title}</p>
                )}
                <p className="text-sm text-gray-600 mt-1 break-all">{user.email || 'N/A'}</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <span
                className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                  roleColors[user.role] || roleColors.public
                }`}
              >
                {roleLabels[user.role] || user.role}
              </span>
              <span
                className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                  user.is_active
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {user.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="text-sm text-gray-600 space-y-1">
              {user.department_name && (
                <div><span className="font-medium">Department:</span> {user.department_name}</div>
              )}
              {user.supervisor_name && (
                <div><span className="font-medium">Reports to:</span> {user.supervisor_name}</div>
              )}
              <div className="text-xs text-gray-500">
                Last active: {user.updated_at
                  ? formatDistanceToNow(new Date(user.updated_at), { addSuffix: true })
                  : 'Never'}
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t">
              <Link href={`/admin/users/${user.id}`} className="flex-1">
                <Button variant="outline" size="sm" className="w-full">
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
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-gray-200 bg-gray-50 px-4 py-3">
        <div className="text-xs sm:text-sm text-gray-700">
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
        <div className="flex gap-2 flex-wrap justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
          >
            Previous
          </Button>
          <div className="flex items-center px-2 sm:px-3 text-xs sm:text-sm text-gray-700">
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
