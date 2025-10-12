require('dotenv').config({ path: '.env.local' });

const apiKey = process.env.PPLX_API_KEY;

// Updated model names for 2024/2025
const MODELS_TO_TEST = [
  // Sonar models (current naming)
  'llama-3.1-sonar-small-128k-online',
  'llama-3.1-sonar-large-128k-online',
  'llama-3.1-sonar-small-128k-chat',
  'llama-3.1-sonar-large-128k-chat',
  
  // Simplified naming
  'sonar-small-online',
  'sonar-medium-online',
  'sonar-small-chat', 
  'sonar-medium-chat',
  
  // Base models
  'llama-3.1-8b-instruct',
  'llama-3.1-70b-instruct',
  'mixtral-8x7b-instruct',
  
  // Very latest naming patterns
  'pplx-7b-online',
  'pplx-70b-online',
  'pplx-7b-chat',
  'pplx-70b-chat'
];

async function testSingleModel(modelName) {
  console.log(`Testing: ${modelName}`);
  
  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: modelName,
        messages: [{ role: 'user', content: 'Say hello' }],
        max_tokens: 10
      })
    });

    const text = await response.text();
    
    if (response.ok) {
      const data = JSON.parse(text);
      console.log(`✅ SUCCESS: ${modelName}`);
      console.log(`Response: "${data.choices?.[0]?.message?.content}"`);
      return modelName;
    } else {
      console.log(`❌ FAILED: ${modelName} - Status ${response.status}`);
      if (response.status === 400) {
        const error = JSON.parse(text);
        console.log(`Error: ${error.error?.message}`);
      }
      return null;
    }
  } catch (error) {
    console.log(`💥 ERROR: ${modelName} - ${error.message}`);
    return null;
  }
}

async function findWorkingModel() {
  console.log('🎯 Testing one model at a time to find what works...\n');
  
  // Test the most common model first
  const workingModel = await testSingleModel('llama-3.1-sonar-small-128k-online');
  
  if (workingModel) {
    console.log(`\n🎉 Found working model: ${workingModel}`);
    return workingModel;
  }
  
  // If that doesn't work, try a few more common ones
  const commonModels = [
    'sonar-small-online',
    'llama-3.1-8b-instruct',
    'pplx-7b-online'
  ];
  
  for (const model of commonModels) {
    console.log('\n' + '='.repeat(50));
    const result = await testSingleModel(model);
    if (result) {
      console.log(`\n🎉 Found working model: ${result}`);
      return result;
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n❌ Could not find any working model');
  console.log('💡 Check https://docs.perplexity.ai/reference/post_chat_completions for current model names');
  return null;
}

findWorkingModel();