import { TwoFactorGuard } from '@/components/auth/TwoFactorGuard'
import { getCurrentUser } from '@/app/actions/auth-actions'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // First check if user is authenticated and is admin
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  // Check if user has admin role
  const supabase = createAdminSupabaseClient()
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (userData?.role !== 'admin') {
    redirect('/dashboard')
  }

  return (
    <TwoFactorGuard redirectTo="/profile/security?required=admin">
      {children}
    </TwoFactorGuard>
  )
}