import { createClient } from '@supabase/supabase-js'
import path from 'path'
import fs from 'fs'
import { config as loadEnv } from 'dotenv'

const envLocalPath = path.resolve(process.cwd(), '.env.local')
if (fs.existsSync(envLocalPath)) {
  loadEnv({ path: envLocalPath })
} else {
  // Fall back to default .env if .env.local is missing
  loadEnv()
}

let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
let serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing Supabase credentials. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

// Trim whitespace from keys
serviceRoleKey = serviceRoleKey.trim()

// Normalize URL - add https:// if missing
if (!supabaseUrl.startsWith('http://') && !supabaseUrl.startsWith('https://')) {
  supabaseUrl = `https://${supabaseUrl}`
}

console.log(`🔗 Connecting to: ${supabaseUrl.substring(0, 30)}...`)
console.log(`🔑 Service key length: ${serviceRoleKey.length} chars`)
console.log(`🔑 Service key starts with: ${serviceRoleKey.substring(0, 20)}...`)

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

const accounts = [
  { email: 'admin@carrollton.gov', password: 'password123' },
  { email: 'john.smith@carrollton.gov', password: 'password123' },
  { email: 'sarah.johnson@carrollton.gov', password: 'password123' },
  { email: 'mike.davis@carrollton.gov', password: 'password123' },
  { email: 'emily.wilson@carrollton.gov', password: 'password123' },
  { email: 'robert.garcia@carrollton.gov', password: 'password123' },
  { email: 'linda.martinez@carrollton.gov', password: 'password123' },
  { email: 'david.lee@carrollton.gov', password: 'password123' }
]

async function resetPasswords() {
  console.log('🔐 Resetting Supabase auth passwords to "password123"')

  const { data, error } = await supabase.auth.admin.listUsers()
  if (error) {
    console.error('❌ Failed to list users:', error.message)
    process.exit(1)
  }

  const existingUsers = data.users

  for (const account of accounts) {
    const user = existingUsers.find(u => u.email?.toLowerCase() === account.email.toLowerCase())

    if (!user) {
      console.warn(`⚠️  Skipping ${account.email} (not found)`) 
      continue
    }

    const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
      password: account.password,
    })

    if (updateError) {
      console.error(`❌ Failed to update ${account.email}:`, updateError.message)
    } else {
      console.log(`✅ Updated ${account.email}`)
    }
  }

  console.log('\n🎉 Done! You can now log in with password "password123" for the accounts above.')
}

resetPasswords().catch(err => {
  console.error('❌ Unexpected error while resetting passwords:', err)
  process.exit(1)
})
