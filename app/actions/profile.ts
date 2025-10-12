'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export interface UpdateProfileInput {
  id: string
  full_name: string
  email: string
  phone: string | null
  mobile: string | null
  department_id: string | null
}

export async function updateUserProfile(input: UpdateProfileInput): Promise<void> {
  const supabase = createServerSupabaseClient()
  const adminSupabase = createAdminSupabaseClient()

  // Get current user for authentication
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser()

  if (!currentUser) {
    throw new Error('Unauthorized')
  }

  // Verify user is updating their own profile
  if (currentUser.id !== input.id) {
    throw new Error('You can only update your own profile')
  }

  // Validate input
  if (!input.full_name.trim()) {
    throw new Error('Full name is required')
  }

  if (!input.email.trim()) {
    throw new Error('Email is required')
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(input.email)) {
    throw new Error('Please enter a valid email address')
  }

  // Check if email is already in use by another user
  const { data: existingUser } = await adminSupabase
    .from('users')
    .select('id')
    .eq('email', input.email)
    .neq('id', input.id)
    .single()

  if (existingUser) {
    throw new Error('This email address is already in use by another user')
  }

  // If department is specified, verify it exists and user has access to it
  if (input.department_id) {
    const { data: userProfile } = await adminSupabase
      .from('users')
      .select('municipality_id')
      .eq('id', input.id)
      .single()

    if (!userProfile) {
      throw new Error('User profile not found')
    }

    const { data: department } = await adminSupabase
      .from('departments')
      .select('id')
      .eq('id', input.department_id)
      .eq('municipality_id', userProfile.municipality_id)
      .single()

    if (!department) {
      throw new Error('Invalid department selection')
    }
  }

  // Get current preferences to merge with new phone/mobile data
  const { data: currentUserData } = await adminSupabase
    .from('users')
    .select('preferences')
    .eq('id', input.id)
    .single()

  const currentPreferences = currentUserData?.preferences || {}
  const updatedPreferences = {
    ...currentPreferences,
    phone: input.phone,
    mobile: input.mobile,
  }

  // Update the user profile using admin client to bypass RLS
  const { error } = await adminSupabase
    .from('users')
    .update({
      full_name: input.full_name.trim(),
      email: input.email.trim(),
      preferences: updatedPreferences,
      department_id: input.department_id,
    })
    .eq('id', input.id)

  if (error) {
    console.error('Error updating user profile:', error)
    throw new Error('Failed to update profile')
  }

  // Update Supabase Auth user email if it changed
  const { data: currentProfile } = await adminSupabase
    .from('users')
    .select('email')
    .eq('id', input.id)
    .single()

  if (currentProfile && currentProfile.email !== currentUser.email) {
    // Note: Updating email in Supabase Auth requires email verification
    // For now, we'll just update the profile table
    // In a production app, you might want to trigger an email verification flow
  }

  // Revalidate relevant paths
  revalidatePath('/profile')
  revalidatePath('/dashboard')
}