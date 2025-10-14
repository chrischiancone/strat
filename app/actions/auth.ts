'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { InputValidator, RateLimiter, AuthSecurity, SecurityAudit } from '@/lib/security'
import { logger } from '@/lib/logger'
import { createError } from '@/lib/errorHandler'
import { headers } from 'next/headers'
import { getSecuritySettingsForAuth } from './settings'

export interface SignInResult {
  success?: boolean
  error?: string
  requiresTwoFactorSetup?: boolean
  redirectTo?: string
}

export async function signIn(formData: FormData): Promise<SignInResult> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  
  const headersList = headers()
  const clientIp = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown'
  const userAgent = headersList.get('user-agent') || 'unknown'
  
  try {
    // Load org security settings
    const sec = await getSecuritySettingsForAuth()

    // Validate inputs
    if (!email || !password) {
      SecurityAudit.logSecurityEvent('LOGIN_ATTEMPT_MISSING_FIELDS', {
        clientIp,
        userAgent,
      })
      return { error: 'Email and password are required' }
    }

    // Sanitize and validate email
    const sanitizedEmail = InputValidator.sanitizeString(email.trim(), 254)
    if (!InputValidator.isValidEmail(sanitizedEmail)) {
      SecurityAudit.logSecurityEvent('LOGIN_ATTEMPT_INVALID_EMAIL', {
        email: sanitizedEmail.substring(0, 50), // Log partial email for debugging
        clientIp,
        userAgent,
      })
      return { error: 'Invalid email format' }
    }

    // Rate limiting (apply settings)
    const rateLimitKey = `login:${clientIp}:${sanitizedEmail}`
    if (RateLimiter.isRateLimited(rateLimitKey, sec.auth.maxLoginAttempts, 15)) {
      SecurityAudit.logSecurityEvent('LOGIN_RATE_LIMITED', {
        email: sanitizedEmail,
        clientIp,
        userAgent,
      }, 'high')
      return { error: 'Too many login attempts. Please try again in 15 minutes.' }
    }

    // Audit user input
    SecurityAudit.auditUserInput({ email: sanitizedEmail })

    const supabase = createServerSupabaseClient()

    const { error, data } = await supabase.auth.signInWithPassword({
      email: sanitizedEmail,
      password,
    })

    if (error) {
      SecurityAudit.logSecurityEvent('LOGIN_FAILED', {
        email: sanitizedEmail,
        error: error.message,
        clientIp,
        userAgent,
      })
      return { error: error.message }
    }

    // Success - reset rate limit and log success
    RateLimiter.reset(rateLimitKey)
    logger.info('User logged in successfully', {
      userId: data.user?.id,
      email: sanitizedEmail,
      clientIp,
      userAgent,
    })

    // Check if 2FA is required for this user
    if (data.user?.id) {
      const { checkTwoFactorRequiredAction } = await import('./2fa-actions')
      const twoFactorRequirement = await checkTwoFactorRequiredAction()
      
      // If 2FA is required but not completed, user needs to set it up
      if (twoFactorRequirement.required && !twoFactorRequirement.hasCompleted) {
        SecurityAudit.logSecurityEvent('LOGIN_2FA_REQUIRED', {
          userId: data.user.id,
          email: sanitizedEmail,
          clientIp,
          userAgent,
        })
        return { 
          success: true, 
          requiresTwoFactorSetup: true,
          redirectTo: '/auth/2fa-required'
        }
      }
    }

    revalidatePath('/', 'layout')
    return { success: true }
  } catch (err) {
    logger.error('Sign in error', { error: err, email, clientIp, userAgent })
    SecurityAudit.logSecurityEvent('LOGIN_ERROR', {
      error: err instanceof Error ? err.message : 'Unknown error',
      clientIp,
      userAgent,
    }, 'high')
    return { error: 'An error occurred during sign in. Please try again.' }
  }
}

export async function signUp(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string
  
  const headersList = headers()
  const clientIp = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown'
  const userAgent = headersList.get('user-agent') || 'unknown'

  try {
    // Validate inputs
    if (!email || !password || !fullName) {
      SecurityAudit.logSecurityEvent('SIGNUP_ATTEMPT_MISSING_FIELDS', {
        clientIp,
        userAgent,
      })
      return { error: 'All fields are required' }
    }

    // Sanitize and validate email
    const sanitizedEmail = InputValidator.sanitizeString(email.trim(), 254)
    if (!InputValidator.isValidEmail(sanitizedEmail)) {
      SecurityAudit.logSecurityEvent('SIGNUP_ATTEMPT_INVALID_EMAIL', {
        email: sanitizedEmail.substring(0, 50),
        clientIp,
        userAgent,
      })
      return { error: 'Invalid email format' }
    }

    // Sanitize full name
    const sanitizedFullName = InputValidator.sanitizeUserContent(fullName.trim())
    if (sanitizedFullName.length < 2 || sanitizedFullName.length > 100) {
      return { error: 'Full name must be between 2 and 100 characters' }
    }

    // Load org security settings
    const sec = await getSecuritySettingsForAuth()

    // Validate password strength per settings
    const minLen = sec.auth.minPasswordLength
    const requireSpecial = sec.auth.requireSpecialChars

    const hasUpper = /[A-Z]/.test(password)
    const hasLower = /[a-z]/.test(password)
    const hasNumber = /[0-9]/.test(password)
    const hasSpecial = /[^A-Za-z0-9]/.test(password)

    if (
      password.length < minLen ||
      !hasUpper || !hasLower || !hasNumber ||
      (requireSpecial && !hasSpecial)
    ) {
      SecurityAudit.logSecurityEvent('SIGNUP_WEAK_PASSWORD', {
        email: sanitizedEmail,
        clientIp,
        userAgent,
      })
      return {
        error: `Password must be at least ${minLen} characters long and contain uppercase, lowercase, numbers${requireSpecial ? ', and special characters' : ''}`
      }
    }

    // Rate limiting for signup
    const rateLimitKey = `signup:${clientIp}`
    if (RateLimiter.isRateLimited(rateLimitKey, 3, 60)) { // 3 attempts per hour
      SecurityAudit.logSecurityEvent('SIGNUP_RATE_LIMITED', {
        email: sanitizedEmail,
        clientIp,
        userAgent,
      }, 'high')
      return { error: 'Too many signup attempts. Please try again in an hour.' }
    }

    // Audit user input
    SecurityAudit.auditUserInput({
      email: sanitizedEmail,
      fullName: sanitizedFullName,
    })

    const supabase = createServerSupabaseClient()

    const { error, data } = await supabase.auth.signUp({
      email: sanitizedEmail,
      password,
      options: {
        data: {
          full_name: sanitizedFullName,
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    })

    if (error) {
      SecurityAudit.logSecurityEvent('SIGNUP_FAILED', {
        email: sanitizedEmail,
        error: error.message,
        clientIp,
        userAgent,
      })
      return { error: error.message }
    }

    // Success - reset rate limit and log success
    RateLimiter.reset(rateLimitKey)
    logger.info('User signed up successfully', {
      userId: data.user?.id,
      email: sanitizedEmail,
      fullName: sanitizedFullName,
      clientIp,
      userAgent,
    })

    // Note: User profile in public.users table will be created by admin
    // This allows proper role assignment and department configuration

    revalidatePath('/', 'layout')
    redirect('/login')
  } catch (err) {
    logger.error('Sign up error', { error: err, email, clientIp, userAgent })
    SecurityAudit.logSecurityEvent('SIGNUP_ERROR', {
      error: err instanceof Error ? err.message : 'Unknown error',
      clientIp,
      userAgent,
    }, 'high')
    return { error: 'An error occurred during sign up. Please try again.' }
  }
}

export async function signOut() {
  const headersList = headers()
  const clientIp = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown'
  
  try {
    const supabase = createServerSupabaseClient()
    
    // Get user info before signing out for logging
    const { data: { user } } = await supabase.auth.getUser()
    
    await supabase.auth.signOut()
    
    if (user) {
      logger.info('User signed out', {
        userId: user.id,
        email: user.email,
        clientIp,
      })
    }
    
    revalidatePath('/', 'layout')
    redirect('/login')
  } catch (err) {
    logger.error('Sign out error', { error: err, clientIp })
    // Still redirect even if there's an error
    redirect('/login')
  }
}

export interface ChangePasswordInput {
  currentPassword: string
  newPassword: string
}

export async function changePassword(input: ChangePasswordInput): Promise<void> {
  const headersList = headers()
  const clientIp = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown'
  const userAgent = headersList.get('user-agent') || 'unknown'
  
  try {
    const supabase = createServerSupabaseClient()

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      SecurityAudit.logSecurityEvent('PASSWORD_CHANGE_UNAUTHORIZED', {
        clientIp,
        userAgent,
      }, 'high')
      throw createError.authentication('Unauthorized')
    }

    // Validate input
    if (!input.currentPassword?.trim()) {
      throw createError.validation('Current password is required')
    }

    if (!input.newPassword?.trim()) {
      throw createError.validation('New password is required')
    }

    // Load org security settings
    const sec = await getSecuritySettingsForAuth()

    // Enhanced password validation per settings
    const minLen = sec.auth.minPasswordLength
    const requireSpecial = sec.auth.requireSpecialChars

    const hasUpper = /[A-Z]/.test(input.newPassword)
    const hasLower = /[a-z]/.test(input.newPassword)
    const hasNumber = /[0-9]/.test(input.newPassword)
    const hasSpecial = /[^A-Za-z0-9]/.test(input.newPassword)

    if (
      input.newPassword.length < minLen ||
      !hasUpper || !hasLower || !hasNumber ||
      (requireSpecial && !hasSpecial)
    ) {
      SecurityAudit.logSecurityEvent('PASSWORD_CHANGE_WEAK_PASSWORD', {
        userId: user.id,
        email: user.email,
        clientIp,
        userAgent,
      })
      throw createError.validation(
        `New password must be at least ${minLen} characters long and contain uppercase, lowercase, numbers${requireSpecial ? ', and special characters' : ''}`
      )
    }

    if (input.currentPassword === input.newPassword) {
      throw createError.validation('New password must be different from current password')
    }

    // Rate limiting for password changes
    const rateLimitKey = `password-change:${user.id}`
    if (RateLimiter.isRateLimited(rateLimitKey, 3, 60)) { // 3 attempts per hour
      SecurityAudit.logSecurityEvent('PASSWORD_CHANGE_RATE_LIMITED', {
        userId: user.id,
        email: user.email,
        clientIp,
        userAgent,
      }, 'high')
      throw createError.rateLimited('Too many password change attempts. Please try again in an hour.')
    }

    // First verify the current password by attempting to sign in
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: input.currentPassword,
    })

    if (verifyError) {
      SecurityAudit.logSecurityEvent('PASSWORD_CHANGE_WRONG_CURRENT', {
        userId: user.id,
        email: user.email,
        error: verifyError.message,
        clientIp,
        userAgent,
      })
      throw createError.authentication('Current password is incorrect')
    }

    // Update the password
    const { error: updateError } = await supabase.auth.updateUser({
      password: input.newPassword,
    })

    if (updateError) {
      logger.error('Error updating password', {
        error: updateError,
        userId: user.id,
        clientIp,
      })
      SecurityAudit.logSecurityEvent('PASSWORD_CHANGE_FAILED', {
        userId: user.id,
        email: user.email,
        error: updateError.message,
        clientIp,
        userAgent,
      }, 'high')
      throw createError.server('Failed to change password')
    }

    // Success - reset rate limit and log success
    RateLimiter.reset(rateLimitKey)
    logger.info('Password changed successfully', {
      userId: user.id,
      email: user.email,
      clientIp,
      userAgent,
    })

    revalidatePath('/settings')
  } catch (err) {
    if (err instanceof Error && err.name?.includes('AppError')) {
      // Re-throw our custom errors
      throw err
    }
    
    logger.error('Unexpected error in changePassword', { error: err, clientIp })
    SecurityAudit.logSecurityEvent('PASSWORD_CHANGE_UNEXPECTED_ERROR', {
      error: err instanceof Error ? err.message : 'Unknown error',
      clientIp,
      userAgent,
    }, 'high')
    throw createError.server('An unexpected error occurred while changing password')
  }
}
