'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, Home } from 'lucide-react'
import { Fragment } from 'react'

interface BreadcrumbItem {
  label: string
  href: string
}

export function Breadcrumbs() {
  const pathname = usePathname()

  // Generate breadcrumbs from the current path
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    // Don't show breadcrumbs on dashboard/home
    if (pathname === '/dashboard' || pathname === '/') {
      return []
    }

    const paths = pathname.split('/').filter(Boolean)
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Home', href: '/dashboard' },
    ]

    // Build breadcrumbs from path segments
    let currentPath = ''
    paths.forEach((segment, index) => {
      currentPath += `/${segment}`

      // Format the label (replace hyphens with spaces, capitalize)
      let label = segment
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase())

      // Handle special cases for better labels
      if (segment === 'admin') label = 'Administration'
      if (segment === 'fiscal-years') label = 'Fiscal Years'
      if (segment === 'audit-logs') label = 'Audit Logs'
      if (segment === 'funding-sources') label = 'Funding Sources'

      // For IDs (UUIDs), use generic labels
      if (segment.match(/^[0-9a-f-]{36}$/i)) {
        const previousSegment = paths[index - 1]
        if (previousSegment === 'plans') label = 'Plan Details'
        if (previousSegment === 'initiatives') label = 'Initiative Details'
        if (previousSegment === 'goals') label = 'Goal Details'
      }

      breadcrumbs.push({
        label,
        href: currentPath,
      })
    })

    return breadcrumbs
  }

  const breadcrumbs = generateBreadcrumbs()

  // Don't render anything if there are no breadcrumbs
  if (breadcrumbs.length === 0) {
    return null
  }

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600">
      {breadcrumbs.map((crumb, index) => {
        const isLast = index === breadcrumbs.length - 1
        const isFirst = index === 0

        return (
          <Fragment key={crumb.href}>
            {index > 0 && (
              <ChevronRight className="h-4 w-4 flex-shrink-0 text-gray-400" />
            )}
            {isLast ? (
              <span className="font-medium text-gray-900">{crumb.label}</span>
            ) : (
              <Link
                href={crumb.href}
                className="flex items-center gap-1 hover:text-primary-600 transition-colors duration-150"
              >
                {isFirst && <Home className="h-4 w-4" />}
                <span>{crumb.label}</span>
              </Link>
            )}
          </Fragment>
        )
      })}
    </nav>
  )
}
