'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { TablesInsert } from '@/types/database'

export interface StrategicPlan {
  id: string
  department_id: string
  department_name: string
  start_fiscal_year_id: string
  end_fiscal_year_id: string
  start_year: number
  end_year: number
  title: string | null
  status: string
  created_at: string
  updated_at: string
  created_by: string
}

export interface FiscalYear {
  id: string
  year: number
  start_date: string
  end_date: string
  is_current: boolean
}

export interface CreatePlanInput {
  department_id: string
  start_fiscal_year_id: string
  end_fiscal_year_id: string
}

export async function getStrategicPlans(): Promise<StrategicPlan[]> {
  const supabase = createServerSupabaseClient()

  // Get current user
  const { data: { user: currentUser } } = await supabase.auth.getUser()

  if (!currentUser) {
    throw new Error('Unauthorized')
  }

  // Get user's municipality and role
  const { data: currentUserProfile } = await supabase
    .from('users')
    .select('municipality_id, department_id, role')
    .eq('id', currentUser.id)
    .single<{ municipality_id: string; department_id: string | null; role: string }>()

  if (!currentUserProfile) {
    throw new Error('User profile not found')
  }

  // Build query - fetch plans with department and fiscal year data
  let query = supabase
    .from('strategic_plans')
    .select(`
      id,
      department_id,
      start_fiscal_year_id,
      end_fiscal_year_id,
      title,
      status,
      created_at,
      updated_at,
      created_by,
      departments:department_id (
        name
      ),
      start_fiscal_year:start_fiscal_year_id (
        year
      ),
      end_fiscal_year:end_fiscal_year_id (
        year
      )
    `)
    .order('created_at', { ascending: false })

  // If department_director or staff, filter to their department
  if (currentUserProfile.role === 'department_director' || currentUserProfile.role === 'staff') {
    if (currentUserProfile.department_id) {
      query = query.eq('department_id', currentUserProfile.department_id)
    }
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching strategic plans:', error)
    throw new Error('Failed to fetch strategic plans')
  }

  // Transform data
  interface PlanQueryResult {
    id: string
    department_id: string
    start_fiscal_year_id: string
    end_fiscal_year_id: string
    title: string | null
    status: string
    created_at: string
    updated_at: string
    created_by: string
    departments: { name: string } | null
    start_fiscal_year: { year: number } | null
    end_fiscal_year: { year: number } | null
  }

  const plans: StrategicPlan[] = (data as unknown as PlanQueryResult[] || []).map((plan) => ({
    id: plan.id,
    department_id: plan.department_id,
    department_name: plan.departments?.name || 'Unknown',
    start_fiscal_year_id: plan.start_fiscal_year_id,
    end_fiscal_year_id: plan.end_fiscal_year_id,
    start_year: plan.start_fiscal_year?.year || 0,
    end_year: plan.end_fiscal_year?.year || 0,
    title: plan.title,
    status: plan.status,
    created_at: plan.created_at,
    updated_at: plan.updated_at,
    created_by: plan.created_by,
  }))

  return plans
}

export async function getFiscalYears(): Promise<FiscalYear[]> {
  const supabase = createServerSupabaseClient()

  // Get current user's municipality
  const { data: { user: currentUser } } = await supabase.auth.getUser()

  if (!currentUser) {
    throw new Error('Unauthorized')
  }

  const { data: currentUserProfile } = await supabase
    .from('users')
    .select('municipality_id')
    .eq('id', currentUser.id)
    .single<{ municipality_id: string }>()

  if (!currentUserProfile) {
    throw new Error('User profile not found')
  }

  // Fetch fiscal years for user's municipality
  const { data, error } = await supabase
    .from('fiscal_years')
    .select('id, year, start_date, end_date, is_current')
    .eq('municipality_id', currentUserProfile.municipality_id)
    .order('year', { ascending: true })

  if (error) {
    console.error('Error fetching fiscal years:', error)
    throw new Error('Failed to fetch fiscal years')
  }

  return data || []
}

export async function createStrategicPlan(
  input: CreatePlanInput
): Promise<{ id: string }> {
  const supabase = createServerSupabaseClient()

  // Get current user
  const { data: { user: currentUser } } = await supabase.auth.getUser()

  if (!currentUser) {
    throw new Error('Unauthorized')
  }

  // Get user's profile to check permissions
  const { data: currentUserProfile } = await supabase
    .from('users')
    .select('municipality_id, department_id, role')
    .eq('id', currentUser.id)
    .single<{ municipality_id: string; department_id: string | null; role: string }>()

  if (!currentUserProfile) {
    throw new Error('User profile not found')
  }

  // Verify user has permission to create plan for this department
  if (currentUserProfile.role === 'department_director' || currentUserProfile.role === 'staff') {
    if (input.department_id !== currentUserProfile.department_id) {
      throw new Error('Cannot create plan for a different department')
    }
  }

  // Fetch fiscal year data to generate title
  const { data: startFY } = await supabase
    .from('fiscal_years')
    .select('year')
    .eq('id', input.start_fiscal_year_id)
    .single<{ year: number }>()

  const { data: endFY } = await supabase
    .from('fiscal_years')
    .select('year')
    .eq('id', input.end_fiscal_year_id)
    .single<{ year: number }>()

  // Generate default title
  const defaultTitle = `FY${startFY?.year}-${endFY?.year} Strategic Plan`

  // Create the strategic plan
  const newPlan: TablesInsert<'strategic_plans'> = {
    department_id: input.department_id,
    start_fiscal_year_id: input.start_fiscal_year_id,
    end_fiscal_year_id: input.end_fiscal_year_id,
    title: defaultTitle,
    status: 'draft',
    created_by: currentUser.id,
  }

  // TODO: Fix Supabase type inference issue
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = (await ((supabase as any)
    .from('strategic_plans')
    .insert(newPlan)
    .select('id')
    .single())) as { data: { id: string } | null; error: unknown }

  if (error) {
    console.error('Error creating strategic plan:', error)
    throw new Error('Failed to create strategic plan')
  }

  if (!data) {
    throw new Error('No data returned after creating plan')
  }

  // Revalidate plans page
  revalidatePath('/plans')

  return { id: data.id }
}

export interface SwotAnalysis {
  strengths: string[]
  weaknesses: string[]
  opportunities: string[]
  threats: string[]
}

export interface EnvironmentalScan {
  demographic_trends: string[]
  economic_factors: string[]
  regulatory_changes: string[]
  technology_trends: string[]
  community_expectations: string[]
}

export interface StrategicPlanForEdit {
  id: string
  department_id: string
  start_fiscal_year_id: string
  end_fiscal_year_id: string
  title: string
  executive_summary: string | null
  department_vision: string | null
  swot_analysis: SwotAnalysis | null
  environmental_scan: EnvironmentalScan | null
  status: string
  created_by: string
  department: {
    id: string
    name: string
    director_name: string | null
    director_email: string | null
    mission_statement: string | null
    core_services: string[]
    current_staffing: {
      executive_management?: number
      professional_staff?: number
      technical_support?: number
    }
  }
}

export async function getStrategicPlanForEdit(
  planId: string
): Promise<StrategicPlanForEdit> {
  const supabase = createServerSupabaseClient()

  // Get current user
  const { data: { user: currentUser } } = await supabase.auth.getUser()

  if (!currentUser) {
    throw new Error('Unauthorized')
  }

  // Fetch plan with department info
  const { data, error } = await supabase
    .from('strategic_plans')
    .select(`
      id,
      department_id,
      start_fiscal_year_id,
      end_fiscal_year_id,
      title,
      executive_summary,
      department_vision,
      swot_analysis,
      environmental_scan,
      status,
      created_by,
      departments:department_id (
        id,
        name,
        director_name,
        director_email,
        mission_statement,
        core_services,
        current_staffing
      )
    `)
    .eq('id', planId)
    .single()

  if (error) {
    console.error('Error fetching strategic plan:', error)
    throw new Error('Failed to fetch strategic plan')
  }

  if (!data) {
    throw new Error('Plan not found')
  }

  // Type the response
  interface PlanEditQueryResult {
    id: string
    department_id: string
    start_fiscal_year_id: string
    end_fiscal_year_id: string
    title: string
    executive_summary: string | null
    department_vision: string | null
    swot_analysis: unknown
    environmental_scan: unknown
    status: string
    created_by: string
    departments: {
      id: string
      name: string
      director_name: string | null
      director_email: string | null
      mission_statement: string | null
      core_services: unknown
      current_staffing: unknown
    } | null
  }

  const typedData = data as unknown as PlanEditQueryResult

  if (!typedData.departments) {
    throw new Error('Department data not found')
  }

  // Transform the data
  return {
    id: typedData.id,
    department_id: typedData.department_id,
    start_fiscal_year_id: typedData.start_fiscal_year_id,
    end_fiscal_year_id: typedData.end_fiscal_year_id,
    title: typedData.title,
    executive_summary: typedData.executive_summary,
    department_vision: typedData.department_vision,
    swot_analysis:
      typeof typedData.swot_analysis === 'object' && typedData.swot_analysis !== null
        ? (typedData.swot_analysis as SwotAnalysis)
        : null,
    environmental_scan:
      typeof typedData.environmental_scan === 'object' && typedData.environmental_scan !== null
        ? (typedData.environmental_scan as EnvironmentalScan)
        : null,
    status: typedData.status,
    created_by: typedData.created_by,
    department: {
      id: typedData.departments.id,
      name: typedData.departments.name,
      director_name: typedData.departments.director_name,
      director_email: typedData.departments.director_email,
      mission_statement: typedData.departments.mission_statement,
      core_services: Array.isArray(typedData.departments.core_services)
        ? (typedData.departments.core_services as string[])
        : [],
      current_staffing:
        typeof typedData.departments.current_staffing === 'object' &&
        typedData.departments.current_staffing !== null
          ? (typedData.departments.current_staffing as {
              executive_management?: number
              professional_staff?: number
              technical_support?: number
            })
          : {},
    },
  }
}

export interface UpdatePlanMetadataInput {
  id: string
  title?: string
  executive_summary?: string | null
  department_vision?: string | null
}

export async function updateStrategicPlan(
  input: UpdatePlanMetadataInput
): Promise<void> {
  const supabase = createServerSupabaseClient()

  // Get current user
  const { data: { user: currentUser } } = await supabase.auth.getUser()

  if (!currentUser) {
    throw new Error('Unauthorized')
  }

  // Check if user has permission to edit this plan
  const { data: plan } = await supabase
    .from('strategic_plans')
    .select('created_by, department_id')
    .eq('id', input.id)
    .single<{ created_by: string; department_id: string }>()

  if (!plan) {
    throw new Error('Plan not found')
  }

  const { data: userProfile } = await supabase
    .from('users')
    .select('role, department_id')
    .eq('id', currentUser.id)
    .single<{ role: string; department_id: string | null }>()

  if (!userProfile) {
    throw new Error('User profile not found')
  }

  // Check permissions: creator, same department, or admin
  const canEdit =
    plan.created_by === currentUser.id ||
    userProfile.role === 'admin' ||
    (userProfile.department_id === plan.department_id &&
      (userProfile.role === 'department_director' || userProfile.role === 'staff'))

  if (!canEdit) {
    throw new Error('You do not have permission to edit this plan')
  }

  // Update the plan
  const updateData: { [key: string]: string | null | undefined } = {}
  if (input.title !== undefined) updateData.title = input.title
  if (input.executive_summary !== undefined)
    updateData.executive_summary = input.executive_summary
  if (input.department_vision !== undefined)
    updateData.department_vision = input.department_vision

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('strategic_plans')
    .update(updateData)
    .eq('id', input.id)

  if (error) {
    console.error('Error updating strategic plan:', error)
    throw new Error('Failed to update strategic plan')
  }

  // Revalidate paths
  revalidatePath(`/plans/${input.id}`)
  revalidatePath(`/plans/${input.id}/edit`)
  revalidatePath('/plans')
}

export interface UpdateDepartmentInput {
  id: string
  director_name?: string | null
  director_email?: string | null
  mission_statement?: string | null
  core_services?: string[]
  current_staffing?: {
    executive_management?: number
    professional_staff?: number
    technical_support?: number
  }
}

export async function updateDepartmentInfo(
  input: UpdateDepartmentInput
): Promise<void> {
  const supabase = createServerSupabaseClient()

  // Get current user
  const { data: { user: currentUser } } = await supabase.auth.getUser()

  if (!currentUser) {
    throw new Error('Unauthorized')
  }

  // Check if user has permission to edit this department
  const { data: userProfile } = await supabase
    .from('users')
    .select('role, department_id')
    .eq('id', currentUser.id)
    .single<{ role: string; department_id: string | null }>()

  if (!userProfile) {
    throw new Error('User profile not found')
  }

  // Check permissions: same department or admin
  const canEdit =
    userProfile.role === 'admin' ||
    (userProfile.department_id === input.id &&
      (userProfile.role === 'department_director' || userProfile.role === 'staff'))

  if (!canEdit) {
    throw new Error('You do not have permission to edit this department')
  }

  // Update the department
  const updateData: { [key: string]: string | null | unknown } = {}
  if (input.director_name !== undefined)
    updateData.director_name = input.director_name
  if (input.director_email !== undefined)
    updateData.director_email = input.director_email
  if (input.mission_statement !== undefined)
    updateData.mission_statement = input.mission_statement
  if (input.core_services !== undefined)
    updateData.core_services = input.core_services
  if (input.current_staffing !== undefined)
    updateData.current_staffing = input.current_staffing

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('departments')
    .update(updateData)
    .eq('id', input.id)

  if (error) {
    console.error('Error updating department:', error)
    throw new Error('Failed to update department')
  }

  // Revalidate all plan pages for this department
  revalidatePath('/plans')
}

export async function updateSwotAnalysis(
  planId: string,
  swot: SwotAnalysis
): Promise<void> {
  const supabase = createServerSupabaseClient()

  // Get current user
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser()

  if (!currentUser) {
    throw new Error('Unauthorized')
  }

  // Check if user has permission to edit this plan
  const { data: plan } = await supabase
    .from('strategic_plans')
    .select('created_by, department_id')
    .eq('id', planId)
    .single<{ created_by: string; department_id: string }>()

  if (!plan) {
    throw new Error('Plan not found')
  }

  const { data: userProfile } = await supabase
    .from('users')
    .select('role, department_id')
    .eq('id', currentUser.id)
    .single<{ role: string; department_id: string | null }>()

  if (!userProfile) {
    throw new Error('User profile not found')
  }

  // Check permissions: creator, same department, or admin
  const canEdit =
    plan.created_by === currentUser.id ||
    userProfile.role === 'admin' ||
    (userProfile.department_id === plan.department_id &&
      (userProfile.role === 'department_director' || userProfile.role === 'staff'))

  if (!canEdit) {
    throw new Error('You do not have permission to edit this plan')
  }

  // Update SWOT analysis
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('strategic_plans')
    .update({
      swot_analysis: swot,
    })
    .eq('id', planId)

  if (error) {
    console.error('Error updating SWOT analysis:', error)
    throw new Error('Failed to update SWOT analysis')
  }

  // Revalidate paths
  revalidatePath(`/plans/${planId}`)
  revalidatePath(`/plans/${planId}/edit`)
  revalidatePath('/plans')
}

export async function updateEnvironmentalScan(
  planId: string,
  scan: EnvironmentalScan
): Promise<void> {
  const supabase = createServerSupabaseClient()

  // Get current user
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser()

  if (!currentUser) {
    throw new Error('Unauthorized')
  }

  // Check if user has permission to edit this plan
  const { data: plan } = await supabase
    .from('strategic_plans')
    .select('created_by, department_id')
    .eq('id', planId)
    .single<{ created_by: string; department_id: string }>()

  if (!plan) {
    throw new Error('Plan not found')
  }

  const { data: userProfile } = await supabase
    .from('users')
    .select('role, department_id')
    .eq('id', currentUser.id)
    .single<{ role: string; department_id: string | null }>()

  if (!userProfile) {
    throw new Error('User profile not found')
  }

  // Check permissions: creator, same department, or admin
  const canEdit =
    plan.created_by === currentUser.id ||
    userProfile.role === 'admin' ||
    (userProfile.department_id === plan.department_id &&
      (userProfile.role === 'department_director' || userProfile.role === 'staff'))

  if (!canEdit) {
    throw new Error('You do not have permission to edit this plan')
  }

  // Update environmental scan
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('strategic_plans')
    .update({
      environmental_scan: scan,
    })
    .eq('id', planId)

  if (error) {
    console.error('Error updating environmental scan:', error)
    throw new Error('Failed to update environmental scan')
  }

  // Revalidate paths
  revalidatePath(`/plans/${planId}`)
  revalidatePath(`/plans/${planId}/edit`)
  revalidatePath('/plans')
}
