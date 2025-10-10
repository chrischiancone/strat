'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'

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
