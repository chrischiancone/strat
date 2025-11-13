import { useState, useEffect } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

/**
 * User profile data structure
 */
interface UserProfile {
  id: string
  email: string
  full_name: string | null
  role: string
  municipality_id: string
  department_id: string | null
}

/**
 * Return type for useUser hook
 */
interface UseUser {
  /** Current user profile, or null if not authenticated */
  user: UserProfile | null
  /** Whether user data is currently being fetched */
  isLoading: boolean
  /** Error message if user fetch failed */
  error: string | null
}

/**
 * React hook to fetch and manage current user profile.
 * 
 * This hook:
 * - Fetches authenticated user from Supabase Auth
 * - Retrieves user profile from `public.users` table
 * - Implements retry logic for schema/permission errors
 * - Listens for auth state changes (sign in/out, token refresh)
 * - Handles errors gracefully with user-friendly messages
 * 
 * @returns Object containing user profile, loading state, and error
 * 
 * @example
 * ```tsx
 * 'use client'
 * import { useUser } from '@/hooks/useUser'
 * 
 * export function UserProfile() {
 *   const { user, isLoading, error } = useUser()
 *   
 *   if (isLoading) return <div>Loading...</div>
 *   if (error) return <div>Error: {error}</div>
 *   if (!user) return <div>Not authenticated</div>
 *   
 *   return <div>Welcome, {user.full_name}!</div>
 * }
 * ```
 */
export function useUser(): UseUser {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    const supabase = createBrowserSupabaseClient()
    let mounted = true
    
    const getUser = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        // Get authenticated user
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
        
        if (authError) {
          console.error('Auth error:', authError)
          throw authError
        }
        
        if (!authUser) {
          if (mounted) {
            setUser(null)
            setError(null)
          }
          return
        }
        
        // Get user profile with retry logic
        let retries = 3
        let profile = null
        let profileError = null
        
        while (retries > 0 && !profile) {
          const result = await supabase
            .from('users')
            .select('id, email, full_name, role, municipality_id, department_id')
            .eq('id', authUser.id)
            .maybeSingle()
          
          profile = result.data
          profileError = result.error
          
          if (profileError) {
            console.error('Profile fetch error:', profileError)
            // Check for specific error types
            if (profileError.message?.includes('schema') || profileError.message?.includes('permission')) {
              // This might be a timing issue - wait a bit longer and retry
              retries--
              if (retries > 0) {
                await new Promise(resolve => setTimeout(resolve, 2000 * (4 - retries)))
              } else {
                // Last retry failed - set a user-friendly error
                if (mounted) {
                  setError('Unable to load user profile. Please refresh the page.')
                  setUser(null)
                }
                return
              }
            } else {
              retries--
              if (retries > 0) {
                // Wait a bit before retrying (exponential backoff)
                await new Promise(resolve => setTimeout(resolve, 1000 * (4 - retries)))
              } else {
                if (mounted) {
                  setError(profileError.message || 'Failed to load user profile')
                  setUser(null)
                }
                return
              }
            }
          } else {
            break
          }
        }
        
        if (!mounted) return
        
        // If profile doesn't exist, the user might need to be created by an admin
        if (!profile) {
          console.warn('User profile not found for authenticated user:', authUser.id)
          setError('User profile not found. Please contact an administrator.')
          setUser(null)
          return
        }
        
        setUser(profile)
        setError(null)
      } catch (err) {
        console.error('Failed to fetch user:', err)
        if (mounted) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to fetch user'
          // Provide more helpful error messages
          if (errorMessage.includes('schema') || errorMessage.includes('permission')) {
            setError('Database connection issue. Please refresh the page or contact support.')
          } else {
            setError(errorMessage)
          }
          setUser(null)
        }
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }
    
    // Get initial user
    getUser()
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return
      
      console.log('Auth state changed:', event)
      
      if (event === 'SIGNED_OUT') {
        setUser(null)
        setError(null)
        setIsLoading(false)
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        getUser()
      }
    })
    
    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])
  
  return { user, isLoading, error }
}
