'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { FUNDING_STATUSES } from '@/lib/constants/strategic-planning'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export interface FundingSource {
  id: string
  funding_source: string
  amount: number
  funding_status: string
  fiscal_year_id: string
}

interface FundingSourcesFormProps {
  initiativeId: string
  fiscalYearId: string
  totalBudget: number
  fundingSources: FundingSource[]
  onAdd: (source: Omit<FundingSource, 'id'>) => Promise<{ id: string }>
  onUpdate: (id: string, source: Partial<FundingSource>) => Promise<void>
  onDelete: (id: string) => Promise<void>
  disabled?: boolean
}

export function FundingSourcesForm({
  initiativeId: _initiativeId,
  fiscalYearId,
  totalBudget,
  fundingSources,
  onAdd,
  onUpdate,
  onDelete,
  disabled = false,
}: FundingSourcesFormProps) {
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingSource, setEditingSource] = useState<FundingSource | null>(null)
  const [deletingSource, setDeletingSource] = useState<FundingSource | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const { toast } = useToast()

  // Form state for add/edit
  const [sourceName, setSourceName] = useState('')
  const [amount, setAmount] = useState('')
  const [status, setStatus] = useState('projected')

  const totalFunding = fundingSources.reduce((sum, s) => sum + s.amount, 0)
  const difference = totalFunding - totalBudget
  const isBalanced = Math.abs(difference) < 0.01 // Allow for floating point errors
  const isUnderFunded = difference < -0.01
  const isOverFunded = difference > 0.01

  const resetForm = () => {
    setSourceName('')
    setAmount('')
    setStatus('projected')
  }

  const handleAdd = async () => {
    if (!sourceName.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Funding source name is required',
        variant: 'destructive',
      })
      return
    }

    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Amount must be greater than 0',
        variant: 'destructive',
      })
      return
    }

    setIsProcessing(true)
    try {
      await onAdd({
        funding_source: sourceName.trim(),
        amount: numAmount,
        funding_status: status,
        fiscal_year_id: fiscalYearId,
      })

      toast({
        title: 'Added',
        description: 'Funding source added successfully',
      })

      setShowAddDialog(false)
      resetForm()
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to add funding source',
        variant: 'destructive',
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleUpdate = async () => {
    if (!editingSource) return

    if (!sourceName.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Funding source name is required',
        variant: 'destructive',
      })
      return
    }

    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Amount must be greater than 0',
        variant: 'destructive',
      })
      return
    }

    setIsProcessing(true)
    try {
      await onUpdate(editingSource.id, {
        funding_source: sourceName.trim(),
        amount: numAmount,
        funding_status: status,
      })

      toast({
        title: 'Updated',
        description: 'Funding source updated successfully',
      })

      setEditingSource(null)
      resetForm()
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to update funding source',
        variant: 'destructive',
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingSource) return

    setIsProcessing(true)
    try {
      await onDelete(deletingSource.id)

      toast({
        title: 'Deleted',
        description: 'Funding source deleted successfully',
      })

      setDeletingSource(null)
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to delete funding source',
        variant: 'destructive',
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const openEditDialog = (source: FundingSource) => {
    setEditingSource(source)
    setSourceName(source.funding_source)
    setAmount(source.amount.toString())
    setStatus(source.funding_status)
  }

  const getFundingStatusBadge = (status: string) => {
    switch (status) {
      case 'secured':
        return 'bg-green-100 text-green-800'
      case 'requested':
        return 'bg-blue-100 text-blue-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'projected':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base font-semibold">Funding Sources</Label>
            <p className="text-sm text-gray-500 mt-1">
              Add funding sources for this initiative
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => setShowAddDialog(true)}
            disabled={disabled}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Source
          </Button>
        </div>

        {fundingSources.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
            <p className="text-sm text-gray-600">
              No funding sources added yet. Click &quot;Add Source&quot; to get
              started.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {fundingSources.map((source) => (
              <div
                key={source.id}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4"
              >
                <div className="flex-1">
                  <p className="font-medium">{source.funding_source}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-gray-600">
                      {formatCurrency(source.amount)}
                    </span>
                    <Badge className={getFundingStatusBadge(source.funding_status)}>
                      {FUNDING_STATUSES.find((s) => s.value === source.funding_status)
                        ?.label || source.funding_status}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(source)}
                    disabled={disabled}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeletingSource(source)}
                    disabled={disabled}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Funding Summary */}
        <div className="rounded-lg border border-gray-300 bg-gray-50 p-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Funding:</span>
              <span className="font-semibold">{formatCurrency(totalFunding)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Budget Needed:</span>
              <span className="font-semibold">{formatCurrency(totalBudget)}</span>
            </div>
            <div className="flex justify-between text-sm border-t border-gray-300 pt-2">
              <span className="text-gray-600">Status:</span>
              <span>
                {isBalanced && (
                  <Badge className="bg-green-100 text-green-800">
                    ✓ Balanced
                  </Badge>
                )}
                {isUnderFunded && (
                  <Badge className="bg-red-100 text-red-800">
                    ⚠ Under-funded by {formatCurrency(Math.abs(difference))}
                  </Badge>
                )}
                {isOverFunded && (
                  <Badge className="bg-orange-100 text-orange-800">
                    ⚠ Over-funded by {formatCurrency(difference)}
                  </Badge>
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog
        open={showAddDialog || !!editingSource}
        onOpenChange={(open) => {
          if (!open) {
            setShowAddDialog(false)
            setEditingSource(null)
            resetForm()
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingSource ? 'Edit Funding Source' : 'Add Funding Source'}
            </DialogTitle>
            <DialogDescription>
              Enter the details for this funding source
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="source_name">Source Name *</Label>
              <Input
                id="source_name"
                value={sourceName}
                onChange={(e) => setSourceName(e.target.value)}
                placeholder="e.g., General Fund, State Grant"
                disabled={isProcessing}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                disabled={isProcessing}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="status">Status *</Label>
              <Select value={status} onValueChange={setStatus} disabled={isProcessing}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FUNDING_STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label} - {s.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowAddDialog(false)
                setEditingSource(null)
                resetForm()
              }}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={editingSource ? handleUpdate : handleAdd}
              disabled={isProcessing}
            >
              {isProcessing ? 'Saving...' : editingSource ? 'Update' : 'Add'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deletingSource}
        onOpenChange={() => setDeletingSource(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Funding Source?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;
              {deletingSource?.funding_source}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isProcessing}
              className="bg-red-600 hover:bg-red-700"
            >
              {isProcessing ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
