import { getDepartments } from '@/app/actions/users'
import { CreateUserForm } from '@/components/admin/CreateUserForm'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function NewUserPage() {
  const departments = await getDepartments()

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
            <h1 className="text-2xl font-semibold text-gray-900">Create User</h1>
            <p className="mt-1 text-sm text-gray-500">
              Add a new user to the system
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-gray-50 p-6">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-lg bg-white p-6 shadow">
            <CreateUserForm departments={departments} />
          </div>
        </div>
      </div>
    </div>
  )
}
