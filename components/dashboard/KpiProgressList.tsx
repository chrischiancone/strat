'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { DashboardData } from '@/app/actions/dashboard'

interface KpiProgressListProps {
  data: DashboardData
}

export function KpiProgressList({ data }: KpiProgressListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Key Performance Indicators</CardTitle>
      </CardHeader>
      <CardContent>
        {data.kpiProgress.length > 0 ? (
          <div className="space-y-4">
            {data.kpiProgress.map((kpi) => (
              <div key={kpi.id} className="rounded-lg border border-gray-200 p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-sm">{kpi.metric_name}</h4>
                  {kpi.initiative_name && (
                    <Badge variant="outline" className="text-xs">
                      Initiative: {kpi.initiative_name}
                    </Badge>
                  )}
                  {kpi.goal_name && (
                    <Badge variant="outline" className="text-xs">
                      Goal: {kpi.goal_name}
                    </Badge>
                  )}
                  {!kpi.initiative_name && !kpi.goal_name && (
                    <Badge variant="outline" className="text-xs">
                      Plan-Level
                    </Badge>
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Baseline:</span> {kpi.baseline_value}
                  {' → '}
                  <span className="font-medium">Year 1:</span> {kpi.year_1_target}
                  {' → '}
                  <span className="font-medium">Year 2:</span> {kpi.year_2_target}
                  {' → '}
                  <span className="font-medium">Year 3:</span> {kpi.year_3_target}
                </div>
                {/* Progress tracking would go here in future story (Epic 5) */}
              </div>
            ))}
            {data.kpiProgress.length > 5 && (
              <p className="text-sm text-muted-foreground text-center pt-2">
                Showing {Math.min(data.kpiProgress.length, 5)} of {data.kpiProgress.length} KPIs
              </p>
            )}
          </div>
        ) : (
          <div className="flex h-[200px] items-center justify-center">
            <p className="text-sm text-muted-foreground">
              No KPIs defined yet. Add KPIs to initiatives, goals, or the plan to track progress.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
