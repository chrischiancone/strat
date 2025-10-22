require('dotenv').config({ path: '.env.local' });

const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';

async function testPerplexityAPI() {
  try {
    console.log('Testing Perplexity API connection...');
    
    const apiKey = process.env.PPLX_API_KEY || process.env.PERPLEXITY_API_KEY;
    if (!apiKey) {
      throw new Error('No API key found in environment');
    }
    
    console.log('API key found:', apiKey.slice(0, 10) + '...');
    
    const response = await fetch(PERPLEXITY_API_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-chat',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: 'Say hello in one sentence.' }
        ],
        max_tokens: 50,
      })
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log('Raw response:', responseText.slice(0, 500));

    if (!response.ok) {
      throw new Error(`API call failed with status ${response.status}: ${responseText.slice(0, 200)}`);
    }

    const data = JSON.parse(responseText);
    console.log('Parsed response:', JSON.stringify(data, null, 2));
    console.log('SUCCESS: API connection working!');

  } catch (error) {
    console.error('ERROR testing Perplexity API:', error);
  }
}

testPerplexityAPI();