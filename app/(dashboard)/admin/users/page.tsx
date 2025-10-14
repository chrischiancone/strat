import { Suspense } from 'react'
import { getUsers, getDepartments } from '@/app/actions/users'
import { UsersTable } from '@/components/admin/UsersTable'
import { UsersFilters } from '@/components/admin/UsersFilters'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface PageProps {
  searchParams: Promise<{
    role?: string
    department?: string
    status?: string
    search?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
    page?: string
  }>
}

export default async function UsersPage({ searchParams }: PageProps) {
  const params = await searchParams
  const page = params.page ? parseInt(params.page) : 1

  const [usersResponse, departments] = await Promise.all([
    getUsers({
      role: params.role,
      departmentId: params.department,
      status: params.status as 'active' | 'inactive' | undefined,
      search: params.search,
      sortBy: params.sortBy,
      sortOrder: params.sortOrder,
      page,
      limit: 50,
    }),
    getDepartments(),
  ])

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-col gap-4 border-b border-gray-200 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl truncate">Users</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage user accounts and permissions
          </p>
        </div>
        <div className="flex-shrink-0">
          <Link href="/admin/users/new">
            <Button className="w-full sm:w-auto">Create User</Button>
          </Link>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-gray-50 p-4 sm:p-6">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-lg bg-white shadow overflow-hidden">
            <Suspense fallback={<div className="p-4">Loading filters...</div>}>
              <UsersFilters
                departments={departments}
                currentFilters={{
                  role: params.role,
                  department: params.department,
                  status: params.status,
                  search: params.search,
                }}
              />
            </Suspense>

            <div className="overflow-x-auto">
              <UsersTable
                users={usersResponse.users}
                total={usersResponse.total}
                page={usersResponse.page}
                totalPages={usersResponse.totalPages}
                sortBy={params.sortBy || 'full_name'}
                sortOrder={params.sortOrder || 'asc'}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
