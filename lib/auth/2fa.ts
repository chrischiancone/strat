import speakeasy from 'speakeasy'
import QRCode from 'qrcode'
import { randomBytes, pbkdf2Sync } from 'crypto'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'

const BACKUP_CODES_COUNT = 8
const BACKUP_CODE_LENGTH = 8

// Generate a new 2FA secret
export function generateTwoFactorSecret(accountName?: string) {
  return speakeasy.generateSecret({
    name: accountName || 'Strategic Planning',
    issuer: 'Strategic Planning System'
  })
}

// Generate QR code data URL for 2FA setup
export async function generateQRCode(secret: string): Promise<string> {
  try {
    return await QRCode.toDataURL(secret)
  } catch (error) {
    logger.error('Failed to generate QR code', { error })
    throw new Error('Failed to generate QR code')
  }
}

// Verify TOTP token
export function verifyTwoFactorToken(secret: string, token: string): boolean {
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: 2 // Allow 2 time periods (±60 seconds)
  })
}

// Generate backup codes
export function generateBackupCodes(): string[] {
  const codes: string[] = []
  for (let i = 0; i < BACKUP_CODES_COUNT; i++) {
    const code = randomBytes(BACKUP_CODE_LENGTH / 2).toString('hex').toUpperCase()
    codes.push(code)
  }
  return codes
}

// Hash backup codes for storage
export function hashBackupCodes(codes: string[]): string[] {
  return codes.map(code => 
    pbkdf2Sync(code, 'backup-code-salt', 10000, 32, 'sha256').toString('hex')
  )
}

// Verify backup code against hashed codes
export function verifyBackupCode(code: string, hashedCodes: string[]): boolean {
  const hashedInput = pbkdf2Sync(code, 'backup-code-salt', 10000, 32, 'sha256').toString('hex')
  return hashedCodes.includes(hashedInput)
}

// Remove used backup code
export function removeUsedBackupCode(code: string, hashedCodes: string[]): string[] {
  const hashedInput = pbkdf2Sync(code, 'backup-code-salt', 10000, 32, 'sha256').toString('hex')
  return hashedCodes.filter(hash => hash !== hashedInput)
}

// Get user's 2FA status
export async function getTwoFactorStatus(userId: string) {
  const status = await getUserTwoFactorStatus(userId)
  if (!status) {
    return { isEnabled: false, backupCodesCount: 0 }
  }
  return { isEnabled: status.enabled, backupCodesCount: status.backupCodesCount }
}

export async function getUserTwoFactorStatus(userId: string) {
  try {
    const admin = createAdminSupabaseClient()
    const { data, error } = await admin
      .from('users')
      .select('two_factor_enabled, two_factor_backup_codes')
      .eq('id', userId)
      .single()

    if (error) {
      logger.error('Failed to get 2FA status', { userId, error })
      return null
    }

    return {
      enabled: data.two_factor_enabled || false,
      backupCodesCount: (data.two_factor_backup_codes || []).length
    }
  } catch (error) {
    logger.error('Error getting 2FA status', { userId, error })
    return null
  }
}

// Enable 2FA for user
export async function enableTwoFactor(userId: string, secret: string, backupCodes: string[]) {
  try {
    const admin = createAdminSupabaseClient()
    const hashedCodes = hashBackupCodes(backupCodes)

    const { error } = await admin
      .from('users')
      .update({
        two_factor_secret: secret,
        two_factor_enabled: true,
        two_factor_backup_codes: hashedCodes
      })
      .eq('id', userId)

    if (error) {
      logger.error('Failed to enable 2FA', { userId, error })
      return { success: false, error: 'Failed to enable 2FA' }
    }

    logger.info('2FA enabled for user', { userId })
    return { success: true }
  } catch (error) {
    logger.error('Error enabling 2FA', { userId, error })
    return { success: false, error: 'Unexpected error enabling 2FA' }
  }
}

// Disable 2FA for user
export async function disableTwoFactor(userId: string) {
  try {
    const admin = createAdminSupabaseClient()

    const { error } = await admin
      .from('users')
      .update({
        two_factor_secret: null,
        two_factor_enabled: false,
        two_factor_backup_codes: null
      })
      .eq('id', userId)

    if (error) {
      logger.error('Failed to disable 2FA', { userId, error })
      return { success: false, error: 'Failed to disable 2FA' }
    }

    logger.info('2FA disabled for user', { userId })
    return { success: true }
  } catch (error) {
    logger.error('Error disabling 2FA', { userId, error })
    return { success: false, error: 'Unexpected error disabling 2FA' }
  }
}

// Verify 2FA token or backup code
export async function verifyTwoFactorAuth(userId: string, code: string): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = createAdminSupabaseClient()
    const { data, error } = await admin
      .from('users')
      .select('two_factor_secret, two_factor_backup_codes')
      .eq('id', userId)
      .single()

    if (error || !data) {
      logger.error('Failed to get user 2FA data', { userId, error })
      return { success: false, error: 'Invalid 2FA setup' }
    }

    const { two_factor_secret, two_factor_backup_codes } = data

    // Try TOTP token first
    if (two_factor_secret && verifyTwoFactorToken(two_factor_secret, code)) {
      return { success: true }
    }

    // Try backup code
    if (two_factor_backup_codes && verifyBackupCode(code, two_factor_backup_codes)) {
      // Remove used backup code
      const updatedCodes = removeUsedBackupCode(code, two_factor_backup_codes)
      
      await admin
        .from('users')
        .update({ two_factor_backup_codes: updatedCodes })
        .eq('id', userId)

      logger.info('Backup code used for 2FA', { userId, remainingCodes: updatedCodes.length })
      return { success: true }
    }

    return { success: false, error: 'Invalid 2FA code' }
  } catch (error) {
    logger.error('Error verifying 2FA', { userId, error })
    return { success: false, error: 'Error verifying 2FA code' }
  }
}

// Use backup code for authentication
export async function useBackupCode(userId: string, backupCode: string) {
  try {
    const admin = createAdminSupabaseClient()
    const { data, error } = await admin
      .from('users')
      .select('two_factor_backup_codes')
      .eq('id', userId)
      .single()

    if (error || !data?.two_factor_backup_codes) {
      return { success: false, error: 'No backup codes found' }
    }

    const hashedCodes = data.two_factor_backup_codes
    
    if (verifyBackupCode(backupCode, hashedCodes)) {
      // Remove the used backup code
      const updatedCodes = removeUsedBackupCode(backupCode, hashedCodes)
      
      const { error: updateError } = await admin
        .from('users')
        .update({ two_factor_backup_codes: updatedCodes })
        .eq('id', userId)

      if (updateError) {
        logger.error('Failed to update backup codes after use', { userId, error: updateError })
        return { success: false, error: 'Failed to update backup codes' }
      }

      logger.info('Backup code used successfully', { userId, remainingCodes: updatedCodes.length })
      return { success: true }
    }

    return { success: false, error: 'Invalid backup code' }
  } catch (error) {
    logger.error('Error using backup code', { userId, error })
    return { success: false, error: 'Error using backup code' }
  }
}
