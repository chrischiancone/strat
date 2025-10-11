'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
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
import { ChevronDown, ChevronUp, Pencil, Plus, Trash2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export interface EnvironmentalScanData {
  demographic_trends: string[]
  economic_factors: string[]
  regulatory_changes: string[]
  technology_trends: string[]
  community_expectations: string[]
}

interface EnvironmentalScanFormProps {
  initialScan?: EnvironmentalScanData
  onSave: (scan: EnvironmentalScanData) => Promise<void>
  disabled?: boolean
}

type ScanCategory = keyof EnvironmentalScanData

const CATEGORY_LABELS: Record<ScanCategory, string> = {
  demographic_trends: 'Demographic Trends',
  economic_factors: 'Economic Factors',
  regulatory_changes: 'Regulatory/Legislative Changes',
  technology_trends: 'Technology Trends',
  community_expectations: 'Community Expectations',
}

const CATEGORY_COLORS: Record<ScanCategory, string> = {
  demographic_trends: 'border-purple-200 bg-purple-50',
  economic_factors: 'border-green-200 bg-green-50',
  regulatory_changes: 'border-orange-200 bg-orange-50',
  technology_trends: 'border-blue-200 bg-blue-50',
  community_expectations: 'border-pink-200 bg-pink-50',
}

const CATEGORY_TEXT_COLORS: Record<ScanCategory, string> = {
  demographic_trends: 'text-purple-900',
  economic_factors: 'text-green-900',
  regulatory_changes: 'text-orange-900',
  technology_trends: 'text-blue-900',
  community_expectations: 'text-pink-900',
}

const CATEGORY_DESCRIPTIONS: Record<ScanCategory, string> = {
  demographic_trends: 'Population changes, age distribution, diversity trends, migration patterns',
  economic_factors: 'Economic conditions, employment, business development, tax base, property values',
  regulatory_changes: 'New laws, compliance requirements, mandates, grants, policy changes',
  technology_trends: 'Emerging tech, digital transformation, cybersecurity, automation, IT infrastructure',
  community_expectations: 'Citizen priorities, service expectations, transparency, equity concerns',
}

const MIN_LENGTH = 15
const MAX_LENGTH = 1000

export function EnvironmentalScanForm({
  initialScan,
  onSave,
  disabled = false,
}: EnvironmentalScanFormProps) {
  const { toast } = useToast()

  const [scan, setScan] = useState<EnvironmentalScanData>(
    initialScan || {
      demographic_trends: [],
      economic_factors: [],
      regulatory_changes: [],
      technology_trends: [],
      community_expectations: [],
    }
  )

  const [expandedCategories, setExpandedCategories] = useState<Set<ScanCategory>>(
    new Set(['demographic_trends'])
  )

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<ScanCategory>('demographic_trends')
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editingText, setEditingText] = useState('')

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deletingCategory, setDeletingCategory] = useState<ScanCategory>('demographic_trends')
  const [deletingIndex, setDeletingIndex] = useState<number>(0)

  const [isSaving, setIsSaving] = useState(false)

  const toggleCategory = (category: ScanCategory) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(category)) {
      newExpanded.delete(category)
    } else {
      newExpanded.add(category)
    }
    setExpandedCategories(newExpanded)
  }

  const handleAdd = (category: ScanCategory) => {
    setEditingCategory(category)
    setEditingIndex(null)
    setEditingText('')
    setIsEditDialogOpen(true)
  }

  const handleEdit = (category: ScanCategory, index: number) => {
    setEditingCategory(category)
    setEditingIndex(index)
    setEditingText(scan[category][index])
    setIsEditDialogOpen(true)
  }

  const handleSaveItem = async () => {
    const trimmedText = editingText.trim()

    // Validation
    if (trimmedText.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a description',
        variant: 'destructive',
      })
      return
    }

    if (trimmedText.length < MIN_LENGTH) {
      toast({
        title: 'Validation Error',
        description: `Entry must be at least ${MIN_LENGTH} characters`,
        variant: 'destructive',
      })
      return
    }

    if (trimmedText.length > MAX_LENGTH) {
      toast({
        title: 'Validation Error',
        description: `Entry cannot exceed ${MAX_LENGTH} characters`,
        variant: 'destructive',
      })
      return
    }

    // Check for duplicates (case-insensitive)
    const isDuplicate = scan[editingCategory].some(
      (item, idx) =>
        idx !== editingIndex && item.toLowerCase() === trimmedText.toLowerCase()
    )

    if (isDuplicate) {
      toast({
        title: 'Validation Error',
        description: 'This entry already exists in this category',
        variant: 'destructive',
      })
      return
    }

    // Update or add
    const newScan = { ...scan }
    if (editingIndex !== null) {
      // Edit existing
      newScan[editingCategory][editingIndex] = trimmedText
    } else {
      // Add new
      newScan[editingCategory] = [...newScan[editingCategory], trimmedText]
    }

    setScan(newScan)
    setIsEditDialogOpen(false)

    // Save to database
    setIsSaving(true)
    try {
      await onSave(newScan)
      toast({
        description: editingIndex !== null ? 'Entry updated successfully' : 'Entry added successfully',
      })
    } catch (error) {
      console.error('Error saving environmental scan:', error)
      toast({
        title: 'Error',
        description: 'Failed to save. Please try again.',
        variant: 'destructive',
      })
      // Revert changes
      setScan(scan)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteConfirm = async () => {
    const newScan = { ...scan }
    newScan[deletingCategory] = newScan[deletingCategory].filter(
      (_, idx) => idx !== deletingIndex
    )
    setScan(newScan)
    setIsDeleteDialogOpen(false)

    // Save to database
    setIsSaving(true)
    try {
      await onSave(newScan)
      toast({
        description: 'Entry deleted successfully',
      })
    } catch (error) {
      console.error('Error deleting entry:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete. Please try again.',
        variant: 'destructive',
      })
      // Revert changes
      setScan(scan)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = (category: ScanCategory, index: number) => {
    setDeletingCategory(category)
    setDeletingIndex(index)
    setIsDeleteDialogOpen(true)
  }

  const handleMoveUp = async (category: ScanCategory, index: number) => {
    if (index === 0) return

    const newScan = { ...scan }
    const items = [...newScan[category]]
    const temp = items[index]
    items[index] = items[index - 1]
    items[index - 1] = temp
    newScan[category] = items
    setScan(newScan)

    // Save to database
    try {
      await onSave(newScan)
    } catch (error) {
      console.error('Error reordering:', error)
      toast({
        title: 'Error',
        description: 'Failed to reorder. Please try again.',
        variant: 'destructive',
      })
      setScan(scan)
    }
  }

  const handleMoveDown = async (category: ScanCategory, index: number) => {
    if (index === scan[category].length - 1) return

    const newScan = { ...scan }
    const items = [...newScan[category]]
    const temp = items[index]
    items[index] = items[index + 1]
    items[index + 1] = temp
    newScan[category] = items
    setScan(newScan)

    // Save to database
    try {
      await onSave(newScan)
    } catch (error) {
      console.error('Error reordering:', error)
      toast({
        title: 'Error',
        description: 'Failed to reorder. Please try again.',
        variant: 'destructive',
      })
      setScan(scan)
    }
  }

  return (
    <div className="space-y-4">
      {(Object.keys(CATEGORY_LABELS) as ScanCategory[]).map((category) => {
        const isExpanded = expandedCategories.has(category)
        const items = scan[category]

        return (
          <Card
            key={category}
            className={`overflow-hidden border-2 ${CATEGORY_COLORS[category]}`}
          >
            <div className="p-4">
              <div className="flex items-start justify-between">
                <button
                  onClick={() => toggleCategory(category)}
                  className="flex-1 text-left"
                  disabled={disabled}
                >
                  <div className="flex items-center gap-2">
                    {isExpanded ? (
                      <ChevronDown className="h-5 w-5" />
                    ) : (
                      <ChevronUp className="h-5 w-5" />
                    )}
                    <div>
                      <h3 className={`font-semibold ${CATEGORY_TEXT_COLORS[category]}`}>
                        {CATEGORY_LABELS[category]}
                      </h3>
                      <p className="text-xs text-gray-600 mt-1">
                        {CATEGORY_DESCRIPTIONS[category]}
                      </p>
                      {!isExpanded && items.length > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          {items.length} {items.length === 1 ? 'entry' : 'entries'}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAdd(category)}
                  disabled={disabled || isSaving}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>

              {isExpanded && (
                <div className="mt-4 space-y-2">
                  {items.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">
                      No entries yet. Click &ldquo;Add&rdquo; to document {CATEGORY_LABELS[category].toLowerCase()}.
                    </p>
                  ) : (
                    items.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-2 rounded-md border border-gray-200 bg-white p-3"
                      >
                        <div className="flex-1">
                          <p className="text-sm text-gray-800">
                            {index + 1}. {item}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMoveUp(category, index)}
                            disabled={disabled || isSaving || index === 0}
                            aria-label="Move up"
                          >
                            <ChevronUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMoveDown(category, index)}
                            disabled={disabled || isSaving || index === items.length - 1}
                            aria-label="Move down"
                          >
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(category, index)}
                            disabled={disabled || isSaving}
                            aria-label="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(category, index)}
                            disabled={disabled || isSaving}
                            aria-label="Delete"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </Card>
        )
      })}

      {/* Add/Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingIndex !== null ? 'Edit' : 'Add'} {CATEGORY_LABELS[editingCategory]}
            </DialogTitle>
            <DialogDescription>
              {CATEGORY_DESCRIPTIONS[editingCategory]}. Be specific and include data where possible.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              value={editingText}
              onChange={(e) => setEditingText(e.target.value)}
              placeholder={`Describe the ${CATEGORY_LABELS[editingCategory].toLowerCase()}...`}
              rows={5}
              maxLength={MAX_LENGTH}
              className="resize-none"
            />
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>
                {editingText.trim().length} / {MAX_LENGTH} characters
              </span>
              <span>Minimum {MIN_LENGTH} characters required</span>
            </div>
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Entry</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this entry? This action cannot be undone.
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
