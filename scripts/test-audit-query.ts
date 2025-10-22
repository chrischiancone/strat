/**
 * Test script to simulate the audit logs query as it runs in the page
 * Run with: npx tsx scripts/test-audit-query.ts
 */

import { createServerSupabaseClient } from '../lib/supabase/server'
import { createAdminSupabaseClient } from '../lib/supabase/admin'

async function testAuditQuery() {
  console.log('🔍 Testing Audit Logs Query Logic...\n')

  // Test 1: Query with admin client (should work)
  console.log('1️⃣  Testing with Admin Client...')
  const adminClient = createAdminSupabaseClient()
  
  const { data: adminData, error: adminError, count: adminCount } = await adminClient
    .from('audit_logs')
    .select(
      `
      id,
      changed_by,
      action,
      table_name,
      record_id,
      old_values,
      new_values,
      changed_at,
      ip_address,
      user_agent,
      users:changed_by (
        full_name,
        email
      )
    `,
      { count: 'exact' }
    )
    .order('changed_at', { ascending: false })
    .limit(10)

  if (adminError) {
    console.error('   ❌ Admin query error:', adminError)
  } else {
    console.log(`   ✅ Admin query successful: ${adminCount} total logs, ${adminData?.length} returned`)
    if (adminData && adminData.length > 0) {
      console.log('   Sample log:')
      const sample = adminData[0]
      console.log(`   - Action: ${sample.action}`)
      console.log(`   - Table: ${sample.table_name}`)
      console.log(`   - Changed at: ${sample.changed_at}`)
      console.log(`   - User: ${sample.users?.full_name || 'N/A'}`)
    }
  }

  // Test 2: Check for users with admin role
  console.log('\n2️⃣  Checking for admin users...')
  const { data: adminUsers, error: usersError } = await adminClient
    .from('users')
    .select('id, email, role, full_name')
    .in('role', ['admin', 'city_manager'])

  if (usersError) {
    console.error('   ❌ Error fetching admin users:', usersError)
  } else if (adminUsers && adminUsers.length > 0) {
    console.log(`   ✅ Found ${adminUsers.length} admin/city_manager users:`)
    adminUsers.forEach(user => {
      console.log(`   - ${user.full_name} (${user.email}) - ${user.role}`)
    })
  } else {
    console.log('   ⚠️  No admin or city_manager users found')
  }

  // Test 3: Check what user_role() returns for each user
  console.log('\n3️⃣  Testing user_role() function...')
  if (adminUsers && adminUsers.length > 0) {
    for (const user of adminUsers) {
      const { data, error } = await adminClient
        .rpc('user_role', {}, { headers: { 'x-user-id': user.id } })
        .catch(() => ({ data: null, error: 'RPC not available' }))

      if (error) {
        console.log(`   ⚠️  Could not test user_role() for ${user.email}`)
      } else {
        console.log(`   ✅ ${user.email}: user_role() returns '${data}'`)
      }
    }
  }

  // Test 4: Check the actual page query simulation
  console.log('\n4️⃣  Simulating page query logic...')
  
  // This simulates what getAuditLogs action does
  const sortBy = 'changed_at'
  const sortOrder = 'desc'
  const page = 1
  const limit = 50

  let query = adminClient
    .from('audit_logs')
    .select(
      `
      id,
      changed_by,
      action,
      table_name,
      record_id,
      old_values,
      new_values,
      changed_at,
      ip_address,
      user_agent,
      users:changed_by (
        full_name,
        email
      )
    `,
      { count: 'exact' }
    )

  query = query.order(sortBy, { ascending: sortOrder === 'asc' })
  
  const from = (page - 1) * limit
  const to = from + limit - 1
  query = query.range(from, to)

  const { data: pageData, error: pageError, count: pageCount } = await query

  if (pageError) {
    console.error('   ❌ Page query error:', pageError)
  } else {
    console.log(`   ✅ Page query successful: ${pageCount} total, ${pageData?.length} returned`)
  }

  console.log('\n✅ Audit query test complete!\n')
  console.log('Summary:')
  console.log(`- Total audit logs: ${adminCount || 0}`)
  console.log(`- Admin users found: ${adminUsers?.length || 0}`)
  console.log(`- Page query returned: ${pageData?.length || 0} logs`)
  
  if (pageData && pageData.length > 0) {
    console.log('\n📋 Sample audit logs that should appear on the page:')
    pageData.slice(0, 5).forEach((log: any, index: number) => {
      console.log(`${index + 1}. ${log.action} on ${log.table_name} by ${log.users?.full_name || 'System'} at ${new Date(log.changed_at).toLocaleString()}`)
    })
  }
}

testAuditQuery().catch(console.error)
