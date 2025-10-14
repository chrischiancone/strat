'use server'

import { revalidatePath } from 'next/cache'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'
import { 
  generateTwoFactorSecret, 
  enableTwoFactor, 
  disableTwoFactor, 
  getTwoFactorStatus,
  verifyTwoFactorToken 
} from '@/lib/auth/2fa'
import { getCurrentUser } from './auth-actions'

export interface TwoFactorSetupResult {
  success: boolean
  error?: string
  secret?: string
  qrCodeUrl?: string
  backupCodes?: string[]
}

export interface TwoFactorStatusResult {
  success: boolean
  error?: string
  isEnabled?: boolean
  backupCodesCount?: number
}

export interface TwoFactorToggleResult {
  success: boolean
  error?: string
}

/**
 * Get current 2FA status for the authenticated user
 */
export async function getTwoFactorStatusAction(): Promise<TwoFactorStatusResult> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    const status = await getTwoFactorStatus(user.id)
    
    return {
      success: true,
      isEnabled: status.isEnabled,
      backupCodesCount: status.backupCodesCount
    }
  } catch (error) {
    console.error('Failed to get 2FA status:', error)
    return { success: false, error: 'Failed to get 2FA status' }
  }
}

/**
 * Initialize 2FA setup by generating secret and QR code
 */
export async function initializeTwoFactorSetupAction(): Promise<TwoFactorSetupResult> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    const secretData = generateTwoFactorSecret(user.email || user.id)
    const { generateQRCode, generateBackupCodes } = await import('@/lib/auth/2fa')
    
    const qrCodeUrl = await generateQRCode(secretData.otpauth_url!)
    const backupCodes = generateBackupCodes()

    return {
      success: true,
      secret: secretData.base32!,
      qrCodeUrl,
      backupCodes
    }
  } catch (error) {
    console.error('Failed to initialize 2FA setup:', error)
    return { success: false, error: 'Failed to initialize 2FA setup' }
  }
}

/**
 * Verify 2FA token and enable 2FA for the user
 */
export async function enableTwoFactorAction(
  secret: string,
  token: string,
  backupCodes: string[]
): Promise<TwoFactorToggleResult> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    // Verify the token first
    const isValid = verifyTwoFactorToken(secret, token)
    if (!isValid) {
      return { success: false, error: 'Invalid verification code' }
    }

    // Enable 2FA
    const result = await enableTwoFactor(user.id, secret, backupCodes)
    
    if (result.success) {
      revalidatePath('/admin/security')
      revalidatePath('/profile/security')
    }

    return result
  } catch (error) {
    console.error('Failed to enable 2FA:', error)
    return { success: false, error: 'Failed to enable 2FA' }
  }
}

/**
 * Disable 2FA for the current user
 */
export async function disableTwoFactorAction(): Promise<TwoFactorToggleResult> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    const result = await disableTwoFactor(user.id)
    
    if (result.success) {
      revalidatePath('/admin/security')
      revalidatePath('/profile/security')
    }

    return result
  } catch (error) {
    console.error('Failed to disable 2FA:', error)
    return { success: false, error: 'Failed to disable 2FA' }
  }
}

/**
 * Verify a 2FA token for the current user (used during login)
 */
export async function verifyTwoFactorAction(token: string, userId?: string): Promise<TwoFactorToggleResult> {
  try {
    const targetUserId = userId || (await getCurrentUser())?.id
    if (!targetUserId) {
      return { success: false, error: 'User not authenticated' }
    }

    const supabase = createAdminSupabaseClient()
    
    // Get user's 2FA secret
    const { data: userData, error } = await supabase
      .from('users')
      .select('two_factor_secret')
      .eq('id', targetUserId)
      .single()

    if (error || !userData?.two_factor_secret) {
      return { success: false, error: '2FA not enabled for this user' }
    }

    const isValid = verifyTwoFactorToken(userData.two_factor_secret, token)
    
    return { success: isValid, error: isValid ? undefined : 'Invalid verification code' }
  } catch (error) {
    console.error('Failed to verify 2FA token:', error)
    return { success: false, error: 'Failed to verify token' }
  }
}

/**
 * Use a backup code for the current user
 */
export async function useTwoFactorBackupCodeAction(backupCode: string, userId?: string): Promise<TwoFactorToggleResult> {
  try {
    const targetUserId = userId || (await getCurrentUser())?.id
    if (!targetUserId) {
      return { success: false, error: 'User not authenticated' }
    }

    const { useBackupCode: useBackupCodeUtil } = await import('@/lib/auth/2fa')
    const result = await useBackupCodeUtil(targetUserId, backupCode)
    
    return result
  } catch (error) {
    console.error('Failed to use backup code:', error)
    return { success: false, error: 'Failed to use backup code' }
  }
}

/**
 * Check if user is admin and 2FA is required for admins
 */
export async function checkTwoFactorRequiredAction(): Promise<{ required: boolean; isAdmin: boolean; hasCompleted: boolean }> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { required: false, isAdmin: false, hasCompleted: false }
    }

    // Check if user is admin
    const supabase = createAdminSupabaseClient()
    const { data: userData } = await supabase
      .from('users')
      .select('role, two_factor_enabled')
      .eq('id', user.id)
      .single()

    const isAdmin = userData?.role === 'admin'
    const hasCompleted = userData?.two_factor_enabled === true

    // Check if 2FA is required for admins from security settings
    const { getSecuritySettingsForAuth } = await import('./settings')
    const securitySettings = await getSecuritySettingsForAuth()
    const twoFactorRequired = securitySettings.twoFactor?.requireForAdmins === true

    return {
      required: isAdmin && twoFactorRequired,
      isAdmin,
      hasCompleted
    }
  } catch (error) {
    console.error('Failed to check 2FA requirement:', error)
    return { required: false, isAdmin: false, hasCompleted: false }
  }
}