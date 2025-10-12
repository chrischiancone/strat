'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { 
  ChevronRightIcon,
  MoreVerticalIcon,
  ExternalLinkIcon,
  CalendarIcon,
  UserIcon,
  CheckCircle2Icon,
  AlertCircleIcon,
  ClockIcon,
  TrendingUpIcon,
  TrendingDownIcon
} from 'lucide-react'

// Base Card Component
export interface BaseCardProps {
  children: React.ReactNode
  className?: string
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  border?: boolean
  background?: 'white' | 'gray' | 'gradient'
  hover?: boolean
  clickable?: boolean
  onClick?: () => void
}

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
  xl: 'p-10'
}

const shadowClasses = {
  none: '',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl'
}

const backgroundClasses = {
  white: 'bg-white',
  gray: 'bg-gray-50',
  gradient: 'bg-gradient-to-br from-white to-gray-50'
}

export function BaseCard({
  children,
  className,
  padding = 'md',
  shadow = 'sm',
  border = true,
  background = 'white',
  hover = false,
  clickable = false,
  onClick
}: BaseCardProps) {
  return (
    <div
      className={cn(
        'rounded-lg transition-all duration-200',
        paddingClasses[padding],
        shadowClasses[shadow],
        backgroundClasses[background],
        border && 'border border-gray-200',
        hover && 'hover:shadow-md hover:-translate-y-0.5',
        clickable && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

// Metric Card
export interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: React.ReactNode
  trend?: {
    value: number
    direction: 'up' | 'down' | 'neutral'
    period?: string
  }
  color?: 'blue' | 'green' | 'orange' | 'red' | 'purple' | 'gray'
  className?: string
  onClick?: () => void
}

const colorThemes = {
  blue: {
    bg: 'bg-blue-50',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    trendUp: 'text-blue-600',
    trendDown: 'text-blue-600'
  },
  green: {
    bg: 'bg-green-50',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    trendUp: 'text-green-600',
    trendDown: 'text-green-600'
  },
  orange: {
    bg: 'bg-orange-50',
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
    trendUp: 'text-orange-600',
    trendDown: 'text-orange-600'
  },
  red: {
    bg: 'bg-red-50',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    trendUp: 'text-red-600',
    trendDown: 'text-red-600'
  },
  purple: {
    bg: 'bg-purple-50',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    trendUp: 'text-purple-600',
    trendDown: 'text-purple-600'
  },
  gray: {
    bg: 'bg-gray-50',
    iconBg: 'bg-gray-100',
    iconColor: 'text-gray-600',
    trendUp: 'text-gray-600',
    trendDown: 'text-gray-600'
  }
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = 'blue',
  className,
  onClick
}: MetricCardProps) {
  const theme = colorThemes[color]
  
  const getTrendIcon = () => {
    if (!trend) return null
    
    if (trend.direction === 'up') {
      return <TrendingUpIcon className="h-4 w-4 text-green-600" />
    } else if (trend.direction === 'down') {
      return <TrendingDownIcon className="h-4 w-4 text-red-600" />
    }
    return null
  }

  const getTrendColor = () => {
    if (!trend) return ''
    return trend.direction === 'up' ? 'text-green-600' : trend.direction === 'down' ? 'text-red-600' : 'text-gray-500'
  }

  return (
    <BaseCard
      className={cn('relative overflow-hidden', theme.bg, className)}
      hover={!!onClick}
      clickable={!!onClick}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
          <div className="flex items-baseline space-x-2">
            <p className="text-3xl font-bold text-gray-900">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
            {trend && (
              <div className={cn('flex items-center text-sm font-medium', getTrendColor())}>
                {getTrendIcon()}
                <span className="ml-1">
                  {trend.value > 0 ? '+' : ''}{trend.value}%
                </span>
              </div>
            )}
          </div>
          {(subtitle || trend?.period) && (
            <p className="mt-1 text-sm text-gray-500">
              {subtitle}
              {trend?.period && ` • ${trend.period}`}
            </p>
          )}
        </div>
        
        {icon && (
          <div className={cn('p-3 rounded-lg', theme.iconBg)}>
            <div className={theme.iconColor}>
              {icon}
            </div>
          </div>
        )}
      </div>
    </BaseCard>
  )
}

// Feature Card
export interface FeatureCardProps {
  title: string
  description: string
  icon?: React.ReactNode
  image?: string
  badge?: {
    text: string
    variant: 'success' | 'warning' | 'error' | 'info' | 'neutral'
  }
  actions?: {
    primary?: {
      text: string
      onClick: () => void
    }
    secondary?: {
      text: string
      onClick: () => void
    }
  }
  className?: string
}

const badgeVariants = {
  success: 'bg-green-100 text-green-800 border-green-200',
  warning: 'bg-amber-100 text-amber-800 border-amber-200',
  error: 'bg-red-100 text-red-800 border-red-200',
  info: 'bg-blue-100 text-blue-800 border-blue-200',
  neutral: 'bg-gray-100 text-gray-800 border-gray-200'
}

export function FeatureCard({
  title,
  description,
  icon,
  image,
  badge,
  actions,
  className
}: FeatureCardProps) {
  return (
    <BaseCard 
      className={cn('group', className)}
      hover={!!actions?.primary}
    >
      {/* Image or Icon Header */}
      {(image || icon) && (
        <div className="mb-4">
          {image ? (
            <img 
              src={image} 
              alt={title}
              className="w-full h-48 object-cover rounded-lg"
            />
          ) : icon ? (
            <div className="flex items-center justify-center h-12 w-12 bg-primary-100 rounded-lg">
              <div className="text-primary-600">
                {icon}
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Badge */}
      {badge && (
        <div className="mb-3">
          <span className={cn(
            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
            badgeVariants[badge.variant]
          )}>
            {badge.text}
          </span>
        </div>
      )}

      {/* Content */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
          {title}
        </h3>
        <p className="text-gray-600 leading-relaxed">
          {description}
        </p>
      </div>

      {/* Actions */}
      {actions && (
        <div className="mt-6 flex items-center gap-3">
          {actions.primary && (
            <button
              onClick={actions.primary.onClick}
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
            >
              {actions.primary.text}
            </button>
          )}
          {actions.secondary && (
            <button
              onClick={actions.secondary.onClick}
              className="inline-flex items-center px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
            >
              {actions.secondary.text}
            </button>
          )}
        </div>
      )}
    </BaseCard>
  )
}

// List Card
export interface ListItem {
  id: string | number
  title: string
  subtitle?: string
  description?: string
  status?: 'active' | 'inactive' | 'pending' | 'completed' | 'error'
  avatar?: string
  icon?: React.ReactNode
  metadata?: Array<{
    label: string
    value: string | number
    icon?: React.ReactNode
  }>
  actions?: Array<{
    label: string
    onClick: () => void
    variant?: 'primary' | 'secondary' | 'danger'
  }>
}

export interface ListCardProps {
  title: string
  items: ListItem[]
  showIndex?: boolean
  maxItems?: number
  onViewAll?: () => void
  className?: string
}

const statusColors = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
  pending: 'bg-amber-100 text-amber-800',
  completed: 'bg-blue-100 text-blue-800',
  error: 'bg-red-100 text-red-800'
}

export function ListCard({
  title,
  items,
  showIndex = false,
  maxItems,
  onViewAll,
  className
}: ListCardProps) {
  const displayItems = maxItems ? items.slice(0, maxItems) : items
  const hasMore = maxItems && items.length > maxItems

  return (
    <BaseCard className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {hasMore && onViewAll && (
          <button
            onClick={onViewAll}
            className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1"
          >
            View all
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Items */}
      <div className="space-y-4">
        {displayItems.map((item, index) => (
          <div key={item.id} className="flex items-start space-x-3 group">
            {/* Index or Avatar/Icon */}
            <div className="flex-shrink-0">
              {showIndex ? (
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-600">
                    {index + 1}
                  </span>
                </div>
              ) : item.avatar ? (
                <img
                  src={item.avatar}
                  alt={item.title}
                  className="w-10 h-10 rounded-full"
                />
              ) : item.icon ? (
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <div className="text-primary-600">
                    {item.icon}
                  </div>
                </div>
              ) : (
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-gray-400" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {item.title}
                    </h4>
                    {item.status && (
                      <span className={cn(
                        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                        statusColors[item.status]
                      )}>
                        {item.status}
                      </span>
                    )}
                  </div>
                  
                  {item.subtitle && (
                    <p className="text-xs text-gray-500 mb-1">
                      {item.subtitle}
                    </p>
                  )}
                  
                  {item.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {item.description}
                    </p>
                  )}

                  {/* Metadata */}
                  {item.metadata && item.metadata.length > 0 && (
                    <div className="flex items-center gap-4 mt-2">
                      {item.metadata.map((meta, metaIndex) => (
                        <div key={metaIndex} className="flex items-center gap-1 text-xs text-gray-500">
                          {meta.icon}
                          <span>{meta.label}: {meta.value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                {item.actions && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.actions.map((action, actionIndex) => (
                      <button
                        key={actionIndex}
                        onClick={action.onClick}
                        className={cn(
                          'px-2 py-1 text-xs font-medium rounded transition-colors',
                          action.variant === 'primary' && 'bg-primary-600 text-white hover:bg-primary-700',
                          action.variant === 'danger' && 'bg-red-600 text-white hover:bg-red-700',
                          (!action.variant || action.variant === 'secondary') && 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        )}
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      {hasMore && (
        <div className="mt-4 pt-4 border-t border-gray-200 text-center">
          <button
            onClick={onViewAll}
            className="text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            View {items.length - maxItems!} more items
          </button>
        </div>
      )}
    </BaseCard>
  )
}

// Quick Action Card
export interface QuickActionProps {
  title: string
  description: string
  icon: React.ReactNode
  onClick: () => void
  disabled?: boolean
  className?: string
}

export function QuickActionCard({
  title,
  description,
  icon,
  onClick,
  disabled = false,
  className
}: QuickActionProps) {
  return (
    <BaseCard
      className={cn(
        'group cursor-pointer',
        disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary-300',
        className
      )}
      hover={!disabled}
      onClick={disabled ? undefined : onClick}
    >
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <div className={cn(
            'w-12 h-12 rounded-lg flex items-center justify-center transition-colors',
            disabled 
              ? 'bg-gray-100' 
              : 'bg-primary-100 group-hover:bg-primary-200'
          )}>
            <div className={cn(
              'transition-colors',
              disabled ? 'text-gray-400' : 'text-primary-600'
            )}>
              {icon}
            </div>
          </div>
        </div>
        
        <div className="flex-1">
          <h3 className={cn(
            'text-sm font-medium mb-1 transition-colors',
            disabled 
              ? 'text-gray-500' 
              : 'text-gray-900 group-hover:text-primary-600'
          )}>
            {title}
          </h3>
          <p className={cn(
            'text-sm transition-colors',
            disabled ? 'text-gray-400' : 'text-gray-600'
          )}>
            {description}
          </p>
        </div>
        
        <ChevronRightIcon className={cn(
          'w-5 h-5 transition-colors',
          disabled 
            ? 'text-gray-300' 
            : 'text-gray-400 group-hover:text-primary-600'
        )} />
      </div>
    </BaseCard>
  )
}