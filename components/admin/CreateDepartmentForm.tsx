'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createDepartmentSchema, type CreateDepartmentInput } from '@/lib/validations/department'
import { createDepartment } from '@/app/actions/departments'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'

export function CreateDepartmentForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateDepartmentInput>({
    resolver: zodResolver(createDepartmentSchema),
    defaultValues: {
      isActive: true,
    },
  })

  const name = watch('name')
  const slug = watch('slug')

  // Auto-generate slug from name
  useEffect(() => {
    if (name && !slug) {
      const generatedSlug = name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
      setValue('slug', generatedSlug)
    }
  }, [name, slug, setValue])

  const onSubmit = async (data: CreateDepartmentInput) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const result = await createDepartment(data)

      if (result.error) {
        setError(result.error)
        setIsSubmitting(false)
        return
      }

      // Success - show toast and redirect
      toast({
        title: 'Department Created',
        description: 'The department has been successfully created.',
      })
      
      // Small delay to ensure toast is visible before redirect
      setTimeout(() => {
        router.refresh() // Clear Next.js cache
        router.push('/admin/departments')
      }, 500)
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
          Auto-generated from name. Used in URLs. Lowercase letters, numbers, and hyphens only.
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
              defaultChecked
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
          {isSubmitting ? 'Creating Department...' : 'Create Department'}
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
