/**
 * Reset Specific User Password
 *
 * This script resets a specific user's password
 * Run with: npx tsx scripts/reset-specific-user-password.ts <email> <password>
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

async function resetUserPassword(email: string, newPassword: string) {
  console.log(`🔐 Resetting password for ${email}...\\n`)

  try {
    // List all users and find the one with matching email
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()

    if (listError) {
      console.error(`❌ Error listing users:`, listError.message)
      return
    }

    const authUser = users.find(u => u.email === email)

    if (!authUser) {
      console.log(`⚠️  User not found in auth.users: ${email}`)
      console.log(`\\nAttempting to check public.users table...`)

      // Check if user exists in public.users
      const { data: publicUser, error: publicError } = await supabase
        .from('users')
        .select('id, email, full_name')
        .eq('email', email)
        .single()

      if (publicError || !publicUser) {
        console.log(`❌ User not found in public.users either`)
        return
      }

      console.log(`✓ Found user in public.users:`, publicUser)
      console.log(`\\n⚠️  User exists in public.users but not in auth.users`)
      console.log(`This user needs to be created in Supabase Auth first.`)
      return
    }

    console.log(`✓ Found user in auth.users:`)
    console.log(`  ID: ${authUser.id}`)
    console.log(`  Email: ${authUser.email}`)
    console.log(`  Created: ${authUser.created_at}`)

    // Update password
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      authUser.id,
      { password: newPassword }
    )

    if (updateError) {
      console.error(`\\n❌ Error updating password:`, updateError.message)
      return
    }

    console.log(`\\n✅ Password reset successfully!`)
    console.log(`\\nCredentials:`)
    console.log(`====================`)
    console.log(`Email: ${email}`)
    console.log(`Password: ${newPassword}`)

  } catch (error) {
    console.error(`❌ Unexpected error:`, error)
  }
}

// Get command line arguments
const email = process.argv[2] || 'chrischiancone@gmail.com'
const password = process.argv[3] || 'password123'

resetUserPassword(email, password).catch(console.error)
