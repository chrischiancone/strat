import React from 'react'
import { cn } from '@/lib/utils'
import { AlertCircle, CheckCircle2, Info, HelpCircle } from 'lucide-react'

// Enhanced Input Component
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  description?: string
  error?: string
  success?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  helperText?: string
  isLoading?: boolean
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    type, 
    label, 
    description, 
    error, 
    success, 
    leftIcon, 
    rightIcon, 
    helperText,
    isLoading,
    disabled,
    ...props 
  }, ref) => {
    const inputId = React.useId()
    const hasError = Boolean(error)
    const hasSuccess = Boolean(success)
    
    return (
      <div className="space-y-2">
        {label && (
          <label 
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700"
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        {description && (
          <p className="text-sm text-gray-600">{description}</p>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400 text-sm">{leftIcon}</span>
            </div>
          )}
          
          <input
            id={inputId}
            type={type}
            className={cn(
              "flex h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors",
              "placeholder:text-gray-400",
              "focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500",
              "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50",
              hasError && "border-red-500 focus:border-red-500 focus:ring-red-500",
              hasSuccess && "border-green-500 focus:border-green-500 focus:ring-green-500",
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              isLoading && "opacity-50 cursor-wait",
              className
            )}
            ref={ref}
            disabled={disabled || isLoading}
            {...props}
          />
          
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-400 text-sm">{rightIcon}</span>
            </div>
          )}
          
          {(hasError || hasSuccess) && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              {hasError ? (
                <AlertCircle className="h-5 w-5 text-red-500" />
              ) : (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              )}
            </div>
          )}
        </div>
        
        {(error || success || helperText) && (
          <div className="space-y-1">
            {error && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {error}
              </p>
            )}
            {success && !error && (
              <p className="text-sm text-green-600 flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" />
                {success}
              </p>
            )}
            {helperText && !error && !success && (
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <Info className="h-4 w-4" />
                {helperText}
              </p>
            )}
          </div>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

// Enhanced Select Component
export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  description?: string
  error?: string
  success?: string
  helperText?: string
  options: Array<{ value: string; label: string; disabled?: boolean }>
  placeholder?: string
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ 
    className, 
    label, 
    description, 
    error, 
    success, 
    helperText,
    options,
    placeholder,
    disabled,
    ...props 
  }, ref) => {
    const selectId = React.useId()
    const hasError = Boolean(error)
    const hasSuccess = Boolean(success)
    
    return (
      <div className="space-y-2">
        {label && (
          <label 
            htmlFor={selectId}
            className="block text-sm font-medium text-gray-700"
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        {description && (
          <p className="text-sm text-gray-600">{description}</p>
        )}
        
        <div className="relative">
          <select
            id={selectId}
            className={cn(
              "flex h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors",
              "focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500",
              "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50",
              hasError && "border-red-500 focus:border-red-500 focus:ring-red-500",
              hasSuccess && "border-green-500 focus:border-green-500 focus:ring-green-500",
              className
            )}
            ref={ref}
            disabled={disabled}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option 
                key={option.value} 
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
          
          {(hasError || hasSuccess) && (
            <div className="absolute inset-y-0 right-8 pr-3 flex items-center pointer-events-none">
              {hasError ? (
                <AlertCircle className="h-5 w-5 text-red-500" />
              ) : (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              )}
            </div>
          )}
        </div>
        
        {(error || success || helperText) && (
          <div className="space-y-1">
            {error && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {error}
              </p>
            )}
            {success && !error && (
              <p className="text-sm text-green-600 flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" />
                {success}
              </p>
            )}
            {helperText && !error && !success && (
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <Info className="h-4 w-4" />
                {helperText}
              </p>
            )}
          </div>
        )}
      </div>
    )
  }
)
Select.displayName = "Select"

// Enhanced Textarea Component
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  description?: string
  error?: string
  success?: string
  helperText?: string
  showCharacterCount?: boolean
  maxLength?: number
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ 
    className, 
    label, 
    description, 
    error, 
    success, 
    helperText,
    showCharacterCount,
    maxLength,
    disabled,
    value,
    ...props 
  }, ref) => {
    const textareaId = React.useId()
    const hasError = Boolean(error)
    const hasSuccess = Boolean(success)
    const characterCount = String(value || '').length
    
    return (
      <div className="space-y-2">
        {label && (
          <label 
            htmlFor={textareaId}
            className="block text-sm font-medium text-gray-700"
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        {description && (
          <p className="text-sm text-gray-600">{description}</p>
        )}
        
        <div className="relative">
          <textarea
            id={textareaId}
            className={cn(
              "flex min-h-[100px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors",
              "placeholder:text-gray-400",
              "focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500",
              "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50",
              "resize-none",
              hasError && "border-red-500 focus:border-red-500 focus:ring-red-500",
              hasSuccess && "border-green-500 focus:border-green-500 focus:ring-green-500",
              className
            )}
            ref={ref}
            disabled={disabled}
            maxLength={maxLength}
            value={value}
            {...props}
          />
          
          {(hasError || hasSuccess) && (
            <div className="absolute top-3 right-3">
              {hasError ? (
                <AlertCircle className="h-5 w-5 text-red-500" />
              ) : (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              )}
            </div>
          )}
        </div>
        
        <div className="flex justify-between items-start">
          <div className="space-y-1 flex-1">
            {error && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {error}
              </p>
            )}
            {success && !error && (
              <p className="text-sm text-green-600 flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" />
                {success}
              </p>
            )}
            {helperText && !error && !success && (
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <Info className="h-4 w-4" />
                {helperText}
              </p>
            )}
          </div>
          
          {(showCharacterCount || maxLength) && (
            <p className={cn(
              "text-xs font-medium ml-2 flex-shrink-0",
              maxLength && characterCount > maxLength * 0.9 ? "text-amber-600" : "text-gray-500",
              maxLength && characterCount >= maxLength ? "text-red-600" : ""
            )}>
              {characterCount}{maxLength && `/${maxLength}`}
            </p>
          )}
        </div>
      </div>
    )
  }
)
Textarea.displayName = "Textarea"

// Form Group Component
export interface FormGroupProps {
  children: React.ReactNode
  className?: string
  columns?: 1 | 2 | 3
  spacing?: 'sm' | 'md' | 'lg'
}

const columnClasses = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
}

const spacingClasses = {
  sm: 'gap-4',
  md: 'gap-6',
  lg: 'gap-8'
}

export function FormGroup({ children, className, columns = 1, spacing = 'md' }: FormGroupProps) {
  return (
    <div className={cn(
      'grid',
      columnClasses[columns],
      spacingClasses[spacing],
      className
    )}>
      {children}
    </div>
  )
}

// Form Section Component
export interface FormSectionProps {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}

export function FormSection({ title, description, children, className }: FormSectionProps) {
  return (
    <div className={cn('space-y-6', className)}>
      <div className="border-b border-gray-200 pb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {description && (
          <p className="mt-1 text-sm text-gray-600">{description}</p>
        )}
      </div>
      {children}
    </div>
  )
}

// Form Actions Component
export interface FormActionsProps {
  children: React.ReactNode
  className?: string
  align?: 'left' | 'center' | 'right' | 'between'
}

const alignClasses = {
  left: 'justify-start',
  center: 'justify-center',
  right: 'justify-end',
  between: 'justify-between'
}

export function FormActions({ children, className, align = 'right' }: FormActionsProps) {
  return (
    <div className={cn(
      'flex items-center gap-3 pt-6 border-t border-gray-200',
      alignClasses[align],
      className
    )}>
      {children}
    </div>
  )
}