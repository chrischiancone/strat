'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Users,
  MessageSquare,
  Bell,
  Activity,
  Settings,
  X,
  Minimize2,
  Maximize2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

import { CommentsPanel } from './CommentsPanel'
import { PresenceIndicators, useCursorTracking } from './PresenceIndicators'
import { NotificationsPanel } from './NotificationsPanel'
import { ActivityFeed } from './ActivityFeed'
import { CollaborationEngine } from '@/lib/collaboration/collaboration-engine'

interface CollaborationWrapperProps {
  resourceId: string
  resourceType: 'plan' | 'goal' | 'initiative' | 'dashboard'
  currentUserId: string
  currentUserName: string
  currentUserAvatar?: string
  children: React.ReactNode
  className?: string
  showPresenceInline?: boolean
  defaultSidebarOpen?: boolean
}

type SidebarTab = 'comments' | 'notifications' | 'activity'

export function CollaborationWrapper({
  resourceId,
  resourceType,
  currentUserId,
  currentUserName,
  currentUserAvatar,
  children,
  className,
  showPresenceInline = true,
  defaultSidebarOpen = false,
}: CollaborationWrapperProps) {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(defaultSidebarOpen)
  const [sidebarMinimized, setSidebarMinimized] = useState(false)
  const [activeTab, setActiveTab] = useState<SidebarTab>('comments')
  const [unreadCounts, setUnreadCounts] = useState({
    comments: 0,
    notifications: 0,
    activities: 0,
  })
  
  const { toast } = useToast()
  const router = useRouter()
  const collaborationEngine = CollaborationEngine.getInstance()

  // Internal navigation handler
  const handleNavigate = (resourceType: string, resourceId: string) => {
    switch (resourceType) {
      case 'goal':
        router.push(`/goals/${resourceId}`)
        break
      case 'initiative':
        router.push(`/initiatives/${resourceId}`)
        break
      default:
        router.push(`/${resourceType}s/${resourceId}`)
        break
    }
  }

  // Internal user invitation handler
  const handleInviteUser = () => {
    // TODO: Implement user invitation modal or functionality
    toast({
      title: 'Invite Users',
      description: 'User invitation feature coming soon!',
    })
  }

  // Internal mention handler
  const handleMention = (userId: string) => {
    // TODO: Handle user mention (e.g., add @mention to active comment)
    console.log('Mention user:', userId)
  }

  // Initialize collaboration session
  useEffect(() => {
    initializeSession()
    return () => {
      if (sessionId) {
        collaborationEngine.leaveSession(sessionId, currentUserId)
      }
    }
  }, [resourceId, resourceType, currentUserId])

  // Track cursor movement
  useCursorTracking(sessionId || '', currentUserId, currentUserName)

  // Subscribe to real-time updates for unread counts
  useEffect(() => {
    if (!sessionId) return

    const unsubscribeComment = collaborationEngine.on('comment', () => {
      setUnreadCounts(prev => ({ ...prev, comments: prev.comments + 1 }))
    })

    const unsubscribeNotification = collaborationEngine.on('notification', (notification) => {
      if (notification.userId === currentUserId) {
        setUnreadCounts(prev => ({ ...prev, notifications: prev.notifications + 1 }))
      }
    })

    const unsubscribeActivity = collaborationEngine.on('activity', () => {
      setUnreadCounts(prev => ({ ...prev, activities: prev.activities + 1 }))
    })

    return () => {
      unsubscribeComment()
      unsubscribeNotification()
      unsubscribeActivity()
    }
  }, [sessionId, currentUserId, collaborationEngine])

  const initializeSession = async () => {
    try {
      const session = await collaborationEngine.createSession(
        resourceId,
        resourceType,
        currentUserId
      )
      setSessionId(session.id)

      // Note: joinSession is not required for the creator; session already includes the participant.
      // Additional participants will be handled by the engine or future sockets.
    } catch (error) {
      console.error('Failed to initialize collaboration session:', error)
      toast({
        title: 'Connection Error',
        description: 'Unable to start collaboration session. Some features may not work.',
        variant: 'destructive',
      })
    }
  }

  const handleTabChange = (tab: SidebarTab) => {
    setActiveTab(tab)
    
    // Reset unread count for the selected tab
    setUnreadCounts(prev => ({
      ...prev,
      [tab]: 0,
    }))
  }

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen)
    if (!sidebarOpen) {
      setSidebarMinimized(false)
    }
  }

  const getTotalUnread = () => {
    return unreadCounts.comments + unreadCounts.notifications + unreadCounts.activities
  }

  const getTabBadge = (tab: SidebarTab) => {
    const count = unreadCounts[tab === 'activity' ? 'activities' : tab]
    return count > 0 ? (
      <Badge variant="destructive" className="ml-1 text-xs min-w-[16px] h-4 p-0 flex items-center justify-center">
        {count > 99 ? '99+' : count}
      </Badge>
    ) : null
  }

  if (!sessionId) {
    return (
      <div className={cn('relative', className)}>
        {children}
        <div className="absolute top-4 right-4">
          <div className="flex items-center space-x-2 bg-muted px-3 py-1 rounded-full">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
            <span className="text-sm text-muted-foreground">Connecting...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('relative min-h-screen flex', className)}>
      {/* Main Content */}
      <div className={cn(
        'flex-1 transition-all duration-300',
        sidebarOpen && !sidebarMinimized ? 'mr-96' : 'mr-0'
      )}>
        {/* Presence Bar */}
        {showPresenceInline && (
          <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b px-6 py-3">
            <div className="flex items-center justify-between">
              <PresenceIndicators
                sessionId={sessionId}
                currentUserId={currentUserId}
                showDetails={true}
                onInviteUser={handleInviteUser}
                onUserClick={handleMention}
              />
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSidebarToggle}
                  className="relative"
                >
                  {sidebarOpen ? (
                    <>
                      <X className="w-4 h-4 mr-1" />
                      Close
                    </>
                  ) : (
                    <>
                      <MessageSquare className="w-4 h-4 mr-1" />
                      Collaborate
                      {getTotalUnread() > 0 && (
                        <Badge variant="destructive" className="absolute -top-1 -right-1 text-xs min-w-[16px] h-4 p-0 flex items-center justify-center">
                          {getTotalUnread() > 99 ? '99+' : getTotalUnread()}
                        </Badge>
                      )}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="p-6">
          {children}
        </div>
      </div>

      {/* Collaboration Sidebar */}
      {sidebarOpen && (
        <div className={cn(
          'fixed right-0 top-0 h-full bg-background border-l z-20 transition-all duration-300',
          sidebarMinimized ? 'w-16' : 'w-96'
        )}>
          {sidebarMinimized ? (
            /* Minimized Sidebar */
            <div className="p-4 space-y-4">
              <div className="flex flex-col items-center space-y-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarMinimized(false)}
                  className="w-8 h-8 p-0"
                >
                  <Maximize2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSidebarToggle}
                  className="w-8 h-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <Separator />
              
              <div className="flex flex-col items-center space-y-2">
                <Button
                  variant={activeTab === 'comments' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => {
                    setActiveTab('comments')
                    setSidebarMinimized(false)
                  }}
                  className="w-8 h-8 p-0 relative"
                >
                  <MessageSquare className="w-4 h-4" />
                  {unreadCounts.comments > 0 && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                  )}
                </Button>
                
                <Button
                  variant={activeTab === 'notifications' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => {
                    setActiveTab('notifications')
                    setSidebarMinimized(false)
                  }}
                  className="w-8 h-8 p-0 relative"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCounts.notifications > 0 && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                  )}
                </Button>
                
                <Button
                  variant={activeTab === 'activity' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => {
                    setActiveTab('activity')
                    setSidebarMinimized(false)
                  }}
                  className="w-8 h-8 p-0 relative"
                >
                  <Activity className="w-4 h-4" />
                  {unreadCounts.activities > 0 && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                  )}
                </Button>
              </div>
            </div>
          ) : (
            /* Full Sidebar */
            <div className="h-full flex flex-col">
              {/* Sidebar Header */}
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="w-5 h-5" />
                    <h2 className="font-semibold">Collaboration</h2>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSidebarMinimized(true)}
                      className="w-8 h-8 p-0"
                    >
                      <Minimize2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSidebarToggle}
                      className="w-8 h-8 p-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                {!showPresenceInline && (
                  <>
                    <Separator className="my-3" />
                    <PresenceIndicators
                      sessionId={sessionId}
                      currentUserId={currentUserId}
                      showDetails={true}
                      maxVisible={3}
                      onInviteUser={handleInviteUser}
                      onUserClick={handleMention}
                    />
                  </>
                )}
              </div>

              {/* Sidebar Content */}
              <div className="flex-1 overflow-hidden">
                <Tabs
                  value={activeTab}
                  onValueChange={(value) => handleTabChange(value as SidebarTab)}
                  className="h-full flex flex-col"
                >
                  <TabsList className="grid w-full grid-cols-3 mx-4 mt-4">
                    <TabsTrigger value="comments" className="relative">
                      <MessageSquare className="w-4 h-4 mr-1" />
                      Comments
                      {getTabBadge('comments')}
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="relative">
                      <Bell className="w-4 h-4 mr-1" />
                      Alerts
                      {getTabBadge('notifications')}
                    </TabsTrigger>
                    <TabsTrigger value="activity" className="relative">
                      <Activity className="w-4 h-4 mr-1" />
                      Activity
                      {getTabBadge('activity')}
                    </TabsTrigger>
                  </TabsList>

                  <div className="flex-1 overflow-hidden p-4">
                    <TabsContent value="comments" className="h-full m-0">
                      <CommentsPanel
                        resourceId={resourceId}
                        resourceType={resourceType}
                        currentUserId={currentUserId}
                        currentUserName={currentUserName}
                        currentUserAvatar={currentUserAvatar}
                        onMention={handleMention}
                      />
                    </TabsContent>

                    <TabsContent value="notifications" className="h-full m-0">
                      <NotificationsPanel
                        userId={currentUserId}
                        onNavigate={handleNavigate}
                        maxHeight="calc(100vh - 200px)"
                      />
                    </TabsContent>

                    <TabsContent value="activity" className="h-full m-0">
                      <ActivityFeed
                        sessionId={sessionId}
                        resourceId={resourceId}
                        resourceType={resourceType}
                        onNavigate={handleNavigate}
                        maxHeight="calc(100vh - 200px)"
                      />
                    </TabsContent>
                  </div>
                </Tabs>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}