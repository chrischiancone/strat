'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { History, ChevronRight } from 'lucide-react'
import { getApprovalHistory, type ApprovalHistoryEntry } from '@/app/actions/plan-approval'
import { formatDistance } from 'date-fns'

interface ApprovalHistoryProps {
  planId: string
}

const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  under_review: 'Under Review',
  approved: 'Approved',
  active: 'Active',
  archived: 'Archived',
}

export function ApprovalHistory({ planId }: ApprovalHistoryProps) {
  const [history, setHistory] = useState<ApprovalHistoryEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadHistory() {
      try {
        const data = await getApprovalHistory(planId)
        setHistory(data)
      } catch (error) {
        console.error('Error loading approval history:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadHistory()
  }, [planId])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <History className="h-5 w-5" />
            Approval History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    )
  }

  if (history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <History className="h-5 w-5" />
            Approval History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No status changes yet.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <History className="h-5 w-5" />
          Approval History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {history.map((entry, index) => (
            <div
              key={entry.id}
              className={`flex gap-4 pb-4 ${index !== history.length - 1 ? 'border-b' : ''}`}
            >
              {/* Timeline line */}
              <div className="flex flex-col items-center">
                <div
                  className={`h-3 w-3 rounded-full ${
                    entry.new_status === 'approved'
                      ? 'bg-green-500'
                      : entry.new_status === 'draft'
                        ? 'bg-gray-400'
                        : 'bg-blue-500'
                  }`}
                />
                {index !== history.length - 1 && (
                  <div className="w-0.5 flex-1 bg-gray-200 mt-2" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  {entry.previous_status && (
                    <>
                      <Badge variant="outline">{STATUS_LABELS[entry.previous_status]}</Badge>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </>
                  )}
                  <Badge
                    variant={entry.new_status === 'approved' ? 'default' : 'secondary'}
                  >
                    {STATUS_LABELS[entry.new_status]}
                  </Badge>
                </div>

                <div className="text-sm">
                  <span className="font-medium">{entry.changed_by_name}</span>
                  <span className="text-muted-foreground">
                    {' '}
                    • {formatDistance(new Date(entry.changed_at), new Date(), { addSuffix: true })}
                  </span>
                </div>

                {entry.notes && (
                  <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                    {entry.notes}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
