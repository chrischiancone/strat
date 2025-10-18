'use client'

import * as React from 'react'
import { useForm, FormProvider, UseFormReturn, FieldValues, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface EnhancedFormProps<TFieldValues extends FieldValues> {
  schema: z.ZodType<TFieldValues>
  onSubmit: SubmitHandler<TFieldValues>
  defaultValues?: Partial<TFieldValues>
  children: React.ReactNode
  className?: string
  submitLabel?: string
  cancelLabel?: string
  onCancel?: () => void
  showSuccessMessage?: boolean
  successMessage?: string
  autoSave?: boolean
  autoSaveDelay?: number
}

export function EnhancedForm<TFieldValues extends FieldValues>({
  schema,
  onSubmit,
  defaultValues,
  children,
  className,
  submitLabel = 'Submit',
  cancelLabel = 'Cancel',
  onCancel,
  showSuccessMessage = false,
  successMessage = 'Saved successfully',
  autoSave = false,
  autoSaveDelay = 2000,
}: EnhancedFormProps<TFieldValues>) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [submitError, setSubmitError] = React.useState<string | null>(null)
  const [showSuccess, setShowSuccess] = React.useState(false)
  const [autoSaveStatus, setAutoSaveStatus] = React.useState<'idle' | 'saving' | 'saved'>('idle')

  const form = useForm<TFieldValues>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'onChange',
  })

  // Auto-save functionality
  const autoSaveTimeoutRef = React.useRef<NodeJS.Timeout>()
  
  React.useEffect(() => {
    if (!autoSave) return

    const subscription = form.watch(() => {
      // Clear existing timeout
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }

      // Set saving status
      setAutoSaveStatus('saving')

      // Set new timeout
      autoSaveTimeoutRef.current = setTimeout(async () => {
        if (form.formState.isValid) {
          try {
            const values = form.getValues()
            await onSubmit(values)
            setAutoSaveStatus('saved')
            setTimeout(() => setAutoSaveStatus('idle'), 2000)
          } catch (error) {
            setAutoSaveStatus('idle')
          }
        }
      }, autoSaveDelay)
    })

    return () => {
      subscription.unsubscribe()
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
    }
  }, [autoSave, autoSaveDelay, form, onSubmit])

  const handleSubmit = async (values: TFieldValues) => {
    setIsSubmitting(true)
    setSubmitError(null)
    setShowSuccess(false)

    try {
      await onSubmit(values)
      
      if (showSuccessMessage) {
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 3000)
      }
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const errorCount = Object.keys(form.formState.errors).length

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className={cn('space-y-6', className)}>
        {/* Error Summary */}
        {errorCount > 0 && form.formState.isSubmitted && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-red-800">
                  Please fix the following {errorCount} error{errorCount > 1 ? 's' : ''}:
                </h3>
                <ul className="mt-2 list-disc list-inside space-y-1 text-sm text-red-700">
                  {Object.entries(form.formState.errors).map(([field, error]) => (
                    <li key={field}>
                      <span className="font-medium capitalize">{field.replace(/_/g, ' ')}</span>:{' '}
                      {error?.message?.toString()}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Submit Error */}
        {submitError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-red-800">{submitError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {showSuccess && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
              <p className="text-sm text-green-800">{successMessage}</p>
            </div>
          </div>
        )}

        {/* Auto-save indicator */}
        {autoSave && (
          <div className="flex items-center justify-end text-sm text-gray-600">
            {autoSaveStatus === 'saving' && (
              <>
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                Saving...
              </>
            )}
            {autoSaveStatus === 'saved' && (
              <>
                <CheckCircle2 className="mr-2 h-3 w-3 text-green-600" />
                All changes saved
              </>
            )}
          </div>
        )}

        {/* Form Fields */}
        <div className="space-y-6">{children}</div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              {cancelLabel}
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting || !form.formState.isDirty}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {submitLabel}
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}

// Enhanced form field wrapper
interface FormFieldWrapperProps {
  name: string
  label: string
  description?: string
  required?: boolean
  children: React.ReactNode
}

export function FormFieldWrapper({
  name,
  label,
  description,
  required,
  children,
}: FormFieldWrapperProps) {
  const { formState } = useForm()
  const error = formState.errors[name]

  return (
    <div className="space-y-2">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      {description && <p className="text-sm text-gray-500">{description}</p>}
      {children}
      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {error.message?.toString()}
        </p>
      )}
    </div>
  )
}
