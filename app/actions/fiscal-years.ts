'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'
import {
  createFiscalYearSchema,
  updateFiscalYearSchema,
  type CreateFiscalYearInput,
  type UpdateFiscalYearInput
} from '@/lib/validations/fiscal-year'
import { revalidatePath } from 'next/cache'

export interface FiscalYearFilters {
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface FiscalYear {
  id: string
  year: number
  start_date: string
  end_date: string
  is_current: boolean | null
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

  // Use admin client for fiscal years query to bypass RLS issues
  // We've already verified user authentication and municipality access above
  const adminClient = createAdminSupabaseClient()
  
  // Build query
  let query = adminClient
    .from('fiscal_years')
    .select(`
      id,
      year,
      start_date,
      end_date,
      is_current
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

export async function getFiscalYearById(fiscalYearId: string) {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from('fiscal_years')
    .select(`
      id,
      year,
      start_date,
      end_date,
      is_current
    `)
    .eq('id', fiscalYearId)
    .single()

  if (error) {
    console.error('Error fetching fiscal year:', error)
    return null
  }

  return data
}

export async function createFiscalYear(input: CreateFiscalYearInput) {
  try {
    // Validate input
    const validatedInput = createFiscalYearSchema.parse(input)

    // Get current user's municipality_id
    const supabase = createServerSupabaseClient()
    const { data: { user: currentUser } } = await supabase.auth.getUser()

    if (!currentUser) {
      return { error: 'Not authenticated' }
    }

    const { data: currentUserProfile, error: profileFetchError } = await supabase
      .from('users')
      .select('municipality_id')
      .eq('id', currentUser.id)
      .single<{ municipality_id: string }>()

    if (profileFetchError || !currentUserProfile) {
      return { error: 'User profile not found' }
    }

    const municipalityId = currentUserProfile.municipality_id
    const adminClient = createAdminSupabaseClient()

    // If setting this fiscal year to current, deactivate all others
    if (validatedInput.isActive) {
      await adminClient
        .from('fiscal_years')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .update({ is_current: false } as any)
        .eq('municipality_id', municipalityId)
        .eq('is_current', true)
    }

    // Create fiscal year
    console.log('Creating fiscal year with data:', {
      municipality_id: municipalityId,
      year: validatedInput.year,
      start_date: validatedInput.startDate,
      end_date: validatedInput.endDate,
      is_current: validatedInput.isActive,
    })
    
    const { data: newFiscalYear, error: insertError } = await adminClient
      .from('fiscal_years')
      .insert({
        municipality_id: municipalityId,
        year: validatedInput.year,
        start_date: validatedInput.startDate,
        end_date: validatedInput.endDate,
        is_current: validatedInput.isActive,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating fiscal year:', insertError)
      console.error('Insert error details:', {
        code: insertError.code,
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint,
      })
      
      // Handle specific constraint violations
      if (insertError.code === '23505') { // Unique violation
        if (insertError.message.includes('fiscal_years_municipality_year_unique')) {
          return { error: `A fiscal year ${validatedInput.year} already exists. Please choose a different year.` }
        }
      }
      
      return { error: `Failed to create fiscal year: ${insertError.message}` }
    }

    // Revalidate fiscal years list page
    revalidatePath('/admin/fiscal-years')

    return { success: true, fiscalYearId: newFiscalYear.id }
  } catch (error) {
    console.error('Error in createFiscalYear:', error)
    if (error instanceof Error) {
      return { error: error.message }
    }
    return { error: 'An unexpected error occurred' }
  }
}

export async function updateFiscalYear(fiscalYearId: string, input: UpdateFiscalYearInput) {
  try {
    // Validate input
    const validatedInput = updateFiscalYearSchema.parse(input)

    const supabase = createServerSupabaseClient()

    // Get current user's municipality_id
    const { data: { user: currentUser } } = await supabase.auth.getUser()

    if (!currentUser) {
      return { error: 'Not authenticated' }
    }

    const { data: currentUserProfile, error: profileFetchError } = await supabase
      .from('users')
      .select('municipality_id')
      .eq('id', currentUser.id)
      .single<{ municipality_id: string }>()

    if (profileFetchError || !currentUserProfile) {
      return { error: 'User profile not found' }
    }

    const municipalityId = currentUserProfile.municipality_id
    const adminClient = createAdminSupabaseClient()

    // If setting this fiscal year to current, deactivate all others
    if (validatedInput.isActive) {
      await adminClient
        .from('fiscal_years')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .update({ is_current: false } as any)
        .eq('municipality_id', municipalityId)
        .neq('id', fiscalYearId)
        .eq('is_current', true)
    }

    // Update fiscal year
    const { error: updateError } = await adminClient
      .from('fiscal_years')
      .update({
        year: validatedInput.year,
        start_date: validatedInput.startDate,
        end_date: validatedInput.endDate,
        is_current: validatedInput.isActive,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any)
      .eq('id', fiscalYearId)

    if (updateError) {
      console.error('Error updating fiscal year:', updateError)
      return { error: 'Failed to update fiscal year' }
    }

    // Revalidate fiscal years pages
    revalidatePath('/admin/fiscal-years')
    revalidatePath(`/admin/fiscal-years/${fiscalYearId}`)

    return { success: true }
  } catch (error) {
    console.error('Error in updateFiscalYear:', error)
    if (error instanceof Error) {
      return { error: error.message }
    }
    return { error: 'An unexpected error occurred' }
  }
}
