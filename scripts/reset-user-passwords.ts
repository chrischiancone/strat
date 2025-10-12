import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables')
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl)
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey)
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

const users = [
  { email: 'admin@carrollton.gov', password: 'password' },
  { email: 'john.smith@carrollton.gov', password: 'password' },
  { email: 'sarah.johnson@carrollton.gov', password: 'password' },
  { email: 'mike.davis@carrollton.gov', password: 'password' },
  { email: 'emily.wilson@carrollton.gov', password: 'password' },
  { email: 'robert.garcia@carrollton.gov', password: 'password' },
  { email: 'linda.martinez@carrollton.gov', password: 'password' },
  { email: 'david.lee@carrollton.gov', password: 'password' },
  { email: 'former@carrollton.gov', password: 'password' },
]

async function resetPasswords() {
  console.log('🔐 Resetting passwords for all users...\n')

  for (const user of users) {
    try {
      // Get user by email
      const { data: authUser, error: getUserError } = await supabase.auth.admin.listUsers()

      if (getUserError) {
        console.error(`❌ Error listing users:`, getUserError.message)
        continue
      }

      const foundUser = authUser.users.find((u) => u.email === user.email)

      if (!foundUser) {
        console.log(`⚠️  User not found: ${user.email}`)
        continue
      }

      // Update the user's password
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        foundUser.id,
        { password: user.password }
      )

      if (updateError) {
        console.error(`❌ Error updating ${user.email}:`, updateError.message)
      } else {
        console.log(`✅ Password reset for ${user.email}`)
      }
    } catch (error) {
      console.error(`❌ Unexpected error for ${user.email}:`, error)
    }
  }

  console.log('\n✅ Password reset complete!')
  console.log('\nYou can now log in with any of these accounts using password: "password"')
}

resetPasswords()
