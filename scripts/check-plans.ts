import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkPlans() {
  console.log('Checking for plans in database...')

  const { data, error } = await supabase
    .from('strategic_plans')
    .select('id, title, created_at')
    .order('created_at', { ascending: false })
    .limit(5)

  if (error) {
    console.error('Error:', error)
    return
  }

  if (!data || data.length === 0) {
    console.log('No plans found in database. The database reset deleted all existing plans.')
    console.log('\nTo test the commenting functionality:')
    console.log('1. Navigate to http://localhost:3000')
    console.log('2. Log in with: admin@carrollton.gov / password')
    console.log('3. Click "My Plans" in the sidebar')
    console.log('4. Click "Create New Plan" button')
    console.log('5. Fill out and submit the form')
    console.log('6. Once created, click to view the plan')
    console.log('7. Scroll to the bottom to see the Comments section')
  } else {
    console.log(`Found ${data.length} plan(s):`)
    data.forEach((plan, index) => {
      console.log(`${index + 1}. ${plan.title} (ID: ${plan.id}, Created: ${plan.created_at})`)
    })
  }
}

checkPlans()
