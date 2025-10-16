'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'
import { createUserSchema, updateUserSchema, type CreateUserInput, type UpdateUserInput } from '@/lib/validations/user'
import { logger } from '@/lib/logger'
import { createError, handleError, safeAsync } from '@/lib/errorHandler'
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
  reports_to: string | null
  supervisor_name: string | null
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
  reports_to: string | null
  departments: { name: string } | null
  supervisor: { full_name: string } | null
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
  const result = await safeAsync(async () => {
    logger.info('Fetching users with filters', { filters, action: 'getUsers' })
    
    // Use admin client to bypass RLS for department joins
    const supabase = createAdminSupabaseClient()

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
      reports_to,
      departments:department_id (
        name
      ),
      supervisor:reports_to (
        full_name
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
    logger.dbError('fetch users', error, { filters })
    throw createError.database('Failed to fetch users', error, { filters })
  }

  // Transform data to include department name and supervisor
  const users: UserWithDepartment[] = (data as unknown as UserQueryResult[] || []).map((user) => ({
    id: user.id,
    full_name: user.full_name,
    email: user.email,
    role: user.role,
    title: user.title,
    is_active: user.is_active,
    department_id: user.department_id,
    department_name: user.departments?.name || null,
    reports_to: user.reports_to,
    supervisor_name: user.supervisor?.full_name || null,
    updated_at: user.updated_at,
  }))

    const total = count || 0
    const totalPages = Math.ceil(total / limit)
    
    const result = {
      users,
      total,
      page,
      limit,
      totalPages,
    }
    
    logger.info('Users fetched successfully', {
      total,
      page,
      limit,
      appliedFilters: filters
    })
    
    return result
  }, { action: 'getUsers' })
  
  if (!result.success) {
    throw new Error(result.error)
  }
  
  return result.data
}

export async function getPotentialSupervisors(excludeUserId?: string) {
  const result = await safeAsync(async () => {
    logger.info('Fetching potential supervisors', { excludeUserId, action: 'getPotentialSupervisors' })
    
    // Get current user's municipality_id first
    const serverSupabase = createServerSupabaseClient()
    const { data: { user } } = await serverSupabase.auth.getUser()
    
    if (!user) {
      throw createError.auth('User not authenticated')
    }
  
  const { data: userProfile } = await serverSupabase
    .from('users')
    .select('municipality_id')
    .eq('id', user.id)
    .single<{ municipality_id: string }>()
    
  if (!userProfile) {
    throw createError.notFound('User profile')
  }
  
  // Use admin client to bypass RLS for reading users
  const supabase = createAdminSupabaseClient()

  let query = supabase
    .from('users')
    .select('id, full_name, role, title')
    .eq('municipality_id', userProfile.municipality_id)
    .eq('is_active', true)
    .order('full_name', { ascending: true })

  // Exclude the user being edited (can't report to themselves)
  if (excludeUserId) {
    query = query.neq('id', excludeUserId)
  }

  const { data, error } = await query

    if (error) {
      logger.dbError('fetch potential supervisors', error)
      throw createError.database('Failed to fetch potential supervisors', error)
    }
    
    const supervisors = data || []
    logger.info('Potential supervisors fetched successfully', { count: supervisors.length })
    
    return supervisors
  }, { action: 'getPotentialSupervisors' })
  
  if (!result.success) {
    logger.warn('Failed to fetch potential supervisors, returning empty array', { error: result.error })
    return []
  }
  
  return result.data
}

export async function getDepartments() {
  const result = await safeAsync(async () => {
    logger.info('Fetching departments for user', { action: 'getDepartments' })
    
    // Get current user's municipality_id first
    const serverSupabase = createServerSupabaseClient()
    const { data: { user } } = await serverSupabase.auth.getUser()
    
    if (!user) {
      throw createError.auth('User not authenticated')
    }
  
  const { data: userProfile } = await serverSupabase
    .from('users')
    .select('municipality_id')
    .eq('id', user.id)
    .single<{ municipality_id: string }>()
    
  if (!userProfile) {
    throw createError.notFound('User profile')
  }
  
  // Use admin client to bypass RLS for reading departments
  const supabase = createAdminSupabaseClient()

  const { data, error } = await supabase
    .from('departments')
    .select('id, name')
    .eq('municipality_id', userProfile.municipality_id)
    .eq('is_active', true)
    .order('name', { ascending: true })

    if (error) {
      logger.dbError('fetch departments', error)
      throw createError.database('Failed to fetch departments', error)
    }
    
    const departments = data || []
    logger.info('Departments fetched successfully', { count: departments.length })
    
    return departments
  }, { action: 'getDepartments' })
  
  if (!result.success) {
    logger.warn('Failed to fetch departments, returning empty array', { error: result.error })
    return []
  }
  
  return result.data
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
      reports_to
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
  const result = await safeAsync(async () => {
    logger.info('Creating new user', { email: input.email, role: input.role, action: 'createUser' })
    
    // Validate input
    const validatedInput = createUserSchema.parse(input)

    // Get current user's municipality_id
    const supabase = createServerSupabaseClient()
    const { data: { user: currentUser } } = await supabase.auth.getUser()

    if (!currentUser) {
      throw createError.auth('Not authenticated')
    }

    const { data: currentUserProfile, error: profileFetchError } = await supabase
      .from('users')
      .select('municipality_id')
      .eq('id', currentUser.id)
      .single<{ municipality_id: string }>()

    if (profileFetchError || !currentUserProfile) {
      throw createError.notFound('User profile', profileFetchError || new Error('Profile not found'))
    }

    const municipalityId = currentUserProfile.municipality_id

    // Create admin client for auth operations
    const adminClient = createAdminSupabaseClient()

    // Create auth user with default password and confirm email
    const { data: authUser, error: authError } = await adminClient.auth.admin.createUser({
      email: validatedInput.email,
      email_confirm: true, // Immediately confirm email
      password: 'password123', // Set default password
      user_metadata: {
        full_name: validatedInput.fullName,
      },
    })

    if (authError || !authUser.user) {
      logger.error('Failed to create auth user', { email: validatedInput.email, error: authError?.message })
      throw createError.auth('Failed to create user', authError || new Error('No user returned'))
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
        reports_to: validatedInput.reportsTo || null,
        is_active: true,
      })

    if (profileError) {
      logger.error('Failed to create user profile', { userId: authUser.user.id, error: profileError.message })
      // Try to clean up auth user
      await adminClient.auth.admin.deleteUser(authUser.user.id)
      throw createError.database('Failed to create user profile', profileError)
    }

    // Revalidate users list page
    revalidatePath('/admin/users')
    
    logger.info('User created successfully', {
      userId: authUser.user.id,
      email: validatedInput.email,
      role: validatedInput.role
    })

    // Return success with login credentials
    return { 
      success: true, 
      userId: authUser.user.id,
      message: `User created successfully! They can log in with:\nEmail: ${validatedInput.email}\nPassword: password123`
    }
  }, { email: input.email, role: input.role, action: 'createUser' })
  
  if (!result.success) {
    return { error: result.error }
  }
  
  return result.data
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
        reports_to: validatedInput.reportsTo || null,
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

export async function deactivateUser(userId: string) {
  try {
    const adminClient = createAdminSupabaseClient()

    // Update public.users to set is_active = false
    const { error: updateError } = await adminClient
      .from('users')
      .update({ is_active: false })
      .eq('id', userId)

    if (updateError) {
      console.error('Error deactivating user:', updateError)
      return { error: 'Failed to deactivate user' }
    }

    // Ban the auth user so they cannot log in
    const { error: authError } = await adminClient.auth.admin.updateUserById(userId, {
      ban_duration: 'none', // Permanent ban
    })

    if (authError) {
      console.error('Error banning auth user:', authError)
      // Don't fail - user is deactivated in public.users
    }

    // Revalidate users list page
    revalidatePath('/admin/users')
    revalidatePath(`/admin/users/${userId}`)

    return { success: true }
  } catch (error) {
    console.error('Error in deactivateUser:', error)
    if (error instanceof Error) {
      return { error: error.message }
    }
    return { error: 'An unexpected error occurred' }
  }
}

export async function reactivateUser(userId: string) {
  try {
    const adminClient = createAdminSupabaseClient()

    // Update public.users to set is_active = true
    const { error: updateError } = await adminClient
      .from('users')
      .update({ is_active: true })
      .eq('id', userId)

    if (updateError) {
      console.error('Error reactivating user:', updateError)
      return { error: 'Failed to reactivate user' }
    }

    // Unban the auth user so they can log in
    const { error: authError } = await adminClient.auth.admin.updateUserById(userId, {
      ban_duration: '0s', // Remove ban
    })

    if (authError) {
      console.error('Error unbanning auth user:', authError)
      // Don't fail - user is reactivated in public.users
    }

    // Revalidate users list page
    revalidatePath('/admin/users')
    revalidatePath(`/admin/users/${userId}`)

    return { success: true }
  } catch (error) {
    console.error('Error in reactivateUser:', error)
    if (error instanceof Error) {
      return { error: error.message }
    }
    return { error: 'An unexpected error occurred' }
  }
}
