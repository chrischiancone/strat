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
import { FileText, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface GenerateReportButtonProps {
  fiscalYears: Array<{ id: string; year: number }>
  departments: Array<{ id: string; name: string }>
}

export function GenerateReportButton({ fiscalYears, departments }: GenerateReportButtonProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedFiscalYears, setSelectedFiscalYears] = useState<string[]>([])
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([])

  const handleGenerateReport = async () => {
    try {
      setLoading(true)

      // Prepare filters
      const filters: {
        fiscal_year_ids?: string[]
        department_ids?: string[]
      } = {}

      if (selectedFiscalYears.length > 0) {
        filters.fiscal_year_ids = selectedFiscalYears
      }

      if (selectedDepartments.length > 0) {
        filters.department_ids = selectedDepartments
      }

      // Call API to generate PDF
      const response = await fetch('/api/reports/council', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(filters),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to generate report')
      }

      // Download the PDF
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `City-Council-Report-${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      toast.success('Report generated successfully')
      setOpen(false)
    } catch (error) {
      console.error('Error generating report:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to generate report')
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <FileText className="mr-2 h-4 w-4" />
          Generate Council Report
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Generate City Council Report</DialogTitle>
          <DialogDescription>
            Select filters to customize the report. Leave all unchecked to include all data.
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
            {selectedFiscalYears.length > 0 && (
              <p className="text-xs text-gray-500">
                {selectedFiscalYears.length} fiscal year(s) selected
              </p>
            )}
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
            {selectedDepartments.length > 0 && (
              <p className="text-xs text-gray-500">
                {selectedDepartments.length} department(s) selected
              </p>
            )}
          </div>

          <div className="rounded-md bg-blue-50 p-4">
            <p className="text-sm text-blue-700">
              <strong>Note:</strong> The report will include executive summary, budget analysis,
              department highlights, at-risk initiatives, and top initiatives across all selected
              criteria.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleGenerateReport} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Generate PDF
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
