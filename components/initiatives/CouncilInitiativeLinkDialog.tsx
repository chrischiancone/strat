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
import { CITY_PRIORITIES, type CityPriority } from '@/lib/constants/strategic-planning'
import { Badge } from '@/components/ui/badge'

interface CouncilInitiativeLinkDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  priorityLevel: 'NEED' | 'WANT' | 'NICE_TO_HAVE'
  onConfirm: (data: CouncilLinkData) => void
  initialData?: CouncilLinkData
}

export interface CouncilLinkData {
  councilPriorities: CityPriority[]
  councilJustification: string
}

export function CouncilInitiativeLinkDialog({
  open,
  onOpenChange,
  priorityLevel,
  onConfirm,
  initialData,
}: CouncilInitiativeLinkDialogProps) {
  const [selectedPriorities, setSelectedPriorities] = useState<CityPriority[]>(
    initialData?.councilPriorities || []
  )
  const [justification, setJustification] = useState(
    initialData?.councilJustification || ''
  )

  useEffect(() => {
    if (initialData) {
      setSelectedPriorities(initialData.councilPriorities || [])
      setJustification(initialData.councilJustification || '')
    }
  }, [initialData])

  const handleConfirm = () => {
    onConfirm({
      councilPriorities: selectedPriorities,
      councilJustification: justification,
    })
    onOpenChange(false)
  }

  const handlePriorityToggle = (priority: CityPriority) => {
    setSelectedPriorities((prev) =>
      prev.includes(priority)
        ? prev.filter((p) => p !== priority)
        : [...prev, priority]
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
          {/* City Council Priorities Selection */}
          <div>
            <Label className="text-base font-semibold mb-3 block">
              Related Council Priorities <span className="text-red-500">*</span>
            </Label>
            <p className="text-sm text-gray-500 mb-3">
              Select all council priorities that this initiative addresses:
            </p>
            <div className="space-y-2 border rounded-lg p-4 bg-gray-50">
              {CITY_PRIORITIES.map((priority) => (
                <div key={priority} className="flex items-center space-x-2">
                  <Checkbox
                    id={`priority-${priority}`}
                    checked={selectedPriorities.includes(priority)}
                    onCheckedChange={() => handlePriorityToggle(priority)}
                  />
                  <Label
                    htmlFor={`priority-${priority}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {priority}
                  </Label>
                </div>
              ))}
            </div>
            {selectedPriorities.length === 0 && (
              <p className="text-sm text-amber-600 mt-2">
                Please select at least one council priority
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
            disabled={selectedPriorities.length === 0 || justification.trim() === ''}
          >
            Confirm & Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
