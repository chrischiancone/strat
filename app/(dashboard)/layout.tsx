import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { Toaster } from '@/components/ui/toaster'
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
    <div className="flex h-screen flex-col">
      <Header user={userProfile || undefined} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar userRole={userProfile?.role} />
        <main className="flex flex-1 flex-col overflow-y-auto bg-gray-50">
          <div className="border-b border-gray-200 bg-white px-6 py-4">
            <Breadcrumbs />
          </div>
          <div className="flex-1 p-6">{children}</div>
        </main>
      </div>
      <Toaster />
    </div>
  )
}
