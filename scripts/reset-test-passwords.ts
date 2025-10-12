/**
 * Reset Test User Passwords
 *
 * This script resets passwords for test users to "password123"
 * Run with: npx tsx scripts/reset-test-passwords.ts
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

const testUsers = [
  { email: 'admin@carrollton.gov', name: 'System Administrator' },
  { email: 'john.smith@carrollton.gov', name: 'John Smith' },
  { email: 'sarah.johnson@carrollton.gov', name: 'Sarah Johnson' },
  { email: 'mike.davis@carrollton.gov', name: 'Mike Davis' },
  { email: 'emily.wilson@carrollton.gov', name: 'Emily Wilson' },
  { email: 'robert.garcia@carrollton.gov', name: 'Robert Garcia' },
  { email: 'linda.martinez@carrollton.gov', name: 'Linda Martinez' },
  { email: 'david.lee@carrollton.gov', name: 'David Lee' },
]

async function resetPasswords() {
  console.log('🔐 Resetting test user passwords...\n')

  for (const user of testUsers) {
    try {
      // Get user by email
      const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()

      if (listError) {
        console.error(`❌ Error listing users:`, listError.message)
        continue
      }

      const authUser = users.find(u => u.email === user.email)

      if (!authUser) {
        console.log(`⚠️  User not found: ${user.email}`)
        continue
      }

      // Update password
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        authUser.id,
        { password: 'password123' }
      )

      if (updateError) {
        console.error(`❌ Error updating ${user.email}:`, updateError.message)
      } else {
        console.log(`✅ Reset password for: ${user.email}`)
      }
    } catch (error) {
      console.error(`❌ Failed to update ${user.email}:`, error)
    }
  }

  console.log('\n🎉 Password reset complete!')
  console.log('\nTest Credentials:')
  console.log('==================')
  testUsers.forEach(user => {
    console.log(`Email: ${user.email}`)
    console.log(`Password: password123`)
    console.log('')
  })
}

resetPasswords().catch(console.error)
