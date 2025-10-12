require('dotenv').config({ path: '.env.local' });

console.log('🧪 TESTING NEW PERPLEXITY API KEY\n');

const apiKey = process.env.PPLX_API_KEY;
const model = process.env.PPLX_MODEL || 'llama-3.1-sonar-small-128k-online';

if (!apiKey || apiKey === 'YOUR_NEW_API_KEY_HERE') {
  console.log('❌ Please update your API key in .env.local first!');
  console.log('Run: nano .env.local');
  console.log('Replace: PPLX_API_KEY=YOUR_NEW_API_KEY_HERE');
  console.log('With: PPLX_API_KEY=your_actual_key');
  process.exit(1);
}

console.log(`✅ Testing API key: ${apiKey.slice(0, 10)}...${apiKey.slice(-5)}`);
console.log(`🤖 Using model: ${model}`);

async function testNewKey() {
  try {
    console.log('\n📡 Making test request...');
    
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: 'Say "Hello, API is working!" in exactly 5 words.' }
        ],
        max_tokens: 20
      })
    });

    const text = await response.text();
    console.log(`📊 Status: ${response.status}`);
    console.log(`📋 Content-Type: ${response.headers.get('content-type')}`);
    
    if (response.ok) {
      console.log('\n🎉 SUCCESS! Your new API key is working!');
      try {
        const data = JSON.parse(text);
        console.log(`💬 Response: "${data.choices?.[0]?.message?.content}"`);
        console.log('\n✅ You can now use the AI research features!');
        
        // Test different models
        console.log('\n🔄 Testing different models...');
        await testModel('llama-3.1-sonar-large-128k-online');
        await testModel('llama-3.1-sonar-small-128k-chat');
        
      } catch (e) {
        console.log(`📄 Raw response: ${text}`);
      }
    } else {
      console.log(`\n❌ API call failed with status ${response.status}`);
      console.log(`Response: ${text.slice(0, 300)}`);
      
      if (response.status === 401) {
        console.log('\n🚨 Still getting 401 errors. Try:');
        console.log('1. Double-check you copied the key correctly');
        console.log('2. Make sure there are no extra spaces');
        console.log('3. Generate a completely new key');
        console.log('4. Contact Perplexity support');
      }
    }
    
  } catch (error) {
    console.log(`\n💥 Error: ${error.message}`);
  }
}

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
      console.log(`  ✅ ${modelName} - Working`);
    } else {
      console.log(`  ❌ ${modelName} - Status ${response.status}`);
    }
  } catch (e) {
    console.log(`  ⚠️  ${modelName} - Error: ${e.message}`);
  }
}

testNewKey();