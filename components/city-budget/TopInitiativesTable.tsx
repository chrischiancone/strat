'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { InitiativeDetail } from '@/app/actions/city-budget'

interface TopInitiativesTableProps {
  data: InitiativeDetail[]
}

const PRIORITY_COLORS = {
  NEED: 'bg-red-100 text-red-800',
  WANT: 'bg-yellow-100 text-yellow-800',
  NICE_TO_HAVE: 'bg-green-100 text-green-800',
}

export function TopInitiativesTable({ data }: TopInitiativesTableProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top 10 Initiatives by Budget</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No initiatives found
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left text-sm font-medium">Rank</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Initiative</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Department</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Priority</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">Total Cost</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">Year 1</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">Year 2</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">Year 3</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.map((initiative, index) => (
                  <tr key={initiative.id} className="hover:bg-muted/50">
                    <td className="px-4 py-3 text-sm font-medium">{index + 1}</td>
                    <td className="px-4 py-3 text-sm">{initiative.name}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {initiative.department_name}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        className={
                          PRIORITY_COLORS[
                            initiative.priority_level as keyof typeof PRIORITY_COLORS
                          ]
                        }
                        variant="secondary"
                      >
                        {initiative.priority_level}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-right">
                      {formatCurrency(initiative.total_cost)}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground text-right">
                      {formatCurrency(initiative.year_1_cost)}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground text-right">
                      {formatCurrency(initiative.year_2_cost)}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground text-right">
                      {formatCurrency(initiative.year_3_cost)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
