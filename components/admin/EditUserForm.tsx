'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { updateUserSchema, type UpdateUserInput } from '@/lib/validations/user'
import { updateUser, getPotentialSupervisors } from '@/app/actions/users'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'

interface Department {
  id: string
  name: string
}

interface Supervisor {
  id: string
  full_name: string | null
  role: string
  title: string | null
}

interface User {
  id: string
  full_name: string | null
  email: string | null
  role: string
  title: string | null
  is_active: boolean | null
  department_id: string | null
  reports_to: string | null
}

interface EditUserFormProps {
  user: User
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

export function EditUserForm({ user, departments }: EditUserFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [supervisors, setSupervisors] = useState<Supervisor[]>([])

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<UpdateUserInput>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      fullName: user.full_name || '',
      role: user.role as UpdateUserInput['role'],
      departmentId: user.department_id || undefined,
      title: user.title || '',
      reportsTo: user.reports_to || undefined,
      isActive: user.is_active ?? true,
    },
  })

  const selectedRole = watch('role')
  const isActive = watch('isActive')
  const requiresDepartment = selectedRole ? rolesThatRequireDepartment.includes(selectedRole) : false

  // Load supervisors on component mount
  useEffect(() => {
    const loadSupervisors = async () => {
      try {
        const supervisorList = await getPotentialSupervisors(user.id)
        setSupervisors(supervisorList)
      } catch (error) {
        console.error('Failed to load supervisors:', error)
      }
    }
    
    loadSupervisors()
  }, [user.id])

  const onSubmit = async (data: UpdateUserInput) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const result = await updateUser(user.id, data)

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
          Email Address <span className="text-gray-500 text-xs">(cannot be changed)</span>
        </Label>
        <Input
          id="email"
          type="email"
          value={user.email || ''}
          disabled
          className="mt-1 bg-gray-50"
        />
        <p className="mt-1 text-xs text-gray-500">
          Email is linked to authentication and cannot be changed here
        </p>
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

      <div>
        <Label htmlFor="reportsTo">Reports To (Supervisor)</Label>
        <select
          id="reportsTo"
          {...register('reportsTo')}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">No supervisor / Direct report to leadership</option>
          {supervisors.map((supervisor) => (
            <option key={supervisor.id} value={supervisor.id}>
              {supervisor.full_name} ({supervisor.role})
              {supervisor.title && ` - ${supervisor.title}`}
            </option>
          ))}
        </select>
        {errors.reportsTo && (
          <p className="mt-1 text-sm text-red-600">{errors.reportsTo.message}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Select who this user reports to for strategic plan reviews and approvals
        </p>
      </div>

      <div>
        <Label>Status</Label>
        <div className="mt-2 flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={isActive === true}
              onChange={() => setValue('isActive', true, { shouldValidate: true })}
              className="h-4 w-4 text-blue-600"
            />
            <span className="text-sm text-gray-700">Active</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={isActive === false}
              onChange={() => setValue('isActive', false, { shouldValidate: true })}
              className="h-4 w-4 text-blue-600"
            />
            <span className="text-sm text-gray-700">Inactive</span>
          </label>
        </div>
        {errors.isActive && (
          <p className="mt-1 text-sm text-red-600">{errors.isActive.message}</p>
        )}
      </div>

      <div className="flex items-center gap-3 border-t border-gray-200 pt-6">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
        </Button>
        <Link href="/admin/users">
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
