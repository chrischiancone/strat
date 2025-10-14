/**
 * Test Perplexity API Connection
 *
 * This script tests the Perplexity API to diagnose connection issues
 * Run with: npx tsx scripts/test-perplexity-api.ts
 */

import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions'

async function testPerplexityApi() {
  console.log('🔍 Testing Perplexity API connection...\n')

  const apiKey = process.env.PPLX_API_KEY
  
  if (!apiKey) {
    console.error('❌ PPLX_API_KEY not found in environment variables')
    console.log('Available env vars:', Object.keys(process.env).filter(k => k.includes('PPL') || k.includes('API')))
    return
  }

  console.log('✅ API Key found:', apiKey.slice(0, 8) + '...' + apiKey.slice(-4))

  try {
    console.log('🚀 Making API request to:', PERPLEXITY_API_URL)
    
    const response = await fetch(PERPLEXITY_API_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: process.env.PPLX_MODEL || 'llama-3.1-sonar-small-128k-online',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: 'Say hello in exactly 5 words.' }
        ],
        max_tokens: 50,
      })
    })

    console.log('📊 Response Status:', response.status)
    console.log('📊 Response Headers:', Object.fromEntries(response.headers.entries()))

    const responseText = await response.text()
    console.log('📄 Raw Response (first 500 chars):', responseText.slice(0, 500))

    // Try to parse as JSON
    try {
      const data = JSON.parse(responseText)
      console.log('\n✅ Successfully parsed JSON response')
      console.log('🎯 Response structure:', JSON.stringify(data, null, 2))
      
      if (data.choices && data.choices[0] && data.choices[0].message) {
        console.log('💬 AI Response:', data.choices[0].message.content)
      }
    } catch (parseError) {
      console.error('\n❌ Failed to parse JSON response')
      console.error('Parse error:', parseError)
      
      // Check if it's an HTML error page
      if (responseText.includes('<html>')) {
        console.log('🚨 Response appears to be HTML error page')
      }
    }

  } catch (error) {
    console.error('❌ Request failed:', error)
  }
}

testPerplexityApi().catch(console.error)