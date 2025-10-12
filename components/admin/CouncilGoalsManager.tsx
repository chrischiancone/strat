'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Pencil, Trash2, GripVertical, Flag, Target } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { 
  CouncilGoal, 
  createCouncilGoal, 
  updateCouncilGoal, 
  deleteCouncilGoal,
  CreateCouncilGoalInput 
} from '@/app/actions/council-goals'

interface CouncilGoalsManagerProps {
  initialGoals: CouncilGoal[]
}

export function CouncilGoalsManager({ initialGoals }: CouncilGoalsManagerProps) {
  const { toast } = useToast()
  const [goals, setGoals] = useState<CouncilGoal[]>(initialGoals)
  
  // Dialog states
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<CouncilGoal | null>(null)
  const [deletingGoal, setDeletingGoal] = useState<CouncilGoal | null>(null)
  
  // Form states
  const [formCategory, setFormCategory] = useState<'core_value' | 'focus_area'>('core_value')
  const [formTitle, setFormTitle] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formKeyPoints, setFormKeyPoints] = useState<string[]>([''])
  
  // Loading states
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const coreValues = goals.filter(goal => goal.category === 'core_value')
  const focusAreas = goals.filter(goal => goal.category === 'focus_area')

  const resetForm = () => {
    setFormCategory('core_value')
    setFormTitle('')
    setFormDescription('')
    setFormKeyPoints([''])
  }

  const handleAdd = () => {
    resetForm()
    setEditingGoal(null)
    setIsEditDialogOpen(true)
  }

  const handleEdit = (goal: CouncilGoal) => {
    setFormCategory(goal.category)
    setFormTitle(goal.title)
    setFormDescription(goal.description)
    setFormKeyPoints(goal.key_points.length > 0 ? goal.key_points : [''])
    setEditingGoal(goal)
    setIsEditDialogOpen(true)
  }

  const handleDelete = (goal: CouncilGoal) => {
    setDeletingGoal(goal)
    setIsDeleteDialogOpen(true)
  }

  const addKeyPoint = () => {
    setFormKeyPoints([...formKeyPoints, ''])
  }

  const updateKeyPoint = (index: number, value: string) => {
    const updated = [...formKeyPoints]
    updated[index] = value
    setFormKeyPoints(updated)
  }

  const removeKeyPoint = (index: number) => {
    if (formKeyPoints.length > 1) {
      const updated = formKeyPoints.filter((_, i) => i !== index)
      setFormKeyPoints(updated)
    }
  }

  const handleSave = async () => {
    if (!formTitle.trim() || !formDescription.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Title and description are required',
        variant: 'destructive',
      })
      return
    }

    const cleanKeyPoints = formKeyPoints.filter(point => point.trim() !== '')

    setIsSaving(true)
    try {
      if (editingGoal) {
        // Update existing goal
        await updateCouncilGoal({
          id: editingGoal.id,
          title: formTitle.trim(),
          description: formDescription.trim(),
          key_points: cleanKeyPoints,
        })

        // Update local state
        setGoals(prev => prev.map(goal => 
          goal.id === editingGoal.id 
            ? { ...goal, title: formTitle.trim(), description: formDescription.trim(), key_points: cleanKeyPoints }
            : goal
        ))

        toast({
          title: 'Goal Updated',
          description: `${formTitle} has been updated successfully`,
        })
      } else {
        // Create new goal
        const input: CreateCouncilGoalInput = {
          category: formCategory,
          title: formTitle.trim(),
          description: formDescription.trim(),
          key_points: cleanKeyPoints,
        }

        const newGoal = await createCouncilGoal(input)
        setGoals(prev => [...prev, newGoal])

        toast({
          title: 'Goal Created',
          description: `${formTitle} has been created successfully`,
        })
      }

      setIsEditDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error('Error saving goal:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save goal',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deletingGoal) return

    setIsDeleting(true)
    try {
      await deleteCouncilGoal(deletingGoal.id)
      
      // Update local state
      setGoals(prev => prev.filter(goal => goal.id !== deletingGoal.id))
      
      toast({
        title: 'Goal Deleted',
        description: `${deletingGoal.title} has been deleted`,
      })
      
      setIsDeleteDialogOpen(false)
      setDeletingGoal(null)
    } catch (error) {
      console.error('Error deleting goal:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete goal',
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const GoalCard = ({ goal }: { goal: CouncilGoal }) => (
    <Card key={goal.id} className="relative">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {goal.category === 'core_value' ? (
              <Flag className="h-5 w-5 text-blue-600" />
            ) : (
              <Target className="h-5 w-5 text-purple-600" />
            )}
            <CardTitle className="text-lg">{goal.title}</CardTitle>
            <Badge variant={goal.category === 'core_value' ? 'default' : 'secondary'}>
              {goal.category === 'core_value' ? 'Core Value' : 'Focus Area'}
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEdit(goal)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(goal)}
            >
              <Trash2 className="h-4 w-4 text-red-600" />
            </Button>
          </div>
        </div>
        <CardDescription className="mt-2">{goal.description}</CardDescription>
      </CardHeader>
      {goal.key_points && goal.key_points.length > 0 && (
        <CardContent className="pt-0">
          <div className="space-y-1">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Key Points:</h4>
            <ul className="space-y-1">
              {goal.key_points.map((point, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                  <span className="text-gray-400 mt-0.5">•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      )}
    </Card>
  )

  return (
    <div className="space-y-8">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          {goals.length} total goals ({coreValues.length} core values, {focusAreas.length} focus areas)
        </div>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Add Goal
        </Button>
      </div>

      {/* Core Values Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Flag className="h-5 w-5 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Core Values</h2>
          <Badge>{coreValues.length}</Badge>
        </div>
        {coreValues.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <Flag className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">No core values defined yet</p>
              <Button variant="outline" onClick={handleAdd} className="mt-2">
                Add First Core Value
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {coreValues.map(goal => <GoalCard key={goal.id} goal={goal} />)}
          </div>
        )}
      </div>

      {/* Focus Areas Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Target className="h-5 w-5 text-purple-600" />
          <h2 className="text-xl font-semibold text-gray-900">Strategic Focus Areas</h2>
          <Badge>{focusAreas.length}</Badge>
        </div>
        {focusAreas.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <Target className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">No focus areas defined yet</p>
              <Button variant="outline" onClick={handleAdd} className="mt-2">
                Add First Focus Area
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {focusAreas.map(goal => <GoalCard key={goal.id} goal={goal} />)}
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingGoal ? 'Edit Goal' : 'Add New Goal'}
            </DialogTitle>
            <DialogDescription>
              {editingGoal 
                ? 'Update the goal details below'
                : 'Create a new strategic goal or core value that departments will align with'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                value={formCategory}
                onValueChange={(value) => setFormCategory(value as 'core_value' | 'focus_area')}
                disabled={!!editingGoal} // Don't allow changing category when editing
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="core_value">Core Value</SelectItem>
                  <SelectItem value="focus_area">Strategic Focus Area</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="e.g., Hospitality, Economic Development"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Describe what this goal means and why it's important..."
                rows={3}
                className="mt-1"
              />
            </div>

            <div>
              <Label>Key Points</Label>
              <div className="space-y-2 mt-1">
                {formKeyPoints.map((point, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={point}
                      onChange={(e) => updateKeyPoint(index, e.target.value)}
                      placeholder="Enter a key point or sub-goal..."
                    />
                    {formKeyPoints.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeKeyPoint(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addKeyPoint}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Key Point
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : (editingGoal ? 'Update Goal' : 'Create Goal')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Goal</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deletingGoal?.title}&quot;? This action cannot be undone.
              Departments may be referencing this goal in their strategic plans.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm} 
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Deleting...' : 'Delete Goal'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}