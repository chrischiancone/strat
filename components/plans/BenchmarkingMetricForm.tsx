'use client'

import { useState, useEffect, memo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ChevronDown, ChevronUp, Pencil, Plus, Trash2, Sparkles } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { researchBenchmarkingMetrics } from '@/app/actions/ai-research'
import dynamic from 'next/dynamic'

// Dynamically import ReactMarkdown to prevent SSR issues
const ReactMarkdown = dynamic(() => import('react-markdown'), {
  ssr: false,
  loading: () => <div className="h-4 w-full bg-gray-100 rounded animate-pulse"></div>
})

// Safe markdown renderer that handles hydration issues
const MarkdownRenderer = memo(function MarkdownRenderer({ content }: { content: string }) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // During SSR and before mounting, show formatted plain text inline
  if (!isMounted) {
    return (
      <span className="whitespace-pre-line">
        {content.split('\n').map((line, i) => {
          // Basic formatting for SSR - render inline to stay on same line as number
          if (line.trim().startsWith('**') && line.trim().endsWith('**')) {
            return (
              <span key={i} className="font-semibold text-gray-900">
                {i > 0 && ' '}{line.replace(/\*\*/g, '')}
              </span>
            )
          }
          // Show reference numbers without making them links - inline
          const withRefNumbers = line.replace(/\[\[(.+?)\]\]\((.+?)\)/g, '[$1]')
          return (
            <span key={i}>
              {i > 0 && ' '}{withRefNumbers}
            </span>
          )
        })}
      </span>
    )
  }

  // Client-side rendering with full markdown support
  return (
    <span className="markdown-content">
      <ReactMarkdown 
        components={{
          // Ensure the root element is inline
          div: ({ children }) => <span>{children}</span>,
          // Handle paragraphs as inline spans to keep content on same line as number
          p: ({ children }) => <span>{children}</span>,
          // Style links to be clickable and visually distinct
          a: ({ href, children }) => (
            <a 
              href={href} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline break-words"
              title={href}
            >
              {children}
            </a>
          ),
          // Bold text styling
          strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
          // Handle line breaks
          br: () => <br />
        }}
      >
        {content}
      </ReactMarkdown>
    </span>
  )
})

export interface BenchmarkingMetric {
  metric_name: string
  current_value: string
  peer_average: string
  gap_analysis: string
}

export interface BenchmarkingMetricData {
  peer_municipalities: string[]
  metrics: BenchmarkingMetric[]
  key_findings: string[]
}

interface BenchmarkingMetricFormProps {
  initialData?: BenchmarkingMetricData
  onSave: (data: BenchmarkingMetricData) => Promise<void>
  disabled?: boolean
  department_id: string
}

type SectionType = 'peer' | 'metric' | 'finding' | null

const SECTION_LABELS = {
  peer: 'Peer Municipalities',
  metric: 'Benchmarking Metrics',
  finding: 'Key Findings',
}

const SECTION_COLORS = {
  peer: 'border-blue-200 bg-blue-50',
  metric: 'border-purple-200 bg-purple-50', 
  finding: 'border-green-200 bg-green-50',
}

const SECTION_TEXT_COLORS = {
  peer: 'text-blue-900',
  metric: 'text-purple-900',
  finding: 'text-green-900',
}

const SECTION_DESCRIPTIONS = {
  peer: 'Comparable cities/counties used for benchmarking analysis',
  metric: 'Key performance indicators compared with peer averages',
  finding: 'Important insights from the benchmarking analysis',
}

const MIN_LENGTH = 15
const MAX_LENGTH = 1000

export function BenchmarkingMetricForm({
  initialData,
  onSave,
  disabled = false,
  department_id,
}: BenchmarkingMetricFormProps) {
  const { toast } = useToast()

  const [data, setData] = useState<BenchmarkingMetricData>({
    peer_municipalities: initialData?.peer_municipalities || [],
    metrics: initialData?.metrics || [],
    key_findings: initialData?.key_findings || [],
  })

  const [expandedSections, setExpandedSections] = useState<Set<SectionType>>(
    new Set(['peer'])
  )

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingSection, setEditingSection] = useState<SectionType>(null)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editingText, setEditingText] = useState('')

  // Metric editing states
  const [metricName, setMetricName] = useState('')
  const [currentValue, setCurrentValue] = useState('')
  const [peerAverage, setPeerAverage] = useState('')
  const [gapAnalysis, setGapAnalysis] = useState('')

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deletingSection, setDeletingSection] = useState<SectionType>(null)
  const [deletingIndex, setDeletingIndex] = useState<number>(0)

  const [isSaving, setIsSaving] = useState(false)
  const [isResearching, setIsResearching] = useState(false)

  const toggleSection = (section: SectionType) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(section)) {
      newExpanded.delete(section)
    } else {
      newExpanded.add(section)
    }
    setExpandedSections(newExpanded)
  }

  const handleAIResearch = async () => {
    setIsResearching(true)
    try {
      const result = await researchBenchmarkingMetrics(department_id)
      
      const newData: BenchmarkingMetricData = {
        peer_municipalities: result.peer_municipalities,
        metrics: result.metrics.map(metric => ({
          metric_name: metric.metric_name,
          current_value: metric.current_value,
          peer_average: metric.peer_average,
          gap_analysis: metric.gap_analysis
        })),
        key_findings: result.key_findings,
      }

      setData(newData)
      
      // Expand all sections to show results
      setExpandedSections(new Set(['peer', 'metric', 'finding']))

      // Save the data
      await onSave(newData)

      toast({
        title: 'AI Research Complete',
        description: `Generated ${result.metrics.length} benchmarking metrics and ${result.peer_municipalities.length} peer municipalities`,
      })
    } catch (error) {
      console.error('AI Research Error:', error)
      toast({
        title: 'Research Failed',
        description: error instanceof Error ? error.message : 'Failed to generate benchmarking metrics',
        variant: 'destructive',
      })
    } finally {
      setIsResearching(false)
    }
  }

  const handleAdd = (section: SectionType) => {
    setEditingSection(section)
    setEditingIndex(null)
    setEditingText('')
    // Reset metric fields
    setMetricName('')
    setCurrentValue('')
    setPeerAverage('')
    setGapAnalysis('')
    setIsEditDialogOpen(true)
  }

  const handleEdit = (section: SectionType, index: number) => {
    setEditingSection(section)
    setEditingIndex(index)
    
    if (section === 'peer') {
      setEditingText(data.peer_municipalities[index])
    } else if (section === 'metric') {
      const metric = data.metrics[index]
      setMetricName(metric.metric_name)
      setCurrentValue(metric.current_value)
      setPeerAverage(metric.peer_average)
      setGapAnalysis(metric.gap_analysis)
    } else if (section === 'finding') {
      setEditingText(data.key_findings[index])
    }
    
    setIsEditDialogOpen(true)
  }

  const handleSaveItem = async () => {
    if (editingSection === 'peer') {
      const trimmed = editingText.trim()

      if (trimmed.length < 2) {
        toast({
          title: 'Validation Error',
          description: 'Municipality name must be at least 2 characters',
          variant: 'destructive',
        })
        return
      }

      if (trimmed.length > 100) {
        toast({
          title: 'Validation Error',
          description: 'Municipality name cannot exceed 100 characters',
          variant: 'destructive',
        })
        return
      }

      const isDuplicate = data.peer_municipalities.some(
        (item, idx) =>
          idx !== editingIndex && item.toLowerCase() === trimmed.toLowerCase()
      )

      if (isDuplicate) {
        toast({
          title: 'Validation Error',
          description: 'This municipality already exists',
          variant: 'destructive',
        })
        return
      }

      const newData = { ...data }
      if (editingIndex !== null) {
        newData.peer_municipalities[editingIndex] = trimmed
      } else {
        newData.peer_municipalities = [...newData.peer_municipalities, trimmed]
      }

      await saveData(newData, editingIndex !== null ? 'Municipality updated' : 'Municipality added')
    } else if (editingSection === 'metric') {
      const trimmedName = metricName.trim()
      const trimmedCurrent = currentValue.trim()
      const trimmedPeer = peerAverage.trim()
      const trimmedGap = gapAnalysis.trim()

      if (trimmedName.length < 5 || trimmedName.length > 200) {
        toast({
          title: 'Validation Error',
          description: 'Metric name must be 5-200 characters',
          variant: 'destructive',
        })
        return
      }

      if (trimmedCurrent.length < 1 || trimmedCurrent.length > 100) {
        toast({
          title: 'Validation Error',
          description: 'Current value must be 1-100 characters',
          variant: 'destructive',
        })
        return
      }

      if (trimmedPeer.length < 1 || trimmedPeer.length > 100) {
        toast({
          title: 'Validation Error',
          description: 'Peer average must be 1-100 characters',
          variant: 'destructive',
        })
        return
      }

      if (trimmedGap.length < 10 || trimmedGap.length > 500) {
        toast({
          title: 'Validation Error',
          description: 'Gap analysis must be 10-500 characters',
          variant: 'destructive',
        })
        return
      }

      const newMetric: BenchmarkingMetric = {
        metric_name: trimmedName,
        current_value: trimmedCurrent,
        peer_average: trimmedPeer,
        gap_analysis: trimmedGap,
      }

      const newData = { ...data }
      if (editingIndex !== null) {
        newData.metrics[editingIndex] = newMetric
      } else {
        newData.metrics = [...newData.metrics, newMetric]
      }

      await saveData(newData, editingIndex !== null ? 'Metric updated' : 'Metric added')
    } else if (editingSection === 'finding') {
      const trimmed = editingText.trim()

      if (trimmed.length < MIN_LENGTH) {
        toast({
          title: 'Validation Error',
          description: `Key finding must be at least ${MIN_LENGTH} characters`,
          variant: 'destructive',
        })
        return
      }

      if (trimmed.length > MAX_LENGTH) {
        toast({
          title: 'Validation Error',
          description: `Key finding cannot exceed ${MAX_LENGTH} characters`,
          variant: 'destructive',
        })
        return
      }

      const isDuplicate = data.key_findings.some(
        (item, idx) =>
          idx !== editingIndex && item.toLowerCase() === trimmed.toLowerCase()
      )

      if (isDuplicate) {
        toast({
          title: 'Validation Error',
          description: 'This finding already exists',
          variant: 'destructive',
        })
        return
      }

      const newData = { ...data }
      if (editingIndex !== null) {
        newData.key_findings[editingIndex] = trimmed
      } else {
        newData.key_findings = [...newData.key_findings, trimmed]
      }

      await saveData(newData, editingIndex !== null ? 'Finding updated' : 'Finding added')
    }
  }

  const saveData = async (newData: BenchmarkingMetricData, successMessage: string) => {
    setData(newData)
    setIsEditDialogOpen(false)

    setIsSaving(true)
    try {
      await onSave(newData)
      toast({
        description: successMessage,
      })
    } catch (error) {
      console.error('Error saving benchmarking data:', error)
      toast({
        title: 'Error',
        description: 'Failed to save. Please try again.',
        variant: 'destructive',
      })
      setData(data)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = (section: SectionType, index: number) => {
    setDeletingSection(section)
    setDeletingIndex(index)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    const newData = { ...data }

    if (deletingSection === 'peer') {
      newData.peer_municipalities = newData.peer_municipalities.filter((_, idx) => idx !== deletingIndex)
    } else if (deletingSection === 'metric') {
      newData.metrics = newData.metrics.filter((_, idx) => idx !== deletingIndex)
    } else if (deletingSection === 'finding') {
      newData.key_findings = newData.key_findings.filter((_, idx) => idx !== deletingIndex)
    }

    setData(newData)
    setIsDeleteDialogOpen(false)

    setIsSaving(true)
    try {
      await onSave(newData)
      toast({
        description: 'Deleted successfully',
      })
    } catch (error) {
      console.error('Error deleting:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete. Please try again.',
        variant: 'destructive',
      })
      setData(data)
    } finally {
      setIsSaving(false)
    }
  }

  const totalItems = data.peer_municipalities.length + data.metrics.length + data.key_findings.length

  return (
    <div className="space-y-6">
      {/* Header with AI Generate Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Benchmarking Metrics</h2>
          <p className="text-sm text-gray-600">
            Compare your department&apos;s performance with peer municipalities
          </p>
        </div>
        <Button
          onClick={handleAIResearch}
          disabled={disabled || isResearching}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          {isResearching ? 'Researching...' : 'Generate with AI'}
        </Button>
      </div>

      {/* Progress indicator */}
      {totalItems > 0 && (
        <div className="text-sm text-gray-500">
          {data.peer_municipalities.length} peer municipalities • {data.metrics.length} metrics • {data.key_findings.length} findings
        </div>
      )}

      {/* Peer Municipalities Section */}
      <Card className={`border-2 ${SECTION_COLORS.peer}`}>
        <div className="p-4">
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() => toggleSection('peer')}
          >
            <div className="flex items-center">
              <div className="flex items-center">
                {expandedSections.has('peer') ? (
                  <ChevronUp className="h-4 w-4 mr-2 text-gray-500" />
                ) : (
                  <ChevronDown className="h-4 w-4 mr-2 text-gray-500" />
                )}
                <h3 className={`font-semibold ${SECTION_TEXT_COLORS.peer}`}>
                  {SECTION_LABELS.peer}
                </h3>
                <span className="ml-2 text-sm text-gray-500">
                  ({data.peer_municipalities.length})
                </span>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                handleAdd('peer')
              }}
              disabled={disabled || isSaving}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
          
          {expandedSections.has('peer') && (
            <div className="mt-4">
              <p className="text-xs text-gray-600 mb-3">
                {SECTION_DESCRIPTIONS.peer}
              </p>
              <div className="space-y-2">
                {data.peer_municipalities.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">
                    No peer municipalities added yet. Click &quot;Generate with AI&quot; to auto-populate or &quot;Add&quot; to manually enter.
                  </p>
                ) : (
                  data.peer_municipalities.map((municipality, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-md border border-gray-200 bg-white p-3"
                    >
                      <span className="text-sm text-gray-800">• {municipality}</span>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit('peer', index)}
                          disabled={disabled || isSaving}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete('peer', index)}
                          disabled={disabled || isSaving}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Benchmarking Metrics Section */}
      <Card className={`border-2 ${SECTION_COLORS.metric}`}>
        <div className="p-4">
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() => toggleSection('metric')}
          >
            <div className="flex items-center">
              <div className="flex items-center">
                {expandedSections.has('metric') ? (
                  <ChevronUp className="h-4 w-4 mr-2 text-gray-500" />
                ) : (
                  <ChevronDown className="h-4 w-4 mr-2 text-gray-500" />
                )}
                <h3 className={`font-semibold ${SECTION_TEXT_COLORS.metric}`}>
                  {SECTION_LABELS.metric}
                </h3>
                <span className="ml-2 text-sm text-gray-500">
                  ({data.metrics.length})
                </span>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                handleAdd('metric')
              }}
              disabled={disabled || isSaving}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
          
          {expandedSections.has('metric') && (
            <div className="mt-4">
              <p className="text-xs text-gray-600 mb-3">
                {SECTION_DESCRIPTIONS.metric}
              </p>
              {data.metrics.length === 0 ? (
                <p className="text-sm text-gray-500 italic">
                  No metrics added yet. Click &quot;Generate with AI&quot; to auto-populate 20 metrics or &quot;Add&quot; to manually enter.
                </p>
              ) : (
                <div className="rounded-md border border-gray-200 bg-white overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[25%]">Metric</TableHead>
                        <TableHead className="w-[15%]">Current Value</TableHead>
                        <TableHead className="w-[15%]">Peer Average</TableHead>
                        <TableHead className="w-[35%]">Gap Analysis</TableHead>
                        <TableHead className="w-[10%]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.metrics.map((metric, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{metric.metric_name}</TableCell>
                          <TableCell>{metric.current_value}</TableCell>
                          <TableCell>{metric.peer_average}</TableCell>
                          <TableCell className="text-sm">{metric.gap_analysis}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit('metric', index)}
                                disabled={disabled || isSaving}
                              >
                                <Pencil className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete('metric', index)}
                                disabled={disabled || isSaving}
                              >
                                <Trash2 className="h-3 w-3 text-red-600" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Key Findings Section */}
      <Card className={`border-2 ${SECTION_COLORS.finding}`}>
        <div className="p-4">
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() => toggleSection('finding')}
          >
            <div className="flex items-center">
              <div className="flex items-center">
                {expandedSections.has('finding') ? (
                  <ChevronUp className="h-4 w-4 mr-2 text-gray-500" />
                ) : (
                  <ChevronDown className="h-4 w-4 mr-2 text-gray-500" />
                )}
                <h3 className={`font-semibold ${SECTION_TEXT_COLORS.finding}`}>
                  {SECTION_LABELS.finding}
                </h3>
                <span className="ml-2 text-sm text-gray-500">
                  ({data.key_findings.length})
                </span>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                handleAdd('finding')
              }}
              disabled={disabled || isSaving}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
          
          {expandedSections.has('finding') && (
            <div className="mt-4">
              <p className="text-xs text-gray-600 mb-3">
                {SECTION_DESCRIPTIONS.finding}
              </p>
              <div className="space-y-2">
                {data.key_findings.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">
                    No findings added yet. Click &quot;Generate with AI&quot; to auto-populate or &quot;Add&quot; to manually enter.
                  </p>
                ) : (
                  data.key_findings.map((finding, index) => (
                    <div
                      key={index}
                      className="flex items-start justify-between rounded-md border border-gray-200 bg-white p-3"
                    >
                      <div className="flex items-start flex-1">
                        <span className="text-sm text-gray-600 mr-2">{index + 1}.</span>
                        <MarkdownRenderer content={finding} />
                      </div>
                      <div className="flex gap-1 ml-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit('finding', index)}
                          disabled={disabled || isSaving}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete('finding', index)}
                          disabled={disabled || isSaving}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingIndex !== null ? 'Edit' : 'Add'}{' '}
              {editingSection === 'peer'
                ? 'Peer Municipality'
                : editingSection === 'metric'
                ? 'Benchmarking Metric'
                : 'Key Finding'}
            </DialogTitle>
            <DialogDescription>
              {editingSection === 'peer'
                ? 'Enter the name of a comparable city or county'
                : editingSection === 'metric'
                ? 'Enter all metric details for comparison'
                : 'Summarize an important insight from your benchmarking analysis'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {editingSection === 'peer' && (
              <div>
                <Label htmlFor="municipality">Municipality Name</Label>
                <Input
                  id="municipality"
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  placeholder="e.g., Plano, TX"
                  maxLength={100}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {editingText.length} / 100 characters
                </p>
              </div>
            )}

            {editingSection === 'metric' && (
              <>
                <div>
                  <Label htmlFor="metric-name">Metric Name *</Label>
                  <Input
                    id="metric-name"
                    value={metricName}
                    onChange={(e) => setMetricName(e.target.value)}
                    placeholder="e.g., Police officers per 1,000 residents"
                    maxLength={200}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {metricName.length} / 200 characters
                  </p>
                </div>
                <div>
                  <Label htmlFor="current-value">Current Value *</Label>
                  <Input
                    id="current-value"
                    value={currentValue}
                    onChange={(e) => setCurrentValue(e.target.value)}
                    placeholder="e.g., 1.8"
                    maxLength={100}
                  />
                </div>
                <div>
                  <Label htmlFor="peer-average">Peer Average *</Label>
                  <Input
                    id="peer-average"
                    value={peerAverage}
                    onChange={(e) => setPeerAverage(e.target.value)}
                    placeholder="e.g., 2.1"
                    maxLength={100}
                  />
                </div>
                <div>
                  <Label htmlFor="gap-analysis">Gap Analysis *</Label>
                  <Textarea
                    id="gap-analysis"
                    value={gapAnalysis}
                    onChange={(e) => setGapAnalysis(e.target.value)}
                    placeholder="Describe the gap and its implications..."
                    rows={3}
                    maxLength={500}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {gapAnalysis.length} / 500 characters (min 10)
                  </p>
                </div>
              </>
            )}

            {editingSection === 'finding' && (
              <div>
                <Label htmlFor="finding">Key Finding</Label>
                <Textarea
                  id="finding"
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  placeholder="Summarize an important insight..."
                  rows={4}
                  maxLength={MAX_LENGTH}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {editingText.length} / {MAX_LENGTH} characters (min {MIN_LENGTH})
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveItem} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this item? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} disabled={isSaving}>
              {isSaving ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}