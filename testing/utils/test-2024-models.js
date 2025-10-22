require('dotenv').config({ path: '.env.local' });

const apiKey = process.env.PPLX_API_KEY;

// Brand new models (Oct 2024+)
const BRAND_NEW_MODELS = [
  // Latest Sonar models (updated naming)
  'llama-3.1-sonar-small-128k-online',
  'llama-3.1-sonar-large-128k-online',
  'llama-3.1-sonar-small-128k-chat',
  'llama-3.1-sonar-large-128k-chat',
  'llama-3.1-sonar-huge-128k-online',
  
  // Possible new simplified names
  'sonar',
  'sonar-online',
  'sonar-chat',
  
  // Try without version numbers
  'llama-sonar-small-online',
  'llama-sonar-large-online',
  'llama-sonar-small-chat',
  'llama-sonar-large-chat',
  
  // Brand new possible names
  'pplx-small-online',
  'pplx-large-online',
  'pplx-small-chat',
  'pplx-large-chat',
  
  // Basic model names
  'small-online',
  'large-online',
  'small-chat',
  'large-chat',
  
  // Minimal names
  'online',
  'chat'
];

async function testModel(modelName) {
  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: modelName,
        messages: [{ role: 'user', content: 'Hi' }],
        max_tokens: 5
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`🎉 SUCCESS: "${modelName}" WORKS!`);
      console.log(`   Response: "${data.choices?.[0]?.message?.content}"`);
      return modelName;
    } else {
      console.log(`❌ ${modelName} - Failed`);
    }
    return null;
  } catch (error) {
    console.log(`💥 ${modelName} - Error: ${error.message}`);
    return null;
  }
}

async function testNewModels() {
  console.log('🔬 Testing brand new 2024 model names...\n');
  
  const workingModels = [];
  
  for (let i = 0; i < BRAND_NEW_MODELS.length; i++) {
    const model = BRAND_NEW_MODELS[i];
    process.stdout.write(`${i + 1}/${BRAND_NEW_MODELS.length}: Testing "${model}"... `);
    
    const result = await testModel(model);
    if (result) {
      workingModels.push(result);
      console.log(`\n✅ FOUND ONE! Breaking to save API calls.`);
      break;
    }
    
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  if (workingModels.length > 0) {
    console.log(`\n🎯 WORKING MODEL: ${workingModels[0]}`);
    console.log(`\n📝 ADD TO YOUR .env.local:`);
    console.log(`PPLX_MODEL=${workingModels[0]}`);
  } else {
    console.log('\n🤔 Still no luck. Let me try to make a request without specifying a model...');
    
    // Try without model parameter (use default)
    try {
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'Hi' }],
          max_tokens: 5
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ SUCCESS with NO MODEL specified!`);
        console.log(`Response: "${data.choices?.[0]?.message?.content}"`);
        console.log(`\n📝 UPDATE CONFIG TO USE DEFAULT MODEL`);
      } else {
        const error = await response.text();
        console.log(`❌ Even default failed: ${error.slice(0, 200)}`);
      }
    } catch (error) {
      console.log(`💥 Default request failed: ${error.message}`);
    }
  }
}

testNewModels();