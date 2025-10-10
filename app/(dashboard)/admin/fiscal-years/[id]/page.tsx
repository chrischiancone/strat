import { notFound } from 'next/navigation'
import { getFiscalYearById, getFiscalYears } from '@/app/actions/fiscal-years'
import { EditFiscalYearForm } from '@/components/admin/EditFiscalYearForm'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditFiscalYearPage({ params }: PageProps) {
  const { id } = await params

  const [fiscalYearData, allFiscalYears] = await Promise.all([
    getFiscalYearById(id),
    getFiscalYears(),
  ])

  if (!fiscalYearData) {
    notFound()
  }

  const fiscalYear = fiscalYearData as {
    id: string
    year_name: string
    start_date: string
    end_date: string
    is_active: boolean | null
  }

  // Check if there's another active fiscal year
  const hasOtherActiveFiscalYear = allFiscalYears.some(
    (fy) => fy.is_active && fy.id !== id
  )

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/fiscal-years">
            <Button variant="outline" size="sm">
              ← Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Edit Fiscal Year: {fiscalYear.year_name}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Update fiscal year information and configuration
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-gray-50 p-6">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-lg bg-white p-6 shadow">
            <EditFiscalYearForm
              fiscalYear={fiscalYear}
              hasOtherActiveFiscalYear={hasOtherActiveFiscalYear}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
