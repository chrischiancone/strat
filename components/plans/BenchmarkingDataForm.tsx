'use client'

import { useState } from 'react'
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
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export interface BenchmarkingMetric {
  metric_name: string
  carrollton_current: string
  peer_average: string
  gap_analysis: string
}

export interface BenchmarkingData {
  peer_municipalities: string[]
  metrics: BenchmarkingMetric[]
  key_findings: string[]
}

interface BenchmarkingDataFormProps {
  initialData?: BenchmarkingData
  onSave: (data: BenchmarkingData) => Promise<void>
  disabled?: boolean
}

type EditMode = 'peer' | 'metric' | 'finding' | null

export function BenchmarkingDataForm({
  initialData,
  onSave,
  disabled = false,
}: BenchmarkingDataFormProps) {
  const { toast } = useToast()

  const [data, setData] = useState<BenchmarkingData>(
    initialData || {
      peer_municipalities: [],
      metrics: [],
      key_findings: [],
    }
  )

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editMode, setEditMode] = useState<EditMode>(null)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  // Peer municipality state
  const [peerMunicipality, setPeerMunicipality] = useState('')

  // Metric state
  const [metricName, setMetricName] = useState('')
  const [carrolltonCurrent, setCarrolltonCurrent] = useState('')
  const [peerAverage, setPeerAverage] = useState('')
  const [gapAnalysis, setGapAnalysis] = useState('')

  // Key finding state
  const [keyFinding, setKeyFinding] = useState('')

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deleteMode, setDeleteMode] = useState<EditMode>(null)
  const [deletingIndex, setDeletingIndex] = useState<number>(0)

  const [isSaving, setIsSaving] = useState(false)

  // Add handlers
  const handleAddPeer = () => {
    setEditMode('peer')
    setEditingIndex(null)
    setPeerMunicipality('')
    setIsEditDialogOpen(true)
  }

  const handleAddMetric = () => {
    setEditMode('metric')
    setEditingIndex(null)
    setMetricName('')
    setCarrolltonCurrent('')
    setPeerAverage('')
    setGapAnalysis('')
    setIsEditDialogOpen(true)
  }

  const handleAddFinding = () => {
    setEditMode('finding')
    setEditingIndex(null)
    setKeyFinding('')
    setIsEditDialogOpen(true)
  }

  // Edit handlers
  const handleEditPeer = (index: number) => {
    setEditMode('peer')
    setEditingIndex(index)
    setPeerMunicipality(data.peer_municipalities[index])
    setIsEditDialogOpen(true)
  }

  const handleEditMetric = (index: number) => {
    setEditMode('metric')
    setEditingIndex(index)
    const metric = data.metrics[index]
    setMetricName(metric.metric_name)
    setCarrolltonCurrent(metric.carrollton_current)
    setPeerAverage(metric.peer_average)
    setGapAnalysis(metric.gap_analysis)
    setIsEditDialogOpen(true)
  }

  const handleEditFinding = (index: number) => {
    setEditMode('finding')
    setEditingIndex(index)
    setKeyFinding(data.key_findings[index])
    setIsEditDialogOpen(true)
  }

  // Save handler
  const handleSaveItem = async () => {
    if (editMode === 'peer') {
      const trimmed = peerMunicipality.trim()

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
    } else if (editMode === 'metric') {
      const trimmedName = metricName.trim()
      const trimmedCurrent = carrolltonCurrent.trim()
      const trimmedAverage = peerAverage.trim()
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
          description: 'Carrollton current value must be 1-100 characters',
          variant: 'destructive',
        })
        return
      }

      if (trimmedAverage.length < 1 || trimmedAverage.length > 100) {
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
        carrollton_current: trimmedCurrent,
        peer_average: trimmedAverage,
        gap_analysis: trimmedGap,
      }

      const newData = { ...data }
      if (editingIndex !== null) {
        newData.metrics[editingIndex] = newMetric
      } else {
        newData.metrics = [...newData.metrics, newMetric]
      }

      await saveData(newData, editingIndex !== null ? 'Metric updated' : 'Metric added')
    } else if (editMode === 'finding') {
      const trimmed = keyFinding.trim()

      if (trimmed.length < 20) {
        toast({
          title: 'Validation Error',
          description: 'Key finding must be at least 20 characters',
          variant: 'destructive',
        })
        return
      }

      if (trimmed.length > 1000) {
        toast({
          title: 'Validation Error',
          description: 'Key finding cannot exceed 1000 characters',
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

  const saveData = async (newData: BenchmarkingData, successMessage: string) => {
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

  // Delete handlers
  const handleDelete = (mode: EditMode, index: number) => {
    setDeleteMode(mode)
    setDeletingIndex(index)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    const newData = { ...data }

    if (deleteMode === 'peer') {
      newData.peer_municipalities = newData.peer_municipalities.filter((_, idx) => idx !== deletingIndex)
    } else if (deleteMode === 'metric') {
      newData.metrics = newData.metrics.filter((_, idx) => idx !== deletingIndex)
    } else if (deleteMode === 'finding') {
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

  return (
    <div className="space-y-6">
      {/* Peer Municipalities */}
      <Card className="border-2 border-blue-200 bg-blue-50">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-blue-900">Peer Municipalities</h3>
              <p className="text-xs text-gray-600 mt-1">
                List comparable cities/counties used for benchmarking
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddPeer}
              disabled={disabled || isSaving}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
          <div className="space-y-2">
            {data.peer_municipalities.length === 0 ? (
              <p className="text-sm text-gray-500 italic">
                No peer municipalities added yet. Click &ldquo;Add&rdquo; to get started.
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
                      onClick={() => handleEditPeer(index)}
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
      </Card>

      {/* Benchmarking Metrics */}
      <Card className="border-2 border-purple-200 bg-purple-50">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-purple-900">Benchmarking Metrics</h3>
              <p className="text-xs text-gray-600 mt-1">
                Compare key performance indicators with peer averages
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddMetric}
              disabled={disabled || isSaving}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Metric
            </Button>
          </div>
          {data.metrics.length === 0 ? (
            <p className="text-sm text-gray-500 italic">
              No metrics added yet. Click &ldquo;Add Metric&rdquo; to get started.
            </p>
          ) : (
            <div className="rounded-md border border-gray-200 bg-white overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[30%]">Metric</TableHead>
                    <TableHead className="w-[15%]">Carrollton Current</TableHead>
                    <TableHead className="w-[15%]">Peer Average</TableHead>
                    <TableHead className="w-[30%]">Gap Analysis</TableHead>
                    <TableHead className="w-[10%]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.metrics.map((metric, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{metric.metric_name}</TableCell>
                      <TableCell>{metric.carrollton_current}</TableCell>
                      <TableCell>{metric.peer_average}</TableCell>
                      <TableCell className="text-sm">{metric.gap_analysis}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditMetric(index)}
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
      </Card>

      {/* Key Findings */}
      <Card className="border-2 border-green-200 bg-green-50">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-green-900">Key Findings</h3>
              <p className="text-xs text-gray-600 mt-1">
                Summarize important insights from the benchmarking analysis
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddFinding}
              disabled={disabled || isSaving}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Finding
            </Button>
          </div>
          <div className="space-y-2">
            {data.key_findings.length === 0 ? (
              <p className="text-sm text-gray-500 italic">
                No findings added yet. Click &ldquo;Add Finding&rdquo; to get started.
              </p>
            ) : (
              data.key_findings.map((finding, index) => (
                <div
                  key={index}
                  className="flex items-start justify-between rounded-md border border-gray-200 bg-white p-3"
                >
                  <span className="text-sm text-gray-800 flex-1">
                    {index + 1}. {finding}
                  </span>
                  <div className="flex gap-1 ml-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditFinding(index)}
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
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingIndex !== null ? 'Edit' : 'Add'}{' '}
              {editMode === 'peer'
                ? 'Peer Municipality'
                : editMode === 'metric'
                ? 'Benchmarking Metric'
                : 'Key Finding'}
            </DialogTitle>
            <DialogDescription>
              {editMode === 'peer'
                ? 'Enter the name of a comparable city or county'
                : editMode === 'metric'
                ? 'Enter all metric details for comparison'
                : 'Summarize an important insight from your benchmarking analysis'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {editMode === 'peer' && (
              <div>
                <Label htmlFor="municipality">Municipality Name</Label>
                <Input
                  id="municipality"
                  value={peerMunicipality}
                  onChange={(e) => setPeerMunicipality(e.target.value)}
                  placeholder="e.g., Plano, TX"
                  maxLength={100}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {peerMunicipality.length} / 100 characters
                </p>
              </div>
            )}

            {editMode === 'metric' && (
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
                  <Label htmlFor="carrollton-current">Carrollton Current Value *</Label>
                  <Input
                    id="carrollton-current"
                    value={carrolltonCurrent}
                    onChange={(e) => setCarrolltonCurrent(e.target.value)}
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

            {editMode === 'finding' && (
              <div>
                <Label htmlFor="finding">Key Finding</Label>
                <Textarea
                  id="finding"
                  value={keyFinding}
                  onChange={(e) => setKeyFinding(e.target.value)}
                  placeholder="Summarize an important insight..."
                  rows={4}
                  maxLength={1000}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {keyFinding.length} / 1000 characters (min 20)
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
