'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function signIn(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const supabase = createServerSupabaseClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  return { success: true }
}

export async function signUp(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string

  const supabase = createServerSupabaseClient()

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  // Note: User profile in public.users table will be created by admin
  // This allows proper role assignment and department configuration

  revalidatePath('/', 'layout')
  redirect('/login')
}

export async function signOut() {
  const supabase = createServerSupabaseClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}

export interface ChangePasswordInput {
  currentPassword: string
  newPassword: string
}

export async function changePassword(input: ChangePasswordInput): Promise<void> {
  const supabase = createServerSupabaseClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  // Validate input
  if (!input.currentPassword.trim()) {
    throw new Error('Current password is required')
  }

  if (!input.newPassword.trim()) {
    throw new Error('New password is required')
  }

  if (input.newPassword.length < 6) {
    throw new Error('New password must be at least 6 characters long')
  }

  if (input.currentPassword === input.newPassword) {
    throw new Error('New password must be different from current password')
  }

  // First verify the current password by attempting to sign in
  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: user.email!,
    password: input.currentPassword,
  })

  if (verifyError) {
    throw new Error('Current password is incorrect')
  }

  // Update the password
  const { error: updateError } = await supabase.auth.updateUser({
    password: input.newPassword,
  })

  if (updateError) {
    console.error('Error updating password:', updateError)
    throw new Error('Failed to change password')
  }

  revalidatePath('/settings')
}
