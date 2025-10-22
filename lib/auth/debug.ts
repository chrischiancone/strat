/**
 * Auth debugging utilities for troubleshooting authentication issues
 */

import { logger } from '@/lib/logger'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export interface AuthDebugInfo {
  hasSession: boolean
  userId?: string
  userEmail?: string
  sessionExpiry?: string
  error?: string
}

/**
 * Get current authentication status with detailed debugging info
 */
export async function getAuthDebugInfo(): Promise<AuthDebugInfo> {
  try {
    const supabase = createServerSupabaseClient()
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      logger.error('Session error in debug', { error: sessionError })
      return {
        hasSession: false,
        error: sessionError.message
      }
    }
    
    if (!session) {
      return {
        hasSession: false
      }
    }
    
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError) {
      logger.error('User error in debug', { error: userError })
      return {
        hasSession: true,
        error: userError.message
      }
    }
    
    return {
      hasSession: true,
      userId: user?.id,
      userEmail: user?.email,
      sessionExpiry: session.expires_at ? new Date(session.expires_at * 1000).toISOString() : undefined
    }
  } catch (error) {
    logger.error('Unexpected error in auth debug', { error })
    return {
      hasSession: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Verify user is authenticated and has a valid session
 * Returns user ID if authenticated, null otherwise
 */
export async function requireAuth(): Promise<string | null> {
  try {
    const supabase = createServerSupabaseClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      logger.warn('Auth check failed', { error })
      return null
    }
    
    if (!user) {
      logger.warn('No authenticated user found')
      return null
    }
    
    return user.id
  } catch (error) {
    logger.error('Error in requireAuth', { error })
    return null
  }
}

/**
 * Log authentication state for debugging
 */
export async function logAuthState(context: string) {
  const debugInfo = await getAuthDebugInfo()
  logger.info('Auth state', {
    context,
    ...debugInfo
  })
}
