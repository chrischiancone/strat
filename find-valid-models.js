require('dotenv').config({ path: '.env.local' });

const apiKey = process.env.PPLX_API_KEY;

// Current models based on Perplexity documentation
const MODELS_TO_TEST = [
  'llama-3.1-sonar-small-128k-online',
  'llama-3.1-sonar-large-128k-online', 
  'llama-3.1-sonar-huge-128k-online',
  'llama-3.1-sonar-small-128k-chat',
  'llama-3.1-sonar-large-128k-chat',
  'llama-3.1-8b-instruct',
  'llama-3.1-70b-instruct',
  'mixtral-8x7b-instruct',
  'sonar-small-chat',
  'sonar-medium-chat', 
  'sonar-small-online',
  'sonar-medium-online'
];

async function testModel(model) {
  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: 'user', content: 'Hi' }],
        max_tokens: 5
      })
    });

    const text = await response.text();
    
    if (response.ok) {
      const data = JSON.parse(text);
      console.log(`✅ ${model} - Working: "${data.choices?.[0]?.message?.content}"`);
      return true;
    } else if (response.status === 400) {
      const error = JSON.parse(text);
      if (error.error?.message?.includes('Invalid model')) {
        console.log(`❌ ${model} - Invalid model name`);
      } else {
        console.log(`⚠️  ${model} - Error: ${error.error?.message}`);
      }
      return false;
    } else {
      console.log(`❌ ${model} - Status ${response.status}: ${text.slice(0, 100)}`);
      return false;
    }
  } catch (error) {
    console.log(`💥 ${model} - Error: ${error.message}`);
    return false;
  }
}

async function findValidModels() {
  console.log('🔍 Finding valid Perplexity models...\n');
  
  const workingModels = [];
  
  for (const model of MODELS_TO_TEST) {
    const works = await testModel(model);
    if (works) {
      workingModels.push(model);
    }
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n📊 SUMMARY:');
  if (workingModels.length > 0) {
    console.log(`✅ Working models found: ${workingModels.length}`);
    console.log('\n🎯 RECOMMENDED MODEL:');
    console.log(`Use: ${workingModels[0]}`);
    console.log('\n📝 Update your .env.local:');
    console.log(`PPLX_MODEL=${workingModels[0]}`);
  } else {
    console.log('❌ No working models found');
  }
}

findValidModels();