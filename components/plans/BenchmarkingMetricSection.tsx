'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BenchmarkingMetricForm, type BenchmarkingMetricData } from './BenchmarkingMetricForm'
import { updateBenchmarkingData } from '@/app/actions/strategic-plans'

interface BenchmarkingMetricSectionProps {
  planId: string
  departmentId: string
  initialData?: BenchmarkingMetricData
}

export function BenchmarkingMetricSection({ 
  planId, 
  departmentId, 
  initialData 
}: BenchmarkingMetricSectionProps) {
  const handleSave = async (data: BenchmarkingMetricData) => {
    // Convert our data structure to match the expected BenchmarkingData interface
    const convertedData = {
      peer_municipalities: data.peer_municipalities,
      metrics: data.metrics.map(metric => ({
        metric_name: metric.metric_name,
        carrollton_current: metric.current_value,
        peer_average: metric.peer_average,
        gap_analysis: metric.gap_analysis
      })),
      key_findings: data.key_findings
    }
    
    await updateBenchmarkingData(planId, convertedData)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI-Powered Benchmarking Metrics</CardTitle>
        <CardDescription>
          Generate comprehensive benchmarking analysis using AI to compare your department against peer municipalities
        </CardDescription>
      </CardHeader>
      <CardContent>
        <BenchmarkingMetricForm 
          initialData={initialData} 
          onSave={handleSave}
          department_id={departmentId}
        />
      </CardContent>
    </Card>
  )
}