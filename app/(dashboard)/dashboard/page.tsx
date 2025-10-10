import { createServerSupabaseClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
      <p className="mt-2 text-gray-600">Welcome to the Strategic Planning System</p>

      <div className="mt-8 rounded-lg bg-white p-6 shadow">
        <h2 className="text-xl font-semibold text-gray-900">User Information</h2>
        <div className="mt-4 space-y-2">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Email:</span> {user?.email}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">User ID:</span> {user?.id}
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-lg bg-blue-50 p-6">
        <h3 className="font-semibold text-blue-900">Next Steps</h3>
        <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-blue-800">
          <li>Story 4.1: User Management - List Users</li>
          <li>Story 4.2: User Management - Create User</li>
          <li>Story 4.5: Department Management - List Departments</li>
        </ul>
      </div>
    </div>
  )
}
