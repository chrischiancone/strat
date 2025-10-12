import { notFound } from 'next/navigation'
import { getUserById, getDepartments } from '@/app/actions/users'
import { EditUserForm } from '@/components/admin/EditUserForm'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditUserPage({ params }: PageProps) {
  const { id } = await params

  const [userData, departments] = await Promise.all([
    getUserById(id),
    getDepartments(),
  ])

  if (!userData) {
    notFound()
  }

  const user = userData

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/users">
            <Button variant="outline" size="sm">
              ← Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Edit User: {user.full_name || 'N/A'}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Update user information and permissions
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-gray-50 p-6">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-lg bg-white p-6 shadow">
            <EditUserForm user={user} departments={departments} />
          </div>
        </div>
      </div>
    </div>
  )
}
