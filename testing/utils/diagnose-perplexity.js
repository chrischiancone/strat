require('dotenv').config({ path: '.env.local' });

console.log('🔍 PERPLEXITY API DIAGNOSTIC TOOL\n');

// Check 1: API Key Format
const apiKey = process.env.PPLX_API_KEY;
console.log('1️⃣  API KEY CHECK:');
if (!apiKey) {
  console.log('❌ No API key found in .env.local');
  process.exit(1);
}

console.log(`✅ API key found: ${apiKey.slice(0, 10)}...${apiKey.slice(-5)}`);
console.log(`📏 Length: ${apiKey.length} characters`);
console.log(`🔤 Format: ${apiKey.startsWith('pplx-') ? 'Correct (pplx- prefix)' : 'Incorrect (should start with pplx-)'}`);

// Check 2: Account Status via API
console.log('\n2️⃣  API CONNECTIVITY TEST:');

async function testApiConnectivity() {
  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 5
      })
    });

    const text = await response.text();
    
    console.log(`📡 Response Status: ${response.status}`);
    console.log(`📋 Content-Type: ${response.headers.get('content-type')}`);
    
    if (response.status === 401) {
      console.log('\n❌ 401 UNAUTHORIZED - POSSIBLE CAUSES:');
      console.log('   • API key is invalid or expired');
      console.log('   • No Perplexity Pro subscription ($20/month required)');
      console.log('   • API access not enabled on account');
      console.log('   • Billing issues or no credits');
      
      console.log('\n🔧 SOLUTIONS TO TRY:');
      console.log('   1. Go to https://www.perplexity.ai/settings/api');
      console.log('   2. Delete current API key and create a new one');
      console.log('   3. Verify you have Perplexity Pro subscription');
      console.log('   4. Check billing and add credits if needed');
      console.log('   5. Contact Perplexity support if issues persist');
      
    } else if (response.status === 429) {
      console.log('\n⏳ 429 RATE LIMIT - You\'re making requests too quickly');
      
    } else if (response.status === 400) {
      console.log('\n🚫 400 BAD REQUEST - Check model name or request format');
      console.log(`Response: ${text.slice(0, 300)}`);
      
    } else if (response.ok) {
      console.log('\n✅ SUCCESS! API key is working correctly');
      try {
        const data = JSON.parse(text);
        console.log(`📝 Response: ${data.choices?.[0]?.message?.content || 'No content'}`);
      } catch (e) {
        console.log(`📄 Raw response: ${text.slice(0, 200)}`);
      }
      
    } else {
      console.log(`\n❓ Unexpected status ${response.status}`);
      console.log(`Response: ${text.slice(0, 300)}`);
    }
    
  } catch (error) {
    console.log(`\n💥 Network Error: ${error.message}`);
    console.log('This might be a connectivity issue or DNS problem');
  }
}

// Check 3: Environment Loading
console.log('\n3️⃣  ENVIRONMENT CHECK:');
console.log(`📁 Working Directory: ${process.cwd()}`);
console.log(`📄 .env.local exists: ${require('fs').existsSync('.env.local') ? 'Yes' : 'No'}`);

testApiConnectivity().then(() => {
  console.log('\n🏁 Diagnostic complete!');
}).catch(console.error);