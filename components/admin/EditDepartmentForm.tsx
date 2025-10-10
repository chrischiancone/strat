'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { updateDepartmentSchema, type UpdateDepartmentInput } from '@/lib/validations/department'
import { updateDepartment } from '@/app/actions/departments'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import Link from 'next/link'

interface Department {
  id: string
  name: string
  slug: string
  director_name: string | null
  director_email: string | null
  mission_statement: string | null
  is_active: boolean | null
}

interface EditDepartmentFormProps {
  department: Department
}

export function EditDepartmentForm({ department }: EditDepartmentFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateDepartmentInput>({
    resolver: zodResolver(updateDepartmentSchema),
    defaultValues: {
      name: department.name,
      slug: department.slug,
      directorName: department.director_name || '',
      directorEmail: department.director_email || '',
      missionStatement: department.mission_statement || '',
      isActive: department.is_active ?? true,
    },
  })

  const onSubmit = async (data: UpdateDepartmentInput) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const result = await updateDepartment(department.id, data)

      if (result.error) {
        setError(result.error)
        setIsSubmitting(false)
        return
      }

      // Success - redirect to departments list
      router.push('/admin/departments')
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

      <div>
        <Label htmlFor="name">
          Department Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="name"
          {...register('name')}
          placeholder="Parks and Recreation"
          className="mt-1"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="slug">
          Slug <span className="text-red-500">*</span>
        </Label>
        <Input
          id="slug"
          {...register('slug')}
          placeholder="parks-and-recreation"
          className="mt-1"
        />
        <p className="mt-1 text-xs text-gray-500">
          Used in URLs. Lowercase letters, numbers, and hyphens only.
        </p>
        {errors.slug && (
          <p className="mt-1 text-sm text-red-600">{errors.slug.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="directorName">Director Name</Label>
        <Input
          id="directorName"
          {...register('directorName')}
          placeholder="John Smith"
          className="mt-1"
        />
        {errors.directorName && (
          <p className="mt-1 text-sm text-red-600">{errors.directorName.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="directorEmail">Director Email</Label>
        <Input
          id="directorEmail"
          type="email"
          {...register('directorEmail')}
          placeholder="john.smith@example.gov"
          className="mt-1"
        />
        {errors.directorEmail && (
          <p className="mt-1 text-sm text-red-600">{errors.directorEmail.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="missionStatement">Mission Statement</Label>
        <Textarea
          id="missionStatement"
          {...register('missionStatement')}
          placeholder="Brief description of the department's mission and purpose..."
          className="mt-1"
          rows={4}
        />
        <p className="mt-1 text-xs text-gray-500">Maximum 500 characters</p>
        {errors.missionStatement && (
          <p className="mt-1 text-sm text-red-600">{errors.missionStatement.message}</p>
        )}
      </div>

      <div>
        <Label>
          Status <span className="text-red-500">*</span>
        </Label>
        <div className="mt-2 flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              {...register('isActive', {
                setValueAs: (v) => v === 'true',
              })}
              value="true"
              defaultChecked={department.is_active ?? true}
              className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-900">Active</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              {...register('isActive', {
                setValueAs: (v) => v === 'true',
              })}
              value="false"
              defaultChecked={!(department.is_active ?? true)}
              className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-900">Inactive</span>
          </label>
        </div>
        {errors.isActive && (
          <p className="mt-1 text-sm text-red-600">{errors.isActive.message}</p>
        )}
      </div>

      <div className="flex items-center gap-3 border-t border-gray-200 pt-6">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Updating Department...' : 'Update Department'}
        </Button>
        <Link href="/admin/departments">
          <Button type="button" variant="outline" disabled={isSubmitting}>
            Cancel
          </Button>
        </Link>
      </div>

      <p className="text-xs text-gray-500">
        * Required fields
      </p>
    </form>
  )
}
