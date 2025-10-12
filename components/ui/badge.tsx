import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary-100 text-primary-800",
        secondary:
          "border-transparent bg-gray-100 text-gray-800",
        destructive:
          "border-transparent bg-red-100 text-red-800",
        success:
          "border-transparent bg-green-100 text-green-800",
        warning:
          "border-transparent bg-amber-100 text-amber-800",
        info:
          "border-transparent bg-blue-100 text-blue-800",
        outline: "text-gray-700 border-gray-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

// Status badge for initiative/project statuses
interface StatusBadgeProps {
  status: string
  className?: string
}

function StatusBadge({ status, className }: StatusBadgeProps) {
  // Map database status values to display values
  const getStatusConfig = (dbStatus: string) => {
    const normalizedStatus = dbStatus.toUpperCase()
    
    const variants: Record<string, { variant: BadgeProps['variant']; label: string }> = {
      'NOT_STARTED': { variant: 'secondary', label: 'Not Started' },
      'IN_PROGRESS': { variant: 'info', label: 'In Progress' },
      'AT_RISK': { variant: 'warning', label: 'At Risk' },
      'COMPLETED': { variant: 'success', label: 'Completed' },
      'DEFERRED': { variant: 'destructive', label: 'Deferred' },
      'ON_HOLD': { variant: 'warning', label: 'On Hold' },
      'CANCELLED': { variant: 'destructive', label: 'Cancelled' },
      'DRAFT': { variant: 'secondary', label: 'Draft' },
      'UNDER_REVIEW': { variant: 'warning', label: 'Under Review' },
      'APPROVED': { variant: 'info', label: 'Approved' },
      'ACTIVE': { variant: 'success', label: 'Active' },
      'ARCHIVED': { variant: 'secondary', label: 'Archived' },
    }
    
    return variants[normalizedStatus] || { variant: 'secondary', label: dbStatus }
  }

  const config = getStatusConfig(status)

  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  )
}

// Priority badge for initiative priorities
interface PriorityBadgeProps {
  priority: 'NEED' | 'WANT' | 'NICE_TO_HAVE'
  className?: string
}

function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const variants: Record<typeof priority, { variant: BadgeProps['variant']; label: string }> = {
    NEED: { variant: 'destructive', label: 'Need (Critical)' },
    WANT: { variant: 'warning', label: 'Want (Important)' },
    NICE_TO_HAVE: { variant: 'success', label: 'Nice to Have' },
  }

  const config = variants[priority] || variants.NEED

  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  )
}

// Funding status badge
interface FundingStatusBadgeProps {
  status: 'secured' | 'requested' | 'pending' | 'projected'
  className?: string
}

function FundingStatusBadge({ status, className }: FundingStatusBadgeProps) {
  const variants: Record<typeof status, { variant: BadgeProps['variant']; label: string }> = {
    secured: { variant: 'success', label: 'Secured' },
    requested: { variant: 'info', label: 'Requested' },
    pending: { variant: 'warning', label: 'Pending' },
    projected: { variant: 'default', label: 'Projected' },
  }

  const config = variants[status]

  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  )
}

export { Badge, badgeVariants, StatusBadge, PriorityBadge, FundingStatusBadge }
