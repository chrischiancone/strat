'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'
import { updateMunicipalitySchema, type UpdateMunicipalityInput } from '@/lib/validations/municipality'
import { revalidatePath } from 'next/cache'

export interface Municipality {
  id: string
  name: string
  state: string | null
  contact_name: string | null
  contact_email: string | null
  contact_phone: string | null
  website_url: string | null
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
      state,
      contact_name,
      contact_email,
      contact_phone,
      website_url
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

    // Update municipality
    const { error: updateError } = await adminClient
      .from('municipalities')
      .update({
        name: validatedInput.name,
        state: validatedInput.state || null,
        contact_name: validatedInput.contactName || null,
        contact_email: validatedInput.contactEmail || null,
        contact_phone: validatedInput.contactPhone || null,
        website_url: validatedInput.websiteUrl || null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any)
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
