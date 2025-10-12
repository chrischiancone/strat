import { notFound } from 'next/navigation'
import { getDepartmentById } from '@/app/actions/departments'
import { EditDepartmentForm } from '@/components/admin/EditDepartmentForm'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditDepartmentPage({ params }: PageProps) {
  const { id } = await params

  // Verify user has admin access
  const supabase = createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    notFound()
  }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single<{ role: string }>()

  if (!profile || profile.role !== 'admin') {
    notFound()
  }

  const departmentData = await getDepartmentById(id)

  if (!departmentData) {
    notFound()
  }

  const department = departmentData as {
    id: string
    name: string
    slug: string
    director_name: string | null
    director_email: string | null
    mission_statement: string | null
    is_active: boolean | null
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/departments">
            <Button variant="outline" size="sm">
              ← Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Edit Department: {department.name}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Update department information and configuration
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-gray-50 p-6">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-lg bg-white p-6 shadow">
            <EditDepartmentForm department={department} />
          </div>
        </div>
      </div>
    </div>
  )
}
