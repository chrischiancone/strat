'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'
import { updateMunicipalitySchema, type UpdateMunicipalityInput } from '@/lib/validations/municipality'
import { revalidatePath } from 'next/cache'

export interface Municipality {
  id: string
  name: string
  slug: string
  state: string
  settings: {
    contact_name?: string
    contact_email?: string
    contact_phone?: string
    website_url?: string
    timezone?: string
    fiscal_year_start_month?: number
    currency?: string
    features?: {
      ai_assistance?: boolean
      public_dashboard?: boolean
      multi_department_collaboration?: boolean
    }
  } | null
}

export async function getMunicipality(): Promise<Municipality | null> {
  const supabase = createServerSupabaseClient()

  // Get current user to fetch their municipality_id
  const { data: { user: currentUser } } = await supabase.auth.getUser()

  if (!currentUser) {
    return null
  }

  const { data: currentUserProfile } = await supabase
    .from('users')
    .select('municipality_id')
    .eq('id', currentUser.id)
    .single<{ municipality_id: string }>()

  if (!currentUserProfile) {
    return null
  }

  // Fetch municipality
  const { data, error } = await supabase
    .from('municipalities')
    .select(`
      id,
      name,
      slug,
      state,
      settings
    `)
    .eq('id', currentUserProfile.municipality_id)
    .single()

  if (error) {
    console.error('Error fetching municipality:', error)
    return null
  }

  return data as Municipality
}

export async function updateMunicipality(municipalityId: string, input: UpdateMunicipalityInput) {
  try {
    // Validate input
    const validatedInput = updateMunicipalitySchema.parse(input)

    const adminClient = createAdminSupabaseClient()

    // Get existing settings first
    const { data: existingMunicipality } = await adminClient
      .from('municipalities')
      .select('settings')
      .eq('id', municipalityId)
      .single()
    
    const existingSettings = existingMunicipality?.settings || {}
    
    // Update municipality with merged settings
    const { error: updateError } = await adminClient
      .from('municipalities')
      .update({
        name: validatedInput.name,
        state: validatedInput.state || existingSettings.state || 'TX',
        settings: {
          ...existingSettings,
          contact_name: validatedInput.contactName || null,
          contact_email: validatedInput.contactEmail || null,
          contact_phone: validatedInput.contactPhone || null,
          website_url: validatedInput.websiteUrl || null,
        }
      })
      .eq('id', municipalityId)

    if (updateError) {
      console.error('Error updating municipality:', updateError)
      return { error: 'Failed to update municipality' }
    }

    // Revalidate settings page
    revalidatePath('/admin/settings')

    return { success: true }
  } catch (error) {
    console.error('Error in updateMunicipality:', error)
    if (error instanceof Error) {
      return { error: error.message }
    }
    return { error: 'An unexpected error occurred' }
  }
}
