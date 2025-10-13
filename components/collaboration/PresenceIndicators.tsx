'use client'

import React, { useState, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Users, 
  Circle, 
  Eye, 
  Edit, 
  MessageSquare, 
  Mouse,
  ChevronDown,
  Settings,
  UserPlus,
  Mail,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { type Participant, type UserPresence, CollaborationEngine } from '@/lib/collaboration/collaboration-engine'

interface PresenceIndicatorsProps {
  sessionId: string
  currentUserId: string
  showDetails?: boolean
  maxVisible?: number
  className?: string
  onInviteUser?: () => void
  onUserClick?: (userId: string) => void
}

interface CursorPosition {
  userId: string
  userName: string
  userAvatar?: string
  x: number
  y: number
  color: string
  elementId?: string
}

const PRESENCE_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
]

const getActivityIcon = (activity: string) => {
  switch (activity) {
    case 'viewing':
      return <Eye className="w-3 h-3" />
    case 'editing':
      return <Edit className="w-3 h-3" />
    case 'commenting':
      return <MessageSquare className="w-3 h-3" />
    default:
      return <Circle className="w-3 h-3 fill-current" />
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-500'
    case 'idle':
      return 'bg-yellow-500'
    case 'away':
      return 'bg-gray-400'
    default:
      return 'bg-gray-400'
  }
}

export function PresenceIndicators({
  sessionId,
  currentUserId,
  showDetails = true,
  maxVisible = 5,
  className,
  onInviteUser,
  onUserClick,
}: PresenceIndicatorsProps) {
  const [participants, setParticipants] = useState<Participant[]>([])
  const [cursors, setCursors] = useState<CursorPosition[]>([])
  const [loading, setLoading] = useState(true)
  
  const collaborationEngine = CollaborationEngine.getInstance()

  useEffect(() => {
    if (!sessionId) return

    const loadPresence = async () => {
      setLoading(true)
      try {
        const sessionParticipants = await collaborationEngine.getSessionParticipants(sessionId)
        setParticipants(sessionParticipants)
      } catch (error) {
        console.error('Failed to load presence:', error)
      } finally {
        setLoading(false)
      }
    }

    loadPresence()

    // Subscribe to presence updates
    const unsubscribe = collaborationEngine.on('presenceUpdate', (data) => {
      if (data.sessionId === sessionId) {
        setParticipants(prev => 
          prev.map(p => 
            p.userId === data.userId 
              ? { ...p, presence: data.presence }
              : p
          )
        )
      }
    })

    // Subscribe to cursor updates
    const unsubscribeCursor = collaborationEngine.on('cursorMove', (data) => {
      if (data.sessionId === sessionId) {
        setCursors(prev => {
          const existing = prev.findIndex(c => c.userId === data.userId)
          const newCursor: CursorPosition = {
            userId: data.userId,
            userName: data.userName,
            userAvatar: data.userAvatar,
            x: data.x,
            y: data.y,
            color: data.color || PRESENCE_COLORS[Math.floor(Math.random() * PRESENCE_COLORS.length)],
            elementId: data.elementId,
          }

          if (existing >= 0) {
            const updated = [...prev]
            updated[existing] = newCursor
            return updated
          } else {
            return [...prev, newCursor]
          }
        })
      }
    })

    // Subscribe to participant changes
    const unsubscribeParticipants = collaborationEngine.on('participantJoined', (data) => {
      if (data.sessionId === sessionId) {
        setParticipants(prev => {
          if (prev.some(p => p.userId === data.participant.userId)) {
            return prev
          }
          return [...prev, data.participant]
        })
      }
    })

    const unsubscribeParticipantLeft = collaborationEngine.on('participantLeft', (data) => {
      if (data.sessionId === sessionId) {
        setParticipants(prev => prev.filter(p => p.userId !== data.userId))
        setCursors(prev => prev.filter(c => c.userId !== data.userId))
      }
    })

    return () => {
      unsubscribe()
      unsubscribeCursor()
      unsubscribeParticipants()
      unsubscribeParticipantLeft()
    }
  }, [sessionId, collaborationEngine])

  const activeParticipants = participants.filter(p => p.userId !== currentUserId)
  const visibleParticipants = activeParticipants.slice(0, maxVisible)
  const hiddenCount = Math.max(0, activeParticipants.length - maxVisible)

  if (loading) {
    return (
      <div className={cn('flex items-center space-x-2', className)}>
        <div className="flex -space-x-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className={cn('flex items-center space-x-3', className)}>
        {/* Live Cursors */}
        <div className="fixed inset-0 pointer-events-none z-50">
          {cursors.map(cursor => (
            <div
              key={cursor.userId}
              className="absolute pointer-events-none transition-all duration-75 ease-out"
              style={{
                left: cursor.x,
                top: cursor.y,
                transform: 'translate(-2px, -2px)',
              }}
            >
              <div className="flex items-center space-x-2">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="drop-shadow-sm"
                >
                  <path
                    d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19841L11.7841 12.3673H5.65376Z"
                    fill={cursor.color}
                    stroke="white"
                    strokeWidth="1"
                  />
                </svg>
                <div
                  className="px-2 py-1 rounded text-xs text-white font-medium whitespace-nowrap"
                  style={{ backgroundColor: cursor.color }}
                >
                  {cursor.userName}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Participant Avatars */}
        <div className="flex items-center space-x-2">
          <div className="flex -space-x-2">
            {visibleParticipants.map((participant, index) => (
              <Tooltip key={participant.userId}>
                <TooltipTrigger asChild>
                  <div className="relative">
                    <Avatar 
                      className={cn(
                        "w-8 h-8 border-2 border-white cursor-pointer hover:z-10 transition-transform hover:scale-110",
                        onUserClick && "cursor-pointer"
                      )}
                      onClick={() => onUserClick?.(participant.userId)}
                    >
                      <AvatarImage src={participant.avatar} />
                      <AvatarFallback 
                        className="text-xs"
                        style={{ 
                          backgroundColor: PRESENCE_COLORS[index % PRESENCE_COLORS.length] + '20',
                          color: PRESENCE_COLORS[index % PRESENCE_COLORS.length]
                        }}
                      >
                        {participant.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    
                    {/* Status indicator */}
                    <div className={cn(
                      "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white",
                      getStatusColor(participant.presence?.status || 'away')
                    )} />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <div className="space-y-1">
                    <div className="font-medium">{participant.name}</div>
                    {participant.presence && (
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        {getActivityIcon(participant.presence.activity)}
                        <span className="capitalize">{participant.presence.activity}</span>
                      </div>
                    )}
                    {participant.presence?.location && (
                      <div className="text-xs text-muted-foreground">
                        At: {participant.presence.location}
                      </div>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>

          {/* Hidden participants count */}
          {hiddenCount > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 px-2">
                  <span className="text-xs text-muted-foreground">+{hiddenCount}</span>
                  <ChevronDown className="w-3 h-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {activeParticipants.slice(maxVisible).map(participant => (
                  <DropdownMenuItem
                    key={participant.userId}
                    onClick={() => onUserClick?.(participant.userId)}
                    className="flex items-center space-x-3"
                  >
                    <div className="relative">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={participant.avatar} />
                        <AvatarFallback className="text-xs">
                          {participant.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className={cn(
                        "absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-white",
                        getStatusColor(participant.presence?.status || 'away')
                      )} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {participant.name}
                      </div>
                      {participant.presence && (
                        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                          {getActivityIcon(participant.presence.activity)}
                          <span className="capitalize">{participant.presence.activity}</span>
                        </div>
                      )}
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {showDetails && (
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="text-xs">
              <Users className="w-3 h-3 mr-1" />
              {participants.length} online
            </Badge>
            
            {onInviteUser && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={onInviteUser}>
                    <UserPlus className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Invite collaborators</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        )}

        {/* Activity Summary */}
        {showDetails && participants.some(p => p.presence?.activity !== 'viewing') && (
          <div className="flex items-center space-x-1">
            {participants
              .filter(p => p.presence?.activity && p.presence.activity !== 'viewing')
              .map((participant, index) => (
                <Tooltip key={participant.userId}>
                  <TooltipTrigger asChild>
                    <div className="flex items-center space-x-1 px-2 py-1 bg-muted rounded text-xs">
                      {getActivityIcon(participant.presence!.activity)}
                      <span>{participant.name.split(' ')[0]}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{participant.name} is {participant.presence!.activity}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}

// Hook for tracking user cursor position
export function useCursorTracking(sessionId: string, userId: string, userName: string) {
  const collaborationEngine = CollaborationEngine.getInstance()

  useEffect(() => {
    if (!sessionId || !userId) return

    const handleMouseMove = (e: MouseEvent) => {
      const elementId = (e.target as Element)?.id || undefined
      
      collaborationEngine.updatePresence(sessionId, userId, {
        status: 'active',
        activity: 'viewing',
        location: window.location.pathname,
        cursor: {
          x: e.clientX,
          y: e.clientY,
          elementId,
        },
      })
    }

    const handleMouseLeave = () => {
      collaborationEngine.updatePresence(sessionId, userId, {
        status: 'active',
        activity: 'viewing',
        location: window.location.pathname,
        cursor: null,
      })
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [sessionId, userId, userName, collaborationEngine])
}