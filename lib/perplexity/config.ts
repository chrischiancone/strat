export const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions'

function getApiKey(): string {
  const key = process.env.PPLX_API_KEY || process.env.PERPLEXITY_API_KEY
  if (!key) {
    throw new Error('Perplexity API key not configured. Set PPLX_API_KEY in your environment.')
  }
  return key
}

interface ApiError {
  error?: {
    message: string
    type: string
    code: string
  }
  status?: number
}

export async function callPerplexityApi(messages: Array<{ role: string; content: string }>) {
  console.log('🔥 Calling Perplexity API with working configuration')
  
  try {
    console.log('Calling Perplexity API with messages:', messages.length)
    
    const response = await fetch(PERPLEXITY_API_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getApiKey()}`
      },
      body: JSON.stringify({
        model: process.env.PPLX_MODEL || 'llama-3.1-sonar-small-128k-online',
        messages,
        max_tokens: 1024,
      })
    })

    console.log('Perplexity API response status:', response.status)
    console.log('Perplexity API response headers:', Object.fromEntries(response.headers.entries()))

    const responseText = await response.text()
    console.log('Perplexity API raw response:', responseText.slice(0, 500))

    let data
    try {
      data = JSON.parse(responseText)
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError)
      throw new Error(`Perplexity API returned invalid JSON. This usually means API key authentication failed. Response: ${responseText.slice(0, 200)}`)
    }

    if (!response.ok) {
      const error = data as ApiError
      throw new Error(
        error.error?.message ||
        `Perplexity API call failed with status ${response.status}: ${responseText.slice(0, 200)}`
      )
    }

    console.log('✅ Successfully received data from Perplexity API')
    
    // Return both content and citations
    return {
      content: data.choices[0].message.content,
      citations: data.citations || []
    }
  } catch (error) {
    console.error('Perplexity API error:', error)
    throw error instanceof Error 
      ? error 
      : new Error('Failed to call Perplexity API')
  }
}
