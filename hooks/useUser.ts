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
    
    const getUser = async () => {
      try {
        setIsLoading(true)
        
        // Get authenticated user
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
        
        if (authError) {
          throw authError
        }
        
        if (!authUser) {
          setUser(null)
          return
        }
        
        // Get user profile
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('id, email, full_name, role, municipality_id, department_id')
          .eq('id', authUser.id)
          .single()
        
        if (profileError) {
          throw profileError
        }
        
        setUser(profile)
      } catch (err) {
        console.error('Failed to fetch user:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch user')
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }
    
    // Get initial user
    getUser()
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null)
        setIsLoading(false)
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        getUser()
      }
    })
    
    return () => {
      subscription.unsubscribe()
    }
  }, [])
  
  return { user, isLoading, error }
}