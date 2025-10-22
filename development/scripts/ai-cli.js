#!/usr/bin/env node

/**
 * Smart AI Selection CLI
 * 
 * Usage:
 *   node scripts/ai-cli.js summary "Your content here"
 *   node scripts/ai-cli.js research "Your research query"
 *   node scripts/ai-cli.js test
 */

require('dotenv').config({ path: '.env.local' });

class AICli {
  constructor() {
    this.claudeApiKey = process.env.CLAUDE_API_KEY;
    this.perplexityApiKey = process.env.PPLX_API_KEY;
    this.claudeModel = process.env.CLAUDE_MODEL || 'claude-3-sonnet-20240229';
    this.perplexityModel = process.env.PPLX_MODEL || 'sonar';
  }

  async callClaude(prompt) {
    console.log('🧠 Using Claude for executive summary...');
    
    if (!this.claudeApiKey || this.claudeApiKey.includes('{{')) {
      throw new Error('Claude API key not properly configured. Please update .env.local');
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.claudeApiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: this.claudeModel,
        max_tokens: 2000,
        temperature: 0.3,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Claude API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return {
      content: data.content[0].text,
      provider: 'claude',
      usage: data.usage
    };
  }

  async callPerplexity(prompt) {
    console.log('🔍 Using Perplexity for research...');
    
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.perplexityApiKey}`
      },
      body: JSON.stringify({
        model: this.perplexityModel,
        max_tokens: 2000,
        temperature: 0.5,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Perplexity API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return {
      content: data.choices[0].message.content,
      provider: 'perplexity',
      usage: data.usage
    };
  }

  async generateExecutiveSummary(content) {
    const prompt = `Create a professional executive summary for the following content:

${content}

Please provide a concise executive summary that:
- Highlights key strategic points
- Uses business-appropriate language
- Focuses on actionable insights
- Is suitable for senior leadership review
- Is no more than 3-4 paragraphs`;

    return await this.callClaude(prompt);
  }

  async conductResearch(query) {
    const prompt = `Research the following topic and provide comprehensive, current information:

${query}

Please provide:
- Current market data and trends
- Key statistics and recent figures
- Recent developments or changes
- Relevant industry insights
- Credible sources and references
- Strategic implications for business planning`;

    return await this.callPerplexity(prompt);
  }

  async testConnections() {
    console.log('🧪 Testing AI provider connections...\n');

    // Test Claude
    try {
      console.log('Testing Claude connection...');
      const claudeResult = await this.callClaude('Hello, this is a test. Please respond with "Claude is working correctly."');
      console.log('✅ Claude: Connected successfully');
      console.log(`   Model: ${this.claudeModel}`);
      console.log(`   Usage: ${JSON.stringify(claudeResult.usage)}\n`);
    } catch (error) {
      console.log('❌ Claude: Connection failed');
      console.log(`   Error: ${error.message}\n`);
    }

    // Test Perplexity
    try {
      console.log('Testing Perplexity connection...');
      const perplexityResult = await this.callPerplexity('Hello, this is a test. Please respond with "Perplexity is working correctly."');
      console.log('✅ Perplexity: Connected successfully');
      console.log(`   Model: ${this.perplexityModel}`);
      if (perplexityResult.usage) {
        console.log(`   Usage: ${JSON.stringify(perplexityResult.usage)}`);
      }
    } catch (error) {
      console.log('❌ Perplexity: Connection failed');
      console.log(`   Error: ${error.message}`);
    }
  }

  printUsage() {
    console.log(`
🤖 Smart AI Selection CLI

Usage:
  node scripts/ai-cli.js test                    # Test both providers
  node scripts/ai-cli.js summary "content"       # Generate executive summary (Claude)
  node scripts/ai-cli.js research "query"        # Conduct research (Perplexity)

Examples:
  node scripts/ai-cli.js summary "Q3 sales increased by 15% due to new product launch..."
  node scripts/ai-cli.js research "AI trends in strategic planning 2024"
  
Environment Variables Required:
  CLAUDE_API_KEY     - Your Claude API key
  PPLX_API_KEY       - Your Perplexity API key (already configured)
`);
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const input = args[1];

  const cli = new AICli();

  try {
    switch (command) {
      case 'test':
        await cli.testConnections();
        break;

      case 'summary':
        if (!input) {
          console.log('❌ Please provide content for the executive summary');
          cli.printUsage();
          process.exit(1);
        }
        console.log('Generating executive summary...\n');
        const summaryResult = await cli.generateExecutiveSummary(input);
        console.log('📄 Executive Summary (Claude):\n');
        console.log(summaryResult.content);
        console.log(`\n💰 Usage: ${JSON.stringify(summaryResult.usage)}`);
        break;

      case 'research':
        if (!input) {
          console.log('❌ Please provide a research query');
          cli.printUsage();
          process.exit(1);
        }
        console.log('Conducting research...\n');
        const researchResult = await cli.conductResearch(input);
        console.log('🔬 Research Results (Perplexity):\n');
        console.log(researchResult.content);
        if (researchResult.usage) {
          console.log(`\n💰 Usage: ${JSON.stringify(researchResult.usage)}`);
        }
        break;

      default:
        cli.printUsage();
        break;
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  main();
}