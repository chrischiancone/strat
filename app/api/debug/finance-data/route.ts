import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createServerSupabaseClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('users')
    .select('role, municipality_id, department_id, full_name')
    .eq('id', user.id)
    .single()

  // Get departments
  const { data: departments } = await supabase
    .from('departments')
    .select('id, name, municipality_id')
    .eq('municipality_id', profile?.municipality_id || '')

  // Get strategic plans
  const deptIds = departments?.map(d => d.id) || []
  const { data: plans } = await supabase
    .from('strategic_plans')
    .select('id, name, department_id')
    .in('department_id', deptIds)

  // Get goals
  const planIds = plans?.map(p => p.id) || []
  const { data: goals } = await supabase
    .from('strategic_goals')
    .select('id, title, strategic_plan_id')
    .in('strategic_plan_id', planIds)

  // Get initiatives
  const goalIds = goals?.map(g => g.id) || []
  const { data: initiatives } = await supabase
    .from('initiatives')
    .select('id, name, strategic_goal_id, total_year_1_cost, total_year_2_cost, total_year_3_cost')
    .in('strategic_goal_id', goalIds)

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: profile?.full_name,
      role: profile?.role,
      municipality_id: profile?.municipality_id,
      department_id: profile?.department_id,
    },
    counts: {
      departments: departments?.length || 0,
      strategic_plans: plans?.length || 0,
      strategic_goals: goals?.length || 0,
      initiatives: initiatives?.length || 0,
    },
    departments: departments?.map(d => ({ id: d.id, name: d.name })),
    strategic_plans: plans?.map(p => ({ id: p.id, name: p.name, department_id: p.department_id })),
    strategic_goals: goals?.map(g => ({ id: g.id, title: g.title, plan_id: g.strategic_plan_id })),
    initiatives: initiatives?.map(i => ({ 
      id: i.id, 
      name: i.name, 
      goal_id: i.strategic_goal_id,
      total_cost: (i.total_year_1_cost || 0) + (i.total_year_2_cost || 0) + (i.total_year_3_cost || 0)
    })),
  })
}
