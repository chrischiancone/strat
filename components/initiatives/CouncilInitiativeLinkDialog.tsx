'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { getCouncilGoals, type CouncilGoal } from '@/app/actions/council-goals'
import { Loader2 } from 'lucide-react'

interface CouncilInitiativeLinkDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  priorityLevel: 'NEED' | 'WANT' | 'NICE_TO_HAVE'
  onConfirm: (data: CouncilLinkData) => void
  initialData?: CouncilLinkData
}

export interface CouncilLinkData {
  selectedKeyPoints: { goalId: string; goalTitle: string; keyPoint: string }[]
  councilJustification: string
}

export function CouncilInitiativeLinkDialog({
  open,
  onOpenChange,
  priorityLevel,
  onConfirm,
  initialData,
}: CouncilInitiativeLinkDialogProps) {
  const [councilGoals, setCouncilGoals] = useState<CouncilGoal[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedKeyPoints, setSelectedKeyPoints] = useState<{ goalId: string; goalTitle: string; keyPoint: string }[]>(
    initialData?.selectedKeyPoints || []
  )
  const [justification, setJustification] = useState(
    initialData?.councilJustification || ''
  )

  // Load council goals
  useEffect(() => {
    const loadGoals = async () => {
      try {
        setLoading(true)
        const goals = await getCouncilGoals()
        setCouncilGoals(goals)
      } catch (error) {
        console.error('Failed to load council goals:', error)
      } finally {
        setLoading(false)
      }
    }
    if (open) {
      loadGoals()
    }
  }, [open])

  useEffect(() => {
    if (initialData) {
      setSelectedKeyPoints(initialData.selectedKeyPoints || [])
      setJustification(initialData.councilJustification || '')
    }
  }, [initialData])

  const handleConfirm = () => {
    onConfirm({
      selectedKeyPoints,
      councilJustification: justification,
    })
    onOpenChange(false)
  }

  const handleKeyPointToggle = (goalId: string, goalTitle: string, keyPoint: string) => {
    setSelectedKeyPoints((prev) => {
      const exists = prev.find(
        (item) => item.goalId === goalId && item.keyPoint === keyPoint
      )
      if (exists) {
        return prev.filter(
          (item) => !(item.goalId === goalId && item.keyPoint === keyPoint)
        )
      } else {
        return [...prev, { goalId, goalTitle, keyPoint }]
      }
    })
  }

  const isKeyPointSelected = (goalId: string, keyPoint: string) => {
    return selectedKeyPoints.some(
      (item) => item.goalId === goalId && item.keyPoint === keyPoint
    )
  }

  const getPriorityBadgeColor = () => {
    switch (priorityLevel) {
      case 'NEED':
        return 'bg-red-100 text-red-800'
      case 'WANT':
        return 'bg-yellow-100 text-yellow-800'
      case 'NICE_TO_HAVE':
        return 'bg-green-100 text-green-800'
    }
  }

  const getPriorityLabel = () => {
    switch (priorityLevel) {
      case 'NEED':
        return 'NEED'
      case 'WANT':
        return 'WANT'
      case 'NICE_TO_HAVE':
        return 'NICE TO HAVE'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            Link to Council Priorities
            <Badge className={getPriorityBadgeColor()}>{getPriorityLabel()}</Badge>
          </DialogTitle>
          <DialogDescription>
            Select which City Council priorities this initiative supports and explain
            how it aligns with council objectives.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* City Council Goals Selection */}
          <div>
            <Label className="text-base font-semibold mb-3 block">
              Related Council Goals <span className="text-red-500">*</span>
            </Label>
            <p className="text-sm text-gray-500 mb-3">
              Select all council goals and core values that this initiative addresses:
            </p>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : (
              <div className="space-y-4 border rounded-lg p-4 bg-gray-50 max-h-96 overflow-y-auto">
                {councilGoals.map((goal) => (
                  <div key={goal.id} className="border-b border-gray-200 last:border-0 pb-4 last:pb-0 mb-4 last:mb-0">
                    <div className="mb-2">
                      <h4 className="font-semibold text-sm text-gray-900">{goal.title}</h4>
                      <p className="text-xs text-gray-600 mt-1">{goal.description}</p>
                    </div>
                    {goal.key_points && goal.key_points.length > 0 && (
                      <div className="ml-2 space-y-2">
                        {goal.key_points.map((point, idx) => (
                          <div key={idx} className="flex items-start space-x-2">
                            <Checkbox
                              id={`keypoint-${goal.id}-${idx}`}
                              checked={isKeyPointSelected(goal.id, point)}
                              onCheckedChange={() => handleKeyPointToggle(goal.id, goal.title, point)}
                              className="mt-0.5"
                            />
                            <Label
                              htmlFor={`keypoint-${goal.id}-${idx}`}
                              className="text-xs text-gray-700 cursor-pointer leading-relaxed"
                            >
                              {point}
                            </Label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            {!loading && selectedKeyPoints.length === 0 && (
              <p className="text-sm text-amber-600 mt-2">
                Please select at least one key point
              </p>
            )}
          </div>

          {/* Justification */}
          <div>
            <Label htmlFor="justification" className="text-base font-semibold">
              Council Alignment Justification <span className="text-red-500">*</span>
            </Label>
            <p className="text-sm text-gray-500 mb-2">
              Explain how this initiative aligns with and supports the selected council
              priorities:
            </p>
            <Textarea
              id="justification"
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              placeholder="Describe how this initiative supports city council priorities and strategic objectives..."
              rows={5}
              className="mt-1"
            />
            {justification.trim() === '' && (
              <p className="text-sm text-amber-600 mt-2">
                Please provide a justification for council alignment
              </p>
            )}
          </div>

          {/* Info box */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">
              Why link to council priorities?
            </h4>
            <p className="text-sm text-blue-800">
              Linking your initiative to City Council priorities helps demonstrate
              strategic alignment, supports budget justification, and ensures your work
              contributes to city-wide objectives. This is especially important for{' '}
              <strong>{getPriorityLabel()}</strong> initiatives.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={loading || selectedKeyPoints.length === 0 || justification.trim() === ''}
          >
            Confirm & Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
