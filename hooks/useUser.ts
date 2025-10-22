import { useState, useEffect } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

interface UserProfile {
  id: string
  email: string
  full_name: string | null
  role: string
  municipality_id: string
  department_id: string | null
}

interface UseUser {
  user: UserProfile | null
  isLoading: boolean
  error: string | null
}

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
            retries--
            if (retries > 0) {
              // Wait a bit before retrying (exponential backoff)
              await new Promise(resolve => setTimeout(resolve, 1000 * (4 - retries)))
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
          setError(err instanceof Error ? err.message : 'Failed to fetch user')
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
