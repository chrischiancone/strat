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
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Users</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage user accounts and permissions
          </p>
        </div>
        <Link href="/admin/users/new">
          <Button>Create User</Button>
        </Link>
      </div>

      <div className="flex-1 overflow-auto bg-gray-50 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-lg bg-white shadow">
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
  )
}
