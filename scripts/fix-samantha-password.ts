/**
 * Fix password for samantha.dean@cityofcarrollton.com
 * 
 * The seed data uses a placeholder password hash that doesn't work.
 * This script properly sets the password using Supabase Admin API.
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables!')
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function fixPassword() {
  const email = 'samantha.dean@cityofcarrollton.com'
  const newPassword = 'password123'
  const userId = '56fc7071-1040-43a7-aeb5-79ad81012b00'
  
  console.log(`\nFixing password for ${email}...`)
  
  try {
    // Check if user exists in auth.users
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId)
    
    if (authError) {
      console.error('Error fetching auth user:', authError)
      
      // User might not exist, try to create them
      console.log('User not found in auth, creating...')
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email,
        password: newPassword,
        email_confirm: true,
        user_metadata: {
          full_name: 'Samantha Dean'
        }
      })
      
      if (createError) {
        console.error('Error creating user:', createError)
        return
      }
      
      console.log('✅ User created successfully!')
      console.log(`   Email: ${email}`)
      console.log(`   Password: ${newPassword}`)
      console.log(`   User ID: ${newUser.user?.id}`)
      
      // Check if public user profile exists with correct ID
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single()
      
      if (profile && profile.id !== newUser.user?.id) {
        console.log(`\n⚠️  WARNING: Public user profile has different ID!`)
        console.log(`   Profile ID: ${profile.id}`)
        console.log(`   Auth ID: ${newUser.user?.id}`)
        console.log(`   You may need to update the profile ID to match the auth ID`)
      }
      
      return
    }
    
    console.log('User found, updating password...')
    
    // Update password
    const { data, error: updateError } = await supabase.auth.admin.updateUserById(
      userId,
      { 
        password: newPassword,
        email_confirm: true
      }
    )
    
    if (updateError) {
      console.error('Error updating password:', updateError)
      return
    }
    
    console.log('✅ Password updated successfully!')
    console.log(`   Email: ${email}`)
    console.log(`   Password: ${newPassword}`)
    console.log(`   User ID: ${userId}`)
    
    // Verify public profile exists
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('id, email, full_name, role, title, department_id, is_active')
      .eq('id', userId)
      .single()
    
    if (profileError) {
      console.error('\n⚠️  WARNING: Public user profile not found!')
      console.error('   Error:', profileError)
      console.log('\n   You may need to create the profile manually or run the seed migration again.')
    } else {
      console.log('\n✅ Public profile verified:')
      console.log(`   Name: ${profile.full_name}`)
      console.log(`   Role: ${profile.role}`)
      console.log(`   Title: ${profile.title}`)
      console.log(`   Active: ${profile.is_active}`)
    }
    
    console.log('\n✨ You can now login with:')
    console.log(`   Email: ${email}`)
    console.log(`   Password: ${newPassword}`)
    
  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

fixPassword()
  .then(() => {
    console.log('\nDone!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Script failed:', error)
    process.exit(1)
  })
