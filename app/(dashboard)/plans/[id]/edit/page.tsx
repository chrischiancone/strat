import { getStrategicPlanForEdit } from '@/app/actions/strategic-plans'
import { notFound } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { PlanEditClient } from './PlanEditClient'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function PlanEditPage({ params }: PageProps) {
  const { id } = await params

  let plan
  let currentUser: { id: string; name: string; avatar?: string } | null = null
  
  try {
    plan = await getStrategicPlanForEdit(id)
    
    // Get current user for collaboration
    const supabase = createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      const { data: profile } = await supabase
        .from('users')
        .select('full_name, avatar_url')
        .eq('id', user.id)
        .single()
      
      currentUser = {
        id: user.id,
        name: profile?.full_name || user.email || 'User',
        avatar: profile?.avatar_url
      }
    }
  } catch (error) {
    console.error('Error loading plan:', error)
    notFound()
  }

  // Only wrap with collaboration if user is authenticated
  if (!currentUser) {
    return (
      <div className="flex h-full flex-col">
        <div className="p-6">
          <p>Please log in to edit this plan.</p>
        </div>
      </div>
    )
  }

  return (
    <PlanEditClient
      plan={plan}
      currentUser={currentUser}
    />
  )
}
