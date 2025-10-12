'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle } from 'lucide-react'
import type { InitiativeSummary } from '@/app/actions/city-initiatives'

interface AtRiskAlertProps {
  initiatives: InitiativeSummary[]
}

export function AtRiskAlert({ initiatives }: AtRiskAlertProps) {
  if (initiatives.length === 0) {
    return null
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <Card className="border-red-200 bg-red-50">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className="rounded-full bg-red-100 p-2">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-red-900 mb-2">
              {initiatives.length} Initiative{initiatives.length > 1 ? 's' : ''} At Risk
            </h3>
            <p className="text-sm text-red-700 mb-4">
              The following initiatives require immediate attention to get back on track:
            </p>

            <div className="space-y-3">
              {initiatives.map((initiative) => (
                <div
                  key={initiative.id}
                  className="rounded-lg bg-white border border-red-200 p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm text-gray-900">
                          {initiative.name}
                        </h4>
                        <Badge
                          variant="secondary"
                          className="bg-red-100 text-red-800"
                        >
                          {initiative.priority_level}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600">
                        {initiative.department_name} • {initiative.plan_title}
                      </p>
                      {initiative.responsible_party && (
                        <p className="text-xs text-gray-500 mt-1">
                          Owner: {initiative.responsible_party}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900">
                        {formatCurrency(initiative.total_cost)}
                      </div>
                      <div className="text-xs text-gray-500">Total Budget</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {initiatives.length > 5 && (
              <p className="text-xs text-red-600 mt-3">
                Showing top {Math.min(5, initiatives.length)} at-risk initiatives. See full table
                below for complete list.
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
