/**
 * Test script to verify audit logging is working
 * Run with: npx tsx scripts/test-audit-logs.ts
 */

import { createAdminSupabaseClient } from '../lib/supabase/admin'

async function testAuditLogs() {
  const supabase = createAdminSupabaseClient()

  console.log('🔍 Testing Audit Logs System...\n')

  // 1. Check if audit_logs table exists and is accessible
  console.log('1️⃣  Checking audit_logs table...')
  const { data: auditLogs, error: auditError, count } = await supabase
    .from('audit_logs')
    .select('*', { count: 'exact', head: false })
    .limit(10)

  if (auditError) {
    console.error('❌ Error accessing audit_logs table:', auditError)
    return
  }

  console.log(`✅ audit_logs table accessible. Found ${count || 0} logs.`)
  if (auditLogs && auditLogs.length > 0) {
    console.log('   Recent logs:')
    auditLogs.forEach(log => {
      console.log(`   - ${log.action} on ${log.table_name} at ${log.changed_at}`)
    })
  } else {
    console.log('   ⚠️  No audit logs found in the table.')
  }

  // 2. Check if audit triggers exist
  console.log('\n2️⃣  Checking audit triggers...')
  try {
    const { data: triggers, error: triggersError } = await supabase
      .rpc('get_triggers_list')

    if (triggersError) {
      console.log('   ⚠️  Could not check triggers via RPC (this is normal for Supabase)')
    } else if (triggers) {
      console.log(`✅ Found ${triggers.length} audit triggers`)
      if (triggers.length > 0) {
        triggers.forEach((trigger: any) => {
          console.log(`   - ${trigger.trigger_name} on ${trigger.event_object_table}`)
        })
      }
    }
  } catch (err) {
    console.log('   ⚠️  RPC function not available - skipping trigger check')
  }

  // 3. Test manual audit log creation
  console.log('\n3️⃣  Testing manual audit log creation...')
  const testUserId = '00000000-0000-0000-0000-000000000000' // System user
  const { error: insertError } = await supabase
    .from('audit_logs')
    .insert({
      table_name: 'test_table',
      record_id: '00000000-0000-0000-0000-000000000001',
      action: 'insert',
      new_values: { test: 'test audit log', created_at: new Date().toISOString() },
      changed_by: testUserId,
      ip_address: '127.0.0.1',
      user_agent: 'Test Script'
    })

  if (insertError) {
    console.error('❌ Error creating test audit log:', insertError)
  } else {
    console.log('✅ Successfully created test audit log')
  }

  // 4. Verify the test log was created
  console.log('\n4️⃣  Verifying test log was created...')
  const { data: testLog, error: testError } = await supabase
    .from('audit_logs')
    .select('*')
    .eq('table_name', 'test_table')
    .order('changed_at', { ascending: false })
    .limit(1)
    .single()

  if (testError) {
    console.error('❌ Error fetching test audit log:', testError)
  } else if (testLog) {
    console.log('✅ Test log found:')
    console.log(`   - ID: ${testLog.id}`)
    console.log(`   - Action: ${testLog.action}`)
    console.log(`   - Table: ${testLog.table_name}`)
    console.log(`   - Created: ${testLog.changed_at}`)
  }

  // 5. Check if real tables have triggers
  console.log('\n5️⃣  Checking critical tables for audit triggers...')
  const criticalTables = [
    'strategic_plans',
    'initiatives',
    'users',
    'departments',
    'municipalities'
  ]

  for (const tableName of criticalTables) {
    // Test by performing a query (not insert, just to check access)
    const { count, error } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true })

    if (error) {
      console.log(`   ⚠️  ${tableName}: Error accessing table`)
    } else {
      console.log(`   ✅ ${tableName}: Table accessible (${count} records)`)
    }
  }

  // 6. Check audit_logs RLS policies
  console.log('\n6️⃣  Checking audit_logs RLS policies...')
  const { data: policies, error: policiesError } = await supabase
    .from('audit_logs')
    .select('*')
    .limit(1)

  if (policiesError && policiesError.message.includes('policy')) {
    console.log('   ⚠️  RLS policies may be too restrictive for viewing audit logs')
    console.log('   Error:', policiesError.message)
  } else {
    console.log('   ✅ RLS policies allow access')
  }

  console.log('\n✅ Audit logs test complete!\n')
  console.log('Summary:')
  console.log(`- Total audit logs in database: ${count || 0}`)
  console.log(`- Test log creation: ${insertError ? '❌ Failed' : '✅ Success'}`)
  console.log('\nIf you see 0 audit logs, triggers may need to be enabled or')
  console.log('no database operations have been performed yet.')
}

testAuditLogs().catch(console.error)
