/**
 * Test Users Query
 *
 * This script tests the users query to see what's being returned
 * Run with: npx tsx scripts/test-users-query.ts
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function testUsersQuery() {
  console.log('🔍 Testing users query...\n')

  try {
    // Test 1: Simple query with service role (bypasses RLS)
    console.log('Test 1: Direct query with service role key')
    const { data: allUsers, error: allError, count } = await supabase
      .from('users')
      .select('id, email, full_name, role, is_active', { count: 'exact' })

    if (allError) {
      console.error('❌ Error:', allError)
    } else {
      console.log(`✓ Found ${count} users`)
      allUsers.forEach(u => {
        console.log(`  - ${u.email} (${u.full_name}) - ${u.role} - Active: ${u.is_active}`)
      })
    }

    // Test 2: Query with department join
    console.log('\n\nTest 2: Query with department join')
    const { data: usersWithDept, error: deptError } = await supabase
      .from('users')
      .select(`
        id,
        full_name,
        email,
        role,
        title,
        is_active,
        department_id,
        departments:department_id (
          name
        ),
        updated_at
      `)

    if (deptError) {
      console.error('❌ Error:', deptError)
    } else {
      console.log(`✓ Found ${usersWithDept.length} users with departments`)
      usersWithDept.slice(0, 3).forEach(u => {
        console.log(`  - ${u.email} - Dept: ${u.departments?.name || 'None'}`)
      })
    }

    // Test 3: Check if admin user exists and get their municipality
    console.log('\n\nTest 3: Check admin user municipality')
    const adminUserId = '00000000-0000-0000-0000-000000000001'
    const { data: adminUser, error: adminError } = await supabase
      .from('users')
      .select('id, email, municipality_id, full_name')
      .eq('id', adminUserId)
      .single()

    if (adminError) {
      console.error('❌ Error:', adminError)
    } else {
      console.log(`✓ Admin user found:`)
      console.log(`  - Email: ${adminUser.email}`)
      console.log(`  - Municipality ID: ${adminUser.municipality_id}`)
    }

    // Test 4: Try to simulate the actual query as if from authenticated user
    console.log('\n\nTest 4: Simulating authenticated user query')
    console.log('(This uses service role, but shows what data would be returned)')

    const { data: paginatedUsers, error: paginatedError, count: totalCount } = await supabase
      .from('users')
      .select(`
        id,
        full_name,
        email,
        role,
        title,
        is_active,
        department_id,
        departments:department_id (
          name
        ),
        updated_at
      `, { count: 'exact' })
      .order('full_name', { ascending: true })
      .range(0, 49)

    if (paginatedError) {
      console.error('❌ Error:', paginatedError)
    } else {
      console.log(`✓ Paginated query returned ${paginatedUsers.length} users (total: ${totalCount})`)
      console.log('First 3 users:')
      paginatedUsers.slice(0, 3).forEach(u => {
        console.log(`  - ${u.full_name} (${u.email})`)
      })
    }

  } catch (error) {
    console.error(`❌ Unexpected error:`, error)
  }
}

testUsersQuery().catch(console.error)
