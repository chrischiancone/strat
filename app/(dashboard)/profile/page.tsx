import { notFound } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'
import { ProfileForm } from '@/components/profile/ProfileForm'

export default async function ProfilePage() {
  const supabase = createServerSupabaseClient()
  const adminSupabase = createAdminSupabaseClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    notFound()
  }

  // Get user profile information using admin client
  const { data: userProfile, error } = await adminSupabase
    .from('users')
    .select(`
      id,
      full_name,
      email,
      preferences,
      role,
      department_id,
      municipality_id,
      departments:department_id(name),
      municipalities:municipality_id(name)
    `)
    .eq('id', user.id)
    .single()

  if (error || !userProfile) {
    console.error('Error fetching user profile:', error)
    notFound()
  }

  // Get all departments for the dropdown using admin client
  const { data: departments } = await adminSupabase
    .from('departments')
    .select('id, name')
    .eq('municipality_id', userProfile.municipality_id)
    .order('name')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">My Profile</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your account information and preferences
        </p>
      </div>

      <div className="max-w-2xl">
        <ProfileForm
          user={{ ...userProfile, full_name: userProfile.full_name || '' }}
          departments={departments || []}
          currentUserRole={userProfile.role}
        />
      </div>
    </div>
  )
}