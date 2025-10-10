'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { updateMunicipalitySchema, type UpdateMunicipalityInput } from '@/lib/validations/municipality'
import { updateMunicipality } from '@/app/actions/municipality'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Municipality {
  id: string
  name: string
  state: string | null
  contact_name: string | null
  contact_email: string | null
  contact_phone: string | null
  website_url: string | null
}

interface EditMunicipalityFormProps {
  municipality: Municipality
}

export function EditMunicipalityForm({ municipality }: EditMunicipalityFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateMunicipalityInput>({
    resolver: zodResolver(updateMunicipalitySchema),
    defaultValues: {
      name: municipality.name,
      state: municipality.state || '',
      contactName: municipality.contact_name || '',
      contactEmail: municipality.contact_email || '',
      contactPhone: municipality.contact_phone || '',
      websiteUrl: municipality.website_url || '',
    },
  })

  const onSubmit = async (data: UpdateMunicipalityInput) => {
    setIsSubmitting(true)
    setError(null)
    setSuccess(false)

    try {
      const result = await updateMunicipality(municipality.id, data)

      if (result.error) {
        setError(result.error)
        setIsSubmitting(false)
        return
      }

      // Success
      setSuccess(true)
      setIsSubmitting(false)
    } catch {
      setError('An unexpected error occurred')
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="rounded-md bg-green-50 p-4">
          <p className="text-sm text-green-800">Municipality settings updated successfully!</p>
        </div>
      )}

      <div>
        <Label htmlFor="name">
          Municipality Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="name"
          {...register('name')}
          placeholder="City of Example"
          className="mt-1"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="state">State/Province</Label>
        <Input
          id="state"
          {...register('state')}
          placeholder="Texas"
          className="mt-1"
        />
        {errors.state && (
          <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="contactName">Contact Name</Label>
        <Input
          id="contactName"
          {...register('contactName')}
          placeholder="John Doe"
          className="mt-1"
        />
        {errors.contactName && (
          <p className="mt-1 text-sm text-red-600">{errors.contactName.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="contactEmail">Contact Email</Label>
        <Input
          id="contactEmail"
          type="email"
          {...register('contactEmail')}
          placeholder="admin@example.gov"
          className="mt-1"
        />
        {errors.contactEmail && (
          <p className="mt-1 text-sm text-red-600">{errors.contactEmail.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="contactPhone">Contact Phone</Label>
        <Input
          id="contactPhone"
          type="tel"
          {...register('contactPhone')}
          placeholder="(555) 123-4567"
          className="mt-1"
        />
        {errors.contactPhone && (
          <p className="mt-1 text-sm text-red-600">{errors.contactPhone.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="websiteUrl">Website URL</Label>
        <Input
          id="websiteUrl"
          type="url"
          {...register('websiteUrl')}
          placeholder="https://example.gov"
          className="mt-1"
        />
        {errors.websiteUrl && (
          <p className="mt-1 text-sm text-red-600">{errors.websiteUrl.message}</p>
        )}
      </div>

      <div className="border-t border-gray-200 pt-6">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
        </Button>
      </div>

      <p className="text-xs text-gray-500">
        * Required fields
      </p>
    </form>
  )
}
