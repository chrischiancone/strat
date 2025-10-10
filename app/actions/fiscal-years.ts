'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'

export interface FiscalYearFilters {
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface FiscalYear {
  id: string
  year_name: string
  start_date: string
  end_date: string
  is_active: boolean | null
}

export async function getFiscalYears(
  filters: FiscalYearFilters = {}
): Promise<FiscalYear[]> {
  const supabase = createServerSupabaseClient()

  const {
    sortBy = 'start_date',
    sortOrder = 'desc',
  } = filters

  // Get current user to fetch their municipality_id
  const { data: { user: currentUser } } = await supabase.auth.getUser()

  if (!currentUser) {
    return []
  }

  const { data: currentUserProfile } = await supabase
    .from('users')
    .select('municipality_id')
    .eq('id', currentUser.id)
    .single<{ municipality_id: string }>()

  if (!currentUserProfile) {
    return []
  }

  // Build query
  let query = supabase
    .from('fiscal_years')
    .select(`
      id,
      year_name,
      start_date,
      end_date,
      is_active
    `)
    .eq('municipality_id', currentUserProfile.municipality_id)

  // Apply sorting
  query = query.order(sortBy, { ascending: sortOrder === 'asc' })

  const { data, error } = await query

  if (error) {
    console.error('Error fetching fiscal years:', error)
    throw new Error('Failed to fetch fiscal years')
  }

  return (data || []) as FiscalYear[]
}
