import { Suspense } from 'react'
import { getDepartmentsWithStats } from '@/app/actions/departments'
import { DepartmentsTable } from '@/components/admin/DepartmentsTable'
import { DepartmentsFilters } from '@/components/admin/DepartmentsFilters'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface PageProps {
  searchParams: Promise<{
    status?: string
    search?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }>
}

export default async function DepartmentsPage({ searchParams }: PageProps) {
  const params = await searchParams

  const departments = await getDepartmentsWithStats({
    status: params.status as 'active' | 'inactive' | undefined,
    search: params.search,
    sortBy: params.sortBy,
    sortOrder: params.sortOrder,
  })

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Departments</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage department information and configuration
          </p>
        </div>
        <Link href="/admin/departments/new">
          <Button>Create Department</Button>
        </Link>
      </div>

      <div className="flex-1 overflow-auto bg-gray-50 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-lg bg-white shadow">
            <Suspense fallback={<div className="p-4">Loading filters...</div>}>
              <DepartmentsFilters
                currentFilters={{
                  status: params.status,
                  search: params.search,
                }}
              />
            </Suspense>

            <DepartmentsTable
              departments={departments}
              sortBy={params.sortBy || 'name'}
              sortOrder={params.sortOrder || 'asc'}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
