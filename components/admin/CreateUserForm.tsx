'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createUserSchema, type CreateUserInput } from '@/lib/validations/user'
import { createUser, getPotentialSupervisors } from '@/app/actions/users'
import { handleError } from '@/lib/errorHandler'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LoadingSpinner } from '@/components/ui/loading-states'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'
import { CheckCircle2Icon, UserPlusIcon } from 'lucide-react'

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

interface CreateUserFormProps {
  departments: Department[]
}

interface CreateUserResponse {
  success: boolean
  error?: string
  userId?: string
  message?: string
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
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [supervisors, setSupervisors] = useState<Supervisor[]>([])

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

  // Load supervisors on component mount
  useEffect(() => {
    const loadSupervisors = async () => {
      try {
        const supervisorList = await getPotentialSupervisors()
        setSupervisors(supervisorList)
      } catch (error) {
        console.error('Failed to load supervisors:', error)
      }
    }
    
    loadSupervisors()
  }, [])

  const onSubmit = async (data: CreateUserInput) => {
    setIsSubmitting(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const result = await createUser(data) as unknown as CreateUserResponse

      if (result.error) {
        setError(result.error)
        setIsSubmitting(false)
        return
      }

      // Success - show credentials and confirmation
      const msg = result.message || 'User created successfully!'
      setSuccessMessage(msg)
      
      toast({
        title: "Success",
        description: "User has been created successfully with default credentials.",
        duration: 5000,
      })
      
      // Redirect after a brief delay to allow user to see the success message
      setTimeout(() => {
        router.push('/admin/users')
      }, 2000)
    } catch (error) {
      const errorMessage = handleError.client(error, {
        component: 'CreateUserForm',
        action: 'createUser'
      })
      setError(errorMessage)
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div 
          className="rounded-md bg-red-50 p-4 border border-red-200"
          role="alert"
          aria-live="polite"
        >
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error creating user</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {successMessage && (
        <div 
          className="rounded-md bg-green-50 p-4 border border-green-200"
          role="status"
          aria-live="polite"
        >
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircle2Icon className="h-5 w-5 text-green-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">User created successfully!</h3>
              <p className="mt-1 text-sm text-green-700">{successMessage}</p>
              <p className="mt-2 text-xs text-green-600">Redirecting to users list...</p>
            </div>
          </div>
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
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-base sm:text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[44px] no-zoom"
          aria-describedby="role-help"
          aria-required="true"
        >
          <option value="">Select a role</option>
          {roles.map((role) => (
            <option key={role.value} value={role.value}>
              {role.label}
            </option>
          ))}
        </select>
        {errors.role && (
          <p className="mt-1 text-sm text-red-600" role="alert" aria-live="polite">{errors.role.message}</p>
        )}
        <p id="role-help" className="mt-1 text-xs text-gray-500">
          Select the user&apos;s role to determine their access permissions
        </p>
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
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-base sm:text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[44px] no-zoom"
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
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-base sm:text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[44px] no-zoom"
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

      <div className="flex flex-col gap-3 border-t border-gray-200 pt-6 sm:flex-row sm:items-center">
        <Button 
          type="submit" 
          disabled={isSubmitting || !!successMessage}
          className="flex items-center gap-2 justify-center w-full sm:w-auto"
        >
          {isSubmitting ? (
            <>
              <LoadingSpinner size="sm" className="text-white" />
              Creating User...
            </>
          ) : successMessage ? (
            <>
              <CheckCircle2Icon className="h-4 w-4" />
              User Created
            </>
          ) : (
            <>
              <UserPlusIcon className="h-4 w-4" />
              Create User
            </>
          )}
        </Button>
        <Link href="/admin/users" className="w-full sm:w-auto">
          <Button type="button" variant="outline" disabled={isSubmitting} className="w-full sm:w-auto">
            Cancel
          </Button>
        </Link>
      </div>

      <p className="text-xs text-gray-500">
        * Required fields. New users are created with a default password and confirmed email.
      </p>
    </form>
  )
}
