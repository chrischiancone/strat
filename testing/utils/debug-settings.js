#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function checkSettings() {
  try {
    const { data, error } = await supabase
      .from('municipalities')
      .select('id, name, settings')
      .eq('name', 'City of Carrollton')
      .single()

    if (error) throw error

    console.log('Municipality:', data.name)
    console.log('ID:', data.id)
    console.log('Current settings:', JSON.stringify(data.settings, null, 2))
    console.log('Appearance settings:', data.settings?.appearance || 'None')
  } catch (err) {
    console.error('Error:', err.message)
  }
}

checkSettings()