import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function populateAuditLogs() {
  console.log('🔨 Populating Audit Logs with Realistic Data...\n')

  // Get admin user for attribution
  const { data: adminUser } = await supabase
    .from('users')
    .select('id, email, full_name')
    .eq('role', 'admin')
    .single()

  if (!adminUser) {
    console.error('❌ No admin user found')
    return
  }

  console.log(`Using admin user: ${adminUser.full_name} (${adminUser.email})`)
  console.log()

  const now = new Date()
  const auditEntries = []

  // Create audit logs for various activities over the past 30 days
  for (let day = 0; day < 30; day++) {
    const timestamp = new Date(now.getTime() - (day * 24 * 60 * 60 * 1000))
    const numActivities = Math.floor(Math.random() * 5) + 1 // 1-5 activities per day

    for (let i = 0; i < numActivities; i++) {
      const activityTime = new Date(timestamp.getTime() + (Math.random() * 24 * 60 * 60 * 1000))
      
      // Randomize activity types
      const activities = [
        {
          table_name: 'users',
          action: 'update',
          old_values: { full_name: 'John Doe', email: 'john@example.com' },
          new_values: { full_name: 'John Smith', email: 'john.smith@example.com' },
        },
        {
          table_name: 'strategic_plans',
          action: 'insert',
          new_values: { title: `Strategic Plan ${day}-${i}`, status: 'draft' },
        },
        {
          table_name: 'initiatives',
          action: 'update',
          old_values: { status: 'planning', progress: 25 },
          new_values: { status: 'in_progress', progress: 50 },
        },
        {
          table_name: 'departments',
          action: 'insert',
          new_values: { name: `Department ${day}`, code: `DEPT${day}` },
        },
        {
          table_name: 'municipalities',
          action: 'update',
          old_values: { name: 'Old City Name' },
          new_values: { name: 'Updated City Name' },
        },
      ]

      const activity = activities[Math.floor(Math.random() * activities.length)]
      
      auditEntries.push({
        table_name: activity.table_name,
        record_id: randomUUID(),
        action: activity.action,
        old_values: activity.old_values || null,
        new_values: activity.new_values || null,
        changed_by: adminUser.id,
        changed_at: activityTime.toISOString(),
        ip_address: `192.168.1.${Math.floor(Math.random() * 255)}`,
        user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      })
    }
  }

  console.log(`Creating ${auditEntries.length} audit log entries...`)
  
  // Insert in batches of 50
  const batchSize = 50
  for (let i = 0; i < auditEntries.length; i += batchSize) {
    const batch = auditEntries.slice(i, i + batchSize)
    const { error } = await supabase
      .from('audit_logs')
      .insert(batch)

    if (error) {
      console.error(`❌ Error inserting batch ${i / batchSize + 1}:`, error.message)
    } else {
      console.log(`✅ Inserted batch ${i / batchSize + 1} (${batch.length} entries)`)
    }
  }

  // Verify total count
  const { count } = await supabase
    .from('audit_logs')
    .select('*', { count: 'exact', head: true })

  console.log()
  console.log(`✅ Total audit logs in database: ${count}`)
  console.log()
  console.log('Done! Navigate to /admin/audit-logs to view the logs.')
}

populateAuditLogs()
  .catch(console.error)
  .finally(() => process.exit(0))
