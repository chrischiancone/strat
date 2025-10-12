/**
 * List All Users in Supabase Auth
 *
 * This script lists all users in auth.users and their corresponding public.users records
 * Run with: npx tsx scripts/list-all-users.ts
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

async function listAllUsers() {
  console.log('📋 Listing all users in Supabase Auth...\n')

  try {
    // List all users from auth
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()

    if (listError) {
      console.error(`❌ Error listing users:`, listError.message)
      return
    }

    console.log(`Found ${users.length} users in auth.users:\n`)
    console.log('='.repeat(80))

    for (const user of users) {
      console.log(`\nEmail: ${user.email}`)
      console.log(`ID: ${user.id}`)
      console.log(`Created: ${user.created_at}`)
      console.log(`Email Confirmed: ${user.email_confirmed_at ? 'Yes' : 'No'}`)

      // Check if user exists in public.users
      const { data: publicUser, error: publicError } = await supabase
        .from('users')
        .select('id, email, full_name, role, department_id, is_active')
        .eq('id', user.id)
        .single()

      if (publicError) {
        console.log(`Public Profile: ❌ NOT FOUND in public.users`)
      } else if (publicUser) {
        console.log(`Public Profile: ✓ Found`)
        console.log(`  - Name: ${publicUser.full_name}`)
        console.log(`  - Role: ${publicUser.role}`)
        console.log(`  - Active: ${publicUser.is_active}`)
      }

      console.log('-'.repeat(80))
    }

    console.log(`\n✅ Listed ${users.length} users`)

    // Also check for orphaned public.users (users in public.users but not in auth.users)
    console.log('\n\n📋 Checking for orphaned public.users records...\n')
    const { data: allPublicUsers, error: allPublicError } = await supabase
      .from('users')
      .select('id, email, full_name')

    if (allPublicError) {
      console.error(`❌ Error fetching public users:`, allPublicError.message)
      return
    }

    const authUserIds = new Set(users.map(u => u.id))
    const orphanedUsers = allPublicUsers.filter(pu => !authUserIds.has(pu.id))

    if (orphanedUsers.length > 0) {
      console.log(`⚠️  Found ${orphanedUsers.length} orphaned users in public.users:`)
      orphanedUsers.forEach(u => {
        console.log(`  - ${u.email} (${u.full_name})`)
      })
    } else {
      console.log(`✓ No orphaned users found`)
    }

  } catch (error) {
    console.error(`❌ Unexpected error:`, error)
  }
}

listAllUsers().catch(console.error)
