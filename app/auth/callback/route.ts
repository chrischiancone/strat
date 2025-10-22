import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { type NextRequest } from 'next/server'
import { logger } from '@/lib/logger'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')
  const origin = requestUrl.origin

  // Handle OAuth errors
  if (error) {
    logger.error('Auth callback error', { error, errorDescription })
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(errorDescription || error)}`
    )
  }

  // Exchange code for session
  if (code) {
    try {
      const supabase = createServerSupabaseClient()
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
      
      if (exchangeError) {
        logger.error('Failed to exchange code for session', { error: exchangeError })
        return NextResponse.redirect(
          `${origin}/login?error=${encodeURIComponent('Authentication failed. Please try again.')}`
        )
      }

      // Verify we have a user
      if (!data.user) {
        logger.error('No user after session exchange')
        return NextResponse.redirect(
          `${origin}/login?error=${encodeURIComponent('Authentication failed. Please try again.')}`
        )
      }

      logger.info('Auth callback successful', { userId: data.user.id })
    } catch (err) {
      logger.error('Unexpected error in auth callback', { error: err })
      return NextResponse.redirect(
        `${origin}/login?error=${encodeURIComponent('An unexpected error occurred. Please try again.')}`
      )
    }
  }

  // Redirect to dashboard after successful sign in
  return NextResponse.redirect(`${origin}/dashboard`)
}
