import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { 
  PLAN_STATUSES, 
  GOAL_STATUSES, 
  GOAL_PRIORITIES,
  INITIATIVE_PRIORITIES 
} from '@/lib/types/plans'

interface StatusBadgeProps {
  status: string
  type: 'plan' | 'goal' | 'goal-priority' | 'initiative-priority'
  className?: string
}

const getColorClasses = (color: string, variant: 'default' | 'outline' = 'default') => {
  const colors = {
    gray: variant === 'outline' 
      ? 'border-gray-300 text-gray-700 hover:bg-gray-50' 
      : 'bg-gray-100 text-gray-800 hover:bg-gray-200',
    red: variant === 'outline' 
      ? 'border-red-300 text-red-700 hover:bg-red-50' 
      : 'bg-red-100 text-red-800 hover:bg-red-200',
    yellow: variant === 'outline' 
      ? 'border-yellow-300 text-yellow-700 hover:bg-yellow-50' 
      : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
    green: variant === 'outline' 
      ? 'border-green-300 text-green-700 hover:bg-green-50' 
      : 'bg-green-100 text-green-800 hover:bg-green-200',
    blue: variant === 'outline' 
      ? 'border-blue-300 text-blue-700 hover:bg-blue-50' 
      : 'bg-blue-100 text-blue-800 hover:bg-blue-200',
    purple: variant === 'outline' 
      ? 'border-purple-300 text-purple-700 hover:bg-purple-50' 
      : 'bg-purple-100 text-purple-800 hover:bg-purple-200',
    orange: variant === 'outline' 
      ? 'border-orange-300 text-orange-700 hover:bg-orange-50' 
      : 'bg-orange-100 text-orange-800 hover:bg-orange-200',
  }
  return colors[color as keyof typeof colors] || colors.gray
}

export function StatusBadge({ status, type, className }: StatusBadgeProps) {
  let config: { label: string; color: string; description?: string }
  let variant: 'default' | 'outline' = 'default'

  switch (type) {
    case 'plan':
      config = PLAN_STATUSES[status as keyof typeof PLAN_STATUSES] || { label: status, color: 'gray' }
      break
    case 'goal':
      config = GOAL_STATUSES[status as keyof typeof GOAL_STATUSES] || { label: status, color: 'gray' }
      break
    case 'goal-priority':
      config = GOAL_PRIORITIES[status as keyof typeof GOAL_PRIORITIES] || { label: status, color: 'gray' }
      variant = 'outline'
      break
    case 'initiative-priority':
      config = INITIATIVE_PRIORITIES[status as keyof typeof INITIATIVE_PRIORITIES] || { label: status, color: 'gray' }
      variant = 'outline'
      break
    default:
      config = { label: status, color: 'gray' }
  }

  return (
    <Badge 
      variant={variant}
      className={cn(
        getColorClasses(config.color, variant),
        'text-xs font-medium transition-colors',
        className
      )}
      title={config.description}
    >
      {config.label}
    </Badge>
  )
}