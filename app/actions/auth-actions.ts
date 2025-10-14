'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { User } from '@supabase/supabase-js'

/**
 * Get the current authenticated user
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const supabase = createServerSupabaseClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      console.error('Error getting current user:', error)
      return null
    }
    
    return user
  } catch (error) {
    console.error('Unexpected error in getCurrentUser:', error)
    return null
  }
}

/**
 * Check if the current user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser()
  return !!user
}

/**
 * Get current user's profile data
 */
export async function getCurrentUserProfile(): Promise<{
  id: string
  email: string
  full_name: string
  role: string
  department_id: string | null
} | null> {
  try {
    const supabase = createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return null

    const { data: profile, error } = await supabase
      .from('users')
      .select('id, email, full_name, role, department_id')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('Error getting user profile:', error)
      return null
    }

    return profile
  } catch (error) {
    console.error('Unexpected error in getCurrentUserProfile:', error)
    return null
  }
}