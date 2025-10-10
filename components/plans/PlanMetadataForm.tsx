'use client'

import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { updateStrategicPlan } from '@/app/actions/strategic-plans'
import { useToast } from '@/hooks/use-toast'

interface PlanMetadataFormProps {
  planId: string
  initialData: {
    title: string
    executive_summary: string | null
    department_vision: string | null
  }
  onSave?: () => void
}

export function PlanMetadataForm({
  planId,
  initialData,
  onSave,
}: PlanMetadataFormProps) {
  const [title, setTitle] = useState(initialData.title)
  const [executiveSummary, setExecutiveSummary] = useState(
    initialData.executive_summary || ''
  )
  const [departmentVision, setDepartmentVision] = useState(
    initialData.department_vision || ''
  )
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  const handleSave = async (
    field: 'title' | 'executive_summary' | 'department_vision',
    value: string
  ) => {
    setIsSaving(true)
    try {
      await updateStrategicPlan({
        id: planId,
        [field]: value || null,
      })

      toast({
        title: 'Saved',
        description: 'Changes saved successfully',
      })

      onSave?.()
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to save changes',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6 rounded-lg border border-gray-200 bg-white p-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Plan Metadata</h2>
        <p className="mt-1 text-sm text-gray-500">
          Basic information about your strategic plan
        </p>
      </div>

      <div className="space-y-4">
        {/* Plan Title */}
        <div>
          <Label htmlFor="title">Plan Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => handleSave('title', title)}
            disabled={isSaving}
            placeholder="e.g., FY2026-2028 Strategic Plan"
            className="mt-1"
          />
        </div>

        {/* Executive Summary */}
        <div>
          <Label htmlFor="executive_summary">Executive Summary</Label>
          <Textarea
            id="executive_summary"
            value={executiveSummary}
            onChange={(e) => setExecutiveSummary(e.target.value)}
            onBlur={() => handleSave('executive_summary', executiveSummary)}
            disabled={isSaving}
            placeholder="Provide a high-level overview of your strategic plan..."
            rows={6}
            className="mt-1"
          />
          <p className="mt-1 text-xs text-gray-500">
            Summarize the key points of your strategic plan
          </p>
        </div>

        {/* Department Vision */}
        <div>
          <Label htmlFor="department_vision">Department Vision</Label>
          <Textarea
            id="department_vision"
            value={departmentVision}
            onChange={(e) => setDepartmentVision(e.target.value)}
            onBlur={() => handleSave('department_vision', departmentVision)}
            disabled={isSaving}
            placeholder="Describe your department's vision for the future..."
            rows={4}
            className="mt-1"
          />
          <p className="mt-1 text-xs text-gray-500">
            What is your department&apos;s long-term vision?
          </p>
        </div>
      </div>
    </div>
  )
}
