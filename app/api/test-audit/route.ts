import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({
        error: 'Not authenticated',
        details: authError?.message
      }, { status: 401 })
    }

    // Check if audit_logs table exists and get count
    const { count: auditCount, error: auditError } = await supabase
      .from('audit_logs')
      .select('*', { count: 'exact', head: true })
    
    // Check if triggers exist
    let triggers = null
    let triggersError = null
    try {
      const result = await supabase.rpc('exec_sql', {
        sql: `
          SELECT 
            trigger_name, 
            event_object_table, 
            action_statement,
            action_timing,
            event_manipulation
          FROM information_schema.triggers 
          WHERE trigger_name LIKE '%audit%'
          ORDER BY event_object_table, trigger_name;
        `
      })
      triggers = result.data
      triggersError = result.error
    } catch (e) {
      triggersError = 'RPC not available'
    }

    // Check if audit_trigger_function exists
    let functions = null
    let functionsError = null
    try {
      const result = await supabase.rpc('exec_sql', {
        sql: `
          SELECT 
            routine_name,
            routine_type
          FROM information_schema.routines
          WHERE routine_name LIKE '%audit%'
          ORDER BY routine_name;
        `
      })
      functions = result.data
      functionsError = result.error
    } catch (e) {
      functionsError = 'RPC not available'
    }

    // Try to create a test record to see if trigger fires
    const testResult = await testAuditTrigger(supabase, user.id)

    return NextResponse.json({
      success: true,
      auditLogsCount: auditCount || 0,
      auditLogsError: auditError?.message || null,
      triggers: triggers || 'Unable to query triggers (RPC not available)',
      triggersError: triggersError || null,
      functions: functions || 'Unable to query functions (RPC not available)',
      functionsError: functionsError || null,
      testResult,
      user: {
        id: user.id,
        email: user.email
      }
    })
  } catch (error) {
    console.error('Test audit error:', error)
    return NextResponse.json({
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

async function testAuditTrigger(supabase: any, userId: string) {
  try {
    // Get user's municipality
    const { data: userProfile } = await supabase
      .from('users')
      .select('municipality_id')
      .eq('id', userId)
      .single()

    if (!userProfile?.municipality_id) {
      return {
        success: false,
        error: 'User has no municipality'
      }
    }

    // Count audit logs before
    const { count: beforeCount } = await supabase
      .from('audit_logs')
      .select('*', { count: 'exact', head: true })

    // Create a test comment (comments table has audit trigger)
    const testComment = {
      entity_type: 'goal',
      entity_id: '00000000-0000-0000-0000-000000000000', // dummy ID
      author_id: userId,
      content: 'Test comment to trigger audit log - ' + new Date().toISOString(),
      is_resolved: false
    }

    const { data: comment, error: commentError } = await supabase
      .from('comments')
      .insert(testComment)
      .select()
      .single()

    if (commentError) {
      return {
        success: false,
        step: 'insert_comment',
        error: commentError.message
      }
    }

    // Wait a moment for trigger to fire
    await new Promise(resolve => setTimeout(resolve, 500))

    // Count audit logs after
    const { count: afterCount } = await supabase
      .from('audit_logs')
      .select('*', { count: 'exact', head: true })

    // Check if an audit log was created
    const { data: auditLog, error: auditError } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('table_name', 'comments')
      .eq('record_id', comment.id)
      .single()

    // Clean up test comment
    await supabase
      .from('comments')
      .delete()
      .eq('id', comment.id)

    return {
      success: true,
      commentCreated: !!comment,
      auditLogCreated: !!auditLog,
      beforeCount: beforeCount || 0,
      afterCount: afterCount || 0,
      countIncreased: (afterCount || 0) > (beforeCount || 0),
      auditLog: auditLog || null,
      auditError: auditError?.message || null
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
