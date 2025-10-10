'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'

export interface DashboardStats {
  users: {
    total: number
    active: number
    inactive: number
  }
  departments: {
    total: number
  }
  fiscalYear: {
    current: number | null
  }
  strategicPlans: {
    total: number
    draft: number
    submitted: number
    approved: number
  }
  auditLogs: {
    recent: number // Last 24 hours
  }
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = createServerSupabaseClient()

  // Get current user to fetch their municipality_id
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

  const municipalityId = currentUserProfile.municipality_id

  // Fetch all statistics in parallel
  const [
    usersResult,
    departmentsResult,
    fiscalYearResult,
    strategicPlansResult,
    auditLogsResult,
  ] = await Promise.all([
    // Users statistics
    supabase
      .from('users')
      .select('status', { count: 'exact' })
      .eq('municipality_id', municipalityId),

    // Departments count
    supabase
      .from('departments')
      .select('id', { count: 'exact', head: true })
      .eq('municipality_id', municipalityId),

    // Current fiscal year
    supabase
      .from('fiscal_years')
      .select('year')
      .eq('municipality_id', municipalityId)
      .eq('is_active', true)
      .order('year', { ascending: false })
      .limit(1)
      .maybeSingle(),

    // Strategic plans by status
    supabase
      .from('strategic_plans')
      .select('status', { count: 'exact' })
      .eq('municipality_id', municipalityId),

    // Recent audit logs (last 24 hours)
    supabase
      .from('audit_logs')
      .select('id', { count: 'exact', head: true })
      .eq('municipality_id', municipalityId)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
  ])

  // Process users data
  interface UserRow {
    status: string
  }
  const usersData = (usersResult.data || []) as UserRow[]
  const activeUsers = usersData.filter((u) => u.status === 'active').length
  const inactiveUsers = usersData.filter((u) => u.status === 'inactive').length
  const totalUsers = usersResult.count || 0

  // Process fiscal year data
  interface FiscalYearRow {
    year: number
  }
  const fiscalYearData = fiscalYearResult.data as FiscalYearRow | null

  // Process strategic plans data
  interface StrategicPlanRow {
    status: string
  }
  const plansData = (strategicPlansResult.data || []) as StrategicPlanRow[]
  const draftPlans = plansData.filter((p) => p.status === 'draft').length
  const submittedPlans = plansData.filter((p) => p.status === 'submitted').length
  const approvedPlans = plansData.filter((p) => p.status === 'approved').length
  const totalPlans = strategicPlansResult.count || 0

  return {
    users: {
      total: totalUsers,
      active: activeUsers,
      inactive: inactiveUsers,
    },
    departments: {
      total: departmentsResult.count || 0,
    },
    fiscalYear: {
      current: fiscalYearData?.year || null,
    },
    strategicPlans: {
      total: totalPlans,
      draft: draftPlans,
      submitted: submittedPlans,
      approved: approvedPlans,
    },
    auditLogs: {
      recent: auditLogsResult.count || 0,
    },
  }
}
