require('dotenv').config({ path: '.env.local' });

const apiKey = process.env.PPLX_API_KEY;

// Latest model names as of late 2024
const LATEST_MODELS = [
  // Current Sonar models
  'llama-3.1-sonar-small-128k-online',
  'llama-3.1-sonar-large-128k-online',
  'llama-3.1-sonar-small-128k-chat',
  'llama-3.1-sonar-large-128k-chat',
  
  // Newer naming conventions
  'sonar-small-online',
  'sonar-medium-online', 
  'sonar-large-online',
  'sonar-small-chat',
  'sonar-medium-chat',
  'sonar-large-chat',
  
  // Base LLaMA models
  'llama-3.1-8b-instruct',
  'llama-3.1-70b-instruct',
  
  // Claude models (if available)
  'claude-3-haiku',
  'claude-3-sonnet',
  
  // GPT models (if available)  
  'gpt-4-turbo',
  'gpt-4o',
  'gpt-3.5-turbo',
  
  // Mixtral
  'mixtral-8x7b-instruct',
  'mixtral-8x22b-instruct',
  
  // Alternative naming
  'pplx-7b-online',
  'pplx-70b-online',
  'pplx-7b-chat',
  'pplx-70b-chat'
];

async function testModelQuickly(modelName) {
  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: modelName,
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 5
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`✅ ${modelName} - WORKS!`);
      console.log(`   Response: "${data.choices?.[0]?.message?.content}"`);
      return modelName;
    } else if (response.status === 400) {
      const error = await response.json();
      if (error.error?.message?.includes('Invalid model')) {
        console.log(`❌ ${modelName} - Invalid`);
      } else {
        console.log(`⚠️  ${modelName} - Error: ${error.error?.message}`);
      }
    } else {
      console.log(`❌ ${modelName} - Status ${response.status}`);
    }
    return null;
  } catch (error) {
    console.log(`💥 ${modelName} - Error: ${error.message}`);
    return null;
  }
}

async function findFirstWorkingModel() {
  console.log('🚀 Quickly testing all possible model names...\n');
  
  for (const model of LATEST_MODELS) {
    const result = await testModelQuickly(model);
    if (result) {
      console.log(`\n🎉 FOUND WORKING MODEL: ${result}`);
      console.log(`\n📝 Update your .env.local with:`);
      console.log(`PPLX_MODEL=${result}`);
      return result;
    }
    
    // Quick delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  console.log('\n❌ No working models found in our list');
  console.log('💡 The model names may have changed recently');
  console.log('📖 Check: https://docs.perplexity.ai/docs/model-cards');
}

findFirstWorkingModel();