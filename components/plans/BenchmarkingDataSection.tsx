'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BenchmarkingDataForm, type BenchmarkingData } from './BenchmarkingDataForm'
import { updateBenchmarkingData } from '@/app/actions/strategic-plans'

interface BenchmarkingDataSectionProps {
  planId: string
  initialData?: BenchmarkingData
}

export function BenchmarkingDataSection({ planId, initialData }: BenchmarkingDataSectionProps) {
  const handleSave = async (data: BenchmarkingData) => {
    await updateBenchmarkingData(planId, data)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Benchmarking Data</CardTitle>
        <CardDescription>
          Compare your department to peer municipalities to justify investment requests
        </CardDescription>
      </CardHeader>
      <CardContent>
        <BenchmarkingDataForm initialData={initialData} onSave={handleSave} />
      </CardContent>
    </Card>
  )
}
