'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Badge } from '@/components/ui/badge'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export interface InitiativeKpi {
  id: string
  initiative_id: string
  metric_name: string
  measurement_frequency: 'monthly' | 'quarterly' | 'annual' | 'continuous'
  baseline_value: string
  year_1_target: string
  year_2_target: string
  year_3_target: string
  data_source: string | null
  responsible_party: string | null
  created_at: string
  updated_at: string
}

interface InitiativeKpisFormProps {
  initiativeId: string
  kpis: InitiativeKpi[]
  onAdd: (kpi: Omit<InitiativeKpi, 'id' | 'created_at' | 'updated_at'>) => Promise<{ id: string }>
  onUpdate: (id: string, kpi: Partial<InitiativeKpi>) => Promise<void>
  onDelete: (id: string) => Promise<void>
  disabled?: boolean
}

const MEASUREMENT_FREQUENCIES = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'annual', label: 'Annually' },
  { value: 'continuous', label: 'Continuous' },
] as const

export function InitiativeKpisForm({
  initiativeId,
  kpis,
  onAdd,
  onUpdate,
  onDelete,
  disabled = false,
}: InitiativeKpisFormProps) {
  const [showDialog, setShowDialog] = useState(false)
  const [editingKpi, setEditingKpi] = useState<InitiativeKpi | null>(null)
  const [deletingKpi, setDeletingKpi] = useState<InitiativeKpi | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  // Form state
  const [metricName, setMetricName] = useState('')
  const [frequency, setFrequency] = useState<'monthly' | 'quarterly' | 'annual' | 'continuous'>('monthly')
  const [baseline, setBaseline] = useState('')
  const [year1Target, setYear1Target] = useState('')
  const [year2Target, setYear2Target] = useState('')
  const [year3Target, setYear3Target] = useState('')
  const [dataSource, setDataSource] = useState('')
  const [responsibleParty, setResponsibleParty] = useState('')

  const resetForm = () => {
    setMetricName('')
    setFrequency('monthly')
    setBaseline('')
    setYear1Target('')
    setYear2Target('')
    setYear3Target('')
    setDataSource('')
    setResponsibleParty('')
    setEditingKpi(null)
  }

  const handleAdd = () => {
    resetForm()
    setShowDialog(true)
  }

  const handleEdit = (kpi: InitiativeKpi) => {
    setMetricName(kpi.metric_name)
    setFrequency(kpi.measurement_frequency)
    setBaseline(kpi.baseline_value)
    setYear1Target(kpi.year_1_target)
    setYear2Target(kpi.year_2_target)
    setYear3Target(kpi.year_3_target)
    setDataSource(kpi.data_source || '')
    setResponsibleParty(kpi.responsible_party || '')
    setEditingKpi(kpi)
    setShowDialog(true)
  }

  const handleSave = async () => {
    // Validation
    if (!metricName.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Metric name is required',
        variant: 'destructive',
      })
      return
    }

    if (!baseline.trim() || !year1Target.trim() || !year2Target.trim() || !year3Target.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Baseline and all year targets are required',
        variant: 'destructive',
      })
      return
    }

    setIsSaving(true)
    try {
      const kpiData = {
        initiative_id: initiativeId,
        metric_name: metricName.trim(),
        measurement_frequency: frequency,
        baseline_value: baseline.trim(),
        year_1_target: year1Target.trim(),
        year_2_target: year2Target.trim(),
        year_3_target: year3Target.trim(),
        data_source: dataSource.trim() || null,
        responsible_party: responsibleParty.trim() || null,
      }

      if (editingKpi) {
        await onUpdate(editingKpi.id, kpiData)
        toast({
          title: 'Updated',
          description: 'KPI updated successfully',
        })
      } else {
        await onAdd(kpiData)
        toast({
          title: 'Created',
          description: 'KPI created successfully',
        })
      }

      setShowDialog(false)
      resetForm()
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save KPI',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingKpi) return

    setIsDeleting(true)
    try {
      await onDelete(deletingKpi.id)
      toast({
        title: 'Deleted',
        description: 'KPI deleted successfully',
      })
      setDeletingKpi(null)
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete KPI',
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const getFrequencyLabel = (freq: string) => {
    return MEASUREMENT_FREQUENCIES.find((f) => f.value === freq)?.label || freq
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-sm text-gray-900">
          Key Performance Indicators {kpis.length > 0 && `(${kpis.length})`}
        </h4>
        <Button
          size="sm"
          onClick={handleAdd}
          disabled={disabled}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add KPI
        </Button>
      </div>

      {kpis.length === 0 ? (
        <div className="rounded-md border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
          <p className="text-sm text-gray-500">
            No KPIs defined yet. Click &quot;Add KPI&quot; to create one.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {kpis.map((kpi) => (
            <div
              key={kpi.id}
              className="rounded-lg border border-gray-200 bg-white p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h5 className="font-semibold text-sm text-gray-900">
                      {kpi.metric_name}
                    </h5>
                    <Badge variant="outline" className="text-xs">
                      {getFrequencyLabel(kpi.measurement_frequency)}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>
                      <span className="font-medium">Baseline:</span> {kpi.baseline_value}
                      {' → '}
                      <span className="font-medium">Year 1:</span> {kpi.year_1_target}
                      {' → '}
                      <span className="font-medium">Year 2:</span> {kpi.year_2_target}
                      {' → '}
                      <span className="font-medium">Year 3:</span> {kpi.year_3_target}
                    </p>
                    {kpi.data_source && (
                      <p>
                        <span className="font-medium">Data Source:</span> {kpi.data_source}
                      </p>
                    )}
                    {kpi.responsible_party && (
                      <p>
                        <span className="font-medium">Responsible:</span> {kpi.responsible_party}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(kpi)}
                    disabled={disabled}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeletingKpi(kpi)}
                    disabled={disabled}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit KPI Dialog */}
      <Dialog open={showDialog} onOpenChange={(open) => {
        setShowDialog(open)
        if (!open) resetForm()
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingKpi ? 'Edit' : 'Add'} Key Performance Indicator</DialogTitle>
            <DialogDescription>
              Define a measurable metric to track initiative progress
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Metric Name */}
            <div>
              <Label htmlFor="metric_name">Metric Name *</Label>
              <Input
                id="metric_name"
                value={metricName}
                onChange={(e) => setMetricName(e.target.value)}
                disabled={isSaving}
                placeholder="e.g., Response Time, Citizen Satisfaction"
                className="mt-1"
                required
                maxLength={200}
              />
            </div>

            {/* Measurement Frequency */}
            <div>
              <Label>Measurement Frequency *</Label>
              <RadioGroup
                value={frequency}
                onValueChange={(value) => setFrequency(value as typeof frequency)}
                disabled={isSaving}
                className="mt-2 grid grid-cols-2 gap-3"
              >
                {MEASUREMENT_FREQUENCIES.map((freq) => (
                  <div key={freq.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={freq.value} id={freq.value} />
                    <Label
                      htmlFor={freq.value}
                      className="font-normal cursor-pointer"
                    >
                      {freq.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Baseline Value */}
            <div>
              <Label htmlFor="baseline">Baseline Value *</Label>
              <Input
                id="baseline"
                value={baseline}
                onChange={(e) => setBaseline(e.target.value)}
                disabled={isSaving}
                placeholder="e.g., 15, 72.5%, $10000"
                className="mt-1"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Current or starting value for this metric
              </p>
            </div>

            {/* Year Targets */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="year1">Year 1 Target *</Label>
                <Input
                  id="year1"
                  value={year1Target}
                  onChange={(e) => setYear1Target(e.target.value)}
                  disabled={isSaving}
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="year2">Year 2 Target *</Label>
                <Input
                  id="year2"
                  value={year2Target}
                  onChange={(e) => setYear2Target(e.target.value)}
                  disabled={isSaving}
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="year3">Year 3 Target *</Label>
                <Input
                  id="year3"
                  value={year3Target}
                  onChange={(e) => setYear3Target(e.target.value)}
                  disabled={isSaving}
                  className="mt-1"
                  required
                />
              </div>
            </div>

            {/* Data Source */}
            <div>
              <Label htmlFor="data_source">Data Source</Label>
              <Input
                id="data_source"
                value={dataSource}
                onChange={(e) => setDataSource(e.target.value)}
                disabled={isSaving}
                placeholder="e.g., CAD System, Annual Survey"
                className="mt-1"
                maxLength={200}
              />
              <p className="mt-1 text-xs text-gray-500">
                Where will the data come from?
              </p>
            </div>

            {/* Responsible Party */}
            <div>
              <Label htmlFor="responsible_party">Responsible Party</Label>
              <Input
                id="responsible_party"
                value={responsibleParty}
                onChange={(e) => setResponsibleParty(e.target.value)}
                disabled={isSaving}
                placeholder="e.g., Operations Manager, Data Analyst"
                className="mt-1"
                maxLength={200}
              />
              <p className="mt-1 text-xs text-gray-500">
                Who is responsible for tracking this metric?
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-gray-200 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowDialog(false)
                resetForm()
              }}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : editingKpi ? 'Update KPI' : 'Add KPI'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingKpi} onOpenChange={() => setDeletingKpi(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete KPI?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deletingKpi?.metric_name}&quot;?
              <span className="block mt-2">This action cannot be undone.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Deleting...' : 'Delete KPI'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
