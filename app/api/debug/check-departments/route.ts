import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createServerSupabaseClient()

  // Check departments table
  const { data: departments, error: deptError } = await supabase
    .from('departments')
    .select('*')
    .eq('municipality_id', '00000000-0000-0000-0000-000000000001')

  // Check all departments (no filter)
  const { data: allDepts, error: allError } = await supabase
    .from('departments')
    .select('*')

  // Check municipalities
  const { data: municipalities, error: munError } = await supabase
    .from('municipalities')
    .select('*')

  return NextResponse.json({
    departments_for_municipality: {
      data: departments,
      error: deptError,
      count: departments?.length || 0
    },
    all_departments: {
      data: allDepts,
      error: allError,
      count: allDepts?.length || 0
    },
    municipalities: {
      data: municipalities,
      error: munError,
      count: municipalities?.length || 0
    }
  })
}
