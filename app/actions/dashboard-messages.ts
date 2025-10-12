'use server'

import { createAdminSupabaseClient } from '@/lib/supabase/admin'

export interface DashboardMessage {
  heading: string
  message: string
  bg_color: 'green' | 'yellow' | 'blue'
}

export async function getDashboardMessage(
  location: string
): Promise<DashboardMessage | null> {
  const adminSupabase = createAdminSupabaseClient()

  const { data, error } = await adminSupabase
    .from('dashboard_messages')
    .select('heading, message, bg_color')
    .eq('location', location)
    .single()

  if (error || !data) {
    return null
  }

  return {
    heading: data.heading,
    message: data.message,
    bg_color: data.bg_color
  }
}