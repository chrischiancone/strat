'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'
import { createDepartmentSchema, type CreateDepartmentInput } from '@/lib/validations/department'
import { revalidatePath } from 'next/cache'

export interface DepartmentFilters {
  status?: 'active' | 'inactive'
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface DepartmentWithStats {
  id: string
  name: string
  slug: string
  director_name: string | null
  director_email: string | null
  is_active: boolean | null
  mission_statement: string | null
  staff_count: number
  plans_count: number
}

interface DepartmentBase {
  id: string
  name: string
  slug: string
  director_name: string | null
  director_email: string | null
  is_active: boolean | null
  mission_statement: string | null
}

export async function getDepartmentsWithStats(
  filters: DepartmentFilters = {}
): Promise<DepartmentWithStats[]> {
  const supabase = createServerSupabaseClient()

  const {
    status,
    search,
    sortBy = 'name',
    sortOrder = 'asc',
  } = filters

  // Build base query - we'll aggregate in application code
  let query = supabase
    .from('departments')
    .select(`
      id,
      name,
      slug,
      director_name,
      director_email,
      is_active,
      mission_statement
    `)

  // Apply status filter
  if (status) {
    query = query.eq('is_active', status === 'active')
  }

  // Apply search filter
  if (search) {
    query = query.ilike('name', `%${search}%`)
  }

  // Apply sorting
  query = query.order(sortBy, { ascending: sortOrder === 'asc' })

  const { data: departmentsData, error: deptError } = await query

  if (deptError) {
    console.error('Error fetching departments:', deptError)
    throw new Error('Failed to fetch departments')
  }

  if (!departmentsData || departmentsData.length === 0) {
    return []
  }

  // Type assertion to ensure TypeScript knows the structure
  const departments = departmentsData as DepartmentBase[]
  const departmentIds = departments.map(d => d.id)

  // Fetch staff counts for all departments
  const { data: staffCounts } = await supabase
    .from('users')
    .select('department_id')
    .eq('is_active', true)
    .in('department_id', departmentIds)

  // Fetch plans counts for all departments
  const { data: plansCounts } = await supabase
    .from('strategic_plans')
    .select('department_id')
    .in('department_id', departmentIds)

  // Create lookup maps for counts
  const staffCountMap = new Map<string, number>()
  const plansCountMap = new Map<string, number>()

  // Type assertion for staff counts
  const typedStaffCounts = staffCounts as { department_id: string | null }[] | null
  typedStaffCounts?.forEach((record) => {
    if (record.department_id) {
      staffCountMap.set(
        record.department_id,
        (staffCountMap.get(record.department_id) || 0) + 1
      )
    }
  })

  // Type assertion for plans counts
  const typedPlansCounts = plansCounts as { department_id: string | null }[] | null
  typedPlansCounts?.forEach((record) => {
    if (record.department_id) {
      plansCountMap.set(
        record.department_id,
        (plansCountMap.get(record.department_id) || 0) + 1
      )
    }
  })

  // Combine data
  const departmentsWithStats: DepartmentWithStats[] = departments.map((dept) => ({
    id: dept.id,
    name: dept.name,
    slug: dept.slug,
    director_name: dept.director_name,
    director_email: dept.director_email,
    is_active: dept.is_active,
    mission_statement: dept.mission_statement,
    staff_count: staffCountMap.get(dept.id) || 0,
    plans_count: plansCountMap.get(dept.id) || 0,
  }))

  return departmentsWithStats
}

export async function createDepartment(input: CreateDepartmentInput) {
  try {
    // Validate input
    const validatedInput = createDepartmentSchema.parse(input)

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

    // Check for duplicate slug
    const { data: existingDepartment } = await supabase
      .from('departments')
      .select('id')
      .eq('slug', validatedInput.slug)
      .eq('municipality_id', municipalityId)
      .single()

    if (existingDepartment) {
      return { error: 'A department with this slug already exists' }
    }

    // Create department using admin client to bypass RLS
    const adminClient = createAdminSupabaseClient()
    const { data: newDepartment, error: insertError } = await adminClient
      .from('departments')
      .insert({
        municipality_id: municipalityId,
        name: validatedInput.name,
        slug: validatedInput.slug,
        director_name: validatedInput.directorName || null,
        director_email: validatedInput.directorEmail || null,
        mission_statement: validatedInput.missionStatement || null,
        is_active: validatedInput.isActive,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating department:', insertError)
      return { error: 'Failed to create department' }
    }

    // Revalidate departments list page
    revalidatePath('/admin/departments')

    return { success: true, departmentId: newDepartment.id }
  } catch (error) {
    console.error('Error in createDepartment:', error)
    if (error instanceof Error) {
      return { error: error.message }
    }
    return { error: 'An unexpected error occurred' }
  }
}
