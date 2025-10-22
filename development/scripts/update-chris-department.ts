/**
 * Update Chris Chiancone's Department Assignment
 *
 * This script updates Chris's user profile to be associated with Workforce Services
 * Run with: npx tsx scripts/update-chris-department.ts
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

async function updateChrisDepartment() {
  console.log('👤 Updating Chris Chiancone\'s department assignment...\n')

  try {
    // Get Chris's user ID
    const { data: authUser } = await supabase.auth.admin.listUsers()
    const chrisAuth = authUser?.users.find(u => u.email === 'chris.chiancone@cityofcarrollton.com')

    if (!chrisAuth) {
      console.error('❌ Chris Chiancone not found in auth users')
      return
    }

    // Get the Workforce Services department ID
    const { data: workforceServices, error: deptError } = await supabase
      .from('departments')
      .select('id, name')
      .eq('slug', 'workforce-services')
      .single()

    if (deptError || !workforceServices) {
      console.error('❌ Workforce Services department not found:', deptError?.message)
      return
    }

    // Update Chris's user profile
    const { error: updateError } = await supabase
      .from('users')
      .update({
        department_id: workforceServices.id,
        role: 'department_director', // Update to department director since he's leading the dept
        title: 'Director of Workforce Services'
      })
      .eq('id', chrisAuth.id)

    if (updateError) {
      console.error('❌ Error updating user profile:', updateError.message)
      return
    }

    console.log('✅ User profile updated successfully!')
    console.log('\n📋 Updated Profile:')
    console.log('===================')
    console.log(`Name: Chris Chiancone`)
    console.log(`Email: chris.chiancone@cityofcarrollton.com`)
    console.log(`Role: department_director`)
    console.log(`Department: ${workforceServices.name}`)
    console.log(`Title: Director of Workforce Services`)
    console.log(`Status: Active`)

    // Verify the update
    const { data: updatedUser, error: verifyError } = await supabase
      .from('users')
      .select(`
        id,
        full_name,
        email,
        role,
        title,
        departments:department_id (
          name
        )
      `)
      .eq('id', chrisAuth.id)
      .single()

    if (verifyError) {
      console.error('❌ Error verifying update:', verifyError.message)
    } else {
      console.log('\n✅ Verification:')
      console.log(`User is now associated with: ${(updatedUser as any).departments?.name}`)
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

updateChrisDepartment().catch(console.error)