import { createClient } from '@supabase/supabase-js'
import path from 'path'
import fs from 'fs'
import { config as loadEnv } from 'dotenv'

const envLocalPath = path.resolve(process.cwd(), '.env.local')
if (fs.existsSync(envLocalPath)) {
  loadEnv({ path: envLocalPath })
} else {
  loadEnv()
}

let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

// Normalize URL
if (!supabaseUrl.startsWith('http://') && !supabaseUrl.startsWith('https://')) {
  supabaseUrl = `https://${supabaseUrl}`
}

async function testConnection() {
  console.log('🔍 Testing Supabase Connection\n')
  console.log(`URL: ${supabaseUrl}`)
  console.log(`Service Key: ${serviceRoleKey.substring(0, 30)}...`)
  console.log(`Anon Key: ${anonKey?.substring(0, 30)}...\n`)

  // Test 1: Try with anon key (should work)
  console.log('Test 1: Testing with anon key...')
  const anonClient = createClient(supabaseUrl, anonKey!, {
    auth: { autoRefreshToken: false, persistSession: false }
  })

  try {
    const { data, error } = await anonClient.from('municipalities').select('id').limit(1)
  if (error) {
    console.log(`  ❌ Anon key test failed: ${error.message}`)
  } else {
    console.log(`  ✅ Anon key works! Found ${data?.length || 0} municipalities`)
  }
} catch (err: any) {
  console.log(`  ❌ Anon key test error: ${err.message}`)
}

// Test 2: Try with service role key (admin operations)
console.log('\nTest 2: Testing with service role key (admin operations)...')
const adminClient = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

try {
  const { data, error } = await adminClient.auth.admin.listUsers()
  if (error) {
    console.log(`  ❌ Service role key test failed: ${error.message}`)
    console.log(`  Error code: ${error.status}`)
    
    // Check if it's a key mismatch issue
    if (error.message.includes('Invalid API key') || error.message.includes('JWT')) {
      console.log('\n  💡 This suggests the service role key might be:')
      console.log('     - From a different Supabase project')
      console.log('     - The anon key instead of service_role key')
      console.log('     - Expired or rotated')
      console.log('\n  🔧 Solution:')
      console.log('     1. Go to: https://supabase.com/dashboard/project/jmdbxoapgedlvdyydicf/settings/api')
      console.log('     2. Find the "service_role" key (NOT "anon" or "public")')
      console.log('     3. Copy it and update .env.local')
    }
  } else {
    console.log(`  ✅ Service role key works! Found ${data.users.length} users`)
  }
} catch (err: any) {
  console.log(`  ❌ Service role key test error: ${err.message}`)
}

// Test 3: Try a simple database query with service role
console.log('\nTest 3: Testing database query with service role key...')
try {
  const { data, error } = await adminClient.from('municipalities').select('id, name').limit(1)
  if (error) {
    console.log(`  ❌ Database query failed: ${error.message}`)
  } else {
    console.log(`  ✅ Database query works! Found: ${data?.[0]?.name || 'N/A'}`)
  }
} catch (err: any) {
  console.log(`  ❌ Database query error: ${err.message}`)
  }

  console.log('\n✅ Connection test complete!')
}

testConnection().catch(err => {
  console.error('❌ Test failed:', err)
  process.exit(1)
})

