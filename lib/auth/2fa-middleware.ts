import { getCurrentUser } from '@/app/actions/auth-actions'
import { checkTwoFactorRequiredAction } from '@/app/actions/2fa-actions'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'

export interface TwoFactorCheckResult {
  allowed: boolean
  reason?: string
  requiresSetup?: boolean
  redirectTo?: string
}

/**
 * Check if the current user can proceed with their action based on 2FA requirements
 * Returns whether the action is allowed and any necessary redirects
 */
export async function check2FARequirement(): Promise<TwoFactorCheckResult> {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return {
        allowed: false,
        reason: 'User not authenticated',
        redirectTo: '/auth/login'
      }
    }

    const requirement = await checkTwoFactorRequiredAction()
    
    // If 2FA is required but not completed, block access
    if (requirement.required && !requirement.hasCompleted) {
      return {
        allowed: false,
        reason: '2FA setup required for admin users',
        requiresSetup: true,
        redirectTo: '/auth/2fa-required'
      }
    }

    return { allowed: true }
  } catch (error) {
    console.error('Error checking 2FA requirement:', error)
    return {
      allowed: false,
      reason: 'Error checking 2FA requirement'
    }
  }
}

/**
 * Middleware wrapper for server actions that require 2FA compliance
 * Throws an error or redirects if 2FA requirements are not met
 */
export async function enforce2FA(): Promise<void> {
  const check = await check2FARequirement()
  
  if (!check.allowed) {
    if (check.redirectTo) {
      const { redirect } = await import('next/navigation')
      redirect(check.redirectTo)
    } else {
      throw new Error(check.reason || '2FA requirement not met')
    }
  }
}

/**
 * Check if a specific user has completed required 2FA setup
 * Useful for admin operations on other users
 */
export async function checkUserTwoFactorCompliance(userId: string): Promise<{
  compliant: boolean
  required: boolean
  reason?: string
}> {
  try {
    const supabase = createAdminSupabaseClient()
    
    // Get user role
    const { data: userData } = await supabase
      .from('users')
      .select('role, two_factor_enabled')
      .eq('id', userId)
      .single()

    if (!userData) {
      return { compliant: false, required: false, reason: 'User not found' }
    }

    const isAdmin = userData.role === 'admin'
    
    // Check organization's 2FA policy
    const { getSecuritySettingsForAuth } = await import('@/app/actions/settings')
    const securitySettings = await getSecuritySettingsForAuth()
    const twoFactorRequired = securitySettings.twoFactor?.requireForAdmins === true

    const required = isAdmin && twoFactorRequired
    const hasCompleted = userData.two_factor_enabled === true

    return {
      compliant: !required || hasCompleted,
      required,
      reason: required && !hasCompleted ? '2FA required but not enabled' : undefined
    }
  } catch (error) {
    console.error('Error checking user 2FA compliance:', error)
    return { compliant: false, required: false, reason: 'Error checking compliance' }
  }
}