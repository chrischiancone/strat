'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createUserSchema, type CreateUserInput } from '@/lib/validations/user'
import { createUser } from '@/app/actions/users'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'

interface Department {
  id: string
  name: string
}

interface CreateUserFormProps {
  departments: Department[]
}

const roles = [
  { value: 'admin', label: 'Admin' },
  { value: 'department_director', label: 'Department Director' },
  { value: 'staff', label: 'Staff' },
  { value: 'city_manager', label: 'City Manager' },
  { value: 'finance', label: 'Finance' },
  { value: 'council', label: 'Council' },
  { value: 'public', label: 'Public' },
]

const rolesThatRequireDepartment = ['staff', 'department_director']

export function CreateUserForm({ departments }: CreateUserFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
  })

  const selectedRole = watch('role')
  const requiresDepartment = selectedRole ? rolesThatRequireDepartment.includes(selectedRole) : false

  const onSubmit = async (data: CreateUserInput) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const result = await createUser(data)

      if (result.error) {
        setError(result.error)
        setIsSubmitting(false)
        return
      }

      // Success - redirect to users list
      router.push('/admin/users')
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
        <Label htmlFor="fullName">
          Full Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="fullName"
          {...register('fullName')}
          placeholder="John Smith"
          className="mt-1"
        />
        {errors.fullName && (
          <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="email">
          Email Address <span className="text-red-500">*</span>
        </Label>
        <Input
          id="email"
          type="email"
          {...register('email')}
          placeholder="john.smith@carrollton.gov"
          className="mt-1"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="role">
          Role <span className="text-red-500">*</span>
        </Label>
        <select
          id="role"
          {...register('role')}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">Select a role</option>
          {roles.map((role) => (
            <option key={role.value} value={role.value}>
              {role.label}
            </option>
          ))}
        </select>
        {errors.role && (
          <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="departmentId">
          Department
          {requiresDepartment && <span className="text-red-500"> *</span>}
          {requiresDepartment && (
            <span className="ml-2 text-xs text-gray-500">
              (required for this role)
            </span>
          )}
        </Label>
        <select
          id="departmentId"
          {...register('departmentId')}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          disabled={!selectedRole}
        >
          <option value="">Select a department</option>
          {departments.map((dept) => (
            <option key={dept.id} value={dept.id}>
              {dept.name}
            </option>
          ))}
        </select>
        {errors.departmentId && (
          <p className="mt-1 text-sm text-red-600">{errors.departmentId.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="title">Job Title</Label>
        <Input
          id="title"
          {...register('title')}
          placeholder="Program Coordinator"
          className="mt-1"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>

      <div className="flex items-center gap-3 border-t border-gray-200 pt-6">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating User...' : 'Create User'}
        </Button>
        <Link href="/admin/users">
          <Button type="button" variant="outline" disabled={isSubmitting}>
            Cancel
          </Button>
        </Link>
      </div>

      <p className="text-xs text-gray-500">
        * Required fields. An invitation email will be sent to the user after creation.
      </p>
    </form>
  )
}
