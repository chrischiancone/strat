'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  Activity,
  AlertTriangle,
  Lightbulb,
  Target,
  BarChart3,
  RefreshCw,
  Sparkles,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { useToast } from '@/hooks/use-toast'
import { type PlanAnalysis, type TrendAnalysis, type AnalyticsInsight } from '@/lib/ai/analytics-engine'

interface AIInsightsDashboardProps {
  planId?: string
  departmentId?: string
}

export function AIInsightsDashboard({ planId, departmentId }: AIInsightsDashboardProps) {
  const [planAnalysis, setPlanAnalysis] = useState<PlanAnalysis | null>(null)
  const [trends, setTrends] = useState<TrendAnalysis[]>([])
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const { toast } = useToast()

  // Load cached analysis on mount
  useEffect(() => {
    if (planId) {
      loadCachedAnalysis()
      loadTrendData()
    }
  }, [planId, departmentId])

  const loadCachedAnalysis = async () => {
    if (!planId) return

    try {
      setLoading(true)
      const response = await fetch(`/api/ai/analyze-plan?planId=${planId}`)
      const data = await response.json()

      if (data.success) {
        setPlanAnalysis(data.analysis)
        setLastUpdated(data.timestamp)
      }
    } catch (error) {
      console.error('Failed to load cached analysis:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadTrendData = async () => {
    try {
      const metrics = ['budget_utilization', 'goal_completion_rate', 'initiative_count', 'risk_count']
      const response = await fetch('/api/ai/analyze-trends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          metrics, 
          departmentId,
          timeframe: 'monthly' 
        }),
      })

      const data = await response.json()
      if (data.success) {
        setTrends(data.trends)
      }
    } catch (error) {
      console.error('Failed to load trend data:', error)
    }
  }

  const runNewAnalysis = async () => {
    if (!planId) return

    try {
      setAnalyzing(true)
      const response = await fetch('/api/ai/analyze-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      })

      const data = await response.json()

      if (data.success) {
        setPlanAnalysis(data.analysis)
        setLastUpdated(data.timestamp)
        toast({
          title: 'Analysis Complete',
          description: 'AI analysis has been updated with the latest insights.',
        })
        
        // Refresh trend data as well
        await loadTrendData()
      } else {
        throw new Error(data.error || 'Analysis failed')
      }
    } catch (error) {
      toast({
        title: 'Analysis Failed',
        description: 'Unable to complete AI analysis. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setAnalyzing(false)
    }
  }

  const getInsightIcon = (type: AnalyticsInsight['type']) => {
    switch (type) {
      case 'alert': return <AlertTriangle className="w-4 h-4" />
      case 'opportunity': return <Lightbulb className="w-4 h-4" />
      case 'recommendation': return <Target className="w-4 h-4" />
      case 'trend': return <TrendingUp className="w-4 h-4" />
      default: return <Brain className="w-4 h-4" />
    }
  }

  const getSeverityColor = (severity: AnalyticsInsight['severity']) => {
    switch (severity) {
      case 'critical': return 'destructive'
      case 'high': return 'destructive'
      case 'medium': return 'default'
      case 'low': return 'secondary'
      default: return 'default'
    }
  }

  const getTrendIcon = (trend: TrendAnalysis['trend']) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="w-4 h-4 text-green-600" />
      case 'decreasing': return <TrendingDown className="w-4 h-4 text-red-600" />
      case 'stable': return <Activity className="w-4 h-4 text-blue-600" />
      case 'volatile': return <Activity className="w-4 h-4 text-orange-600" />
      default: return <Activity className="w-4 h-4" />
    }
  }

  const formatTrendData = (trend: TrendAnalysis) => {
    return trend.data.map(point => ({
      date: new Date(point.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      value: point.value,
      predicted: false,
    })).concat(
      (trend.forecast || []).map(point => ({
        date: new Date(point.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        value: point.predicted,
        predicted: true,
        confidence: point.confidence,
      }))
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Brain className="w-6 h-6 text-purple-600" />
          <h2 className="text-2xl font-bold">AI Insights Dashboard</h2>
          <Sparkles className="w-5 h-5 text-purple-400" />
        </div>
        
        <div className="flex items-center space-x-3">
          {lastUpdated && (
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="w-4 h-4 mr-1" />
              Last updated: {new Date(lastUpdated).toLocaleString()}
            </div>
          )}
          <Button 
            onClick={runNewAnalysis} 
            disabled={analyzing || !planId}
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${analyzing ? 'animate-spin' : ''}`} />
            <span>{analyzing ? 'Analyzing...' : 'Run Analysis'}</span>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {planAnalysis ? (
            <>
              {/* Overall Score Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5" />
                    <span>Overall Plan Health</span>
                  </CardTitle>
                  <CardDescription>
                    AI-generated assessment based on multiple factors
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <Progress value={planAnalysis.overallScore} className="h-3" />
                    </div>
                    <div className="text-2xl font-bold text-purple-600">
                      {planAnalysis.overallScore}%
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">{planAnalysis.strengths.length} Strengths</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <XCircle className="w-4 h-4 text-red-600" />
                      <span className="text-sm">{planAnalysis.weaknesses.length} Areas for Improvement</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-orange-600" />
                      <span className="text-sm">{planAnalysis.risks.length} Risks Identified</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Lightbulb className="w-4 h-4 text-blue-600" />
                      <span className="text-sm">{planAnalysis.opportunities.length} Opportunities</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Insights Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Top Strength */}
                {planAnalysis.strengths[0] && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        Top Strength
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{planAnalysis.strengths[0]}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Primary Risk */}
                {planAnalysis.risks[0] && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center">
                        <AlertTriangle className="w-4 h-4 text-red-600 mr-2" />
                        Primary Risk
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{planAnalysis.risks[0].title}</p>
                      <Badge 
                        variant={getSeverityColor(planAnalysis.risks[0].severity)}
                        className="mt-2 text-xs"
                      >
                        {planAnalysis.risks[0].confidence}% confidence
                      </Badge>
                    </CardContent>
                  </Card>
                )}

                {/* Best Opportunity */}
                {planAnalysis.opportunities[0] && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center">
                        <Lightbulb className="w-4 h-4 text-blue-600 mr-2" />
                        Best Opportunity
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{planAnalysis.opportunities[0].title}</p>
                      <Badge variant="secondary" className="mt-2 text-xs">
                        {planAnalysis.opportunities[0].confidence}% confidence
                      </Badge>
                    </CardContent>
                  </Card>
                )}
              </div>
            </>
          ) : loading ? (
            <Card>
              <CardContent className="flex items-center justify-center py-16">
                <RefreshCw className="w-8 h-8 animate-spin text-purple-600" />
                <span className="ml-3 text-lg">Loading AI insights...</span>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Brain className="w-16 h-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Analysis Available</h3>
                <p className="text-gray-600 mb-6 text-center">
                  Run an AI analysis to get intelligent insights about your strategic plan.
                </p>
                <Button 
                  onClick={runNewAnalysis} 
                  disabled={!planId}
                  className="flex items-center space-x-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Start Analysis</span>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          {planAnalysis ? (
            <div className="grid gap-4">
              {planAnalysis.insights.map((insight, index) => (
                <Card key={insight.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm flex items-center space-x-2">
                        {getInsightIcon(insight.type)}
                        <span>{insight.title}</span>
                      </CardTitle>
                      <Badge variant={getSeverityColor(insight.severity)}>
                        {insight.confidence}% confidence
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-4">{insight.description}</p>
                    {insight.recommendations.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Recommended Actions:</h4>
                        <ul className="space-y-1">
                          {insight.recommendations.map((rec, recIndex) => (
                            <li key={recIndex} className="flex items-start space-x-2 text-sm">
                              <ArrowRight className="w-3 h-3 mt-0.5 text-gray-400 flex-shrink-0" />
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-16 text-center">
                <p className="text-gray-600">No insights available. Run an analysis first.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-4">
          <div className="grid gap-6">
            {trends.map((trend, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      {getTrendIcon(trend.trend)}
                      <span className="capitalize">{trend.metric.replace('_', ' ')}</span>
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge variant={trend.trend === 'increasing' ? 'default' : 'secondary'}>
                        {trend.changeRate > 0 ? '+' : ''}{trend.changeRate.toFixed(1)}%
                      </Badge>
                      <Badge variant="outline">{trend.trend}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={formatTrendData(trend)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Area 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#8884d8" 
                          fill="#8884d8" 
                          fillOpacity={0.6} 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-4">
          {planAnalysis ? (
            <div className="space-y-4">
              {/* High Priority Recommendations */}
              {planAnalysis.insights.filter(i => i.type === 'recommendation' && i.severity === 'high').length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-red-700">
                      <AlertTriangle className="w-5 h-5" />
                      <span>High Priority Actions</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {planAnalysis.insights
                      .filter(i => i.type === 'recommendation' && i.severity === 'high')
                      .map((insight, index) => (
                        <div key={insight.id} className="border-l-4 border-red-500 pl-4">
                          <h4 className="font-medium mb-2">{insight.title}</h4>
                          <p className="text-sm text-gray-600 mb-3">{insight.description}</p>
                          <ul className="space-y-1">
                            {insight.recommendations.map((rec, recIndex) => (
                              <li key={recIndex} className="flex items-start space-x-2 text-sm">
                                <ArrowRight className="w-3 h-3 mt-0.5 text-red-400 flex-shrink-0" />
                                <span>{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                  </CardContent>
                </Card>
              )}

              {/* Other Recommendations */}
              <div className="grid gap-4">
                {planAnalysis.insights
                  .filter(i => i.type === 'recommendation' && i.severity !== 'high')
                  .map((insight) => (
                    <Card key={insight.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">{insight.title}</CardTitle>
                          <Badge variant={getSeverityColor(insight.severity)}>
                            {insight.severity} priority
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm mb-4">{insight.description}</p>
                        {insight.recommendations.length > 0 && (
                          <ul className="space-y-1">
                            {insight.recommendations.map((rec, recIndex) => (
                              <li key={recIndex} className="flex items-start space-x-2 text-sm">
                                <ArrowRight className="w-3 h-3 mt-0.5 text-gray-400 flex-shrink-0" />
                                <span>{rec}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="py-16 text-center">
                <p className="text-gray-600">No recommendations available. Run an analysis first.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}