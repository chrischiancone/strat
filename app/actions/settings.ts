"use server"

import { revalidatePath } from 'next/cache'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'
import { securitySettingsSchema, type SecuritySettings } from '@/lib/validations/security'
import { invalidatePerformanceSettingsCache } from '@/lib/performance/settings'
import { applyMonitoringSettings } from '@/lib/performance/apply-settings'

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

/**
 * Update notification settings
 */
export async function updateNotificationSettings(municipalityId: string, input: JSONObject) {
  if (!municipalityId) return { error: 'Missing municipalityId' }
  
  try {
    const result = await updateMunicipalitySettings(municipalityId, { notifications: input })
    return result
  } catch (error) {
    console.error('Error in updateNotificationSettings:', error)
    return { error: 'Failed to update notification settings: ' + (error instanceof Error ? error.message : String(error)) }
  }
}

/**
 * Update appearance settings
 */
export async function updateAppearanceSettings(municipalityId: string, input: JSONObject) {
  if (!municipalityId) return { error: 'Missing municipalityId' }
  
  try {
    const result = await updateMunicipalitySettings(municipalityId, { appearance: input })
    return result
  } catch (error) {
    console.error('Error in updateAppearanceSettings:', error)
    return { error: 'Failed to update appearance settings: ' + (error instanceof Error ? error.message : String(error)) }
  }
}

/**
 * Update integration settings
 */
export async function updateIntegrationSettings(municipalityId: string, input: JSONObject) {
  if (!municipalityId) return { error: 'Missing municipalityId' }
  
  try {
    const result = await updateMunicipalitySettings(municipalityId, { integrations: input })
    return result
  } catch (error) {
    console.error('Error in updateIntegrationSettings:', error)
    return { error: 'Failed to update integration settings: ' + (error instanceof Error ? error.message : String(error)) }
  }
}

/**
 * Update performance settings
 */
export async function updatePerformanceSettings(municipalityId: string, input: JSONObject) {
  if (!municipalityId) return { error: 'Missing municipalityId' }
  
  try {
    const result = await updateMunicipalitySettings(municipalityId, { performance: input })
    
    // Invalidate performance settings cache so middleware picks up changes
    if (result.success) {
      invalidatePerformanceSettingsCache()
      
      // Apply monitoring settings immediately
      await applyMonitoringSettings()
    }
    
    return result
  } catch (error) {
    console.error('Error in updatePerformanceSettings:', error)
    return { error: 'Failed to update performance settings: ' + (error instanceof Error ? error.message : String(error)) }
  }
}

/**
 * Update backup settings
 */
export async function updateBackupSettings(municipalityId: string, input: JSONObject) {
  if (!municipalityId) return { error: 'Missing municipalityId' }
  
  try {
    const result = await updateMunicipalitySettings(municipalityId, { backup: input })
    return result
  } catch (error) {
    console.error('Error in updateBackupSettings:', error)
    return { error: 'Failed to update backup settings: ' + (error instanceof Error ? error.message : String(error)) }
  }
}

/**
 * Update maintenance settings
 */
export async function updateMaintenanceSettings(municipalityId: string, input: JSONObject) {
  if (!municipalityId) return { error: 'Missing municipalityId' }
  
  try {
    const result = await updateMunicipalitySettings(municipalityId, { maintenance: input })
    return result
  } catch (error) {
    console.error('Error in updateMaintenanceSettings:', error)
    return { error: 'Failed to update maintenance settings: ' + (error instanceof Error ? error.message : String(error)) }
  }
}
