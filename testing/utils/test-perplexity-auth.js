require('dotenv').config({ path: '.env.local' });

const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';

async function testAuthMethod(authMethod, apiKey) {
  try {
    console.log(`\n=== Testing auth method: ${authMethod} ===`);
    
    let headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };

    // Try different auth header formats
    switch (authMethod) {
      case 'Bearer':
        headers['Authorization'] = `Bearer ${apiKey}`;
        break;
      case 'Token':
        headers['Authorization'] = `Token ${apiKey}`;
        break;
      case 'API-Key':
        headers['X-API-Key'] = apiKey;
        break;
      case 'Perplexity-Key':
        headers['Perplexity-API-Key'] = apiKey;
        break;
      case 'Plain':
        headers['Authorization'] = apiKey;
        break;
    }
    
    const response = await fetch(PERPLEXITY_API_URL, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          { role: 'user', content: 'Hello' }
        ],
        max_tokens: 10,
      })
    });

    console.log(`Status: ${response.status}`);
    
    const responseText = await response.text();
    
    if (response.ok) {
      console.log(`✅ SUCCESS with ${authMethod}`);
      const data = JSON.parse(responseText);
      console.log(`Response: ${data.choices?.[0]?.message?.content || 'No content'}`);
      return true;
    } else {
      console.log(`❌ FAILED with status ${response.status}`);
      if (response.status !== 401) {
        console.log(`Response: ${responseText.slice(0, 200)}`);
      }
      return false;
    }

  } catch (error) {
    console.log(`❌ ERROR:`, error.message);
    return false;
  }
}

async function testAllAuthMethods() {
  const apiKey = process.env.PPLX_API_KEY || process.env.PERPLEXITY_API_KEY;
  if (!apiKey) {
    console.log('❌ No API key found in environment');
    return;
  }

  console.log(`Testing API key: ${apiKey.slice(0, 10)}...`);
  
  const authMethods = ['Bearer', 'Token', 'API-Key', 'Perplexity-Key', 'Plain'];
  const workingMethods = [];
  
  for (const method of authMethods) {
    const success = await testAuthMethod(method, apiKey);
    if (success) {
      workingMethods.push(method);
    }
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log(`\n📊 SUMMARY:`);
  if (workingMethods.length > 0) {
    console.log(`✅ Working auth methods: ${workingMethods.join(', ')}`);
  } else {
    console.log(`❌ NO WORKING AUTH METHODS`);
    console.log(`\n🔍 This likely means:`);
    console.log(`1. API key is invalid or expired`);
    console.log(`2. Account doesn't have API access`);
    console.log(`3. Account needs billing/credits setup`);
    console.log(`4. API endpoint has changed`);
  }
}

testAllAuthMethods();