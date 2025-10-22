import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkAuditSystem() {
  console.log('🔍 Checking Audit Log System...\n')

  // 1. Check if audit_logs table exists
  console.log('1. Checking audit_logs table...')
  const { data: auditLogs, error: auditError, count } = await supabase
    .from('audit_logs')
    .select('*', { count: 'exact' })
    .limit(5)

  if (auditError) {
    console.error('❌ Error accessing audit_logs table:', auditError.message)
  } else {
    console.log(`✅ audit_logs table accessible. Found ${count} total logs.`)
    if (auditLogs && auditLogs.length > 0) {
      console.log('   Sample logs:')
      auditLogs.forEach((log: any) => {
        console.log(`   - ${log.action} on ${log.table_name} by ${log.changed_by || 'System'} at ${log.changed_at}`)
      })
    }
  }
  console.log()

  // 2. Check for audit triggers (skipping - requires custom query)
  console.log('2. Checking for audit triggers...')
  console.log('⚠️  Skipping trigger check (requires database admin access)')
  console.log()

  // 3. Check recent activity
  console.log('3. Checking recent activity (last 7 days)...')
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const { data: recentLogs, count: recentCount } = await supabase
    .from('audit_logs')
    .select('*', { count: 'exact', head: true })
    .gte('changed_at', sevenDaysAgo)

  console.log(`   Found ${recentCount || 0} logs in the last 7 days`)
  console.log()

  // 4. Test creating a manual audit log
  console.log('4. Testing manual audit log creation...')
  const { data: testLog, error: createError } = await supabase
    .from('audit_logs')
    .insert({
      table_name: 'test',
      record_id: 'test-' + Date.now(),
      action: 'insert',
      new_values: { test: 'Test audit log entry' },
      changed_by: null,
    })
    .select()
    .single()

  if (createError) {
    console.error('❌ Error creating test audit log:', createError.message)
  } else {
    console.log('✅ Successfully created test audit log')
    console.log(`   ID: ${testLog.id}`)
  }
  console.log()

  // 5. Check for users who should see audit logs
  console.log('5. Checking admin/city_manager users...')
  const { data: adminUsers, error: userError } = await supabase
    .from('users')
    .select('id, email, full_name, role')
    .in('role', ['admin', 'city_manager'])

  if (userError) {
    console.error('❌ Error fetching admin users:', userError.message)
  } else {
    console.log(`✅ Found ${adminUsers?.length || 0} users with audit log access:`)
    adminUsers?.forEach(user => {
      console.log(`   - ${user.full_name} (${user.email}) - ${user.role}`)
    })
  }
  console.log()

  // 6. Check RLS policies
  console.log('6. Checking RLS policies on audit_logs...')
  const { data: policies, error: policyError } = await supabase
    .rpc('get_audit_policies', {})
    .catch(() => ({ data: null, error: null }))

  if (policies) {
    console.log(`✅ Found RLS policies`)
  } else {
    console.log('⚠️  Could not retrieve policy information (this may be normal)')
  }
  console.log()

  console.log('✅ Audit system check complete!')
}

checkAuditSystem()
  .catch(console.error)
  .finally(() => process.exit(0))
