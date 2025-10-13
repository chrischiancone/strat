'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Plus, Edit, Trash2, ChevronUp, ChevronDown } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export interface SwotData {
  strengths: string[]
  weaknesses: string[]
  opportunities: string[]
  threats: string[]
}

interface SwotAnalysisFormProps {
  initialSwot?: SwotData
  onSave: (swot: SwotData) => Promise<void>
  disabled?: boolean
}

type SwotCategory = 'strengths' | 'weaknesses' | 'opportunities' | 'threats'

const CATEGORY_LABELS: Record<SwotCategory, string> = {
  strengths: 'Strengths',
  weaknesses: 'Weaknesses',
  opportunities: 'Opportunities',
  threats: 'Threats',
}

const CATEGORY_COLORS: Record<SwotCategory, string> = {
  strengths: 'border-green-200 bg-green-50',
  weaknesses: 'border-red-200 bg-red-50',
  opportunities: 'border-blue-200 bg-blue-50',
  threats: 'border-orange-200 bg-orange-50',
}

export function SwotAnalysisForm({
  initialSwot,
  onSave,
  disabled = false,
}: SwotAnalysisFormProps) {
  const [swot, setSwot] = useState<SwotData>({
    strengths: initialSwot?.strengths || [],
    weaknesses: initialSwot?.weaknesses || [],
    opportunities: initialSwot?.opportunities || [],
    threats: initialSwot?.threats || [],
  })
  const [showDialog, setShowDialog] = useState(false)
  const [editingCategory, setEditingCategory] = useState<SwotCategory | null>(null)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editingText, setEditingText] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<{
    category: SwotCategory
    index: number
  } | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  const handleAdd = (category: SwotCategory) => {
    setEditingCategory(category)
    setEditingIndex(null)
    setEditingText('')
    setShowDialog(true)
  }

  const handleEdit = (category: SwotCategory, index: number) => {
    setEditingCategory(category)
    setEditingIndex(index)
    setEditingText(swot[category][index])
    setShowDialog(true)
  }

  const handleSaveItem = async () => {
    if (!editingCategory) return

    // Split input by newlines and handle each item
    const items = editingText
      .split('\n')
      .map((item) => item.trim())
      .filter((item) => item.length > 0)

    // If we're editing, just handle the single item
    if (editingIndex !== null) {
      const trimmedText = items[0] // Only consider first item when editing

      // Validation for single item edit
      if (trimmedText.length < 10) {
        toast({
          title: 'Validation Error',
          description: 'Item must be at least 10 characters',
          variant: 'destructive',
        })
        return
      }

      if (trimmedText.length > 500) {
        toast({
          title: 'Validation Error',
          description: 'Item must be 500 characters or less',
          variant: 'destructive',
        })
        return
      }

      // Check for duplicates when editing
      const isDuplicate = swot[editingCategory].some(
        (item, idx) =>
          idx !== editingIndex &&
          item.toLowerCase() === trimmedText.toLowerCase()
      )

      if (isDuplicate) {
        toast({
          title: 'Warning',
          description: 'Similar item already exists in this category',
          variant: 'destructive',
        })
        return
      }

      const newItems = [...swot[editingCategory]]
      newItems[editingIndex] = trimmedText
      const newSwot = {
        ...swot,
        [editingCategory]: newItems,
      }
      setSwot(newSwot)
      
      // Auto-save to database
      setTimeout(async () => {
        try {
          await onSave(newSwot)
          toast({
            title: 'Saved',
            description: 'Item updated successfully',
          })
        } catch {
          toast({
            title: 'Error',
            description: 'Failed to save changes',
            variant: 'destructive',
          })
          // Revert on error
          setSwot(swot)
        }
      }, 0)
    } else {
      // Handle bulk items for new entries
      const validItems: string[] = []
      const errors: string[] = []
      const duplicates: string[] = []

      items.forEach((item) => {
        // Validate length
        if (item.length < 10) {
          errors.push(
            `"${item.slice(0, 20)}..." is too short (min 10 characters)`
          )
          return
        }
        if (item.length > 500) {
          errors.push(
            `"${item.slice(0, 20)}..." is too long (max 500 characters)`
          )
          return
        }

        // Check duplicates against existing items and previously processed valid items
        const isDuplicate =
          swot[editingCategory].some(
            (existing) => existing.toLowerCase() === item.toLowerCase()
          ) ||
          validItems.some((valid) => valid.toLowerCase() === item.toLowerCase())

        if (isDuplicate) {
          duplicates.push(item)
          return
        }

        validItems.push(item)
      })

      // Show validation messages if any
      if (errors.length > 0) {
        toast({
          title: 'Validation Errors',
          description: errors.join('\n'),
          variant: 'destructive',
        })
        return
      }

      if (duplicates.length > 0) {
        toast({
          title: 'Duplicate Items',
          description: `${duplicates.length} duplicate items were skipped`,
          variant: 'default',
        })
      }

      // Save valid items
      if (validItems.length > 0) {
        const newItems = [...swot[editingCategory], ...validItems]
        const newSwot = {
          ...swot,
          [editingCategory]: newItems,
        }
        setSwot(newSwot)

        // Auto-save to database
        setTimeout(async () => {
          try {
            await onSave(newSwot)
            if (validItems.length > 1) {
              toast({
                title: 'Success',
                description: `Added ${validItems.length} items to ${CATEGORY_LABELS[editingCategory]}`,
              })
            } else {
              toast({
                title: 'Saved',
                description: 'Item added successfully',
              })
            }
          } catch {
            toast({
              title: 'Error',
              description: 'Failed to save changes',
              variant: 'destructive',
            })
            // Revert on error
            setSwot(swot)
          }
        }, 0)
      }
    }

    setShowDialog(false)
    setEditingCategory(null)
    setEditingIndex(null)
    setEditingText('')
  }

  const handleDelete = (category: SwotCategory, index: number) => {
    setDeleteConfirm({ category, index })
  }

  const confirmDelete = async () => {
    if (!deleteConfirm) return

    const { category, index } = deleteConfirm
    const newItems = swot[category].filter((_, idx) => idx !== index)
    const newSwot = {
      ...swot,
      [category]: newItems,
    }
    const oldSwot = swot
    setSwot(newSwot)
    setDeleteConfirm(null)

    // Auto-save to database
    try {
      await onSave(newSwot)
      toast({
        title: 'Saved',
        description: 'Item deleted successfully',
      })
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to save changes',
        variant: 'destructive',
      })
      // Revert on error
      setSwot(oldSwot)
    }
  }

  const handleMoveUp = async (category: SwotCategory, index: number) => {
    if (index === 0) return

    const newItems = [...swot[category]]
    const temp = newItems[index]
    newItems[index] = newItems[index - 1]
    newItems[index - 1] = temp
    const newSwot = {
      ...swot,
      [category]: newItems,
    }
    const oldSwot = swot
    setSwot(newSwot)

    // Auto-save to database
    try {
      await onSave(newSwot)
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to save changes',
        variant: 'destructive',
      })
      // Revert on error
      setSwot(oldSwot)
    }
  }

  const handleMoveDown = async (category: SwotCategory, index: number) => {
    if (index === swot[category].length - 1) return

    const newItems = [...swot[category]]
    const temp = newItems[index]
    newItems[index] = newItems[index + 1]
    newItems[index + 1] = temp
    const newSwot = {
      ...swot,
      [category]: newItems,
    }
    const oldSwot = swot
    setSwot(newSwot)

    // Auto-save to database
    try {
      await onSave(newSwot)
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to save changes',
        variant: 'destructive',
      })
      // Revert on error
      setSwot(oldSwot)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave(swot)
      toast({
        title: 'Saved',
        description: 'SWOT analysis saved successfully',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to save SWOT analysis',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const renderCategory = (category: SwotCategory) => {
    const items = swot[category]

    return (
      <Card key={category} className={CATEGORY_COLORS[category]}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">{CATEGORY_LABELS[category]}</CardTitle>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleAdd(category)}
              disabled={disabled}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No items added yet. Click &ldquo;Add Item&rdquo; to begin.
            </p>
          ) : (
            <div className="space-y-2">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 rounded-md bg-white border border-gray-200 p-3"
                >
                  <span className="text-sm font-medium text-gray-500 min-w-[20px]">
                    {index + 1}.
                  </span>
                  <p className="flex-1 text-sm text-gray-700">{item}</p>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMoveUp(category, index)}
                      disabled={disabled || index === 0}
                      title="Move up"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMoveDown(category, index)}
                      disabled={disabled || index === items.length - 1}
                      title="Move down"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(category, index)}
                      disabled={disabled}
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(category, index)}
                      disabled={disabled}
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return <>
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {renderCategory('strengths')}
        {renderCategory('weaknesses')}
        {renderCategory('opportunities')}
        {renderCategory('threats')}
      </div>

      <div className="flex justify-end border-t border-gray-200 pt-4">
        <Button onClick={handleSave} disabled={disabled || isSaving}>
          {isSaving ? 'Saving...' : 'Save SWOT Analysis'}
        </Button>
      </div>
    </div>

    {/* Add/Edit Dialog */}
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editingIndex !== null ? 'Edit' : 'Add'}{' '}
            {editingCategory && CATEGORY_LABELS[editingCategory].slice(0, -1)}
          </DialogTitle>
          <DialogDescription>
            {editingIndex !== null
              ? 'Update the item text below'
              : 'Enter items below (10-500 characters each)\nAdd multiple items by putting each on a new line'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Textarea
            value={editingText}
            onChange={(e) => setEditingText(e.target.value)}
            placeholder="Enter item text..."
            rows={8}
            maxLength={500}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground text-right">
            {editingText.length}/500 characters
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setShowDialog(false)}>
            Cancel
          </Button>
          <Button onClick={handleSaveItem}>
            {editingIndex !== null ? 'Update' : 'Add'} Item
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* Delete Confirmation Dialog */}
    <AlertDialog
      open={!!deleteConfirm}
      onOpenChange={() => setDeleteConfirm(null)}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Item?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this item? This action cannot be
            undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={confirmDelete}
            className="bg-red-600 hover:bg-red-700"
          >
            Delete Item
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </>
}
