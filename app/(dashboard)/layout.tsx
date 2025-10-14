import { DashboardLayoutClient } from '@/components/layout/DashboardLayoutClient'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user profile for header
  const { data: userProfile } = await supabase
    .from('users')
    .select('full_name, email, role, department_id')
    .eq('id', user.id)
    .single<{ full_name: string; email: string; role: string; department_id: string | null }>()

  return (
    <DashboardLayoutClient userProfile={userProfile || undefined}>
      {children}
    </DashboardLayoutClient>
  )
}
