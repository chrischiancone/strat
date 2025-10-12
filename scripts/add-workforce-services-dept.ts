/**
 * Add Workforce Services Department
 *
 * This script adds the "Workforce Services" department to the City of Carrollton
 * Run with: npx tsx scripts/add-workforce-services-dept.ts
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

const newDepartment = {
  name: 'Workforce Services',
  slug: 'workforce-services',
  director_name: 'Chris Chiancone',
  director_email: 'chris.chiancone@cityofcarrollton.com',
  mission_statement: 'To develop and support a skilled workforce through strategic partnerships, training programs, and employment services that drive economic growth and community prosperity.',
  core_services: [
    'Workforce Development Programs',
    'Job Training and Certification',
    'Employment Services',
    'Career Counseling',
    'Skills Assessment',
    'Employer Relations',
    'Grant Administration',
    'Labor Market Analysis'
  ],
  current_staffing: {
    'total_positions': 8,
    'filled_positions': 6,
    'vacant_positions': 2,
    'department_head': 1,
    'program_coordinators': 3,
    'support_staff': 4
  }
}

async function addWorkforceServicesDept() {
  console.log('🏢 Adding Workforce Services department...\n')

  try {
    // Get the City of Carrollton municipality ID
    const { data: municipality, error: municipalityError } = await supabase
      .from('municipalities')
      .select('id, name')
      .eq('slug', 'carrollton')
      .single()

    if (municipalityError || !municipality) {
      console.error('❌ Error getting City of Carrollton:', municipalityError?.message)
      return
    }

    console.log(`📍 Municipality: ${municipality.name}`)

    // Check if department already exists
    const { data: existingDept, error: checkError } = await supabase
      .from('departments')
      .select('id, name')
      .eq('municipality_id', municipality.id)
      .eq('slug', newDepartment.slug)
      .maybeSingle()

    if (checkError) {
      console.error('❌ Error checking existing department:', checkError.message)
      return
    }

    if (existingDept) {
      console.log(`⚠️  Department "${newDepartment.name}" already exists`)
      return
    }

    // Insert the new department
    const { data: insertedDept, error: insertError } = await supabase
      .from('departments')
      .insert({
        municipality_id: municipality.id,
        name: newDepartment.name,
        slug: newDepartment.slug,
        director_name: newDepartment.director_name,
        director_email: newDepartment.director_email,
        mission_statement: newDepartment.mission_statement,
        core_services: newDepartment.core_services,
        current_staffing: newDepartment.current_staffing,
        is_active: true
      })
      .select()
      .single()

    if (insertError) {
      console.error('❌ Error creating department:', insertError.message)
      return
    }

    console.log(`✅ Department created successfully!`)
    console.log('\n📋 Department Details:')
    console.log('======================')
    console.log(`Name: ${newDepartment.name}`)
    console.log(`Slug: ${newDepartment.slug}`)
    console.log(`Director: ${newDepartment.director_name}`)
    console.log(`Email: ${newDepartment.director_email}`)
    console.log(`Status: Active`)
    console.log(`\nMission Statement:`)
    console.log(`${newDepartment.mission_statement}`)
    console.log(`\nCore Services:`)
    newDepartment.core_services.forEach((service, index) => {
      console.log(`${index + 1}. ${service}`)
    })

    // List all departments now
    console.log('\n📊 All Departments:')
    console.log('===================')
    const { data: allDepartments, error: listError } = await supabase
      .from('departments')
      .select('name, director_name, is_active')
      .eq('municipality_id', municipality.id)
      .eq('is_active', true)
      .order('name')

    if (listError) {
      console.error('❌ Error listing departments:', listError.message)
    } else {
      allDepartments?.forEach((dept, index) => {
        console.log(`${index + 1}. ${dept.name} (Director: ${dept.director_name || 'TBD'})`)
      })
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

addWorkforceServicesDept().catch(console.error)