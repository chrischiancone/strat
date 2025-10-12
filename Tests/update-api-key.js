const fs = require('fs');
const path = require('path');

console.log('🔑 PERPLEXITY API KEY UPDATER\n');

// Read current .env.local
const envPath = path.join(process.cwd(), '.env.local');
let envContent = fs.readFileSync(envPath, 'utf8');

console.log('Please paste your NEW Perplexity API key below:');
console.log('(It should start with "pplx-")');

// Note: In a real interactive script, you'd use readline
// For now, we'll show instructions
console.log('\n📝 INSTRUCTIONS:');
console.log('1. Copy your new API key from https://www.perplexity.ai/settings/api');
console.log('2. Replace "YOUR_NEW_API_KEY_HERE" in the .env.local file');
console.log('3. Run: node test-new-key.js');

console.log('\n🔧 MANUAL UPDATE:');
console.log('Edit .env.local file and replace:');
console.log('PPLX_API_KEY=YOUR_NEW_API_KEY_HERE');
console.log('with:');
console.log('PPLX_API_KEY=your_actual_new_key_here');

console.log('\n⚡ QUICK COMMAND:');
console.log('Or run this command (replace with your actual key):');
console.log('sed -i "" "s/YOUR_NEW_API_KEY_HERE/pplx-your-actual-key-here/" .env.local');