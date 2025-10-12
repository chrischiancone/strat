import React from 'react'
import Link from 'next/link'
import { ChevronRightIcon, HomeIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface BreadcrumbItem {
  label: string
  href?: string
  current?: boolean
}

export interface PageHeaderProps {
  title: string
  description?: string
  breadcrumbs?: BreadcrumbItem[]
  actions?: React.ReactNode
  className?: string
  variant?: 'default' | 'compact'
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  className,
  variant = 'default'
}: PageHeaderProps) {
  return (
    <div className={cn(
      'border-b border-gray-200 bg-white',
      variant === 'compact' ? 'px-4 py-3' : 'px-6 py-6',
      className
    )}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="mb-4" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li>
              <Link 
                href="/" 
                className="flex items-center hover:text-gray-700 transition-colors"
                aria-label="Home"
              >
                <HomeIcon className="h-4 w-4" />
              </Link>
            </li>
            {breadcrumbs.map((item, index) => (
              <li key={index} className="flex items-center">
                <ChevronRightIcon className="h-4 w-4 mx-2 text-gray-400" />
                {item.href && !item.current ? (
                  <Link 
                    href={item.href}
                    className="hover:text-gray-700 transition-colors font-medium"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className={cn(
                    "font-medium",
                    item.current ? "text-primary-600" : "text-gray-900"
                  )}>
                    {item.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}
      
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <h1 className={cn(
            "font-bold tracking-tight text-gray-900",
            variant === 'compact' ? "text-xl" : "text-3xl"
          )}>
            {title}
          </h1>
          {description && (
            <p className={cn(
              "text-gray-600 leading-relaxed",
              variant === 'compact' ? "mt-1 text-sm" : "mt-2 text-lg"
            )}>
              {description}
            </p>
          )}
        </div>
        
        {actions && (
          <div className="ml-6 flex-shrink-0">
            <div className="flex items-center gap-3">
              {actions}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}