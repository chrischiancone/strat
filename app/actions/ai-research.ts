'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'
import { callPerplexityApi } from '@/lib/perplexity/config'

interface ResearchResponse {
  content: string[]
  citations?: string[]
}

// Helper function to process citations and convert reference numbers to markdown links
function processContentWithCitations(bullets: string[], citations: string[]): string[] {
  if (!citations || citations.length === 0) {
    return bullets
  }

  // Process each bullet point to replace reference numbers with markdown links
  const processedBullets = bullets.map(bullet => {
    // Find patterns like [1], [2], etc. and replace with markdown links
    return bullet.replace(/\[(\d+)\]/g, (match, num) => {
      const index = parseInt(num) - 1
      if (index >= 0 && index < citations.length) {
        return `[${match}](${citations[index]})`
      }
      return match
    })
  })

  // Return bullets with inline citation links only - no separate references section
  return processedBullets
}

export async function researchDemographics(department_or_plan_id: string): Promise<ResearchResponse> {
  // Get current user
  const supabase = createServerSupabaseClient()
  const adminSupabase = createAdminSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  console.log('AI Research (Demographics): Starting department lookup for ID:', department_or_plan_id)

  let department: { id: string; name: string; municipality_id: string } | null = null
  let municipality: { name: string; state: string } | null = null

  // Get current user's profile using admin client
  const { data: userProfile } = await adminSupabase
    .from('users')
    .select('department_id, municipality_id')
    .eq('id', user.id)
    .single<{ department_id: string | null; municipality_id: string }>()

  if (!userProfile) {
    throw new Error('User profile not found')
  }

  console.log('AI Research (Demographics): User profile:', userProfile)

  // Strategy 1: Try as department ID first
  if (department_or_plan_id) {
    try {
      const { data: dep } = await adminSupabase
        .from('departments')
        .select('id, name, municipality_id')
        .eq('id', department_or_plan_id)
        .single<{ id: string; name: string; municipality_id: string }>()
      
      if (dep) {
        console.log('AI Research (Demographics): Found department by ID:', dep)
        department = dep
      }
    } catch {
      console.log('AI Research (Demographics): Not a department ID, continuing...')
    }
  }

  // Strategy 2: If not found, try as plan ID
  if (!department && department_or_plan_id) {
    try {
      const { data: plan } = await adminSupabase
        .from('strategic_plans')
        .select('department_id')
        .eq('id', department_or_plan_id)
        .single<{ department_id: string }>()
      
      if (plan?.department_id) {
        const { data: dep2 } = await adminSupabase
          .from('departments')
          .select('id, name, municipality_id')
          .eq('id', plan.department_id)
          .single<{ id: string; name: string; municipality_id: string }>()
        
        if (dep2) {
          console.log('AI Research (Demographics): Found department by plan ID:', dep2)
          department = dep2
        }
      }
    } catch {
      console.log('AI Research (Demographics): Not a plan ID, continuing...')
    }
  }

  // Strategy 3: Fall back to current user's department
  if (!department && userProfile.department_id) {
    try {
      const { data: dep3 } = await adminSupabase
        .from('departments')
        .select('id, name, municipality_id')
        .eq('id', userProfile.department_id)
        .single<{ id: string; name: string; municipality_id: string }>()
      
      if (dep3) {
        console.log('AI Research (Demographics): Found user department:', dep3)
        department = dep3
      }
    } catch {
      console.log('AI Research (Demographics): User has no department, continuing...')
    }
  }

  // Strategy 4: Get any department from user's municipality
  if (!department) {
    try {
      const { data: anyDep } = await adminSupabase
        .from('departments')
        .select('id, name, municipality_id')
        .eq('municipality_id', userProfile.municipality_id)
        .limit(1)
        .single<{ id: string; name: string; municipality_id: string }>()
      
      if (anyDep) {
        console.log('AI Research (Demographics): Found any department in municipality:', anyDep)
        department = anyDep
      }
    } catch {
      console.log('AI Research (Demographics): No departments in municipality')
    }
  }

  if (!department) {
    console.error('AI Research: No department found after all strategies')
    throw new Error('No department found for research context. Please ensure you have proper department access.')
  }

  // Get municipality information
  const { data: municipalityData } = await adminSupabase
    .from('municipalities')
    .select('name, state')
    .eq('id', department.municipality_id)
    .single<{ name: string; state: string }>()

  municipality = municipalityData
  const municipalityName = municipality?.name || 'your city'
  const municipalityState = municipality?.state || ''
  
  console.log('AI Research (Demographics): Municipality found:', municipality)

  // Build updated prompt for current year forward research - dynamically department-specific
  const currentYear = new Date().getFullYear()
  const query = `You are a demographic analyst helping the ${department.name} department in ${municipalityName}${municipalityState ? ', ' + municipalityState : ''} with department-focused demographic research.

Provide specific demographic insights from ${currentYear - 2} to ${currentYear + 3} that directly impact ${department.name} operations:
- Population changes (size, growth rate, notable shifts with specific numbers/percentages)
- Age distribution trends relevant to ${department.name} services (median age, generational shifts with data)
- Racial/ethnic diversity trends affecting ${department.name} service delivery (specific demographic percentages and changes)
- Migration patterns impacting ${department.name} client base (domestic/international movement with numbers)
- Income and education demographics affecting ${department.name} programs (median household income, education levels)
- Housing and household trends relevant to ${department.name} service area
- Language barriers and multilingual service needs for ${department.name} clients
- Demographic trends that create opportunities or challenges for ${department.name}

Context: Strategic planning for ${department.name} department in ${municipalityName}${municipalityState ? ', ' + municipalityState : ''}.
Be specific and include actual data, statistics, and projections that would impact ${department.name} service planning.
Return only bullet points (no preface), 8-12 bullets, each focused on how demographics affect ${department.name} operations.`

  // Call Perplexity API
  console.log('AI Research (Demographics): Calling Perplexity API...')
  const response = await callPerplexityApi([
    { role: 'system', content: 'You are a demographic research analyst providing department-focused data and projections for municipal strategic planning.' },
    { role: 'user', content: query }
  ])

  // Parse bullets from response
  const lines = response.content
    .split('\n')
    .map((l: string) => l.trim())
    .filter(Boolean)

  const bullets: string[] = []
  for (const line of lines) {
    const cleaned = line.replace(/^[-•\d\.\)\s]+/, '').trim()
    if (cleaned.length > 0) bullets.push(cleaned)
  }

  // Process citations and convert to markdown links
  const processedContent = processContentWithCitations(bullets, response.citations || [])
  
  return { 
    content: processedContent,
    citations: response.citations || []
  }
}

export async function researchEconomicFactors(department_or_plan_id: string): Promise<ResearchResponse> {
  // Get current user
  const supabase = createServerSupabaseClient()
  const adminSupabase = createAdminSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  console.log('AI Research (Economic): Starting department lookup for ID:', department_or_plan_id)

  let department: { id: string; name: string; municipality_id: string } | null = null
  let municipality: { name: string; state: string } | null = null

  // Get current user's profile using admin client
  const { data: userProfile } = await adminSupabase
    .from('users')
    .select('department_id, municipality_id')
    .eq('id', user.id)
    .single<{ department_id: string | null; municipality_id: string }>()

  if (!userProfile) {
    throw new Error('User profile not found')
  }

  console.log('AI Research (Economic): User profile:', userProfile)

  // Strategy 1: Try as department ID first
  if (department_or_plan_id) {
    try {
      const { data: dep } = await adminSupabase
        .from('departments')
        .select('id, name, municipality_id')
        .eq('id', department_or_plan_id)
        .single<{ id: string; name: string; municipality_id: string }>()
      
      if (dep) {
        console.log('AI Research (Economic): Found department by ID:', dep)
        department = dep
      }
    } catch {
      console.log('AI Research (Economic): Not a department ID, continuing...')
    }
  }

  // Strategy 2: If not found, try as plan ID
  if (!department && department_or_plan_id) {
    try {
      const { data: plan } = await adminSupabase
        .from('strategic_plans')
        .select('department_id')
        .eq('id', department_or_plan_id)
        .single<{ department_id: string }>()
      
      if (plan?.department_id) {
        const { data: dep2 } = await adminSupabase
          .from('departments')
          .select('id, name, municipality_id')
          .eq('id', plan.department_id)
          .single<{ id: string; name: string; municipality_id: string }>()
        
        if (dep2) {
          console.log('AI Research (Economic): Found department by plan ID:', dep2)
          department = dep2
        }
      }
    } catch {
      console.log('AI Research (Economic): Not a plan ID, continuing...')
    }
  }

  // Strategy 3: Fall back to current user's department
  if (!department && userProfile.department_id) {
    try {
      const { data: dep3 } = await adminSupabase
        .from('departments')
        .select('id, name, municipality_id')
        .eq('id', userProfile.department_id)
        .single<{ id: string; name: string; municipality_id: string }>()
      
      if (dep3) {
        console.log('AI Research (Economic): Found user department:', dep3)
        department = dep3
      }
    } catch {
      console.log('AI Research (Economic): User has no department, continuing...')
    }
  }

  // Strategy 4: Get any department from user's municipality
  if (!department) {
    try {
      const { data: anyDep } = await adminSupabase
        .from('departments')
        .select('id, name, municipality_id')
        .eq('municipality_id', userProfile.municipality_id)
        .limit(1)
        .single<{ id: string; name: string; municipality_id: string }>()
      
      if (anyDep) {
        console.log('AI Research (Economic): Found any department in municipality:', anyDep)
        department = anyDep
      }
    } catch {
      console.log('AI Research (Economic): No departments in municipality')
    }
  }

  if (!department) {
    console.error('AI Research (Economic): No department found after all strategies')
    throw new Error('No department found for research context. Please ensure you have proper department access.')
  }

  // Get municipality information
  const { data: municipalityData } = await adminSupabase
    .from('municipalities')
    .select('name, state')
    .eq('id', department.municipality_id)
    .single<{ name: string; state: string }>()

  municipality = municipalityData
  const municipalityName = municipality?.name || 'your city'
  const municipalityState = municipality?.state || ''
  
  console.log('AI Research (Economic): Municipality found:', municipality)

  // Build prompt specific to economic factors with current year focus - dynamically department-specific
  const currentYear = new Date().getFullYear()
  const query = `You are an economic analyst helping the ${department.name} department in ${municipalityName}${municipalityState ? ', ' + municipalityState : ''} with department-focused economic research.

Provide specific economic insights from ${currentYear - 2} to ${currentYear + 3} that directly impact ${department.name} operations:
- Employment trends affecting ${department.name} (unemployment rates, job growth, industry shifts with specific numbers)
- Business development impacting ${department.name} services (new businesses, closures, economic growth with data)
- Tax base and revenue trends affecting ${department.name} budget (property tax, sales tax, revenue changes with percentages)
- Property values and real estate trends impacting ${department.name} service area (median prices, growth rates)
- Economic development initiatives affecting ${department.name} operations (major projects with investment amounts)
- Economic challenges and opportunities specific to ${department.name} service delivery
- Funding trends and economic factors affecting ${department.name} budget and resources
- Economic demographics of ${department.name} client base or service population

Context: Strategic planning for ${department.name} department in ${municipalityName}${municipalityState ? ', ' + municipalityState : ''}.
Be specific and include actual data, statistics, dollar amounts, and projections that would impact ${department.name} operations and service delivery.
Return only bullet points (no preface), 8-12 bullets, each focused on how economic factors affect ${department.name}.`

  // Call Perplexity
  const response = await callPerplexityApi([
    { role: 'system', content: 'You are an economic research analyst providing department-focused economic data and projections for municipal strategic planning.' },
    { role: 'user', content: query }
  ])

  // Parse bullets from response
  const lines = response.content
    .split('\n')
    .map((l: string) => l.trim())
    .filter(Boolean)

  const bullets: string[] = []
  for (const line of lines) {
    const cleaned = line.replace(/^[-•\d\.\)\s]+/, '').trim()
    if (cleaned.length > 0) bullets.push(cleaned)
  }

  // Process citations and convert to markdown links
  const processedContent = processContentWithCitations(bullets, response.citations || [])
  
  return { 
    content: processedContent,
    citations: response.citations || []
  }
}

export async function researchRegulatoryChanges(department_or_plan_id: string): Promise<ResearchResponse> {
  // Get current user
  const supabase = createServerSupabaseClient()
  const adminSupabase = createAdminSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  console.log('AI Research (Regulatory): Starting department lookup for ID:', department_or_plan_id)

  let department: { id: string; name: string; municipality_id: string } | null = null
  let municipality: { name: string; state: string } | null = null

  // Get current user's profile using admin client
  const { data: userProfile } = await adminSupabase
    .from('users')
    .select('department_id, municipality_id')
    .eq('id', user.id)
    .single<{ department_id: string | null; municipality_id: string }>()

  if (!userProfile) {
    throw new Error('User profile not found')
  }

  console.log('AI Research (Regulatory): User profile:', userProfile)

  // Strategy 1: Try as department ID first
  if (department_or_plan_id) {
    try {
      const { data: dep } = await adminSupabase
        .from('departments')
        .select('id, name, municipality_id')
        .eq('id', department_or_plan_id)
        .single<{ id: string; name: string; municipality_id: string }>()
      
      if (dep) {
        console.log('AI Research (Regulatory): Found department by ID:', dep)
        department = dep
      }
    } catch {
      console.log('AI Research (Regulatory): Not a department ID, continuing...')
    }
  }

  // Strategy 2: If not found, try as plan ID
  if (!department && department_or_plan_id) {
    try {
      const { data: plan } = await adminSupabase
        .from('strategic_plans')
        .select('department_id')
        .eq('id', department_or_plan_id)
        .single<{ department_id: string }>()
      
      if (plan?.department_id) {
        const { data: dep2 } = await adminSupabase
          .from('departments')
          .select('id, name, municipality_id')
          .eq('id', plan.department_id)
          .single<{ id: string; name: string; municipality_id: string }>()
        
        if (dep2) {
          console.log('AI Research (Regulatory): Found department by plan ID:', dep2)
          department = dep2
        }
      }
    } catch {
      console.log('AI Research (Regulatory): Not a plan ID, continuing...')
    }
  }

  // Strategy 3: Fall back to current user's department
  if (!department && userProfile.department_id) {
    try {
      const { data: dep3 } = await adminSupabase
        .from('departments')
        .select('id, name, municipality_id')
        .eq('id', userProfile.department_id)
        .single<{ id: string; name: string; municipality_id: string }>()
      
      if (dep3) {
        console.log('AI Research (Regulatory): Found user department:', dep3)
        department = dep3
      }
    } catch {
      console.log('AI Research (Regulatory): User has no department, continuing...')
    }
  }

  // Strategy 4: Get any department from user's municipality
  if (!department) {
    try {
      const { data: anyDep } = await adminSupabase
        .from('departments')
        .select('id, name, municipality_id')
        .eq('municipality_id', userProfile.municipality_id)
        .limit(1)
        .single<{ id: string; name: string; municipality_id: string }>()
      
      if (anyDep) {
        console.log('AI Research (Regulatory): Found any department in municipality:', anyDep)
        department = anyDep
      }
    } catch {
      console.log('AI Research (Regulatory): No departments in municipality')
    }
  }

  if (!department) {
    console.error('AI Research (Regulatory): No department found after all strategies')
    throw new Error('No department found for research context. Please ensure you have proper department access.')
  }

  // Get municipality information
  const { data: municipalityData } = await adminSupabase
    .from('municipalities')
    .select('name, state')
    .eq('id', department.municipality_id)
    .single<{ name: string; state: string }>()

  municipality = municipalityData
  const municipalityName = municipality?.name || 'your city'
  const municipalityState = municipality?.state || ''
  
  console.log('AI Research (Regulatory): Municipality found:', municipality)

  // Build prompt specific to regulatory/legislative changes with current year focus - dynamically department-specific
  const currentYear = new Date().getFullYear()
  const query = `You are a regulatory analyst helping the ${department.name} department in ${municipalityName}${municipalityState ? ', ' + municipalityState : ''} track legislative changes affecting department operations.

Provide specific regulatory insights from ${currentYear} to ${currentYear + 2} that directly impact ${department.name}:
- New federal laws affecting ${department.name} operations and service delivery (with effective dates)
- Texas state legislation impacting ${department.name} programs and services (with bill numbers where available)
- Local ordinance changes affecting ${department.name} operations (with deadlines)
- Grant opportunities relevant to ${department.name} from new legislation (with application deadlines and amounts)
- Regulatory compliance deadlines and mandates affecting ${department.name} (with specific dates)
- Policy changes impacting ${department.name} service delivery and operations (with implementation timelines)
- ADA and accessibility compliance requirements for ${department.name} facilities and programs
- Data privacy and reporting requirements affecting ${department.name}
- Budget and funding implications from regulatory changes for ${department.name}

Context: Strategic planning for ${department.name} department in ${municipalityName}${municipalityState ? ', ' + municipalityState : ''}.
Be specific and include actual dates, deadlines, bill numbers, funding amounts, and compliance requirements that affect ${department.name}.
Return only bullet points (no preface), 8-12 bullets, each focused on regulatory impacts to ${department.name}.`

  // Call Perplexity
  const response = await callPerplexityApi([
    { role: 'system', content: 'You are a regulatory research analyst providing department-focused compliance and legislative information for municipal strategic planning.' },
    { role: 'user', content: query }
  ])

  // Parse bullets from response
  const lines = response.content
    .split('\n')
    .map((l: string) => l.trim())
    .filter(Boolean)

  const bullets: string[] = []
  for (const line of lines) {
    const cleaned = line.replace(/^[-•\d\.\)\s]+/, '').trim()
    if (cleaned.length > 0) bullets.push(cleaned)
  }

  // Process citations and convert to markdown links
  const processedContent = processContentWithCitations(bullets, response.citations || [])
  
  return { 
    content: processedContent,
    citations: response.citations || []
  }
}

export async function researchTechnologyTrends(department_or_plan_id: string): Promise<ResearchResponse> {
  // Get current user
  const supabase = createServerSupabaseClient()
  const adminSupabase = createAdminSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  console.log('AI Research (Technology): Starting department lookup for ID:', department_or_plan_id)

  let department: { id: string; name: string; municipality_id: string } | null = null
  let municipality: { name: string; state: string } | null = null

  // Get current user's profile using admin client
  const { data: userProfile } = await adminSupabase
    .from('users')
    .select('department_id, municipality_id')
    .eq('id', user.id)
    .single<{ department_id: string | null; municipality_id: string }>()

  if (!userProfile) {
    throw new Error('User profile not found')
  }

  console.log('AI Research (Technology): User profile:', userProfile)

  // Strategy 1: Try as department ID first
  if (department_or_plan_id) {
    try {
      const { data: dep } = await adminSupabase
        .from('departments')
        .select('id, name, municipality_id')
        .eq('id', department_or_plan_id)
        .single<{ id: string; name: string; municipality_id: string }>()
      
      if (dep) {
        console.log('AI Research (Technology): Found department by ID:', dep)
        department = dep
      }
    } catch {
      console.log('AI Research (Technology): Not a department ID, continuing...')
    }
  }

  // Strategy 2: If not found, try as plan ID
  if (!department && department_or_plan_id) {
    try {
      const { data: plan } = await adminSupabase
        .from('strategic_plans')
        .select('department_id')
        .eq('id', department_or_plan_id)
        .single<{ department_id: string }>()
      
      if (plan?.department_id) {
        const { data: dep2 } = await adminSupabase
          .from('departments')
          .select('id, name, municipality_id')
          .eq('id', plan.department_id)
          .single<{ id: string; name: string; municipality_id: string }>()
        
        if (dep2) {
          console.log('AI Research (Technology): Found department by plan ID:', dep2)
          department = dep2
        }
      }
    } catch {
      console.log('AI Research (Technology): Not a plan ID, continuing...')
    }
  }

  // Strategy 3: Fall back to current user's department
  if (!department && userProfile.department_id) {
    try {
      const { data: dep3 } = await adminSupabase
        .from('departments')
        .select('id, name, municipality_id')
        .eq('id', userProfile.department_id)
        .single<{ id: string; name: string; municipality_id: string }>()
      
      if (dep3) {
        console.log('AI Research (Technology): Found user department:', dep3)
        department = dep3
      }
    } catch {
      console.log('AI Research (Technology): User has no department, continuing...')
    }
  }

  // Strategy 4: Get any department from user's municipality
  if (!department) {
    try {
      const { data: anyDep } = await adminSupabase
        .from('departments')
        .select('id, name, municipality_id')
        .eq('municipality_id', userProfile.municipality_id)
        .limit(1)
        .single<{ id: string; name: string; municipality_id: string }>()
      
      if (anyDep) {
        console.log('AI Research (Technology): Found any department in municipality:', anyDep)
        department = anyDep
      }
    } catch {
      console.log('AI Research (Technology): No departments in municipality')
    }
  }

  if (!department) {
    console.error('AI Research (Technology): No department found after all strategies')
    throw new Error('No department found for research context. Please ensure you have proper department access.')
  }

  // Get municipality information
  const { data: municipalityData } = await adminSupabase
    .from('municipalities')
    .select('name, state')
    .eq('id', department.municipality_id)
    .single<{ name: string; state: string }>()

  municipality = municipalityData
  const municipalityName = municipality?.name || 'your city'
  const municipalityState = municipality?.state || ''
  
  console.log('AI Research (Technology): Municipality found:', municipality)

  // Build prompt specific to technology trends with current year focus - dynamically department-specific
  const currentYear = new Date().getFullYear()
  const query = `You are a technology analyst helping the ${department.name} department in ${municipalityName}${municipalityState ? ', ' + municipalityState : ''} with department-focused technology research.

Provide specific technology insights from ${currentYear} to ${currentYear + 3} that directly impact ${department.name} operations:
- Emerging tech relevant to ${department.name} operations (AI, machine learning, IoT applications with adoption rates)
- Digital transformation initiatives for ${department.name} (process automation, digital services, online platforms with costs)
- Cybersecurity trends affecting ${department.name} (data protection, compliance standards, security requirements)
- Automation technologies for ${department.name} operations (workflow automation, service delivery systems with ROI data)
- IT infrastructure needs for ${department.name} (network upgrades, software systems, hardware requirements with investment amounts)
- Technology challenges specific to ${department.name} service delivery
- Digital accessibility and inclusion requirements for ${department.name} programs
- Technology integration opportunities for ${department.name} with other city systems
- Mobile and citizen engagement technology relevant to ${department.name} services

Context: Strategic planning for ${department.name} department in ${municipalityName}${municipalityState ? ', ' + municipalityState : ''}.
Be specific and include data on costs, implementation timelines, adoption rates, and technology impacts on ${department.name} operations.
Return only bullet points (no preface), 8-12 bullets, each focused on technology impacts to ${department.name}.`

  // Call Perplexity
  console.log('AI Research (Technology): Calling Perplexity API...')
  const response = await callPerplexityApi([
    { role: 'system', content: 'You are a technology research analyst providing department-focused technology trends and projections for municipal strategic planning.' },
    { role: 'user', content: query }
  ])

  // Parse bullets from response
  const lines = response.content
    .split('\n')
    .map((l: string) => l.trim())
    .filter(Boolean)

  const bullets: string[] = []
  for (const line of lines) {
    const cleaned = line.replace(/^[-•\d\.\)\s]+/, '').trim()
    if (cleaned.length > 0) bullets.push(cleaned)
  }

  // Process citations and convert to markdown links
  const processedContent = processContentWithCitations(bullets, response.citations || [])
  
  return { 
    content: processedContent,
    citations: response.citations || []
  }
}

export async function researchCommunityExpectations(department_or_plan_id: string): Promise<ResearchResponse> {
  // Get current user
  const supabase = createServerSupabaseClient()
  const adminSupabase = createAdminSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  console.log('AI Research (Community): Starting department lookup for ID:', department_or_plan_id)

  let department: { id: string; name: string; municipality_id: string } | null = null
  let municipality: { name: string; state: string } | null = null

  // Get current user's profile using admin client
  const { data: userProfile } = await adminSupabase
    .from('users')
    .select('department_id, municipality_id')
    .eq('id', user.id)
    .single<{ department_id: string | null; municipality_id: string }>()

  if (!userProfile) {
    throw new Error('User profile not found')
  }

  console.log('AI Research (Community): User profile:', userProfile)

  // Strategy 1: Try as department ID first
  if (department_or_plan_id) {
    try {
      const { data: dep } = await adminSupabase
        .from('departments')
        .select('id, name, municipality_id')
        .eq('id', department_or_plan_id)
        .single<{ id: string; name: string; municipality_id: string }>()
      
      if (dep) {
        console.log('AI Research (Community): Found department by ID:', dep)
        department = dep
      }
    } catch {
      console.log('AI Research (Community): Not a department ID, continuing...')
    }
  }

  // Strategy 2: If not found, try as plan ID
  if (!department && department_or_plan_id) {
    try {
      const { data: plan } = await adminSupabase
        .from('strategic_plans')
        .select('department_id')
        .eq('id', department_or_plan_id)
        .single<{ department_id: string }>()
      
      if (plan?.department_id) {
        const { data: dep2 } = await adminSupabase
          .from('departments')
          .select('id, name, municipality_id')
          .eq('id', plan.department_id)
          .single<{ id: string; name: string; municipality_id: string }>()
        
        if (dep2) {
          console.log('AI Research (Community): Found department by plan ID:', dep2)
          department = dep2
        }
      }
    } catch {
      console.log('AI Research (Community): Not a plan ID, continuing...')
    }
  }

  // Strategy 3: Fall back to current user's department
  if (!department && userProfile.department_id) {
    try {
      const { data: dep3 } = await adminSupabase
        .from('departments')
        .select('id, name, municipality_id')
        .eq('id', userProfile.department_id)
        .single<{ id: string; name: string; municipality_id: string }>()
      
      if (dep3) {
        console.log('AI Research (Community): Found user department:', dep3)
        department = dep3
      }
    } catch {
      console.log('AI Research (Community): User has no department, continuing...')
    }
  }

  // Strategy 4: Get any department from user's municipality
  if (!department) {
    try {
      const { data: anyDep } = await adminSupabase
        .from('departments')
        .select('id, name, municipality_id')
        .eq('municipality_id', userProfile.municipality_id)
        .limit(1)
        .single<{ id: string; name: string; municipality_id: string }>()
      
      if (anyDep) {
        console.log('AI Research (Community): Found any department in municipality:', anyDep)
        department = anyDep
      }
    } catch {
      console.log('AI Research (Community): No departments in municipality')
    }
  }

  if (!department) {
    console.error('AI Research (Community): No department found after all strategies')
    throw new Error('No department found for research context. Please ensure you have proper department access.')
  }

  // Get municipality information
  const { data: municipalityData } = await adminSupabase
    .from('municipalities')
    .select('name, state')
    .eq('id', department.municipality_id)
    .single<{ name: string; state: string }>()

  municipality = municipalityData
  const municipalityName = municipality?.name || 'your city'
  const municipalityState = municipality?.state || ''
  
  console.log('AI Research (Community): Municipality found:', municipality)

  // Build prompt specific to community expectations with current year focus - dynamically department-specific
  const currentYear = new Date().getFullYear()
  const query = `You are a community engagement analyst helping the ${department.name} department in ${municipalityName}${municipalityState ? ', ' + municipalityState : ''} understand citizen priorities and expectations.

Provide specific community insights from ${currentYear - 2} to ${currentYear + 3} that directly impact ${department.name} operations:
- Citizen service expectations for ${department.name} (service quality, response times, accessibility requirements)
- Community priorities affecting ${department.name} programs (budget preferences, program demand, service gaps)
- Public satisfaction trends with ${department.name} services (survey data, complaint patterns, feedback trends)
- Equity and inclusion expectations for ${department.name} (accessibility, language needs, underserved populations)
- Transparency and accountability expectations from citizens regarding ${department.name}
- Digital service expectations for ${department.name} (online services, mobile access, digital divide considerations)
- Community engagement preferences for ${department.name} (communication channels, public meetings, feedback methods)
- Emerging community needs that ${department.name} should address (demographic shifts, social issues, service demands)
- Budget and resource allocation expectations from citizens for ${department.name}

Context: Strategic planning for ${department.name} department in ${municipalityName}${municipalityState ? ', ' + municipalityState : ''}.
Be specific and include data on citizen surveys, public feedback, community meetings, and service expectation trends.
Return only bullet points (no preface), 8-12 bullets, each focused on community expectations that affect ${department.name}.`

  // Call Perplexity
  console.log('AI Research (Community): Calling Perplexity API...')
  const response = await callPerplexityApi([
    { role: 'system', content: 'You are a community engagement analyst providing citizen expectations and priorities data for municipal strategic planning.' },
    { role: 'user', content: query }
  ])

  // Parse bullets from response
  const lines = response.content
    .split('\n')
    .map((l: string) => l.trim())
    .filter(Boolean)

  const bullets: string[] = []
  for (const line of lines) {
    const cleaned = line.replace(/^[-•\d\.\)\s]+/, '').trim()
    if (cleaned.length > 0) bullets.push(cleaned)
  }

  // Process citations and convert to markdown links
  const processedContent = processContentWithCitations(bullets, response.citations || [])
  
  return { 
    content: processedContent,
    citations: response.citations || []
  }
}

export async function researchBenchmarkingMetrics(department_or_plan_id: string): Promise<{
  peer_municipalities: string[]
  metrics: {
    metric_name: string
    current_value: string
    peer_average: string
    gap_analysis: string
  }[]
  key_findings: string[]
}> {
  // Get current user
  const supabase = createServerSupabaseClient()
  const adminSupabase = createAdminSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  console.log('AI Research (Benchmarking): Starting department lookup for ID:', department_or_plan_id)

  let department: { id: string; name: string; municipality_id: string } | null = null
  let municipality: { name: string; state: string } | null = null

  // Get current user's profile using admin client
  const { data: userProfile } = await adminSupabase
    .from('users')
    .select('department_id, municipality_id')
    .eq('id', user.id)
    .single<{ department_id: string | null; municipality_id: string }>()

  if (!userProfile) {
    throw new Error('User profile not found')
  }

  console.log('AI Research (Benchmarking): User profile:', userProfile)

  // Strategy 1: Try as department ID first
  if (department_or_plan_id) {
    try {
      const { data: dep } = await adminSupabase
        .from('departments')
        .select('id, name, municipality_id')
        .eq('id', department_or_plan_id)
        .single<{ id: string; name: string; municipality_id: string }>()
      
      if (dep) {
        console.log('AI Research (Benchmarking): Found department by ID:', dep)
        department = dep
      }
    } catch {
      console.log('AI Research (Benchmarking): Not a department ID, continuing...')
    }
  }

  // Strategy 2: If not found, try as plan ID
  if (!department && department_or_plan_id) {
    try {
      const { data: plan } = await adminSupabase
        .from('strategic_plans')
        .select('department_id')
        .eq('id', department_or_plan_id)
        .single<{ department_id: string }>()
      
      if (plan?.department_id) {
        const { data: dep2 } = await adminSupabase
          .from('departments')
          .select('id, name, municipality_id')
          .eq('id', plan.department_id)
          .single<{ id: string; name: string; municipality_id: string }>()
        
        if (dep2) {
          console.log('AI Research (Benchmarking): Found department by plan ID:', dep2)
          department = dep2
        }
      }
    } catch {
      console.log('AI Research (Benchmarking): Not a plan ID, continuing...')
    }
  }

  // Strategy 3: Fall back to current user's department
  if (!department && userProfile.department_id) {
    try {
      const { data: dep3 } = await adminSupabase
        .from('departments')
        .select('id, name, municipality_id')
        .eq('id', userProfile.department_id)
        .single<{ id: string; name: string; municipality_id: string }>()
      
      if (dep3) {
        console.log('AI Research (Benchmarking): Found user department:', dep3)
        department = dep3
      }
    } catch {
      console.log('AI Research (Benchmarking): User has no department, continuing...')
    }
  }

  // Strategy 4: Get any department from user's municipality
  if (!department) {
    try {
      const { data: anyDep } = await adminSupabase
        .from('departments')
        .select('id, name, municipality_id')
        .eq('municipality_id', userProfile.municipality_id)
        .limit(1)
        .single<{ id: string; name: string; municipality_id: string }>()
      
      if (anyDep) {
        console.log('AI Research (Benchmarking): Found any department in municipality:', anyDep)
        department = anyDep
      }
    } catch {
      console.log('AI Research (Benchmarking): No departments in municipality')
    }
  }

  if (!department) {
    console.error('AI Research (Benchmarking): No department found after all strategies')
    throw new Error('No department found for research context. Please ensure you have proper department access.')
  }

  // Get municipality information
  const { data: municipalityData } = await adminSupabase
    .from('municipalities')
    .select('name, state')
    .eq('id', department.municipality_id)
    .single<{ name: string; state: string }>()

  municipality = municipalityData
  const municipalityName = municipality?.name || 'your city'
  const municipalityState = municipality?.state || ''
  
  console.log('AI Research (Benchmarking): Municipality found:', municipality)

  // First, get peer municipalities
  const peerQuery = `You are a municipal research analyst. Identify 5-6 peer municipalities that are comparable to ${municipalityName}${municipalityState ? ', ' + municipalityState : ''} for benchmarking ${department.name} department performance.

Consider municipalities with similar:
- Population size (within 25% of ${municipalityName})
- Demographics and socioeconomic profile
- Geographic region or state
- Municipal structure and services
- Budget constraints

Provide only the municipality names in this format: "City Name, State" (one per line, no bullets or numbers).`

  console.log('AI Research (Benchmarking): Getting peer municipalities...')
  const peerResponse = await callPerplexityApi([
    { role: 'system', content: 'You are a municipal research analyst providing peer municipality identification for benchmarking analysis.' },
    { role: 'user', content: peerQuery }
  ])

  // Parse peer municipalities
  const peerMunicipalities = peerResponse.content
    .split('\n')
    .map((line: string) => line.trim())
    .filter(Boolean)
    .filter((line: string) => !line.includes('similar') && !line.includes('comparable') && line.includes(','))
    .slice(0, 6)

  // Now get benchmarking metrics
  const metricsQuery = `You are a performance benchmarking analyst. Create exactly 20 benchmarking metrics comparing ${department.name} department performance in ${municipalityName}${municipalityState ? ', ' + municipalityState : ''} against peer municipalities.

For each metric, provide:
1. Metric name (specific, measurable KPI)
2. ${municipalityName} current value (realistic estimate with units)
3. Peer average (realistic benchmark from similar municipalities)
4. Gap analysis (brief explanation of difference and implications)

Use these peer municipalities for comparison: ${peerMunicipalities.join(', ')}

Metrics should cover:
- Service delivery efficiency
- Resource allocation
- Performance outcomes
- Cost effectiveness  
- Staffing levels
- Technology adoption
- Customer satisfaction
- Response times
- Budget per capita
- Service quality indicators

Format each metric as:
METRIC: [specific metric name]|[current value]|[peer average]|[gap analysis]

Provide exactly 20 metrics relevant to ${department.name} operations.`

  console.log('AI Research (Benchmarking): Getting metrics data...')
  const metricsResponse = await callPerplexityApi([
    { role: 'system', content: 'You are a performance benchmarking analyst providing detailed municipal department performance metrics.' },
    { role: 'user', content: metricsQuery }
  ])

  // Parse metrics from response
  const metricLines = metricsResponse.content
    .split('\n')
    .filter((line: string) => line.includes('METRIC:') || line.includes('|'))
    .slice(0, 20)

  const metrics = metricLines.map((line: string) => {
    const cleaned = line.replace(/^METRIC:\s*/, '').trim()
    const parts = cleaned.split('|')
    
    if (parts.length >= 4) {
      return {
        metric_name: parts[0].trim(),
        current_value: parts[1].trim(),
        peer_average: parts[2].trim(), 
        gap_analysis: parts[3].trim()
      }
    }
    
    // Fallback parsing for different formats
    const fallbackParts = cleaned.split(/[\t\|]/)
    if (fallbackParts.length >= 4) {
      return {
        metric_name: fallbackParts[0].trim(),
        current_value: fallbackParts[1].trim(),
        peer_average: fallbackParts[2].trim(),
        gap_analysis: fallbackParts[3].trim()
      }
    }
    
    // Last resort - create a basic metric
    return {
      metric_name: cleaned || 'Performance Metric',
      current_value: 'TBD',
      peer_average: 'TBD', 
      gap_analysis: 'Analysis needed'
    }
  })

  // Get key findings
  const findingsQuery = `Based on the benchmarking analysis of ${department.name} department in ${municipalityName}${municipalityState ? ', ' + municipalityState : ''}, provide 3-5 key findings that summarize the most important insights.

Consider:
- Overall performance compared to peers
- Areas of strength and concern
- Resource allocation implications
- Strategic priorities for improvement
- Investment recommendations

Provide findings as bullet points (one per line, no preface).`

  console.log('AI Research (Benchmarking): Getting key findings...')
  const findingsResponse = await callPerplexityApi([
    { role: 'system', content: 'You are a strategic planning analyst providing key insights from benchmarking analysis.' },
    { role: 'user', content: findingsQuery }
  ])

  // Parse key findings
  const findings = findingsResponse.content
    .split('\n')
    .map((line: string) => line.trim())
    .filter(Boolean)
    .map((line: string) => line.replace(/^[-•\d\.\)\s]+/, '').trim())
    .filter(Boolean)
    .slice(0, 5)

  return {
    peer_municipalities: peerMunicipalities,
    metrics: metrics.slice(0, 20),
    key_findings: findings
  }
}

export async function generateExecutiveSummary(planId: string): Promise<string> {
  // Get current user
  const supabase = createServerSupabaseClient()
  const adminSupabase = createAdminSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  console.log('AI Research (Executive Summary): Starting for plan ID:', planId)

  // Get comprehensive strategic plan data
  const { data: planData, error: planError } = await adminSupabase
    .from('strategic_plans')
    .select(`
      id,
      title,
      department_vision,
      swot_analysis,
      environmental_scan,
      benchmarking_data,
      start_fiscal_year_id,
      end_fiscal_year_id,
      departments:department_id (
        id,
        name,
        municipality_id,
        director_name,
        mission_statement,
        core_services,
        current_staffing
      )
    `)
    .eq('id', planId)
    .single()

  if (planError || !planData) {
    throw new Error('Failed to fetch strategic plan data')
  }

  // Get strategic goals and initiatives
  const { data: goalsData } = await adminSupabase
    .from('strategic_goals')
    .select(`
      id,
      goal_number,
      title,
      description,
      city_priority_alignment,
      objectives,
      success_measures,
      initiatives:strategic_goal_id (
        id,
        initiative_number,
        name,
        priority_level,
        description,
        rationale,
        expected_outcomes,
        total_year_1_cost,
        total_year_2_cost,
        total_year_3_cost,
        status
      )
    `)
    .eq('strategic_plan_id', planId)
    .order('goal_number')

  // Get Council Goals for alignment context
  const municipalityId = planData.departments?.municipality_id
  console.log('Fetching Council Goals for municipality:', municipalityId)
  
  let councilGoals = null
  let councilGoalsError = null
  
  if (municipalityId) {
    const result = await adminSupabase
      .from('council_goals')
      .select('category, title, description, key_points')
      .eq('municipality_id', municipalityId)
      .eq('is_active', true)
      .order('category')
      .order('sort_order')
    
    councilGoals = result.data
    councilGoalsError = result.error
  } else {
    console.warn('No municipality_id found, skipping council goals fetch')
  }
  
  if (councilGoalsError) {
    console.error('Error fetching council goals:', councilGoalsError)
  } else {
    console.log('Found', councilGoals?.length || 0, 'council goals:', councilGoals?.map(g => g.title))
  }

  // Get fiscal years for context
  const { data: fiscalYears } = await adminSupabase
    .from('fiscal_years')
    .select('id, year')
    .in('id', [planData.start_fiscal_year_id, planData.end_fiscal_year_id])

  const startYear = fiscalYears?.find(fy => fy.id === planData.start_fiscal_year_id)?.year
  const endYear = fiscalYears?.find(fy => fy.id === planData.end_fiscal_year_id)?.year

  // Calculate total investment
  let totalInvestment = 0
  let initiativeCount = 0
  const priorityBreakdown = { NEED: 0, WANT: 0, NICE_TO_HAVE: 0 }

  goalsData?.forEach(goal => {
    goal.initiatives?.forEach(initiative => {
      initiativeCount++
      totalInvestment += (initiative.total_year_1_cost || 0) + (initiative.total_year_2_cost || 0) + (initiative.total_year_3_cost || 0)
      priorityBreakdown[initiative.priority_level as keyof typeof priorityBreakdown]++
    })
  })

  // Build comprehensive context for AI
  const planTitle = planData.title || `${planData.departments?.name} Strategic Plan`
  const departmentName = planData.departments?.name || 'Department'
  const directorName = planData.departments?.director_name || 'Department Director'
  const missionStatement = planData.departments?.mission_statement || ''
  const coreServices = Array.isArray(planData.departments?.core_services) ? planData.departments.core_services : []
  const departmentVision = planData.department_vision || ''

  // Extract key data points
  const swotData = planData.swot_analysis as Record<string, string[] | number>
  const envScanData = planData.environmental_scan as Record<string, string[] | number>
  const benchmarkingData = planData.benchmarking_data as Record<string, string[] | number>

  const swotSummary = swotData ? {
    strengths: swotData.strengths?.length || 0,
    weaknesses: swotData.weaknesses?.length || 0,
    opportunities: swotData.opportunities?.length || 0,
    threats: swotData.threats?.length || 0
  } : null

  const envScanSummary = envScanData ? {
    demographics: envScanData.demographic_trends?.length || 0,
    economics: envScanData.economic_factors?.length || 0,
    regulatory: envScanData.regulatory_changes?.length || 0,
    technology: envScanData.technology_trends?.length || 0,
    community: envScanData.community_expectations?.length || 0
  } : null

  const benchmarkingSummary = benchmarkingData ? {
    peers: benchmarkingData.peer_municipalities?.length || 0,
    metrics: benchmarkingData.metrics?.length || 0,
    findings: benchmarkingData.key_findings?.length || 0
  } : null

  // Process Council Goals
  const coreValues = councilGoals?.filter(goal => goal.category === 'core_value') || []
  const focusAreas = councilGoals?.filter(goal => goal.category === 'focus_area') || []
  
  console.log('Processed Council Goals:')
  console.log('- Core Values:', coreValues.length, coreValues.map(cv => cv.title))
  console.log('- Focus Areas:', focusAreas.length, focusAreas.map(fa => fa.title))

  // Build comprehensive Council Goals section
  let councilGoalsSection = '**CITY COUNCIL STRATEGIC PRIORITIES:**\n'
  
  if (coreValues.length > 0) {
    councilGoalsSection += 'The City Council has established the following Core Values:\n'
    coreValues.forEach(cv => {
      councilGoalsSection += `- ${cv.title}: ${cv.description}\n`
      if (cv.key_points && cv.key_points.length > 0) {
        councilGoalsSection += `  Strategic Focus Areas: ${cv.key_points.join(', ')}\n`
      }
    })
    councilGoalsSection += '\n'
  }
  
  if (focusAreas.length > 0) {
    councilGoalsSection += 'Council Priority Focus Areas:\n'
    focusAreas.forEach(fa => {
      councilGoalsSection += `- ${fa.title}: ${fa.description}\n`
      if (fa.key_points && fa.key_points.length > 0) {
        councilGoalsSection += `  Key Initiatives: ${fa.key_points.join(', ')}\n`
      }
    })
    councilGoalsSection += '\n'
  }
  
  if (coreValues.length === 0 && focusAreas.length === 0) {
    councilGoalsSection += 'Council priorities are being developed.\n\n'
  }
  
  // Build comprehensive SWOT details
  let swotDetails = ''
  if (swotData) {
    if (swotData.strengths?.length > 0) {
      swotDetails += `Key Strengths: ${swotData.strengths.slice(0, 3).join('; ')}\n`
    }
    if (swotData.opportunities?.length > 0) {
      swotDetails += `Major Opportunities: ${swotData.opportunities.slice(0, 3).join('; ')}\n`
    }
    if (swotData.weaknesses?.length > 0) {
      swotDetails += `Areas for Improvement: ${swotData.weaknesses.slice(0, 2).join('; ')}\n`
    }
    if (swotData.threats?.length > 0) {
      swotDetails += `Strategic Challenges: ${swotData.threats.slice(0, 2).join('; ')}\n`
    }
  }

  // Build AI prompt
  const prompt = `You are an expert strategic planning consultant writing an executive summary for a municipal department strategic plan.

**STRATEGIC PLAN OVERVIEW:**
- Plan Title: ${planTitle}
- Department: ${departmentName}
- Director: ${directorName}
- Planning Period: FY${startYear}-${endYear}
- Total Strategic Investment: $${totalInvestment.toLocaleString()}
- Strategic Goals Defined: ${goalsData?.length || 0}
- Implementation Initiatives: ${initiativeCount}
- Priority Distribution: ${priorityBreakdown.NEED} Critical Needs, ${priorityBreakdown.WANT} Strategic Wants, ${priorityBreakdown.NICE_TO_HAVE} Future Considerations

**DEPARTMENT FOUNDATION:**
- Mission: ${missionStatement}
- Core Services: ${coreServices.join(', ')}
- Department Vision: ${departmentVision}
- Current Staffing: ${planData.departments?.current_staffing || 'Not specified'} employees

${councilGoalsSection}
**STRATEGIC ANALYSIS INSIGHTS:**
${swotSummary ? `SWOT Analysis Completed: Identified ${swotSummary.strengths} organizational strengths, ${swotSummary.opportunities} strategic opportunities, ${swotSummary.weaknesses} improvement areas, and ${swotSummary.threats} risk factors.` : 'SWOT Analysis: Pending completion'}
${swotDetails}
${envScanSummary ? `Environmental Scan Completed: Analyzed ${envScanSummary.demographics} demographic trends, ${envScanSummary.economics} economic factors, ${envScanSummary.regulatory} regulatory changes, ${envScanSummary.technology} technology innovations, and ${envScanSummary.community} community expectations.` : 'Environmental Scan: Pending completion'}
${benchmarkingSummary ? `Benchmarking Analysis Completed: Compared performance with ${benchmarkingSummary.peers} peer municipalities across ${benchmarkingSummary.metrics} key metrics, identifying ${benchmarkingSummary.findings} critical insights.` : 'Benchmarking Analysis: Pending completion'}

**STRATEGIC GOALS & ALIGNMENT:**
${goalsData?.map(goal => {
    let goalText = `Strategic Goal ${goal.goal_number}: ${goal.title}\n`
    goalText += `- Objective: ${goal.description}\n`
    if (goal.city_priority_alignment) {
      goalText += `- Council Alignment: ${goal.city_priority_alignment}\n`
    }
    goalText += `- Implementation: ${goal.initiatives?.length || 0} specific initiatives\n`
    if (goal.objectives?.length > 0) {
      goalText += `- Key Objectives: ${goal.objectives.slice(0, 2).join('; ')}\n`
    }
    return goalText
  }).join('\n') || 'Strategic goals are currently being developed based on the completed strategic analysis.'}

**EXECUTIVE SUMMARY REQUIREMENTS:**
Write a comprehensive, professional executive summary (800-1000 words) that:

1. **Opening**: Establish the department's critical role and mission within the municipality
2. **Council Alignment**: EXPLICITLY reference and demonstrate alignment with the City Council's established core values (${coreValues.map(cv => cv.title).join(', ') || 'being developed'})
3. **Strategic Foundation**: Present the rigorous strategic planning methodology and analysis conducted
4. **Key Insights**: Highlight the most significant findings from strategic analysis (SWOT, environmental scan, benchmarking)
5. **Strategic Direction**: Outline how each strategic goal directly advances council priorities and community needs
6. **Investment Framework**: Justify the strategic investment requirements and projected return on investment
7. **Expected Impact**: Conclude with specific expected outcomes and measurable benefits to the community

**FORMATTING REQUIREMENTS:**
- Format your response using proper Markdown syntax
- Use ## for main section headers (e.g., ## Executive Summary, ## Strategic Foundation, ## Key Findings)
- Use ### for subsection headers where appropriate
- Use **bold text** for emphasis on key points
- Use bullet points (-) for lists of items
- Use > blockquotes for important quotes or highlighted information
- Ensure proper paragraph breaks and spacing for readability

**CRITICAL INSTRUCTION**: You MUST acknowledge and reference the City Council's established core values of ${coreValues.map(cv => cv.title).join(', ')} throughout the summary. DO NOT state that council goals are undefined - they are clearly established and provided above.

Use professional, confident language appropriate for city leadership and elected officials. Focus on demonstrating clear value, measurable impact, and strategic alignment with established council priorities.

**RESPONSE FORMAT**: Return ONLY the Markdown-formatted executive summary text. Do not include any preamble, explanations, or additional commentary.`

  console.log('AI Research (Executive Summary): Calling Perplexity API...')
  const response = await callPerplexityApi([
    { 
      role: 'system', 
      content: 'You are an expert strategic planning consultant specializing in municipal government strategic plans. Write professional, compelling executive summaries that effectively communicate strategic value to city leadership.' 
    },
    { role: 'user', content: prompt }
  ])

  return response.content
}

export interface StrategicGoalSuggestion {
  title: string
  description: string
  city_priority_alignment: string
  objectives: string[]
  success_measures: string[]
  rationale: string
}

export async function generateStrategicGoals(planId: string): Promise<StrategicGoalSuggestion[]> {
  // Get current user
  const supabase = createServerSupabaseClient()
  const adminSupabase = createAdminSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  console.log('AI Research (Strategic Goals): Starting comprehensive data gathering for plan ID:', planId)

  // Get comprehensive strategic plan data
  const { data: planData, error: planError } = await adminSupabase
    .from('strategic_plans')
    .select(`
      id,
      title,
      department_vision,
      swot_analysis,
      environmental_scan,
      benchmarking_data,
      departments:department_id (
        id,
        name,
        municipality_id,
        mission_statement,
        core_services,
        current_staffing,
        director_name
      )
    `)
    .eq('id', planId)
    .single()

  if (planError || !planData) {
    throw new Error('Failed to fetch strategic plan data')
  }

  // Get existing strategic goals to avoid duplication
  const { data: existingGoals } = await adminSupabase
    .from('strategic_goals')
    .select('title, description')
    .eq('strategic_plan_id', planId)

  // Get Council Goals for alignment
  const { data: councilGoals } = await adminSupabase
    .from('council_goals')
    .select('category, title, description, key_points')
    .eq('municipality_id', planData.departments.municipality_id)
    .eq('is_active', true)
    .order('category')
    .order('sort_order')

  // Get municipality information
  const { data: municipality } = await adminSupabase
    .from('municipalities')
    .select('name, state')
    .eq('id', planData.departments.municipality_id)
    .single()

  const municipalityName = municipality?.name || 'Municipality'
  const municipalityState = municipality?.state || ''

  // Extract and structure all strategic data
  const departmentName = planData.departments?.name || 'Department'
  const missionStatement = planData.departments?.mission_statement || ''
  const coreServices = Array.isArray(planData.departments?.core_services) ? planData.departments.core_services : []
  const departmentVision = planData.department_vision || ''
  const currentStaffing = planData.departments?.current_staffing || 0
  const directorName = planData.departments?.director_name || 'Department Director'

  // Process SWOT data
  const swotData = planData.swot_analysis as Record<string, string[] | number>
  const strengths = swotData?.strengths || []
  const weaknesses = swotData?.weaknesses || []
  const opportunities = swotData?.opportunities || []
  const threats = swotData?.threats || []

  // Process Environmental Scan data
  const envScanData = planData.environmental_scan as Record<string, string[] | number>
  const demographics = envScanData?.demographic_trends || []
  const economics = envScanData?.economic_factors || []
  const regulatory = envScanData?.regulatory_changes || []
  const technology = envScanData?.technology_trends || []
  const community = envScanData?.community_expectations || []

  // Process Benchmarking data
  const benchmarkingData = planData.benchmarking_data as Record<string, string[] | number>
  const _peerMunicipalities = benchmarkingData?.peer_municipalities || []
  const _performanceMetrics = benchmarkingData?.metrics || []
  const keyFindings = benchmarkingData?.key_findings || []

  // Organize Council Goals by category
  const coreValues = councilGoals?.filter(goal => goal.category === 'core_value') || []
  const focusAreas = councilGoals?.filter(goal => goal.category === 'focus_area') || []

  // Build comprehensive context for AI
  const _currentYear = new Date().getFullYear()
  const prompt = `You are an expert strategic planning consultant developing strategic goals for a municipal department. Analyze all available strategic data to create 3-5 comprehensive strategic goals.

**DEPARTMENT CONTEXT:**
- Department: ${departmentName}
- Municipality: ${municipalityName}${municipalityState ? ', ' + municipalityState : ''}
- Director: ${directorName}
- Mission: ${missionStatement}
- Core Services: ${coreServices.join(', ')}
- Vision: ${departmentVision}
- Current Staffing: ${currentStaffing} employees

**COUNCIL GOALS TO ALIGN WITH:**
${coreValues.length > 0 ? `Core Values:\n${coreValues.map(cv => `- ${cv.title}: ${cv.description}\n  Key Points: ${(cv.key_points || []).join(', ')}`).join('\n')}` : 'No core values defined'}

${focusAreas.length > 0 ? `Focus Areas:\n${focusAreas.map(fa => `- ${fa.title}: ${fa.description}\n  Key Points: ${(fa.key_points || []).join(', ')}`).join('\n')}` : 'No focus areas defined'}

**SWOT ANALYSIS:**
Strengths (${strengths.length}):
${strengths.slice(0, 5).map((s: string) => `- ${s}`).join('\n')}

Weaknesses (${weaknesses.length}):
${weaknesses.slice(0, 5).map((w: string) => `- ${w}`).join('\n')}

Opportunities (${opportunities.length}):
${opportunities.slice(0, 5).map((o: string) => `- ${o}`).join('\n')}

Threats (${threats.length}):
${threats.slice(0, 5).map((t: string) => `- ${t}`).join('\n')}

**ENVIRONMENTAL SCAN INSIGHTS:**
Demographic Trends (${demographics.length}): ${demographics.slice(0, 3).join('; ')}
Economic Factors (${economics.length}): ${economics.slice(0, 3).join('; ')}
Regulatory Changes (${regulatory.length}): ${regulatory.slice(0, 3).join('; ')}
Technology Trends (${technology.length}): ${technology.slice(0, 3).join('; ')}
Community Expectations (${community.length}): ${community.slice(0, 3).join('; ')}

**BENCHMARKING INSIGHTS:**
${keyFindings.length > 0 ? `Key Findings:\n${keyFindings.slice(0, 5).join('\n')}` : 'No benchmarking findings available'}

**EXISTING STRATEGIC GOALS TO AVOID DUPLICATION:**
${existingGoals?.length ? existingGoals.map(goal => `- ${goal.title}`).join('\n') : 'No existing goals'}

**STRATEGIC GOAL REQUIREMENTS:**
Create 3-5 strategic goals that:
1. Directly align with and support the council's core values and focus areas
2. Leverage identified strengths and address critical weaknesses
3. Capitalize on key opportunities while mitigating major threats
4. Respond to environmental scan insights (demographics, economics, technology, etc.)
5. Incorporate benchmarking best practices and lessons learned
6. Are specific to ${departmentName} operations and service delivery
7. Are achievable within a 3-year timeframe
8. Support the department's mission and vision

For each strategic goal, provide:
- Title: Clear, concise goal statement (8-12 words)
- Description: Detailed explanation of what will be accomplished (2-3 sentences)
- City Priority Alignment: Which council goal(s) this supports and how
- Objectives: 3-5 specific measurable objectives to achieve this goal
- Success Measures: 3-5 specific metrics to track progress
- Rationale: Why this goal is critical based on the strategic analysis (reference specific SWOT items, environmental factors, or benchmarking insights)

You MUST respond with ONLY a valid JSON array in this exact format:
[
  {
    "title": "Goal Title Here",
    "description": "Detailed description here",
    "city_priority_alignment": "How this aligns with council priorities",
    "objectives": [
      "Objective 1",
      "Objective 2",
      "Objective 3"
    ],
    "success_measures": [
      "Measure 1",
      "Measure 2",
      "Measure 3"
    ],
    "rationale": "Why this goal is important based on the analysis"
  }
]

Do not include any text before or after the JSON array. Ensure all strings are properly quoted and the JSON is valid.`

  console.log('AI Research (Strategic Goals): Calling Perplexity API...')
  const response = await callPerplexityApi([
    { 
      role: 'system', 
      content: 'You are an expert municipal strategic planning consultant. You analyze comprehensive strategic data to create well-aligned, actionable strategic goals. You MUST respond with ONLY valid JSON - no explanatory text, no markdown formatting, no code blocks, just pure JSON array.' 
    },
    { role: 'user', content: prompt }
  ])

  try {
    // Clean up the response content
    let content = response.content.trim()
    
    // Try to find JSON array in the response
    const jsonMatch = content.match(/\[\s*\{[\s\S]*\}\s*\]/)
    
    if (!jsonMatch) {
      // If no array found, try to find individual objects and wrap in array
      const objectMatches = content.match(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g)
      if (objectMatches) {
        content = '[' + objectMatches.join(',') + ']'
      } else {
        console.log('Raw AI response:', content)
        // Fallback: create mock goals if no JSON found
        return [
          {
            title: "Enhance Service Delivery Excellence",
            description: "Improve service quality and efficiency through process optimization and staff development.",
            city_priority_alignment: "Aligns with council's focus on operational excellence and community service.",
            objectives: [
              "Reduce average service response time by 25%",
              "Implement customer satisfaction tracking system",
              "Train 100% of staff on new service standards"
            ],
            success_measures: [
              "Service response time metrics",
              "Customer satisfaction scores",
              "Staff completion of training programs"
            ],
            rationale: "Based on identified opportunities for process improvement and community expectations for enhanced service delivery."
          }
        ]
      }
    }
    
    const jsonString = jsonMatch ? jsonMatch[0] : content
    
    // Fix common JSON issues
    const cleanJson = jsonString
      .replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*):/g, '$1"$2":') // Add quotes to keys
      .replace(/:\s*([^\[\{"\s][^,\}\]]*)/g, (match, p1) => {
        // Add quotes to string values that aren't already quoted
        if (p1.trim() === 'true' || p1.trim() === 'false' || p1.trim() === 'null' || /^\d+(\.\d+)?$/.test(p1.trim())) {
          return match
        }
        return ': "' + p1.trim().replace(/"/g, '\\"') + '"'
      })
    
    const strategicGoals = JSON.parse(cleanJson) as StrategicGoalSuggestion[]
    
    // Validate and clean the structure
    const validatedGoals = strategicGoals
      .filter(goal => goal && typeof goal === 'object')
      .map(goal => ({
        title: String(goal.title || 'Untitled Goal'),
        description: String(goal.description || 'No description provided'),
        city_priority_alignment: String(goal.city_priority_alignment || ''),
        objectives: Array.isArray(goal.objectives) ? goal.objectives.map(String) : [],
        success_measures: Array.isArray(goal.success_measures) ? goal.success_measures.map(String) : [],
        rationale: String(goal.rationale || '')
      }))
      .filter(goal => goal.title !== 'Untitled Goal' && goal.description !== 'No description provided')
    
    console.log(`AI Research (Strategic Goals): Generated ${validatedGoals.length} strategic goal suggestions`)
    
    return validatedGoals
    
  } catch (error) {
    console.error('Error parsing strategic goals JSON:', error)
    console.log('Raw AI response content:', response.content)
    
    // Fallback: return a sample strategic goal
    return [
      {
        title: "Improve Operational Efficiency",
        description: "Streamline department processes and enhance service delivery capabilities through strategic improvements.",
        city_priority_alignment: "Supports council priorities for efficient government operations and enhanced community service.",
        objectives: [
          "Implement process improvement initiatives",
          "Enhance staff training and development",
          "Improve service delivery metrics"
        ],
        success_measures: [
          "Process efficiency metrics",
          "Staff performance indicators",
          "Service delivery satisfaction scores"
        ],
        rationale: "Generated as fallback goal due to AI response parsing issues. Please customize based on your specific strategic analysis."
      }
    ]
  }
}
