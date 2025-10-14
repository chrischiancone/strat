"use server"

import { revalidatePath } from 'next/cache'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'
import { securitySettingsSchema, type SecuritySettings } from '@/lib/validations/security'

export type JSONObject = { [key: string]: any }

function isObject(item: any): item is Record<string, any> {
  return item && typeof item === 'object' && !Array.isArray(item)
}

function deepMerge<T extends JSONObject, U extends JSONObject>(target: T, source: U): T & U {
  const output: any = { ...target }
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach((key) => {
      const srcVal = (source as any)[key]
      const tgtVal = (target as any)[key]
      if (isObject(srcVal)) {
        output[key] = deepMerge(isObject(tgtVal) ? tgtVal : {}, srcVal)
      } else {
        output[key] = srcVal
      }
    })
  }
  return output
}

/**
 * Update municipality.settings JSON with a deep-merged patch.
 * Safely merges nested objects like appearance, notifications, backup, etc.
 */
export async function updateMunicipalitySettings(municipalityId: string, patch: JSONObject) {
  if (!municipalityId) return { error: 'Missing municipalityId' }
  try {
    const admin = createAdminSupabaseClient()

    const { data: row, error: fetchErr } = await admin
      .from('municipalities')
      .select('settings')
      .eq('id', municipalityId)
      .single()

    if (fetchErr) {
      console.error('Error fetching municipality settings:', fetchErr)
      return { error: 'Failed to load current settings' }
    }

    const current = (row?.settings as JSONObject) || {}
    const merged = deepMerge(current, patch)

    const { error: updateErr } = await admin
      .from('municipalities')
      .update({ settings: merged })
      .eq('id', municipalityId)

    if (updateErr) {
      console.error('Error updating municipality settings:', updateErr)
      return { error: 'Failed to update settings' }
    }

    // Revalidate key paths where settings are consumed
    revalidatePath('/')
    revalidatePath('/admin/settings')
    revalidatePath('/dashboard')

    return { success: true }
  } catch (err) {
    console.error('updateMunicipalitySettings unexpected error:', err)
    return { error: 'Unexpected error updating settings' }
  }
}

// Fetch security settings for the single-tenant municipality context used during auth (no user session yet)
export async function getSecuritySettingsForAuth(): Promise<SecuritySettings> {
  const admin = createAdminSupabaseClient()
  const { data } = await admin
    .from('municipalities')
    .select('settings')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle<{ settings: any }>()

  const existing = (data?.settings?.security as unknown) || {}
  // Parse with defaults
  return securitySettingsSchema.parse(existing)
}

// Update only the security settings object atomically (deep-merge handled by updateMunicipalitySettings)
export async function updateSecuritySettings(municipalityId: string, input: SecuritySettings) {
  console.log('updateSecuritySettings called with:', { municipalityId, input })
  
  try {
    // Validate input using schema to ensure types/ranges
    const parsed = securitySettingsSchema.parse(input)
    console.log('Parsed security settings:', parsed)
    
    const result = await updateMunicipalitySettings(municipalityId, { security: parsed })
    console.log('updateMunicipalitySettings result:', result)
    
    return result
  } catch (error) {
    console.error('Error in updateSecuritySettings:', error)
    return { error: 'Failed to update security settings: ' + (error instanceof Error ? error.message : String(error)) }
  }
}
