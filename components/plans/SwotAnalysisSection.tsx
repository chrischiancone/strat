'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SwotAnalysisForm, type SwotData } from './SwotAnalysisForm'
import { updateSwotAnalysis } from '@/app/actions/strategic-plans'

interface SwotAnalysisSectionProps {
  planId: string
  initialSwot?: SwotData
}

export function SwotAnalysisSection({ planId, initialSwot }: SwotAnalysisSectionProps) {
  const handleSave = async (swot: SwotData) => {
    await updateSwotAnalysis(planId, swot)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>SWOT Analysis</CardTitle>
        <CardDescription>
          Identify strengths, weaknesses, opportunities, and threats to inform strategic priorities
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SwotAnalysisForm initialSwot={initialSwot} onSave={handleSave} />
      </CardContent>
    </Card>
  )
}
