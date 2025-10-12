'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { callPerplexityApi } from '@/lib/perplexity/config'

interface ResearchResponse {
  content: string[]
}

export async function researchDemographics(department_id: string): Promise<ResearchResponse> {
  // Get current user's municipality
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  // Get department info
  const { data: department } = await supabase
    .from('departments')
    .select('name, municipality_id, municipalities(name, state)')
    .eq('id', department_id)
    .single<{
      name: string
      municipality_id: string
      municipalities: { name: string; state: string }
    }>()

  if (!department) {
    throw new Error('Department not found')
  }

  // Build prompt
  const query = `You are an analyst helping a city department with demographic research. Write concise, citation-free bullet points focused on:
- Population changes (size, growth rate, notable shifts)
- Age distribution trends
- Racial/ethnic diversity trends
- Migration patterns (domestic/international)
- Income and education demographics
- Any department-specific demographics that matter to ${department.name}

Context: Municipality = ${department.municipalities.name}, ${department.municipalities.state}; Department = ${department.name}.
Return only bullet points (no preface, no summary), 6-10 bullets, each ≤ 200 characters.`

  // Call Perplexity
  const content = await callPerplexityApi([
    { role: 'system', content: 'You are a concise research assistant for municipal strategic planning.' },
    { role: 'user', content: query }
  ])

  // Parse bullets from response
  const lines = content
    .split('\n')
    .map((l: string) => l.trim())
    .filter(Boolean)

  const bullets: string[] = []
  for (const line of lines) {
    const cleaned = line.replace(/^[-•\d\.\)\s]+/, '').trim()
    if (cleaned.length > 0) bullets.push(cleaned)
  }

  return { content: bullets }
}