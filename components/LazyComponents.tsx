/**
 * Lazy-loaded components for better performance and code splitting
 */
import { lazy } from 'react'
import { Loading } from '@/components/ErrorBoundary'

// Admin components that are heavy and not needed on initial load
export const LazyCouncilGoalsManager = lazy(() => 
  import('@/components/admin/CouncilGoalsManager').then(module => ({ 
    default: module.CouncilGoalsManager 
  }))
)

export const LazyEnhancedDashboardStats = lazy(() => 
  import('@/components/admin/EnhancedDashboardStats').then(module => ({ 
    default: module.EnhancedDashboardStats 
  }))
)

export const LazyAuditLogsDebug = lazy(() => 
  import('@/components/admin/AuditLogsDebug').then(module => ({ 
    default: module.AuditLogsDebug 
  }))
)

// Form components that can be lazy loaded
export const LazyCreateUserForm = lazy(() => 
  import('@/components/admin/CreateUserForm').then(module => ({ 
    default: module.CreateUserForm 
  }))
)

export const LazySwotAnalysisForm = lazy(() => 
  import('@/components/plans/SwotAnalysisForm').then(module => ({ 
    default: module.SwotAnalysisForm 
  }))
)

export const LazyGenerateReportButton = lazy(() => 
  import('@/components/plans/GeneratePlanPdfButton').then(module => ({ 
    default: module.GeneratePlanPdfButton 
  }))
)

// Wrapper component for lazy loading with consistent loading state
interface LazyWrapperProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function LazyWrapper({ children, fallback }: LazyWrapperProps) {
  const defaultFallback = (
    <div className="p-8">
      <Loading message="Loading component..." />
    </div>
  )

  return (
    <div>
      {fallback || defaultFallback}
      {children}
    </div>
  )
}

// Pre-loading utilities for better UX
export const preloadComponent = (componentImport: () => Promise<any>) => {
  // Preload on idle or user interaction
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      componentImport()
    })
  } else {
    // Fallback for browsers without requestIdleCallback
    setTimeout(() => {
      componentImport()
    }, 2000)
  }
}

// Preload admin components when user navigates to admin routes
export const preloadAdminComponents = () => {
  preloadComponent(() => import('@/components/admin/CouncilGoalsManager'))
  preloadComponent(() => import('@/components/admin/EnhancedDashboardStats'))
  preloadComponent(() => import('@/components/admin/CreateUserForm'))
}

// Preload form components when user shows intent to create/edit
export const preloadFormComponents = () => {
  preloadComponent(() => import('@/components/plans/SwotAnalysisForm'))
  preloadComponent(() => import('@/components/plans/GeneratePlanPdfButton'))
}