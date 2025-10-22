#!/usr/bin/env ts-node

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function clearSwotStrengths() {
  console.log('🔍 Looking for strategic plans with SWOT analysis...')

  // Get all strategic plans with SWOT data
  const { data: plans, error } = await supabase
    .from('strategic_plans')
    .select('id, title, swot_analysis')
    .not('swot_analysis', 'is', null)

  if (error) {
    console.error('❌ Error fetching strategic plans:', error)
    return
  }

  if (!plans || plans.length === 0) {
    console.log('ℹ️  No strategic plans with SWOT analysis found')
    return
  }

  console.log(`📋 Found ${plans.length} strategic plan(s) with SWOT data:`)
  
  let totalStrengthsCleared = 0

  for (const plan of plans) {
    const swotData = plan.swot_analysis as any
    const currentStrengths = swotData?.strengths || []
    
    console.log(`\n📄 Plan: "${plan.title}" (ID: ${plan.id})`)
    console.log(`   Current strengths: ${currentStrengths.length}`)
    
    if (currentStrengths.length > 0) {
      // Clear strengths while preserving other SWOT data
      const updatedSwot = {
        ...swotData,
        strengths: []
      }

      const { error: updateError } = await supabase
        .from('strategic_plans')
        .update({ swot_analysis: updatedSwot })
        .eq('id', plan.id)

      if (updateError) {
        console.error(`   ❌ Error clearing strengths: ${updateError.message}`)
      } else {
        console.log(`   ✅ Cleared ${currentStrengths.length} strength(s)`)
        totalStrengthsCleared += currentStrengths.length
      }
    } else {
      console.log('   ℹ️  No strengths to clear')
    }
  }

  console.log(`\n🎉 Successfully cleared ${totalStrengthsCleared} total strength(s) from ${plans.length} plan(s)`)
}

// Run the script
clearSwotStrengths().catch(console.error)