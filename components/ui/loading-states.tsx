import React from 'react'
import { cn } from '@/lib/utils'
import { 
  LoaderIcon, 
  FileTextIcon, 
  UsersIcon, 
  SearchIcon,
  PlusCircleIcon,
  AlertCircleIcon,
  CheckCircle2Icon,
  InfoIcon
} from 'lucide-react'

// Professional Skeleton Components
export interface SkeletonProps {
  className?: string
  variant?: 'text' | 'rectangle' | 'circle' | 'rounded'
  width?: string | number
  height?: string | number
  animate?: boolean
}

export function Skeleton({ 
  className, 
  variant = 'rectangle',
  width,
  height,
  animate = true
}: SkeletonProps) {
  const baseClasses = "bg-gray-200"
  const animateClasses = animate ? "animate-pulse" : ""
  
  const variantClasses = {
    text: "h-4 rounded",
    rectangle: "rounded-lg",
    circle: "rounded-full",
    rounded: "rounded-md"
  }

  const style: React.CSSProperties = {}
  if (width) style.width = typeof width === 'number' ? `${width}px` : width
  if (height) style.height = typeof height === 'number' ? `${height}px` : height

  return (
    <div 
      className={cn(
        baseClasses,
        variantClasses[variant],
        animateClasses,
        className
      )}
      style={style}
    />
  )
}

// Table Skeleton
export interface TableSkeletonProps {
  rows?: number
  columns?: number
  showHeader?: boolean
  className?: string
}

export function TableSkeleton({ 
  rows = 5, 
  columns = 4, 
  showHeader = true,
  className 
}: TableSkeletonProps) {
  return (
    <div className={cn("space-y-4 p-6", className)}>
      {showHeader && (
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} height={20} className="w-full" />
          ))}
        </div>
      )}
      
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton key={colIndex} height={16} className="w-full" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

// Card Skeleton
export interface CardSkeletonProps {
  showImage?: boolean
  showAvatar?: boolean
  lines?: number
  className?: string
}

export function CardSkeleton({ 
  showImage = false, 
  showAvatar = false, 
  lines = 3,
  className 
}: CardSkeletonProps) {
  return (
    <div className={cn("p-6 border border-gray-200 rounded-lg bg-white space-y-4", className)}>
      {showImage && (
        <Skeleton height={200} className="w-full rounded-lg" />
      )}
      
      <div className="space-y-3">
        {showAvatar && (
          <div className="flex items-center space-x-3">
            <Skeleton variant="circle" width={40} height={40} />
            <div className="space-y-2 flex-1">
              <Skeleton height={16} className="w-1/3" />
              <Skeleton height={14} className="w-1/4" />
            </div>
          </div>
        )}
        
        <div className="space-y-2">
          {Array.from({ length: lines }).map((_, i) => (
            <Skeleton 
              key={i} 
              height={16} 
              className={cn(
                i === lines - 1 ? "w-2/3" : "w-full"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// List Skeleton
export interface ListSkeletonProps {
  items?: number
  showAvatar?: boolean
  className?: string
}

export function ListSkeleton({ 
  items = 5, 
  showAvatar = true,
  className 
}: ListSkeletonProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center space-x-3 p-4 bg-white border border-gray-200 rounded-lg">
          {showAvatar && (
            <Skeleton variant="circle" width={40} height={40} />
          )}
          <div className="flex-1 space-y-2">
            <Skeleton height={16} className="w-3/4" />
            <Skeleton height={14} className="w-1/2" />
          </div>
          <Skeleton height={32} width={80} className="rounded-md" />
        </div>
      ))}
    </div>
  )
}

// Loading Spinner
export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  text?: string
}

export function LoadingSpinner({ 
  size = 'md', 
  className,
  text
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  }

  return (
    <div 
      className="flex flex-col items-center justify-center space-y-2"
      role="status"
      aria-live="polite"
      aria-label={text || 'Loading content'}
    >
      <LoaderIcon 
        className={cn(
          'animate-spin text-primary-600',
          sizeClasses[size],
          className
        )}
        aria-hidden="true"
      />
      {text && (
        <p className="text-sm font-medium text-gray-600" aria-live="polite">{text}</p>
      )}
    </div>
  )
}

// Page Loading State
export interface PageLoadingProps {
  title?: string
  description?: string
  className?: string
}

export function PageLoading({ 
  title = "Loading...", 
  description = "Please wait while we fetch your data",
  className 
}: PageLoadingProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 px-4", className)}>
      <LoadingSpinner size="xl" />
      <div className="mt-6 text-center space-y-2">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600 max-w-sm">{description}</p>
      </div>
    </div>
  )
}

// Empty State Component
export interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description: string
  action?: React.ReactNode
  className?: string
  variant?: 'default' | 'search' | 'error' | 'success' | 'info'
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  variant = 'default'
}: EmptyStateProps) {
  const getDefaultIcon = () => {
    switch (variant) {
      case 'search':
        return <SearchIcon className="h-12 w-12 text-gray-400" />
      case 'error':
        return <AlertCircleIcon className="h-12 w-12 text-red-400" />
      case 'success':
        return <CheckCircle2Icon className="h-12 w-12 text-green-400" />
      case 'info':
        return <InfoIcon className="h-12 w-12 text-blue-400" />
      default:
        return <FileTextIcon className="h-12 w-12 text-gray-400" />
    }
  }

  const getBgColor = () => {
    switch (variant) {
      case 'search':
        return 'bg-gray-50'
      case 'error':
        return 'bg-red-50'
      case 'success':
        return 'bg-green-50'
      case 'info':
        return 'bg-blue-50'
      default:
        return 'bg-gray-50'
    }
  }

  return (
    <div className={cn("text-center py-12 px-4", className)}>
      <div className={cn(
        "mx-auto flex h-20 w-20 items-center justify-center rounded-full",
        getBgColor()
      )}>
        {icon || getDefaultIcon()}
      </div>
      
      <div className="mt-6 space-y-2">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600 max-w-sm mx-auto">{description}</p>
      </div>
      
      {action && (
        <div className="mt-6">
          {action}
        </div>
      )}
    </div>
  )
}

// Specialized Empty States
export function NoDataEmptyState({ 
  resourceName = "items",
  action 
}: { 
  resourceName?: string
  action?: React.ReactNode 
}) {
  return (
    <EmptyState
      icon={<FileTextIcon className="h-12 w-12 text-gray-400" />}
      title={`No ${resourceName} found`}
      description={`You haven't created any ${resourceName} yet. Get started by creating your first one.`}
      action={action}
    />
  )
}

export function SearchEmptyState({ query }: { query: string }) {
  return (
    <EmptyState
      variant="search"
      title="No results found"
      description={`We couldn't find any results for "${query}". Try adjusting your search terms.`}
    />
  )
}

export function ErrorEmptyState({ 
  action,
  error = "Something went wrong" 
}: { 
  action?: React.ReactNode
  error?: string 
}) {
  return (
    <EmptyState
      variant="error"
      title="Unable to load data"
      description={error}
      action={action}
    />
  )
}

// Content Loading Wrapper
export interface ContentLoadingProps {
  isLoading: boolean
  error?: string | null
  children: React.ReactNode
  loadingComponent?: React.ReactNode
  emptyState?: React.ReactNode
  data?: any[] | null
  className?: string
}

export function ContentLoading({
  isLoading,
  error,
  children,
  loadingComponent,
  emptyState,
  data,
  className
}: ContentLoadingProps) {
  if (isLoading) {
    return (
      <div className={className}>
        {loadingComponent || <PageLoading />}
      </div>
    )
  }

  if (error) {
    return (
      <div className={className}>
        <ErrorEmptyState 
          error={error}
          action={
            <button 
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Try Again
            </button>
          }
        />
      </div>
    )
  }

  if (data && Array.isArray(data) && data.length === 0) {
    return (
      <div className={className}>
        {emptyState || <NoDataEmptyState />}
      </div>
    )
  }

  return <div className={className}>{children}</div>
}

// Page Loading Overlay
export function LoadingOverlay({ 
  isLoading, 
  text = "Loading...",
  className 
}: {
  isLoading: boolean
  text?: string
  className?: string
}) {
  if (!isLoading) return null

  return (
    <div className={cn(
      "fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center",
      className
    )}>
      <div className="bg-white rounded-lg shadow-lg p-8 flex flex-col items-center space-y-4">
        <LoadingSpinner size="xl" />
        <p className="text-lg font-medium text-gray-900">{text}</p>
      </div>
    </div>
  )
}