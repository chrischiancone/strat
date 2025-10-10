import { createServerSupabaseClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Pencil } from 'lucide-react'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

async function getStrategicPlan(id: string) {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from('strategic_plans')
    .select(`
      id,
      title,
      status,
      executive_summary,
      department_vision,
      created_at,
      updated_at,
      departments:department_id (
        name
      ),
      start_fiscal_year:start_fiscal_year_id (
        year
      ),
      end_fiscal_year:end_fiscal_year_id (
        year
      )
    `)
    .eq('id', id)
    .single()

  if (error || !data) {
    return null
  }

  return data
}

export default async function PlanDetailPage({ params }: PageProps) {
  const { id } = await params
  const plan = await getStrategicPlan(id)

  if (!plan) {
    notFound()
  }

  interface PlanData {
    id: string
    title: string | null
    status: string
    executive_summary: string | null
    department_vision: string | null
    created_at: string
    updated_at: string
    departments: { name: string } | null
    start_fiscal_year: { year: number } | null
    end_fiscal_year: { year: number } | null
  }

  const typedPlan = plan as PlanData

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/plans">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                {typedPlan.title || 'Untitled Plan'}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                {typedPlan.departments?.name} • FY{' '}
                {typedPlan.start_fiscal_year?.year} -{' '}
                {typedPlan.end_fiscal_year?.year}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href={`/plans/${id}/edit`}>
              <Button>
                <Pencil className="mr-2 h-4 w-4" />
                Edit Plan
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-gray-50">
        <div className="mx-auto max-w-4xl p-6">
          <div className="space-y-6">
            {/* Status Badge */}
            <div>
              <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800">
                Status: {typedPlan.status}
              </span>
            </div>

            {/* Executive Summary */}
            {typedPlan.executive_summary && (
              <div className="rounded-lg bg-white p-6 shadow">
                <h2 className="text-lg font-semibold text-gray-900">
                  Executive Summary
                </h2>
                <p className="mt-2 text-gray-700">
                  {typedPlan.executive_summary}
                </p>
              </div>
            )}

            {/* Department Vision */}
            {typedPlan.department_vision && (
              <div className="rounded-lg bg-white p-6 shadow">
                <h2 className="text-lg font-semibold text-gray-900">
                  Department Vision
                </h2>
                <p className="mt-2 text-gray-700">
                  {typedPlan.department_vision}
                </p>
              </div>
            )}

            {/* Placeholder sections for future stories */}
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="text-lg font-semibold text-gray-900">
                Strategic Goals
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                No goals defined yet. Edit the plan to add strategic goals.
              </p>
            </div>

            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="text-lg font-semibold text-gray-900">
                Initiatives
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                No initiatives defined yet. Define goals first, then add
                initiatives.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
