'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { updateFiscalYearSchema, type UpdateFiscalYearInput } from '@/lib/validations/fiscal-year'
import { updateFiscalYear } from '@/app/actions/fiscal-years'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'

interface FiscalYear {
  id: string
  year_name: string
  start_date: string
  end_date: string
  is_active: boolean | null
}

interface EditFiscalYearFormProps {
  fiscalYear: FiscalYear
  hasOtherActiveFiscalYear?: boolean
}

export function EditFiscalYearForm({ fiscalYear, hasOtherActiveFiscalYear = false }: EditFiscalYearFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<UpdateFiscalYearInput>({
    resolver: zodResolver(updateFiscalYearSchema),
    defaultValues: {
      yearName: fiscalYear.year_name,
      startDate: fiscalYear.start_date,
      endDate: fiscalYear.end_date,
      isActive: fiscalYear.is_active ?? false,
    },
  })

  const isActive = watch('isActive')
  const wasActive = fiscalYear.is_active ?? false

  const onSubmit = async (data: UpdateFiscalYearInput) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const result = await updateFiscalYear(fiscalYear.id, data)

      if (result.error) {
        setError(result.error)
        setIsSubmitting(false)
        return
      }

      // Success - redirect to fiscal years list
      router.push('/admin/fiscal-years')
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
        <Label htmlFor="yearName">
          Year Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="yearName"
          {...register('yearName')}
          placeholder="FY 2025"
          className="mt-1"
        />
        <p className="mt-1 text-xs text-gray-500">
          e.g., &quot;FY 2025&quot; or &quot;2024-2025&quot;
        </p>
        {errors.yearName && (
          <p className="mt-1 text-sm text-red-600">{errors.yearName.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="startDate">
          Start Date <span className="text-red-500">*</span>
        </Label>
        <Input
          id="startDate"
          type="date"
          {...register('startDate')}
          className="mt-1"
        />
        <p className="mt-1 text-xs text-gray-500">
          Fiscal years typically start on October 1st
        </p>
        {errors.startDate && (
          <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="endDate">
          End Date <span className="text-red-500">*</span>
        </Label>
        <Input
          id="endDate"
          type="date"
          {...register('endDate')}
          className="mt-1"
        />
        <p className="mt-1 text-xs text-gray-500">
          Fiscal years typically end on September 30th
        </p>
        {errors.endDate && (
          <p className="mt-1 text-sm text-red-600">{errors.endDate.message}</p>
        )}
      </div>

      <div>
        <div className="flex items-start">
          <div className="flex h-5 items-center">
            <input
              id="isActive"
              type="checkbox"
              {...register('isActive')}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </div>
          <div className="ml-3">
            <Label htmlFor="isActive" className="font-normal">
              Set as Active Fiscal Year
            </Label>
            {hasOtherActiveFiscalYear && isActive && !wasActive && (
              <p className="mt-1 text-xs text-amber-600">
                ⚠️ This will deactivate the currently active fiscal year
              </p>
            )}
          </div>
        </div>
        {errors.isActive && (
          <p className="mt-1 text-sm text-red-600">{errors.isActive.message}</p>
        )}
      </div>

      <div className="flex items-center gap-3 border-t border-gray-200 pt-6">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Updating Fiscal Year...' : 'Update Fiscal Year'}
        </Button>
        <Link href="/admin/fiscal-years">
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
