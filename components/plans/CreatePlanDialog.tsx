'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus } from 'lucide-react'
import { createStrategicPlan, FiscalYear } from '@/app/actions/strategic-plans'

interface CreatePlanDialogProps {
  fiscalYears: FiscalYear[]
  userDepartmentId: string | null
  userDepartmentName: string | null
  userRole: string
  departments?: Array<{ id: string; name: string }>
}

export function CreatePlanDialog({
  fiscalYears,
  userDepartmentId,
  userDepartmentName,
  userRole,
  departments = [],
}: CreatePlanDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [departmentId, setDepartmentId] = useState(userDepartmentId || '')
  const [startFiscalYearId, setStartFiscalYearId] = useState('')
  const [endFiscalYearId, setEndFiscalYearId] = useState('')

  // Handle start fiscal year change - clear end year if it becomes invalid
  const handleStartFiscalYearChange = (newStartId: string) => {
    setStartFiscalYearId(newStartId)
    
    // If end year is already selected, check if it's still valid
    if (endFiscalYearId) {
      const startYear = fiscalYears.find((fy) => fy.id === newStartId)
      const endYear = fiscalYears.find((fy) => fy.id === endFiscalYearId)
      
      // Clear end year if it's now earlier than the new start year
      if (startYear && endYear && endYear.year <= startYear.year) {
        setEndFiscalYearId('')
      }
    }
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!departmentId || !startFiscalYearId || !endFiscalYearId) {
      setError('Please fill in all fields')
      return
    }

    // Validate: end year must be different from and after start year
    const startYear = fiscalYears.find((fy) => fy.id === startFiscalYearId)
    const endYear = fiscalYears.find((fy) => fy.id === endFiscalYearId)

    if (startYear && endYear) {
      if (endYear.year < startYear.year) {
        setError('End fiscal year cannot be earlier than start fiscal year')
        return
      }
      if (endYear.year === startYear.year) {
        setError('End fiscal year must be different from start fiscal year (multi-year plans only)')
        return
      }
    }

    setIsSubmitting(true)

    try {
      const result = await createStrategicPlan({
        department_id: departmentId,
        start_fiscal_year_id: startFiscalYearId,
        end_fiscal_year_id: endFiscalYearId,
      })

      // Close dialog and redirect to plan detail/edit page
      setOpen(false)
      router.push(`/plans/${result.id}`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create plan')
      setIsSubmitting(false)
    }
  }

  const isAdmin = userRole === 'admin'

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create New Plan
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Strategic Plan</DialogTitle>
            <DialogDescription>
              Create a new multi-year strategic plan for your department.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Department Selection */}
            <div className="grid gap-2">
              <Label htmlFor="department">Department</Label>
              {departments.length > 0 ? (
                <Select
                  value={departmentId}
                  onValueChange={setDepartmentId}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="department">
                    <SelectValue placeholder="Select a department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm">
                  {userDepartmentName || 'No department assigned'}
                </div>
              )}
            </div>

            {/* Start Fiscal Year */}
            <div className="grid gap-2">
              <Label htmlFor="start-year">Start Fiscal Year</Label>
              <Select
                value={startFiscalYearId}
                onValueChange={handleStartFiscalYearChange}
                disabled={isSubmitting}
              >
                <SelectTrigger id="start-year">
                  <SelectValue placeholder="Select start year" />
                </SelectTrigger>
                <SelectContent>
                  {fiscalYears.map((fy) => (
                    <SelectItem key={fy.id} value={fy.id}>
                      FY {fy.year}
                      {fy.is_current && ' (Current)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* End Fiscal Year */}
            <div className="grid gap-2">
              <Label htmlFor="end-year">End Fiscal Year</Label>
              <Select
                value={endFiscalYearId}
                onValueChange={setEndFiscalYearId}
                disabled={isSubmitting || !startFiscalYearId}
              >
                <SelectTrigger id="end-year">
                  <SelectValue placeholder={startFiscalYearId ? "Select end year" : "Select start year first"} />
                </SelectTrigger>
                <SelectContent>
                  {fiscalYears
                    .filter((fy) => {
                      // Only show fiscal years that are > start year
                      if (!startFiscalYearId) return true
                      const startYear = fiscalYears.find((f) => f.id === startFiscalYearId)
                      return startYear ? fy.year > startYear.year : true
                    })
                    .map((fy) => (
                      <SelectItem key={fy.id} value={fy.id}>
                        FY {fy.year}
                        {fy.is_current && ' (Current)'}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
                {error}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Plan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
