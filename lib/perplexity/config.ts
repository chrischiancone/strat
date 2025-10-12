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
  try {
    const response = await fetch(PERPLEXITY_API_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
'Authorization': `Bearer ${getApiKey()}`
      },
      body: JSON.stringify({
        model: 'mistral-7b-instruct',
        messages,
        max_tokens: 1024,
      })
    })

    const data = await response.json()

    if (!response.ok) {
      const error = data as ApiError
      throw new Error(
        error.error?.message ||
        `API call failed with status ${error.status}`
      )
    }

    return data.choices[0].message.content
  } catch (error) {
    console.error('Perplexity API error:', error)
    throw error instanceof Error 
      ? error 
      : new Error('Failed to call Perplexity API')
  }
}