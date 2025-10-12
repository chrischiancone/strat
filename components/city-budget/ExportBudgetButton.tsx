'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Download, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface ExportBudgetButtonProps {
  fiscalYears: Array<{ id: string; year: number }>
  departments: Array<{ id: string; name: string }>
  priorityLevels?: Array<{ value: string; label: string }>
}

export function ExportBudgetButton({
  fiscalYears,
  departments,
  priorityLevels = [
    { value: 'NEED', label: 'Need (Critical)' },
    { value: 'WANT', label: 'Want (Important)' },
    { value: 'NICE_TO_HAVE', label: 'Nice to Have' },
  ],
}: ExportBudgetButtonProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedFiscalYears, setSelectedFiscalYears] = useState<string[]>([])
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([])
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([])

  const handleExport = async () => {
    try {
      setLoading(true)

      // Prepare filters
      const filters: {
        fiscal_year_ids?: string[]
        department_ids?: string[]
        priority_levels?: string[]
      } = {}

      if (selectedFiscalYears.length > 0) {
        filters.fiscal_year_ids = selectedFiscalYears
      }

      if (selectedDepartments.length > 0) {
        filters.department_ids = selectedDepartments
      }

      if (selectedPriorities.length > 0) {
        filters.priority_levels = selectedPriorities
      }

      // Call API to generate Excel
      const response = await fetch('/api/exports/budget', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(filters),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to generate export')
      }

      // Download the Excel file
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `City-Budget-Export-${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      toast.success('Budget data exported successfully')
      setOpen(false)
    } catch (error) {
      console.error('Error exporting budget:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to export budget data')
    } finally {
      setLoading(false)
    }
  }

  const toggleFiscalYear = (id: string) => {
    setSelectedFiscalYears((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const toggleDepartment = (id: string) => {
    setSelectedDepartments((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const togglePriority = (value: string) => {
    setSelectedPriorities((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export to Excel
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Export Budget Data to Excel</DialogTitle>
          <DialogDescription>
            Select filters to customize the export. Leave all unchecked to include all data.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Fiscal Years Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Fiscal Years (Optional)</Label>
            <div className="grid grid-cols-2 gap-2 rounded-md border p-3">
              {fiscalYears.map((fy) => (
                <label
                  key={fy.id}
                  className="flex cursor-pointer items-center space-x-2 rounded p-2 hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={selectedFiscalYears.includes(fy.id)}
                    onChange={() => toggleFiscalYear(fy.id)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">FY {fy.year}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Departments Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Departments (Optional)</Label>
            <div className="grid grid-cols-1 gap-2 rounded-md border p-3">
              {departments.map((dept) => (
                <label
                  key={dept.id}
                  className="flex cursor-pointer items-center space-x-2 rounded p-2 hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={selectedDepartments.includes(dept.id)}
                    onChange={() => toggleDepartment(dept.id)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">{dept.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Priority Levels Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Priority Levels (Optional)</Label>
            <div className="grid grid-cols-1 gap-2 rounded-md border p-3">
              {priorityLevels.map((priority) => (
                <label
                  key={priority.value}
                  className="flex cursor-pointer items-center space-x-2 rounded p-2 hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={selectedPriorities.includes(priority.value)}
                    onChange={() => togglePriority(priority.value)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">{priority.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="rounded-md bg-blue-50 p-4">
            <p className="text-sm text-blue-700">
              <strong>Note:</strong> The Excel file will include multiple sheets: Summary, Budget
              by Year, Budget by Department, Budget by Funding Source, Budget by Category, and Top
              10 Initiatives.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export to Excel
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
