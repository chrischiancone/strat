'use client'

import { useState, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Sparkles } from 'lucide-react'
import { updateStrategicPlan } from '@/app/actions/strategic-plans'
import { generateExecutiveSummary } from '@/app/actions/ai-research'
import { useToast } from '@/hooks/use-toast'
import { MarkdownEditor } from '@/components/ui/markdown-editor'

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
  const [isGenerating, setIsGenerating] = useState(false)
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

  // Force re-render when content changes
  useEffect(() => {
    // This ensures the component properly re-renders when state changes
  }, [executiveSummary])

  const handleGenerateExecutiveSummary = async () => {
    setIsGenerating(true)
    try {
      const generatedSummary = await generateExecutiveSummary(planId)
      
      // Update state immediately
      setExecutiveSummary(generatedSummary)
      
      // Auto-save the generated summary
      await updateStrategicPlan({
        id: planId,
        executive_summary: generatedSummary,
      })

      toast({
        title: 'Executive Summary Generated',
        description: 'AI has generated a comprehensive executive summary using your strategic plan data',
      })

      onSave?.()
    } catch (error) {
      console.error('AI Generation Error:', error)
      toast({
        title: 'Generation Failed',
        description: error instanceof Error ? error.message : 'Failed to generate executive summary',
        variant: 'destructive',
      })
    } finally {
      setIsGenerating(false)
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
          <div className="flex items-center justify-between mb-2">
            <Label htmlFor="executive_summary">Executive Summary (Run Last)</Label>
            <Button
              type="button"
              size="sm"
              onClick={handleGenerateExecutiveSummary}
              disabled={isSaving || isGenerating}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {isGenerating ? 'Generating...' : 'Generate with AI'}
            </Button>
          </div>
          <MarkdownEditor
            key={`executive-summary-${executiveSummary.length}`}
            value={executiveSummary}
            onChange={setExecutiveSummary}
            onBlur={() => handleSave('executive_summary', executiveSummary)}
            disabled={isSaving || isGenerating}
            placeholder={isGenerating ? "AI is generating your executive summary with Markdown formatting..." : "Provide a high-level overview of your strategic plan using Markdown formatting, or click 'Generate with AI' to create one automatically..."}
            rows={10}
            showPreview={true}
          />
          <p className="mt-1 text-xs text-gray-500">
            {executiveSummary.length === 0 
              ? '🤖 Click "Generate with AI" to create a comprehensive Markdown-formatted executive summary using your strategic goals, analysis data, and department information.' 
              : `${executiveSummary.length} characters - Use the Preview tab to see your Markdown formatting. The AI generates professional Markdown content automatically.`
            }
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
