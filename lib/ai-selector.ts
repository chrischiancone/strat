/**
 * Smart AI Selection Utility
 * 
 * Automatically selects the best AI provider based on task type:
 * - Claude: Executive summaries, strategic analysis, formal documents
 * - Perplexity: Research tasks, market data, current information
 */

export interface AIConfig {
  provider: 'claude' | 'perplexity';
  model: string;
  apiKey: string;
  baseUrl?: string;
}

export interface AIRequest {
  prompt: string;
  taskType: 'executive-summary' | 'research' | 'analysis' | 'general';
  maxTokens?: number;
  temperature?: number;
}

export interface AIResponse {
  content: string;
  provider: string;
  model: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
}

class AISelector {
  private claudeConfig: AIConfig;
  private perplexityConfig: AIConfig;

  constructor() {
    // Claude configuration
    this.claudeConfig = {
      provider: 'claude',
      model: process.env.CLAUDE_MODEL || 'claude-3-sonnet-20240229',
      apiKey: process.env.CLAUDE_API_KEY || '',
      baseUrl: 'https://api.anthropic.com/v1'
    };

    // Perplexity configuration
    this.perplexityConfig = {
      provider: 'perplexity',
      model: process.env.PPLX_MODEL || 'sonar',
      apiKey: process.env.PPLX_API_KEY || '',
      baseUrl: 'https://api.perplexity.ai'
    };
  }

  /**
   * Selects the appropriate AI provider based on task type
   */
  selectProvider(taskType: string): AIConfig {
    switch (taskType) {
      case 'executive-summary':
      case 'strategic-analysis':
      case 'formal-document':
      case 'synthesis':
        return this.claudeConfig;
      
      case 'research':
      case 'market-data':
      case 'current-events':
      case 'competitive-analysis':
        return this.perplexityConfig;
      
      default:
        // Default to Claude for general tasks
        return this.claudeConfig;
    }
  }

  /**
   * Makes an API request to Claude
   */
  private async callClaude(prompt: string, options: Partial<AIRequest> = {}): Promise<AIResponse> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.claudeConfig.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: this.claudeConfig.model,
        max_tokens: options.maxTokens || 4000,
        temperature: options.temperature || 0.7,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return {
      content: data.content[0].text,
      provider: 'claude',
      model: this.claudeConfig.model,
      usage: {
        promptTokens: data.usage?.input_tokens,
        completionTokens: data.usage?.output_tokens,
        totalTokens: data.usage?.input_tokens + data.usage?.output_tokens
      }
    };
  }

  /**
   * Makes an API request to Perplexity
   */
  private async callPerplexity(prompt: string, options: Partial<AIRequest> = {}): Promise<AIResponse> {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.perplexityConfig.apiKey}`
      },
      body: JSON.stringify({
        model: this.perplexityConfig.model,
        max_tokens: options.maxTokens || 4000,
        temperature: options.temperature || 0.7,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return {
      content: data.choices[0].message.content,
      provider: 'perplexity',
      model: this.perplexityConfig.model,
      usage: {
        promptTokens: data.usage?.prompt_tokens,
        completionTokens: data.usage?.completion_tokens,
        totalTokens: data.usage?.total_tokens
      }
    };
  }

  /**
   * Main method to generate AI response with automatic provider selection
   */
  async generate(request: AIRequest): Promise<AIResponse> {
    const config = this.selectProvider(request.taskType);
    
    console.log(`🤖 Using ${config.provider} for ${request.taskType} task`);

    try {
      if (config.provider === 'claude') {
        return await this.callClaude(request.prompt, request);
      } else {
        return await this.callPerplexity(request.prompt, request);
      }
    } catch (error) {
      console.error(`Error with ${config.provider}:`, error);
      throw error;
    }
  }

  /**
   * Convenience method for executive summaries (uses Claude)
   */
  async generateExecutiveSummary(content: string, context?: string): Promise<AIResponse> {
    const prompt = `Create a professional executive summary for the following content${context ? ` in the context of ${context}` : ''}:

${content}

**FORMATTING REQUIREMENTS:**
- Format your response using proper Markdown syntax
- Use ## for main section headers (e.g., ## Executive Summary, ## Strategic Overview)
- Use ### for subsection headers where appropriate
- Use **bold text** for emphasis on key points, metrics, and important statements
- Use bullet points (-) for lists of items
- Use > blockquotes for mission statements, key quotes, or critical highlights
- Ensure proper paragraph breaks and spacing for readability
- Include horizontal rules (---) to separate major sections when appropriate

**CONTENT REQUIREMENTS:**
Please provide a comprehensive executive summary that:
- **Highlights key strategic points** with specific data and metrics
- Uses clear, **business-appropriate language** suitable for municipal leadership
- **Focuses on strategic implications** and measurable outcomes
- Is suitable for **senior leadership and elected officials** review
- Demonstrates clear **value proposition and ROI**
- Includes specific **implementation timeline and investment details**

**RESPONSE FORMAT:** Return ONLY the Markdown-formatted executive summary. Do not include any preamble or explanations.`;

    return this.generate({
      prompt,
      taskType: 'executive-summary',
      temperature: 0.3, // Lower temperature for more focused, professional output
      maxTokens: 2000 // Allow for longer, more comprehensive summaries
    });
  }

  /**
   * Convenience method for research tasks (uses Perplexity)
   */
  async conductResearch(query: string, focus?: string): Promise<AIResponse> {
    const prompt = `Research the following topic and provide comprehensive, current information:

${query}

${focus ? `Please focus specifically on: ${focus}` : ''}

Provide:
- Current market data and trends
- Key statistics and figures
- Recent developments or changes
- Relevant industry insights
- Credible sources and references`;

    return this.generate({
      prompt,
      taskType: 'research',
      temperature: 0.5 // Moderate temperature for balanced research output
    });
  }
}

// Export singleton instance
export const aiSelector = new AISelector();

// Export convenience functions
export const generateExecutiveSummary = (content: string, context?: string) => 
  aiSelector.generateExecutiveSummary(content, context);

export const conductResearch = (query: string, focus?: string) => 
  aiSelector.conductResearch(query, focus);

export default aiSelector;