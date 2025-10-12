require('dotenv').config({ path: '.env.local' });

const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';

// Try different models that might work
const MODELS_TO_TEST = [
  'llama-3.1-sonar-small-128k-online',
  'llama-3.1-sonar-small-128k-chat',
  'llama-3.1-sonar-large-128k-online',
  'llama-3.1-sonar-large-128k-chat',
  'llama-3.1-8b-instruct',
  'llama-3.1-70b-instruct',
  'mixtral-8x7b-instruct',
  'sonar-small-chat',
  'sonar-small-online',
  'sonar-medium-chat',
  'sonar-medium-online'
];

async function testPerplexityModel(model) {
  try {
    const apiKey = process.env.PPLX_API_KEY || process.env.PERPLEXITY_API_KEY;
    if (!apiKey) {
      throw new Error('No API key found');
    }

    console.log(`\n=== Testing model: ${model} ===`);
    
    const response = await fetch(PERPLEXITY_API_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: 'Say hello briefly.' }
        ],
        max_tokens: 50,
      })
    });

    console.log(`Status: ${response.status}`);
    
    const responseText = await response.text();
    
    if (response.ok) {
      const data = JSON.parse(responseText);
      console.log(`✅ SUCCESS with model: ${model}`);
      console.log(`Response: ${data.choices?.[0]?.message?.content || 'No content'}`);
      return true;
    } else {
      console.log(`❌ FAILED with status ${response.status}`);
      if (response.status === 401) {
        console.log('401 = Authentication failed (bad API key or account issue)');
      } else if (response.status === 400) {
        console.log('400 = Bad request (likely unsupported model name)');
        console.log(`Error details: ${responseText.slice(0, 200)}`);
      } else {
        console.log(`Error details: ${responseText.slice(0, 200)}`);
      }
      return false;
    }

  } catch (error) {
    console.log(`❌ ERROR testing ${model}:`, error.message);
    return false;
  }
}

async function testAllModels() {
  console.log('🔍 Testing Perplexity API with different models...\n');
  console.log(`Using API key: ${(process.env.PPLX_API_KEY || '').slice(0, 10)}...`);
  
  let successCount = 0;
  const workingModels = [];
  
  for (const model of MODELS_TO_TEST) {
    const success = await testPerplexityModel(model);
    if (success) {
      successCount++;
      workingModels.push(model);
    }
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log(`\n📊 SUMMARY:`);
  console.log(`✅ Working models: ${successCount}/${MODELS_TO_TEST.length}`);
  
  if (workingModels.length > 0) {
    console.log(`\n🎉 WORKING MODELS:`);
    workingModels.forEach(model => console.log(`  - ${model}`));
    console.log(`\n💡 Update your config to use: ${workingModels[0]}`);
  } else {
    console.log(`\n❌ NO WORKING MODELS FOUND`);
    console.log(`\n🔧 TROUBLESHOOTING STEPS:`);
    console.log(`1. Check your Perplexity account at https://www.perplexity.ai/settings/api`);
    console.log(`2. Verify your API key is active and has credits`);
    console.log(`3. Make sure your account has API access enabled`);
    console.log(`4. Try regenerating your API key`);
  }
}

testAllModels();