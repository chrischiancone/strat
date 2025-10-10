'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'
import { createUserSchema, updateUserSchema, type CreateUserInput, type UpdateUserInput } from '@/lib/validations/user'
import { revalidatePath } from 'next/cache'

export interface UserFilters {
  role?: string
  departmentId?: string
  status?: 'active' | 'inactive'
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface UserWithDepartment {
  id: string
  full_name: string | null
  email: string | null
  role: string
  title: string | null
  is_active: boolean | null
  department_id: string | null
  department_name: string | null
  updated_at: string | null
}

interface UserQueryResult {
  id: string
  full_name: string | null
  email: string | null
  role: string
  title: string | null
  is_active: boolean | null
  department_id: string | null
  departments: { name: string } | null
  updated_at: string | null
}

export interface UsersResponse {
  users: UserWithDepartment[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export async function getUsers(
  filters: UserFilters = {}
): Promise<UsersResponse> {
  const supabase = createServerSupabaseClient()

  const {
    role,
    departmentId,
    status,
    search,
    sortBy = 'full_name',
    sortOrder = 'asc',
    page = 1,
    limit = 50,
  } = filters

  // Build base query
  let query = supabase
    .from('users')
    .select(
      `
      id,
      full_name,
      email,
      role,
      title,
      is_active,
      department_id,
      departments:department_id (
        name
      ),
      updated_at
    `,
      { count: 'exact' }
    )

  // Apply filters
  if (role) {
    query = query.eq('role', role)
  }

  if (departmentId) {
    query = query.eq('department_id', departmentId)
  }

  if (status) {
    query = query.eq('is_active', status === 'active')
  }

  if (search) {
    query = query.or(
      `full_name.ilike.%${search}%,email.ilike.%${search}%`
    )
  }

  // Apply sorting
  query = query.order(sortBy, { ascending: sortOrder === 'asc' })

  // Apply pagination
  const from = (page - 1) * limit
  const to = from + limit - 1
  query = query.range(from, to)

  const { data, error, count } = await query

  if (error) {
    console.error('Error fetching users:', error)
    throw new Error('Failed to fetch users')
  }

  // Transform data to include department name
  const users: UserWithDepartment[] = (data as unknown as UserQueryResult[] || []).map((user) => ({
    id: user.id,
    full_name: user.full_name,
    email: user.email,
    role: user.role,
    title: user.title,
    is_active: user.is_active,
    department_id: user.department_id,
    department_name: user.departments?.name || null,
    updated_at: user.updated_at,
  }))

  const total = count || 0
  const totalPages = Math.ceil(total / limit)

  return {
    users,
    total,
    page,
    limit,
    totalPages,
  }
}

export async function getDepartments() {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from('departments')
    .select('id, name')
    .eq('is_active', true)
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching departments:', error)
    return []
  }

  return data || []
}

export async function getUserById(userId: string) {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from('users')
    .select(`
      id,
      full_name,
      email,
      role,
      title,
      is_active,
      department_id,
      departments:department_id (
        name
      )
    `)
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error fetching user:', error)
    return null
  }

  return data
}

export async function createUser(input: CreateUserInput) {
  try {
    // Validate input
    const validatedInput = createUserSchema.parse(input)

    // Get current user's municipality_id
    const supabase = createServerSupabaseClient()
    const { data: { user: currentUser } } = await supabase.auth.getUser()

    if (!currentUser) {
      return { error: 'Not authenticated' }
    }

    const { data: currentUserProfile, error: profileFetchError } = await supabase
      .from('users')
      .select('municipality_id')
      .eq('id', currentUser.id)
      .single<{ municipality_id: string }>()

    if (profileFetchError || !currentUserProfile) {
      return { error: 'User profile not found' }
    }

    const municipalityId = currentUserProfile.municipality_id

    // Create admin client for auth operations
    const adminClient = createAdminSupabaseClient()

    // Create auth user
    const { data: authUser, error: authError } = await adminClient.auth.admin.createUser({
      email: validatedInput.email,
      email_confirm: false,
      user_metadata: {
        full_name: validatedInput.fullName,
      },
    })

    if (authError || !authUser.user) {
      console.error('Error creating auth user:', authError)
      return { error: authError?.message || 'Failed to create user' }
    }

    // Send invitation email
    const { error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(
      validatedInput.email,
      {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      }
    )

    if (inviteError) {
      console.error('Error sending invitation:', inviteError)
      // Don't fail - user is created, they just won't get the email
    }

    // Create public user profile
    const { error: profileError } = await adminClient
      .from('users')
      .insert({
        id: authUser.user.id,
        municipality_id: municipalityId,
        full_name: validatedInput.fullName,
        email: validatedInput.email,
        role: validatedInput.role,
        title: validatedInput.title || null,
        department_id: validatedInput.departmentId || null,
        is_active: true,
      })

    if (profileError) {
      console.error('Error creating user profile:', profileError)
      // Try to clean up auth user
      await adminClient.auth.admin.deleteUser(authUser.user.id)
      return { error: 'Failed to create user profile' }
    }

    // Revalidate users list page
    revalidatePath('/admin/users')

    return { success: true, userId: authUser.user.id }
  } catch (error) {
    console.error('Error in createUser:', error)
    if (error instanceof Error) {
      return { error: error.message }
    }
    return { error: 'An unexpected error occurred' }
  }
}

export async function updateUser(userId: string, input: UpdateUserInput) {
  try {
    // Validate input
    const validatedInput = updateUserSchema.parse(input)

    const adminClient = createAdminSupabaseClient()

    // Update user record (use admin client to bypass RLS)
    const { error: updateError } = await adminClient
      .from('users')
      .update({
        full_name: validatedInput.fullName,
        role: validatedInput.role,
        department_id: validatedInput.departmentId || null,
        title: validatedInput.title || null,
        is_active: validatedInput.isActive,
      })
      .eq('id', userId)

    if (updateError) {
      console.error('Error updating user:', updateError)
      return { error: 'Failed to update user' }
    }

    // Revalidate users list page
    revalidatePath('/admin/users')
    revalidatePath(`/admin/users/${userId}`)

    return { success: true }
  } catch (error) {
    console.error('Error in updateUser:', error)
    if (error instanceof Error) {
      return { error: error.message }
    }
    return { error: 'An unexpected error occurred' }
  }
}
