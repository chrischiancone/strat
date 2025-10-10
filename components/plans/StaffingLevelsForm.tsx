'use client'

import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { updateDepartmentInfo } from '@/app/actions/strategic-plans'
import { useToast } from '@/hooks/use-toast'

interface StaffingLevelsFormProps {
  departmentId: string
  initialData: {
    executive_management?: number
    professional_staff?: number
    technical_support?: number
  }
  onSave?: () => void
}

export function StaffingLevelsForm({
  departmentId,
  initialData,
  onSave,
}: StaffingLevelsFormProps) {
  const [executiveManagement, setExecutiveManagement] = useState(
    initialData.executive_management?.toString() || '0'
  )
  const [professionalStaff, setProfessionalStaff] = useState(
    initialData.professional_staff?.toString() || '0'
  )
  const [technicalSupport, setTechnicalSupport] = useState(
    initialData.technical_support?.toString() || '0'
  )
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await updateDepartmentInfo({
        id: departmentId,
        current_staffing: {
          executive_management: parseInt(executiveManagement) || 0,
          professional_staff: parseInt(professionalStaff) || 0,
          technical_support: parseInt(technicalSupport) || 0,
        },
      })

      toast({
        title: 'Saved',
        description: 'Staffing levels saved successfully',
      })

      onSave?.()
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to save changes',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleNumberChange = (
    value: string,
    setter: (value: string) => void
  ) => {
    // Only allow numbers
    if (value === '' || /^\d+$/.test(value)) {
      setter(value)
    }
  }

  return (
    <div className="space-y-6 rounded-lg border border-gray-200 bg-white p-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          Current Staffing Levels
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Number of staff members in each category
        </p>
      </div>

      <div className="space-y-4">
        {/* Executive/Management */}
        <div>
          <Label htmlFor="executive_management">
            Executive/Management Staff
          </Label>
          <Input
            id="executive_management"
            type="text"
            inputMode="numeric"
            value={executiveManagement}
            onChange={(e) =>
              handleNumberChange(e.target.value, setExecutiveManagement)
            }
            onBlur={handleSave}
            disabled={isSaving}
            placeholder="0"
            className="mt-1"
          />
        </div>

        {/* Professional Staff */}
        <div>
          <Label htmlFor="professional_staff">Professional Staff</Label>
          <Input
            id="professional_staff"
            type="text"
            inputMode="numeric"
            value={professionalStaff}
            onChange={(e) =>
              handleNumberChange(e.target.value, setProfessionalStaff)
            }
            onBlur={handleSave}
            disabled={isSaving}
            placeholder="0"
            className="mt-1"
          />
        </div>

        {/* Technical/Support */}
        <div>
          <Label htmlFor="technical_support">Technical/Support Staff</Label>
          <Input
            id="technical_support"
            type="text"
            inputMode="numeric"
            value={technicalSupport}
            onChange={(e) =>
              handleNumberChange(e.target.value, setTechnicalSupport)
            }
            onBlur={handleSave}
            disabled={isSaving}
            placeholder="0"
            className="mt-1"
          />
        </div>

        {/* Total */}
        <div className="border-t border-gray-200 pt-4">
          <div className="flex justify-between text-sm">
            <span className="font-medium text-gray-700">Total Staff:</span>
            <span className="font-semibold text-gray-900">
              {(parseInt(executiveManagement) || 0) +
                (parseInt(professionalStaff) || 0) +
                (parseInt(technicalSupport) || 0)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
