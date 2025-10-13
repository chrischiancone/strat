'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  Activity,
  MessageSquare,
  Edit,
  Plus,
  Trash2,
  UserPlus,
  UserMinus,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  Calendar,
  MoreHorizontal,
  ExternalLink,
  Eye,
  GitBranch,
  Target,
  BarChart3,
} from 'lucide-react'
import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns'
import { cn } from '@/lib/utils'
import { type ActivityFeedItem, CollaborationEngine } from '@/lib/collaboration/collaboration-engine'

interface ActivityFeedProps {
  sessionId?: string
  resourceId?: string
  resourceType?: 'plan' | 'goal' | 'initiative' | 'dashboard'
  userId?: string
  className?: string
  maxHeight?: string
  showFilters?: boolean
  onNavigate?: (resourceType: string, resourceId: string) => void
}

type ActivityFilter = 'all' | 'comments' | 'edits' | 'user-actions' | 'system'

const getActivityIcon = (action: string, resourceType?: string) => {
  switch (action) {
    case 'comment_added':
      return <MessageSquare className="w-4 h-4 text-blue-500" />
    case 'comment_updated':
      return <MessageSquare className="w-4 h-4 text-orange-500" />
    case 'comment_deleted':
      return <MessageSquare className="w-4 h-4 text-red-500" />
    case 'edit':
      return <Edit className="w-4 h-4 text-green-500" />
    case 'created':
      return <Plus className="w-4 h-4 text-blue-500" />
    case 'deleted':
      return <Trash2 className="w-4 h-4 text-red-500" />
    case 'user_joined':
      return <UserPlus className="w-4 h-4 text-green-500" />
    case 'user_left':
      return <UserMinus className="w-4 h-4 text-orange-500" />
    case 'status_changed':
      return <CheckCircle className="w-4 h-4 text-purple-500" />
    case 'assigned':
      return <UserPlus className="w-4 h-4 text-blue-500" />
    case 'unassigned':
      return <UserMinus className="w-4 h-4 text-gray-500" />
    case 'due_date_changed':
      return <Calendar className="w-4 h-4 text-yellow-500" />
    case 'viewed':
      return <Eye className="w-4 h-4 text-gray-400" />
    default:
      if (resourceType === 'plan') return <FileText className="w-4 h-4 text-blue-500" />
      if (resourceType === 'goal') return <Target className="w-4 h-4 text-green-500" />
      if (resourceType === 'initiative') return <GitBranch className="w-4 h-4 text-purple-500" />
      if (resourceType === 'dashboard') return <BarChart3 className="w-4 h-4 text-orange-500" />
      return <Activity className="w-4 h-4 text-gray-500" />
  }
}

const getActivityColor = (action: string) => {
  switch (action) {
    case 'created':
    case 'user_joined':
      return 'border-l-green-500'
    case 'deleted':
    case 'user_left':
      return 'border-l-red-500'
    case 'edit':
    case 'comment_added':
      return 'border-l-blue-500'
    case 'comment_updated':
    case 'status_changed':
      return 'border-l-orange-500'
    default:
      return 'border-l-gray-300'
  }
}

const formatActivityMessage = (activity: ActivityFeedItem) => {
  const { action, resourceType, actorName, metadata } = activity
  
  const resourceTypeText = resourceType?.toLowerCase() || 'item'
  
  switch (action) {
    case 'comment_added':
      return `commented on this ${resourceTypeText}`
    case 'comment_updated':
      return `updated their comment on this ${resourceTypeText}`
    case 'comment_deleted':
      return `deleted their comment from this ${resourceTypeText}`
    case 'edit':
      return `edited this ${resourceTypeText}`
    case 'created':
      return `created this ${resourceTypeText}`
    case 'deleted':
      return `deleted this ${resourceTypeText}`
    case 'user_joined':
      return `joined the collaboration session`
    case 'user_left':
      return `left the collaboration session`
    case 'status_changed':
      return `changed status ${metadata?.from ? `from "${metadata.from}" ` : ''}to "${metadata?.to}"`
    case 'assigned':
      return `assigned ${metadata?.assigneeName || 'someone'} to this ${resourceTypeText}`
    case 'unassigned':
      return `removed ${metadata?.assigneeName || 'someone'} from this ${resourceTypeText}`
    case 'due_date_changed':
      return metadata?.dueDate 
        ? `set due date to ${format(new Date(metadata.dueDate), 'MMM d, yyyy')}`
        : `removed the due date`
    case 'viewed':
      return `viewed this ${resourceTypeText}`
    default:
      return `performed an action on this ${resourceTypeText}`
  }
}

const getTimeLabel = (date: Date) => {
  if (isToday(date)) {
    return 'Today'
  } else if (isYesterday(date)) {
    return 'Yesterday'
  } else {
    return format(date, 'MMM d, yyyy')
  }
}

export function ActivityFeed({
  sessionId,
  resourceId,
  resourceType,
  userId,
  className,
  maxHeight = '500px',
  showFilters = true,
  onNavigate,
}: ActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityFeedItem[]>([])
  const [filter, setFilter] = useState<ActivityFilter>('all')
  const [loading, setLoading] = useState(false)
  const [showSystemActivities, setShowSystemActivities] = useState(true)
  
  const collaborationEngine = CollaborationEngine.getInstance()

  useEffect(() => {
    loadActivities()
  }, [sessionId, resourceId, resourceType, userId])

  useEffect(() => {
    if (!sessionId && !resourceId) return

    // Subscribe to new activities
    const unsubscribe = collaborationEngine.on('activity', (activity) => {
      if (
        (sessionId && activity.sessionId === sessionId) ||
        (resourceId && activity.resourceId === resourceId)
      ) {
        setActivities(prev => [activity, ...prev])
      }
    })

    return () => unsubscribe()
  }, [sessionId, resourceId, collaborationEngine])

  const loadActivities = async () => {
    setLoading(true)
    try {
      let activityData: ActivityFeedItem[] = []
      
      if (sessionId) {
        activityData = await collaborationEngine.getSessionActivity(sessionId)
      } else if (resourceId && resourceType) {
        const response = await fetch(
          `/api/collaboration/activity?resourceId=${resourceId}&resourceType=${resourceType}`
        )
        if (response.ok) {
          const data = await response.json()
          activityData = data.activities
        }
      } else if (userId) {
        const response = await fetch(`/api/collaboration/activity?userId=${userId}`)
        if (response.ok) {
          const data = await response.json()
          activityData = data.activities
        }
      }
      
      setActivities(activityData)
    } catch (error) {
      console.error('Failed to load activities:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredActivities = activities.filter(activity => {
    if (!showSystemActivities && activity.action === 'viewed') return false
    
    switch (filter) {
      case 'comments':
        return activity.action.startsWith('comment_')
      case 'edits':
        return ['edit', 'created', 'deleted', 'status_changed'].includes(activity.action)
      case 'user-actions':
        return ['user_joined', 'user_left', 'assigned', 'unassigned'].includes(activity.action)
      case 'system':
        return ['viewed'].includes(activity.action)
      default:
        return true
    }
  })

  // Group activities by date
  const groupedActivities = filteredActivities.reduce((groups, activity) => {
    const date = getTimeLabel(activity.timestamp)
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(activity)
    return groups
  }, {} as Record<string, ActivityFeedItem[]>)

  const handleActivityClick = (activity: ActivityFeedItem) => {
    if (activity.resourceType && activity.resourceId) {
      onNavigate?.(activity.resourceType, activity.resourceId)
    }
  }

  return (
    <Card className={cn('flex flex-col', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center space-x-2">
            <Activity className="w-5 h-5" />
            <span>Activity Feed</span>
            {activities.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {activities.length}
              </Badge>
            )}
          </CardTitle>
          
          {showFilters && (
            <div className="flex items-center space-x-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Filter className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setFilter('all')}>
                    All Activities
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setFilter('comments')}>
                    Comments
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilter('edits')}>
                    Edits & Changes
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilter('user-actions')}>
                    User Actions
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilter('system')}>
                    System Events
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem 
                    onClick={() => setShowSystemActivities(!showSystemActivities)}
                  >
                    {showSystemActivities ? 'Hide' : 'Show'} System Activities
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={loadActivities}>
                    Refresh
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
        
        <CardDescription>
          Track collaboration and changes in real-time
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-full" style={{ maxHeight }}>
          {loading ? (
            <div className="p-4 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex space-x-3 animate-pulse">
                  <div className="w-8 h-8 bg-gray-200 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-3/4" />
                    <div className="h-2 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : Object.keys(groupedActivities).length > 0 ? (
            <div className="space-y-6">
              {Object.entries(groupedActivities).map(([date, dateActivities]) => (
                <div key={date}>
                  <div className="sticky top-0 bg-background/80 backdrop-blur-sm px-4 py-2 border-b">
                    <h3 className="text-sm font-medium text-muted-foreground">
                      {date}
                    </h3>
                  </div>
                  
                  <div className="space-y-1">
                    {dateActivities.map((activity, index) => (
                      <div
                        key={activity.id}
                        className={cn(
                          'flex items-start space-x-3 p-4 hover:bg-muted/50 transition-colors border-l-4',
                          onNavigate && activity.resourceType && activity.resourceId && 'cursor-pointer',
                          getActivityColor(activity.action)
                        )}
                        onClick={() => handleActivityClick(activity)}
                      >
                        <div className="flex-shrink-0 mt-1">
                          {getActivityIcon(activity.action, activity.resourceType)}
                        </div>
                        
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center space-x-2">
                            <Avatar className="w-6 h-6">
                              <AvatarImage src={activity.actorAvatar} />
                              <AvatarFallback className="text-xs">
                                {activity.actorName.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">
                              {activity.actorName}
                            </span>
                          </div>
                          
                          <p className="text-sm text-gray-600">
                            {formatActivityMessage(activity)}
                          </p>
                          
                          {activity.description && (
                            <p className="text-xs text-gray-500 italic">
                              "{activity.description}"
                            </p>
                          )}
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-gray-500">
                                {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                              </span>
                              
                              {activity.resourceType && (
                                <Badge variant="outline" className="text-xs">
                                  {activity.resourceType}
                                </Badge>
                              )}
                            </div>
                            
                            {onNavigate && activity.resourceType && activity.resourceId && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-6 px-2 opacity-0 group-hover:opacity-100"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleActivityClick(activity)
                                }}
                              >
                                <ExternalLink className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 px-4 text-center text-gray-500">
              <Activity className="w-12 h-12 mb-4 opacity-20" />
              <p className="text-sm">
                {filter === 'all' 
                  ? "No activity yet"
                  : `No ${filter.replace('-', ' ')} activity`
                }
              </p>
              {filter !== 'all' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFilter('all')}
                  className="mt-2"
                >
                  View all activity
                </Button>
              )}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}