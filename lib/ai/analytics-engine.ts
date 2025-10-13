/**
 * AI-Powered Analytics Engine
 * Provides intelligent insights, trend analysis, and predictive capabilities
 * for municipal strategic planning
 */

import { logger } from '../logger'
import { createError } from '../errorHandler'

// Types for AI Analytics
export interface AnalyticsInsight {
  id: string
  type: 'trend' | 'prediction' | 'recommendation' | 'alert' | 'opportunity'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  confidence: number // 0-100
  data: Record<string, unknown>
  recommendations: string[]
  createdAt: Date
  validUntil?: Date
}

export interface PlanAnalysis {
  planId: string
  overallScore: number // 0-100
  strengths: string[]
  weaknesses: string[]
  risks: AnalyticsInsight[]
  opportunities: AnalyticsInsight[]
  insights: AnalyticsInsight[]
}

export interface TrendAnalysis {
  metric: string
  timeframe: 'monthly' | 'quarterly' | 'yearly'
  trend: 'increasing' | 'decreasing' | 'stable' | 'volatile'
  changeRate: number // percentage
  data: Array<{ date: string; value: number }>
  forecast?: Array<{ date: string; predicted: number; confidence: number }>
}

export interface PredictiveAnalysis {
  scenario: string
  probability: number // 0-100
  impact: 'low' | 'medium' | 'high'
  timeframe: string
  factors: string[]
  recommendations: string[]
}

// AI Analytics Engine Class
export class AIAnalyticsEngine {
  private static instance: AIAnalyticsEngine
  private readonly apiKey: string
  private readonly baseUrl: string

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || ''
    this.baseUrl = 'https://api.openai.com/v1'
    
    if (!this.apiKey) {
      logger.warn('OpenAI API key not configured - AI features will use mock data')
    }
  }

  static getInstance(): AIAnalyticsEngine {
    if (!AIAnalyticsEngine.instance) {
      AIAnalyticsEngine.instance = new AIAnalyticsEngine()
    }
    return AIAnalyticsEngine.instance
  }

  // Analyze a strategic plan and provide insights
  async analyzePlan(planData: {
    id: string
    title: string
    description: string
    goals: Array<{
      id: string
      title: string
      description: string
      targetDate: string
      status: string
      initiatives: Array<{
        title: string
        description: string
        budget: number
        timeline: string
        status: string
      }>
    }>
    budget: {
      total: number
      allocated: number
      spent: number
    }
    timeline: {
      startDate: string
      endDate: string
    }
  }): Promise<PlanAnalysis> {
    try {
      logger.info('Analyzing strategic plan', { planId: planData.id })

      if (!this.apiKey) {
        return this.generateMockPlanAnalysis(planData)
      }

      const prompt = this.buildPlanAnalysisPrompt(planData)
      const analysis = await this.callOpenAI(prompt, 'plan-analysis')

      const parsedAnalysis = this.parsePlanAnalysis(analysis, planData.id)
      
      logger.info('Plan analysis completed', { 
        planId: planData.id, 
        score: parsedAnalysis.overallScore 
      })

      return parsedAnalysis

    } catch (error) {
      logger.error('Plan analysis failed', { error, planId: planData.id })
      throw createError.server('Failed to analyze plan')
    }
  }

  // Generate trend analysis for metrics
  async analyzeTrends(metrics: Array<{
    name: string
    timeframe: 'monthly' | 'quarterly' | 'yearly'
    data: Array<{ date: string; value: number }>
  }>): Promise<TrendAnalysis[]> {
    try {
      logger.info('Analyzing trends', { metricsCount: metrics.length })

      const analyses: TrendAnalysis[] = []

      for (const metric of metrics) {
        const analysis = await this.analyzeSingleTrend(metric)
        analyses.push(analysis)
      }

      logger.info('Trend analysis completed', { trendsAnalyzed: analyses.length })
      return analyses

    } catch (error) {
      logger.error('Trend analysis failed', { error })
      throw createError.server('Failed to analyze trends')
    }
  }

  // Generate predictive insights
  async generatePredictions(context: {
    planId: string
    currentProgress: number
    remainingTime: number
    budgetUtilization: number
    teamSize: number
    externalFactors: string[]
  }): Promise<PredictiveAnalysis[]> {
    try {
      logger.info('Generating predictions', { planId: context.planId })

      if (!this.apiKey) {
        return this.generateMockPredictions(context)
      }

      const prompt = this.buildPredictionPrompt(context)
      const predictions = await this.callOpenAI(prompt, 'predictions')

      const parsedPredictions = this.parsePredictions(predictions)
      
      logger.info('Predictions generated', { 
        planId: context.planId, 
        predictionsCount: parsedPredictions.length 
      })

      return parsedPredictions

    } catch (error) {
      logger.error('Prediction generation failed', { error, planId: context.planId })
      throw createError.server('Failed to generate predictions')
    }
  }

  // Generate smart recommendations
  async generateRecommendations(context: {
    planData: Record<string, unknown>
    currentChallenges: string[]
    availableResources: Record<string, unknown>
    constraints: string[]
  }): Promise<AnalyticsInsight[]> {
    try {
      logger.info('Generating recommendations')

      if (!this.apiKey) {
        return this.generateMockRecommendations(context)
      }

      const prompt = this.buildRecommendationPrompt(context)
      const recommendations = await this.callOpenAI(prompt, 'recommendations')

      const parsedRecommendations = this.parseRecommendations(recommendations)
      
      logger.info('Recommendations generated', { 
        recommendationsCount: parsedRecommendations.length 
      })

      return parsedRecommendations

    } catch (error) {
      logger.error('Recommendation generation failed', { error })
      throw createError.server('Failed to generate recommendations')
    }
  }

  // Analyze single trend
  private async analyzeSingleTrend(metric: {
    name: string
    timeframe: 'monthly' | 'quarterly' | 'yearly'
    data: Array<{ date: string; value: number }>
  }): Promise<TrendAnalysis> {
    // Calculate trend direction and change rate
    const values = metric.data.map(d => d.value)
    const firstValue = values[0]
    const lastValue = values[values.length - 1]
    const changeRate = ((lastValue - firstValue) / firstValue) * 100

    // Determine trend direction
    let trend: 'increasing' | 'decreasing' | 'stable' | 'volatile'
    if (Math.abs(changeRate) < 5) {
      trend = 'stable'
    } else if (changeRate > 0) {
      trend = 'increasing'
    } else {
      trend = 'decreasing'
    }

    // Check for volatility
    const variance = this.calculateVariance(values)
    if (variance > values.reduce((a, b) => a + b) / values.length * 0.3) {
      trend = 'volatile'
    }

    // Generate forecast (simple linear regression for demo)
    const forecast = this.generateSimpleForecast(metric.data, 6) // 6 periods ahead

    return {
      metric: metric.name,
      timeframe: metric.timeframe,
      trend,
      changeRate,
      data: metric.data,
      forecast,
    }
  }

  // OpenAI API call
  private async callOpenAI(prompt: string, type: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured')
    }

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert municipal planning analyst. Provide insights in structured JSON format.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data.choices[0]?.message?.content || ''
  }

  // Build prompts for different analysis types
  private buildPlanAnalysisPrompt(planData: Record<string, unknown>): string {
    return `
Analyze this municipal strategic plan and provide insights in JSON format:

Plan Data:
${JSON.stringify(planData, null, 2)}

Please analyze and return a JSON object with:
- overallScore (0-100)
- strengths (array of strings)
- weaknesses (array of strings)
- risks (array with type, severity, title, description, confidence)
- opportunities (array with type, severity, title, description, confidence)
- insights (array with type, severity, title, description, confidence)

Focus on budget allocation efficiency, timeline feasibility, resource allocation, and strategic alignment.
`
  }

  private buildPredictionPrompt(context: Record<string, unknown>): string {
    return `
Based on this project context, generate predictions for potential scenarios:

Context:
${JSON.stringify(context, null, 2)}

Return a JSON array of predictions with:
- scenario (string)
- probability (0-100)
- impact ('low'|'medium'|'high')
- timeframe (string)
- factors (array of strings)
- recommendations (array of strings)

Consider budget overruns, timeline delays, resource constraints, and external factors.
`
  }

  private buildRecommendationPrompt(context: Record<string, unknown>): string {
    return `
Generate smart recommendations based on this context:

${JSON.stringify(context, null, 2)}

Return a JSON array of recommendations with:
- type ('recommendation')
- severity ('low'|'medium'|'high')
- title (string)
- description (string)
- confidence (0-100)
- recommendations (array of specific action items)

Focus on actionable improvements for efficiency, risk mitigation, and success optimization.
`
  }

  // Parsing methods for AI responses
  private parsePlanAnalysis(response: string, planId: string): PlanAnalysis {
    try {
      const parsed = JSON.parse(response)
      return {
        planId,
        overallScore: parsed.overallScore || 75,
        strengths: parsed.strengths || [],
        weaknesses: parsed.weaknesses || [],
        risks: (parsed.risks || []).map((r: any) => this.createInsight(r, 'alert')),
        opportunities: (parsed.opportunities || []).map((o: any) => this.createInsight(o, 'opportunity')),
        insights: (parsed.insights || []).map((i: any) => this.createInsight(i, 'recommendation')),
      }
    } catch {
      return this.generateMockPlanAnalysis({ id: planId })
    }
  }

  private parsePredictions(response: string): PredictiveAnalysis[] {
    try {
      return JSON.parse(response)
    } catch {
      return []
    }
  }

  private parseRecommendations(response: string): AnalyticsInsight[] {
    try {
      const parsed = JSON.parse(response)
      return parsed.map((r: any) => this.createInsight(r, 'recommendation'))
    } catch {
      return []
    }
  }

  // Helper methods
  private createInsight(data: any, type: AnalyticsInsight['type']): AnalyticsInsight {
    return {
      id: crypto.randomUUID(),
      type,
      severity: data.severity || 'medium',
      title: data.title || 'Insight',
      description: data.description || '',
      confidence: data.confidence || 75,
      data: data.data || {},
      recommendations: data.recommendations || [],
      createdAt: new Date(),
    }
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((a, b) => a + b) / values.length
    const squaredDiffs = values.map(value => Math.pow(value - mean, 2))
    return squaredDiffs.reduce((a, b) => a + b) / values.length
  }

  private generateSimpleForecast(
    data: Array<{ date: string; value: number }>, 
    periods: number
  ): Array<{ date: string; predicted: number; confidence: number }> {
    const values = data.map(d => d.value)
    const trend = values.length > 1 ? (values[values.length - 1] - values[0]) / (values.length - 1) : 0
    
    const forecast: Array<{ date: string; predicted: number; confidence: number }> = []
    const lastDate = new Date(data[data.length - 1].date)
    const lastValue = values[values.length - 1]

    for (let i = 1; i <= periods; i++) {
      const futureDate = new Date(lastDate)
      futureDate.setMonth(futureDate.getMonth() + i)
      
      forecast.push({
        date: futureDate.toISOString().split('T')[0],
        predicted: lastValue + (trend * i),
        confidence: Math.max(60 - (i * 5), 30), // Decreasing confidence over time
      })
    }

    return forecast
  }

  // Mock data generators for when OpenAI API is not available
  private generateMockPlanAnalysis(planData: any): PlanAnalysis {
    return {
      planId: planData.id,
      overallScore: 78,
      strengths: [
        'Well-defined objectives with clear measurable outcomes',
        'Adequate budget allocation across priority areas',
        'Strong stakeholder engagement framework',
      ],
      weaknesses: [
        'Timeline constraints may impact delivery quality',
        'Resource allocation could be more balanced',
        'Limited contingency planning for external risks',
      ],
      risks: [
        this.createInsight({
          title: 'Budget Overrun Risk',
          description: 'Current spending trends suggest potential 15% budget overrun',
          severity: 'high',
          confidence: 82,
        }, 'alert'),
      ],
      opportunities: [
        this.createInsight({
          title: 'Early Completion Potential',
          description: 'Accelerated progress on key initiatives could enable early delivery',
          severity: 'medium',
          confidence: 67,
        }, 'opportunity'),
      ],
      insights: [
        this.createInsight({
          title: 'Resource Optimization',
          description: 'Consider redistributing resources from over-allocated to under-resourced initiatives',
          severity: 'medium',
          confidence: 75,
          recommendations: ['Review current resource allocation', 'Identify reallocation opportunities'],
        }, 'recommendation'),
      ],
    }
  }

  private generateMockPredictions(context: any): PredictiveAnalysis[] {
    return [
      {
        scenario: 'On-time delivery with current resources',
        probability: 72,
        impact: 'high',
        timeframe: 'Next 6 months',
        factors: ['Current progress rate', 'Resource availability', 'Team performance'],
        recommendations: [
          'Maintain current pace',
          'Monitor key milestones closely',
          'Prepare contingency resources',
        ],
      },
      {
        scenario: 'Budget overrun due to scope creep',
        probability: 45,
        impact: 'medium',
        timeframe: 'Next 3 months',
        factors: ['Expanding requirements', 'External dependencies'],
        recommendations: [
          'Implement stricter scope control',
          'Regular budget reviews',
          'Stakeholder expectation management',
        ],
      },
    ]
  }

  private generateMockRecommendations(context: any): AnalyticsInsight[] {
    return [
      this.createInsight({
        title: 'Implement Agile Planning Cycles',
        description: 'Adopt shorter planning cycles to improve responsiveness and reduce risks',
        severity: 'medium',
        confidence: 80,
        recommendations: [
          'Transition to quarterly planning reviews',
          'Implement continuous feedback loops',
          'Establish rapid decision-making processes',
        ],
      }, 'recommendation'),
      this.createInsight({
        title: 'Enhance Cross-Department Collaboration',
        description: 'Improve coordination between departments to reduce silos and increase efficiency',
        severity: 'high',
        confidence: 85,
        recommendations: [
          'Create cross-functional working groups',
          'Implement shared planning tools',
          'Regular interdepartmental meetings',
        ],
      }, 'recommendation'),
    ]
  }
}

// Export singleton instance
export const aiAnalytics = AIAnalyticsEngine.getInstance()