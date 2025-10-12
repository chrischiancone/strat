import { NextRequest, NextResponse } from 'next/server'
import { generateExecutiveSummary } from '@/lib/ai-selector'

export async function GET(request: NextRequest) {
  try {
    // Test Claude integration with a sample executive summary
    const testContent = `
FY2025 Strategic Plan Overview:
- Department: Information Technology
- Strategic Goals: 3 major goals focused on digital transformation
- Total Investment: $2.5M over 3 years
- Key Initiatives: Cloud migration, cybersecurity enhancement, digital services expansion
- SWOT Analysis: Completed with focus on technological capabilities
- Community Impact: Improved digital services for 50,000+ residents
    `

    console.log('🧪 Testing Claude integration for executive summary...')
    
    const result = await generateExecutiveSummary(
      testContent, 
      'Municipal IT Strategic Plan'
    )

    return NextResponse.json({
      success: true,
      provider: result.provider,
      model: result.model,
      contentPreview: result.content.substring(0, 200) + '...',
      usage: result.usage
    })

  } catch (error) {
    console.error('AI Integration Test Error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      provider: 'claude'
    }, { status: 500 })
  }
}