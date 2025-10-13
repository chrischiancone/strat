#!/usr/bin/env node

/**
 * Script to create a test user with proper authentication
 * This creates a user in both auth.users and public.users tables
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createTestUser() {
  try {
    // Test user credentials
    const testEmail = 'admin@carrollton.gov'
    const testPassword = 'admin123'
    
    console.log('Creating test user...')
    
    // First, try to delete existing user if it exists
    try {
      const { data: existingUsers } = await supabase.auth.admin.listUsers()
      const existingUser = existingUsers.users.find(u => u.email === testEmail)
      
      if (existingUser) {
        console.log('Deleting existing user...')
        await supabase.auth.admin.deleteUser(existingUser.id)
      }
    } catch (error) {
      console.log('No existing user to delete')
    }
    
    // Create the auth user
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
      user_metadata: {
        full_name: 'System Administrator'
      }
    })
    
    if (authError) {
      throw new Error(`Failed to create auth user: ${authError.message}`)
    }
    
    console.log('Auth user created:', authUser.user.id)
    
    // Get municipality and department IDs
    const { data: municipality } = await supabase
      .from('municipalities')
      .select('id')
      .limit(1)
      .single()
    
    const { data: department } = await supabase
      .from('departments')
      .select('id')
      .eq('slug', 'information-technology')
      .single()
    
    if (!municipality || !department) {
      throw new Error('Municipality or IT department not found')
    }
    
    // Create the public user profile
    const { error: profileError } = await supabase
      .from('users')
      .upsert({
        id: authUser.user.id,
        municipality_id: municipality.id,
        full_name: 'System Administrator',
        email: testEmail,
        role: 'admin',
        title: 'IT Director',
        is_active: true,
        department_id: department.id
      })
    
    if (profileError) {
      throw new Error(`Failed to create user profile: ${profileError.message}`)
    }
    
    console.log('✅ Test user created successfully!')
    console.log(`Email: ${testEmail}`)
    console.log(`Password: ${testPassword}`)
    console.log(`User ID: ${authUser.user.id}`)
    
  } catch (error) {
    console.error('❌ Error creating test user:', error.message)
    process.exit(1)
  }
}

createTestUser()