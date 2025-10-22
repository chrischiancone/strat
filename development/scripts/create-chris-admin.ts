/**
 * Create Chris Chiancone Admin User
 *
 * This script creates chris.chiancone@cityofcarrollton.com as an admin user
 * Run with: npx tsx scripts/create-chris-admin.ts
 */

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

const newUser = {
  email: 'chris.chiancone@cityofcarrollton.com',
  password: 'password123',
  fullName: 'Chris Chiancone',
  role: 'admin',
  title: 'System Administrator'
}

async function createChrisAdmin() {
  console.log('👤 Creating admin user Chris Chiancone...\n')

  try {
    // Check if user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    const existingUser = existingUsers?.users.find(u => u.email === newUser.email)

    if (existingUser) {
      console.log(`⚠️  User ${newUser.email} already exists`)
      
      // Update password if needed
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        existingUser.id,
        { password: newUser.password }
      )

      if (updateError) {
        console.error(`❌ Error updating password:`, updateError.message)
      } else {
        console.log(`✅ Password updated for ${newUser.email}`)
      }
      return
    }

    // Get the default municipality (assuming it's City of Carrollton)
    const { data: municipalities, error: municipalityError } = await supabase
      .from('municipalities')
      .select('id, name')
      .limit(1)
      .single()

    if (municipalityError || !municipalities) {
      console.error('❌ Error getting municipality:', municipalityError?.message)
      return
    }

    console.log(`📍 Using municipality: ${municipalities.name}`)

    // Create auth user with confirmed email
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: newUser.email,
      email_confirm: true, // Immediately confirm email
      password: newUser.password,
      user_metadata: {
        full_name: newUser.fullName,
      },
    })

    if (authError || !authUser.user) {
      console.error('❌ Error creating auth user:', authError?.message)
      return
    }

    console.log(`✅ Auth user created: ${authUser.user.id}`)

    // Create public user profile
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: authUser.user.id,
        municipality_id: municipalities.id,
        full_name: newUser.fullName,
        email: newUser.email,
        role: newUser.role,
        title: newUser.title,
        department_id: null, // Admin doesn't need a department
        is_active: true,
      })

    if (profileError) {
      console.error('❌ Error creating user profile:', profileError.message)
      // Try to clean up auth user
      await supabase.auth.admin.deleteUser(authUser.user.id)
      return
    }

    console.log(`✅ User profile created`)
    console.log('\n🎉 Admin user created successfully!')
    console.log('\nLogin Credentials:')
    console.log('==================')
    console.log(`Email: ${newUser.email}`)
    console.log(`Password: ${newUser.password}`)
    console.log(`Role: ${newUser.role}`)
    console.log(`Status: Confirmed & Active`)

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

createChrisAdmin().catch(console.error)