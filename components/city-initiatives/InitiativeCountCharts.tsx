'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import type { InitiativeCounts } from '@/app/actions/city-initiatives'

interface InitiativeCountChartsProps {
  counts: InitiativeCounts
}

const PRIORITY_COLORS = {
  NEED: '#ef4444', // red
  WANT: '#f59e0b', // amber
  NICE_TO_HAVE: '#22c55e', // green
}

const STATUS_COLORS = {
  not_started: '#9ca3af', // gray
  in_progress: '#3b82f6', // blue
  at_risk: '#ef4444', // red
  completed: '#22c55e', // green
  deferred: '#6b7280', // gray-dark
}

export function InitiativeCountCharts({ counts }: InitiativeCountChartsProps) {
  const priorityData = [
    { name: 'Need', value: counts.byPriority.NEED, color: PRIORITY_COLORS.NEED },
    { name: 'Want', value: counts.byPriority.WANT, color: PRIORITY_COLORS.WANT },
    {
      name: 'Nice to Have',
      value: counts.byPriority.NICE_TO_HAVE,
      color: PRIORITY_COLORS.NICE_TO_HAVE,
    },
  ]

  const statusData = [
    { name: 'Not Started', value: counts.byStatus.not_started, color: STATUS_COLORS.not_started },
    { name: 'In Progress', value: counts.byStatus.in_progress, color: STATUS_COLORS.in_progress },
    { name: 'At Risk', value: counts.byStatus.at_risk, color: STATUS_COLORS.at_risk },
    { name: 'Completed', value: counts.byStatus.completed, color: STATUS_COLORS.completed },
    { name: 'Deferred', value: counts.byStatus.deferred, color: STATUS_COLORS.deferred },
  ]

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* By Priority */}
      <Card>
        <CardHeader>
          <CardTitle>Initiatives by Priority</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={priorityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {priorityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* By Status */}
      <Card>
        <CardHeader>
          <CardTitle>Initiatives by Status</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={statusData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-15} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
