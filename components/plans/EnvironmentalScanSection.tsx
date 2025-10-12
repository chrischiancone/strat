'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EnvironmentalScanForm, type EnvironmentalScanData } from './EnvironmentalScanForm'
import { updateEnvironmentalScan } from '@/app/actions/strategic-plans'

interface EnvironmentalScanSectionProps {
  planId: string
  initialScan?: EnvironmentalScanData
  department_id: string
}

export function EnvironmentalScanSection({ planId, initialScan, department_id }: EnvironmentalScanSectionProps) {
  const handleSave = async (scan: EnvironmentalScanData) => {
    await updateEnvironmentalScan(planId, scan)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Environmental Scan</CardTitle>
        <CardDescription>
          Document external factors affecting your department to inform strategic priorities
        </CardDescription>
      </CardHeader>
      <CardContent>
        <EnvironmentalScanForm
          initialScan={initialScan}
          onSave={handleSave}
          department_id={department_id}
        />
      </CardContent>
    </Card>
  )
}
