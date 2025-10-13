'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Bell,
  BellOff,
  Check,
  CheckCheck,
  X,
  MoreHorizontal,
  MessageSquare,
  Edit,
  UserPlus,
  AlertCircle,
  Info,
  CheckCircle,
  ExternalLink,
  Filter,
  Settings,
  Archive,
  Trash2,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { type Notification, CollaborationEngine } from '@/lib/collaboration/collaboration-engine'

interface NotificationsPanelProps {
  userId: string
  className?: string
  onNavigate?: (resourceType: string, resourceId: string) => void
  maxHeight?: string
}

type NotificationFilter = 'all' | 'unread' | 'mentions' | 'comments' | 'activity'

const getNotificationIcon = (type: string, priority: string = 'medium') => {
  const iconClass = cn('w-4 h-4', {
    'text-red-500': priority === 'high',
    'text-yellow-500': priority === 'medium',
    'text-blue-500': priority === 'low',
  })

  switch (type) {
    case 'comment':
      return <MessageSquare className={iconClass} />
    case 'mention':
      return <AlertCircle className={iconClass} />
    case 'edit':
      return <Edit className={iconClass} />
    case 'invite':
      return <UserPlus className={iconClass} />
    case 'system':
      return <Info className={iconClass} />
    default:
      return <Bell className={iconClass} />
  }
}

const getNotificationColor = (type: string, priority: string = 'medium') => {
  switch (priority) {
    case 'high':
      return 'border-l-red-500 bg-red-50'
    case 'medium':
      return 'border-l-yellow-500 bg-yellow-50'
    case 'low':
      return 'border-l-blue-500 bg-blue-50'
    default:
      return 'border-l-gray-300 bg-gray-50'
  }
}

export function NotificationsPanel({
  userId,
  className,
  onNavigate,
  maxHeight = '400px',
}: NotificationsPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filter, setFilter] = useState<NotificationFilter>('all')
  const [loading, setLoading] = useState(false)
  const [showOnlyUnread, setShowOnlyUnread] = useState(false)
  
  const { toast } = useToast()
  const collaborationEngine = CollaborationEngine.getInstance()

  // Load notifications
  useEffect(() => {
    loadNotifications()
  }, [userId])

  // Subscribe to new notifications
  useEffect(() => {
    const unsubscribe = collaborationEngine.on('notification', (notification) => {
      if (notification.userId === userId) {
        setNotifications(prev => [notification, ...prev])
        
        // Show toast for high priority notifications
        if (notification.priority === 'high') {
          toast({
            title: notification.title,
            description: notification.message,
            action: notification.actionUrl ? (
              <Button variant="outline" size="sm" onClick={() => {
                if (notification.resourceType && notification.resourceId) {
                  onNavigate?.(notification.resourceType, notification.resourceId)
                }
              }}>
                <ExternalLink className="w-3 h-3 mr-1" />
                View
              </Button>
            ) : undefined,
          })
        }
      }
    })

    return () => unsubscribe()
  }, [userId, collaborationEngine, toast, onNavigate])

  const loadNotifications = async () => {
    setLoading(true)
    try {
      const userNotifications = await collaborationEngine.getUserNotifications(userId)
      setNotifications(userNotifications)
    } catch (error) {
      console.error('Failed to load notifications:', error)
      toast({
        title: 'Error loading notifications',
        description: 'Unable to load notifications. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      await collaborationEngine.markNotificationAsRead(notificationId)
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, read: true } : n
        )
      )
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications
        .filter(n => !n.read)
        .map(n => n.id)

      await Promise.all(
        unreadIds.map(id => collaborationEngine.markNotificationAsRead(id))
      )

      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true }))
      )

      toast({
        title: 'All notifications marked as read',
      })
    } catch (error) {
      console.error('Failed to mark all as read:', error)
      toast({
        title: 'Error',
        description: 'Unable to mark notifications as read.',
        variant: 'destructive',
      })
    }
  }

  const deleteNotification = async (notificationId: string) => {
    try {
      await fetch(`/api/collaboration/notifications/${notificationId}`, {
        method: 'DELETE',
      })

      setNotifications(prev =>
        prev.filter(n => n.id !== notificationId)
      )

      toast({
        title: 'Notification deleted',
      })
    } catch (error) {
      console.error('Failed to delete notification:', error)
      toast({
        title: 'Error',
        description: 'Unable to delete notification.',
        variant: 'destructive',
      })
    }
  }

  const clearAll = async () => {
    try {
      await Promise.all(
        notifications.map(n => deleteNotification(n.id))
      )
      
      setNotifications([])
      toast({
        title: 'All notifications cleared',
      })
    } catch (error) {
      console.error('Failed to clear notifications:', error)
    }
  }

  const filteredNotifications = notifications.filter(notification => {
    if (showOnlyUnread && notification.read) return false
    
    switch (filter) {
      case 'unread':
        return !notification.read
      case 'mentions':
        return notification.type === 'mention'
      case 'comments':
        return notification.type === 'comment'
      case 'activity':
        return ['edit', 'invite', 'system'].includes(notification.type)
      default:
        return true
    }
  })

  const unreadCount = notifications.filter(n => !n.read).length
  const hasNotifications = notifications.length > 0

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read when clicked
    if (!notification.read) {
      markAsRead(notification.id)
    }

    // Navigate if possible
    if (notification.resourceType && notification.resourceId) {
      onNavigate?.(notification.resourceType, notification.resourceId)
    } else if (notification.actionUrl) {
      window.open(notification.actionUrl, '_blank')
    }
  }

  return (
    <Card className={cn('flex flex-col', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center space-x-2">
            <Bell className="w-5 h-5" />
            <span>Notifications</span>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          
          <div className="flex items-center space-x-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Filter className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setFilter('all')}>
                  All Notifications
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('unread')}>
                  Unread Only
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setFilter('mentions')}>
                  Mentions
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('comments')}>
                  Comments
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('activity')}>
                  Activity
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {hasNotifications && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {unreadCount > 0 && (
                    <DropdownMenuItem onClick={markAllAsRead}>
                      <CheckCheck className="w-4 h-4 mr-2" />
                      Mark all as read
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => setShowOnlyUnread(!showOnlyUnread)}>
                    {showOnlyUnread ? <Bell /> : <BellOff />}
                    <span className="ml-2">
                      {showOnlyUnread ? 'Show all' : 'Show unread only'}
                    </span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={clearAll} className="text-red-600">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear all
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
        
        <CardDescription>
          Stay updated on collaboration activity
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-full" style={{ maxHeight }}>
          {loading ? (
            <div className="p-4 space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex space-x-3 animate-pulse">
                  <div className="w-8 h-8 bg-gray-200 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-3/4" />
                    <div className="h-2 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredNotifications.length > 0 ? (
            <div className="divide-y">
              {filteredNotifications.map((notification, index) => (
                <div
                  key={notification.id}
                  className={cn(
                    'flex items-start space-x-3 p-4 cursor-pointer hover:bg-muted/50 transition-colors border-l-4',
                    notification.read ? 'opacity-60' : '',
                    getNotificationColor(notification.type, notification.priority)
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type, notification.priority)}
                  </div>
                  
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        
                        {notification.actors && notification.actors.length > 0 && (
                          <div className="flex items-center space-x-1 mt-2">
                            {notification.actors.slice(0, 3).map((actor, actorIndex) => (
                              <Avatar key={actor.id} className="w-5 h-5">
                                <AvatarImage src={actor.avatar} />
                                <AvatarFallback className="text-xs">
                                  {actor.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                            ))}
                            {notification.actors.length > 3 && (
                              <span className="text-xs text-gray-500">
                                +{notification.actors.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-1 ml-2">
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal className="w-3 h-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {!notification.read ? (
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation()
                                markAsRead(notification.id)
                              }}>
                                <Check className="w-4 h-4 mr-2" />
                                Mark as read
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation()
                                // Mark as unread functionality
                              }}>
                                <Bell className="w-4 h-4 mr-2" />
                                Mark as unread
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteNotification(notification.id)
                              }}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
                      </span>
                      
                      {(notification.resourceType && notification.resourceId) && (
                        <Badge variant="outline" className="text-xs">
                          {notification.resourceType}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 px-4 text-center text-gray-500">
              <Bell className="w-12 h-12 mb-4 opacity-20" />
              <p className="text-sm">
                {filter === 'all' 
                  ? "No notifications yet"
                  : `No ${filter} notifications`
                }
              </p>
              {filter !== 'all' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFilter('all')}
                  className="mt-2"
                >
                  View all notifications
                </Button>
              )}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}