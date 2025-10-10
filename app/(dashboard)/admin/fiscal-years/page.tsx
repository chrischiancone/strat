import { Suspense } from 'react'
import { getFiscalYears } from '@/app/actions/fiscal-years'
import { FiscalYearsTable } from '@/components/admin/FiscalYearsTable'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface PageProps {
  searchParams: Promise<{
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }>
}

export default async function FiscalYearsPage({ searchParams }: PageProps) {
  const params = await searchParams

  const fiscalYears = await getFiscalYears({
    sortBy: params.sortBy,
    sortOrder: params.sortOrder,
  })

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Fiscal Years</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage fiscal year configuration for strategic planning
          </p>
        </div>
        <Link href="/admin/fiscal-years/new">
          <Button>Create Fiscal Year</Button>
        </Link>
      </div>

      <div className="flex-1 overflow-auto bg-gray-50 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-lg bg-white shadow">
            <Suspense fallback={<div className="p-4">Loading...</div>}>
              <FiscalYearsTable
                fiscalYears={fiscalYears}
                sortBy={params.sortBy || 'start_date'}
                sortOrder={params.sortOrder || 'desc'}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}
