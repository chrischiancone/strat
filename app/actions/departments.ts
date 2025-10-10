'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'

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
