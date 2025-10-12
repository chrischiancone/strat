import { Badge } from '@/components/ui/badge'
import type { PlanStatus } from '@/app/actions/plan-approval'

interface PlanStatusBadgeProps {
  status: PlanStatus
  className?: string
}

const STATUS_CONFIG: Record<
  PlanStatus,
  { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }
> = {
  draft: {
    label: 'Draft',
    variant: 'outline',
  },
  under_review: {
    label: 'Under Review',
    variant: 'secondary',
  },
  approved: {
    label: 'Approved',
    variant: 'default',
  },
  active: {
    label: 'Active',
    variant: 'default',
  },
  archived: {
    label: 'Archived',
    variant: 'destructive',
  },
}

export function PlanStatusBadge({ status, className }: PlanStatusBadgeProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.draft

  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  )
}
