'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export interface CouncilGoal {
  id: string
  municipality_id: string
  category: 'core_value' | 'focus_area'
  title: string
  description: string
  key_points: string[]
  sort_order: number
  is_active: boolean
  created_by: string
  created_at: string
  updated_at: string
}

export interface CreateCouncilGoalInput {
  category: 'core_value' | 'focus_area'
  title: string
  description: string
  key_points: string[]
}

export interface UpdateCouncilGoalInput {
  id: string
  title?: string
  description?: string
  key_points?: string[]
  sort_order?: number
  is_active?: boolean
}

export async function getCouncilGoals(): Promise<CouncilGoal[]> {
  try {
    const supabase = createServerSupabaseClient()
    const adminClient = createAdminSupabaseClient()

    // Get current user for authentication
    const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser()

    if (authError) {
      console.error('Authentication error:', authError)
      throw new Error('Authentication failed')
    }

    if (!currentUser) {
      throw new Error('Unauthorized')
    }

    // Get user's municipality and role for filtering
    const { data: currentUserProfile, error: profileError } = await supabase
      .from('users')
      .select('municipality_id, role')
      .eq('id', currentUser.id)
      .single<{ municipality_id: string; role: string }>()

    if (profileError) {
      console.error('Error fetching user profile:', profileError)
      throw new Error('User profile query failed')
    }

    if (!currentUserProfile) {
      throw new Error('User profile not found')
    }

    // Use admin client for data query to bypass RLS
    const { data, error } = await adminClient
      .from('council_goals')
      .select('*')
      .eq('municipality_id', currentUserProfile.municipality_id)
      .eq('is_active', true)
      .order('category', { ascending: true })
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('Error fetching council goals:', error)
      throw new Error(`Database query failed: ${error.message}`)
    }

    return data || []
  } catch (error) {
    console.error('getCouncilGoals error:', error)
    throw error
  }
}

export async function createCouncilGoal(input: CreateCouncilGoalInput): Promise<CouncilGoal> {
  const supabase = createServerSupabaseClient()
  const adminSupabase = createAdminSupabaseClient()

  // Get current user
  const { data: { user: currentUser } } = await supabase.auth.getUser()

  if (!currentUser) {
    throw new Error('Unauthorized')
  }

  // Check if user is admin
  const { data: currentUserProfile } = await supabase
    .from('users')
    .select('municipality_id, role')
    .eq('id', currentUser.id)
    .single<{ municipality_id: string; role: string }>()

  if (!currentUserProfile || currentUserProfile.role !== 'admin') {
    throw new Error('Access denied: Admin role required')
  }

  // Get next sort order for this category
  const { data: existingGoals } = await adminSupabase
    .from('council_goals')
    .select('sort_order')
    .eq('municipality_id', currentUserProfile.municipality_id)
    .eq('category', input.category)
    .order('sort_order', { ascending: false })
    .limit(1)

  const nextSortOrder = (existingGoals?.[0]?.sort_order || 0) + 1

  // Create the goal
  const { data, error } = await adminSupabase
    .from('council_goals')
    .insert({
      municipality_id: currentUserProfile.municipality_id,
      category: input.category,
      title: input.title,
      description: input.description,
      key_points: input.key_points,
      sort_order: nextSortOrder,
      created_by: currentUser.id,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating council goal:', error)
    throw new Error('Failed to create council goal')
  }

  revalidatePath('/admin/council-goals')
  return data
}

export async function updateCouncilGoal(input: UpdateCouncilGoalInput): Promise<void> {
  const supabase = createServerSupabaseClient()
  const adminSupabase = createAdminSupabaseClient()

  // Get current user
  const { data: { user: currentUser } } = await supabase.auth.getUser()

  if (!currentUser) {
    throw new Error('Unauthorized')
  }

  // Check if user is admin
  const { data: currentUserProfile } = await supabase
    .from('users')
    .select('municipality_id, role')
    .eq('id', currentUser.id)
    .single<{ municipality_id: string; role: string }>()

  if (!currentUserProfile || currentUserProfile.role !== 'admin') {
    throw new Error('Access denied: Admin role required')
  }

  // Update the goal
  interface CouncilGoalUpdateData {
    title?: string
    description?: string | null
    key_points?: string[]
    sort_order?: number
    is_active?: boolean
  }
  
  const updateData: CouncilGoalUpdateData = {}
  if (input.title !== undefined) updateData.title = input.title
  if (input.description !== undefined) updateData.description = input.description
  if (input.key_points !== undefined) updateData.key_points = input.key_points
  if (input.sort_order !== undefined) updateData.sort_order = input.sort_order
  if (input.is_active !== undefined) updateData.is_active = input.is_active

  const { error } = await adminSupabase
    .from('council_goals')
    .update(updateData)
    .eq('id', input.id)
    .eq('municipality_id', currentUserProfile.municipality_id)

  if (error) {
    console.error('Error updating council goal:', error)
    throw new Error('Failed to update council goal')
  }

  revalidatePath('/admin/council-goals')
}

export async function deleteCouncilGoal(id: string): Promise<void> {
  const supabase = createServerSupabaseClient()
  const adminSupabase = createAdminSupabaseClient()

  // Get current user
  const { data: { user: currentUser } } = await supabase.auth.getUser()

  if (!currentUser) {
    throw new Error('Unauthorized')
  }

  // Check if user is admin
  const { data: currentUserProfile } = await supabase
    .from('users')
    .select('municipality_id, role')
    .eq('id', currentUser.id)
    .single<{ municipality_id: string; role: string }>()

  if (!currentUserProfile || currentUserProfile.role !== 'admin') {
    throw new Error('Access denied: Admin role required')
  }

  // Soft delete by setting is_active to false
  const { error } = await adminSupabase
    .from('council_goals')
    .update({ is_active: false })
    .eq('id', id)
    .eq('municipality_id', currentUserProfile.municipality_id)

  if (error) {
    console.error('Error deleting council goal:', error)
    throw new Error('Failed to delete council goal')
  }

  revalidatePath('/admin/council-goals')
}

export async function reorderCouncilGoals(goals: { id: string; sort_order: number }[]): Promise<void> {
  const supabase = createServerSupabaseClient()
  const adminSupabase = createAdminSupabaseClient()

  // Get current user
  const { data: { user: currentUser } } = await supabase.auth.getUser()

  if (!currentUser) {
    throw new Error('Unauthorized')
  }

  // Check if user is admin
  const { data: currentUserProfile } = await supabase
    .from('users')
    .select('municipality_id, role')
    .eq('id', currentUser.id)
    .single<{ municipality_id: string; role: string }>()

  if (!currentUserProfile || currentUserProfile.role !== 'admin') {
    throw new Error('Access denied: Admin role required')
  }

  // Update sort orders in batch
  const updatePromises = goals.map(goal =>
    adminSupabase
      .from('council_goals')
      .update({ sort_order: goal.sort_order })
      .eq('id', goal.id)
      .eq('municipality_id', currentUserProfile.municipality_id)
  )

  const results = await Promise.all(updatePromises)
  
  // Check for errors
  const errors = results.filter(result => result.error)
  if (errors.length > 0) {
    console.error('Error reordering council goals:', errors)
    throw new Error('Failed to reorder council goals')
  }

  revalidatePath('/admin/council-goals')
}