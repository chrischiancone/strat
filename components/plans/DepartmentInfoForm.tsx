'use client'

import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { updateDepartmentInfo } from '@/app/actions/strategic-plans'
import { useToast } from '@/hooks/use-toast'
import { X, Plus } from 'lucide-react'

interface DepartmentInfoFormProps {
  departmentId: string
  initialData: {
    director_name: string | null
    director_email: string | null
    mission_statement: string | null
    core_services: string[]
  }
  onSave?: () => void
}

export function DepartmentInfoForm({
  departmentId,
  initialData,
  onSave,
}: DepartmentInfoFormProps) {
  const [directorName, setDirectorName] = useState(
    initialData.director_name || ''
  )
  const [directorEmail, setDirectorEmail] = useState(
    initialData.director_email || ''
  )
  const [missionStatement, setMissionStatement] = useState(
    initialData.mission_statement || ''
  )
  const [coreServices, setCoreServices] = useState<string[]>(
    initialData.core_services.length > 0 ? initialData.core_services : ['']
  )
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  const handleSave = async (
    field:
      | 'director_name'
      | 'director_email'
      | 'mission_statement'
      | 'core_services',
    value: string | string[]
  ) => {
    setIsSaving(true)
    try {
      await updateDepartmentInfo({
        id: departmentId,
        [field]: value || null,
      })

      toast({
        title: 'Saved',
        description: 'Changes saved successfully',
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

  const handleAddService = () => {
    setCoreServices([...coreServices, ''])
  }

  const handleRemoveService = (index: number) => {
    const newServices = coreServices.filter((_, i) => i !== index)
    setCoreServices(newServices)
    handleSave(
      'core_services',
      newServices.filter((s) => s.trim() !== '')
    )
  }

  const handleServiceChange = (index: number, value: string) => {
    const newServices = [...coreServices]
    newServices[index] = value
    setCoreServices(newServices)
  }

  const handleServiceBlur = () => {
    handleSave(
      'core_services',
      coreServices.filter((s) => s.trim() !== '')
    )
  }

  return (
    <div className="space-y-6 rounded-lg border border-gray-200 bg-white p-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          Department Information
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Contact information and department details
        </p>
      </div>

      <div className="space-y-4">
        {/* Director Name */}
        <div>
          <Label htmlFor="director_name">Director Name</Label>
          <Input
            id="director_name"
            value={directorName}
            onChange={(e) => setDirectorName(e.target.value)}
            onBlur={() => handleSave('director_name', directorName)}
            disabled={isSaving}
            placeholder="e.g., John Smith"
            className="mt-1"
          />
        </div>

        {/* Director Email */}
        <div>
          <Label htmlFor="director_email">Director Email</Label>
          <Input
            id="director_email"
            type="email"
            value={directorEmail}
            onChange={(e) => setDirectorEmail(e.target.value)}
            onBlur={() => handleSave('director_email', directorEmail)}
            disabled={isSaving}
            placeholder="e.g., john.smith@city.gov"
            className="mt-1"
          />
        </div>

        {/* Mission Statement */}
        <div>
          <Label htmlFor="mission_statement">Mission Statement</Label>
          <Textarea
            id="mission_statement"
            value={missionStatement}
            onChange={(e) => setMissionStatement(e.target.value)}
            onBlur={() => handleSave('mission_statement', missionStatement)}
            disabled={isSaving}
            placeholder="Describe your department's mission..."
            rows={4}
            className="mt-1"
          />
          <p className="mt-1 text-xs text-gray-500">
            What is the core purpose of your department?
          </p>
        </div>

        {/* Core Services */}
        <div>
          <Label>Core Services</Label>
          <div className="mt-2 space-y-2">
            {coreServices.map((service, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={service}
                  onChange={(e) => handleServiceChange(index, e.target.value)}
                  onBlur={handleServiceBlur}
                  disabled={isSaving}
                  placeholder="e.g., Water Distribution"
                  className="flex-1"
                />
                {coreServices.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveService(index)}
                    disabled={isSaving}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddService}
              disabled={isSaving}
              className="mt-2"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Service
            </Button>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            List the key services your department provides
          </p>
        </div>
      </div>
    </div>
  )
}
