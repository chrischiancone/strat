/**
 * Script to create sample audit logs with proper user IDs
 * This helps test the audit logs page with realistic data
 * Run with: npx tsx scripts/populate-audit-logs.ts
 */

import { createAdminSupabaseClient } from '../lib/supabase/admin'

async function populateAuditLogs() {
  const supabase = createAdminSupabaseClient()

  console.log('🔧 Populating Audit Logs with Sample Data...\n')

  // Get admin user
  const { data: adminUser } = await supabase
    .from('users')
    .select('id, email, full_name')
    .eq('role', 'admin')
    .single()

  if (!adminUser) {
    console.error('❌ No admin user found')
    return
  }

  console.log(`✅ Found admin user: ${adminUser.full_name} (${adminUser.email})`)

  // Create sample audit logs for various actions
  const sampleLogs = [
    {
      table_name: 'users',
      record_id: adminUser.id,
      action: 'update',
      old_values: { full_name: 'Old Name', updated_at: new Date().toISOString() },
      new_values: { full_name: adminUser.full_name, updated_at: new Date().toISOString() },
      changed_by: adminUser.id,
      ip_address: '192.168.1.100',
      user_agent: 'Mozilla/5.0 (Test Browser)'
    },
    {
      table_name: 'municipalities',
      record_id: '00000000-0000-0000-0000-000000000001',
      action: 'update',
      old_values: { name: 'Test City', updated_at: new Date().toISOString() },
      new_values: { name: 'City of Carrollton', updated_at: new Date().toISOString() },
      changed_by: adminUser.id,
      ip_address: '192.168.1.100',
      user_agent: 'Mozilla/5.0 (Test Browser)'
    },
    {
      table_name: 'departments',
      record_id: '00000000-0000-0000-0000-000000000002',
      action: 'insert',
      new_values: { name: 'New Department', created_at: new Date().toISOString() },
      changed_by: adminUser.id,
      ip_address: '192.168.1.100',
      user_agent: 'Mozilla/5.0 (Test Browser)'
    },
    {
      table_name: 'strategic_plans',
      record_id: '00000000-0000-0000-0000-000000000003',
      action: 'insert',
      new_values: { title: 'Strategic Plan 2025', status: 'draft', created_at: new Date().toISOString() },
      changed_by: adminUser.id,
      ip_address: '192.168.1.100',
      user_agent: 'Mozilla/5.0 (Test Browser)'
    },
    {
      table_name: 'initiatives',
      record_id: '00000000-0000-0000-0000-000000000004',
      action: 'update',
      old_values: { status: 'draft', updated_at: new Date().toISOString() },
      new_values: { status: 'active', updated_at: new Date().toISOString() },
      changed_by: adminUser.id,
      ip_address: '192.168.1.100',
      user_agent: 'Mozilla/5.0 (Test Browser)'
    },
    {
      table_name: 'fiscal_years',
      record_id: '00000000-0000-0000-0000-000000000005',
      action: 'insert',
      new_values: { name: 'FY 2025', start_date: '2025-01-01', end_date: '2025-12-31' },
      changed_by: adminUser.id,
      ip_address: '192.168.1.101',
      user_agent: 'Mozilla/5.0 (Chrome/120.0)'
    },
    {
      table_name: 'users',
      record_id: '00000000-0000-0000-0000-000000000006',
      action: 'insert',
      new_values: { email: 'new.user@example.com', role: 'staff', created_at: new Date().toISOString() },
      changed_by: adminUser.id,
      ip_address: '192.168.1.102',
      user_agent: 'Mozilla/5.0 (Safari/17.0)'
    },
    {
      table_name: 'departments',
      record_id: '00000000-0000-0000-0000-000000000007',
      action: 'delete',
      old_values: { name: 'Deprecated Department', deleted_at: new Date().toISOString() },
      changed_by: adminUser.id,
      ip_address: '192.168.1.100',
      user_agent: 'Mozilla/5.0 (Firefox/121.0)'
    },
  ]

  console.log(`\n📝 Creating ${sampleLogs.length} sample audit logs...`)

  const { data, error } = await supabase
    .from('audit_logs')
    .insert(sampleLogs)
    .select()

  if (error) {
    console.error('❌ Error creating audit logs:', error)
    return
  }

  console.log(`✅ Successfully created ${data?.length || 0} audit logs`)

  // Verify the total count
  const { count } = await supabase
    .from('audit_logs')
    .select('*', { count: 'exact', head: true })

  console.log(`\n📊 Total audit logs in database: ${count}`)

  // Show sample of recent logs
  const { data: recentLogs } = await supabase
    .from('audit_logs')
    .select(`
      id,
      action,
      table_name,
      changed_at,
      users:changed_by (full_name, email)
    `)
    .order('changed_at', { ascending: false })
    .limit(5)

  if (recentLogs && recentLogs.length > 0) {
    console.log('\n📋 Recent audit logs:')
    recentLogs.forEach((log, index) => {
      console.log(`${index + 1}. ${log.action} on ${log.table_name} by ${log.users?.full_name || 'System'} at ${new Date(log.changed_at).toLocaleString()}`)
    })
  }

  console.log('\n✅ Audit logs population complete!')
  console.log('\n💡 Now visit /admin/audit-logs to see these logs.')
}

populateAuditLogs().catch(console.error)
