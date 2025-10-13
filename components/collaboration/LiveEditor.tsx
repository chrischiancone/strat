'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
  Edit,
  Users,
  Save,
  Undo2,
  Redo2,
  Type,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  AlertTriangle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { type LiveEdit, type Participant, CollaborationEngine } from '@/lib/collaboration/collaboration-engine'
import { useDebounce } from '@/hooks/use-debounce'

interface LiveEditorProps {
  sessionId: string
  resourceId: string
  resourceType: 'plan' | 'goal' | 'initiative' | 'dashboard'
  currentUserId: string
  currentUserName: string
  initialContent?: string
  fieldName: string
  placeholder?: string
  className?: string
  onSave?: (content: string) => void
  onContentChange?: (content: string) => void
  readOnly?: boolean
  showParticipants?: boolean
  autoSave?: boolean
  saveDelay?: number
}

interface EditCursor {
  userId: string
  userName: string
  position: number
  color: string
}

interface ConflictedEdit {
  id: string
  content: string
  timestamp: Date
  userId: string
  userName: string
}

const EDITOR_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
]

export function LiveEditor({
  sessionId,
  resourceId,
  resourceType,
  currentUserId,
  currentUserName,
  initialContent = '',
  fieldName,
  placeholder = 'Start typing...',
  className,
  onSave,
  onContentChange,
  readOnly = false,
  showParticipants = true,
  autoSave = true,
  saveDelay = 2000,
}: LiveEditorProps) {
  const [content, setContent] = useState(initialContent)
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [editCursors, setEditCursors] = useState<EditCursor[]>([])
  const [conflicts, setConflicts] = useState<ConflictedEdit[]>([])
  const [activeEditors, setActiveEditors] = useState<Participant[]>([])
  const [isLocked, setIsLocked] = useState(false)
  const [showConflicts, setShowConflicts] = useState(false)
  const [editHistory, setEditHistory] = useState<string[]>([initialContent])
  const [historyIndex, setHistoryIndex] = useState(0)
  
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { toast } = useToast()
  const collaborationEngine = CollaborationEngine.getInstance()
  
  const debouncedContent = useDebounce(content, 300)

  // Handle auto-save
  useEffect(() => {
    if (!autoSave || !debouncedContent || debouncedContent === initialContent) return

    const saveTimer = setTimeout(async () => {
      await handleSave(debouncedContent, false)
    }, saveDelay)

    return () => clearTimeout(saveTimer)
  }, [debouncedContent, autoSave, saveDelay, initialContent])

  // Subscribe to live edits
  useEffect(() => {
    const unsubscribeLiveEdit = collaborationEngine.on('liveEdit', (edit) => {
      if (edit.resourceId === resourceId && edit.fieldName === fieldName && edit.userId !== currentUserId) {
        handleRemoteEdit(edit)
      }
    })

    const unsubscribePresence = collaborationEngine.on('presenceUpdate', (data) => {
      if (data.sessionId === sessionId) {
        updateEditCursors(data)
      }
    })

    const unsubscribeLock = collaborationEngine.on('editLock', (data) => {
      if (data.resourceId === resourceId && data.fieldName === fieldName) {
        setIsLocked(data.locked && data.userId !== currentUserId)
      }
    })

    return () => {
      unsubscribeLiveEdit()
      unsubscribePresence()
      unsubscribeLock()
    }
  }, [sessionId, resourceId, fieldName, currentUserId, collaborationEngine])

  // Broadcast edits
  useEffect(() => {
    if (content !== initialContent) {
      const edit: Omit<LiveEdit, 'id' | 'timestamp'> = {
        sessionId,
        resourceId,
        resourceType,
        fieldName,
        userId: currentUserId,
        userName: currentUserName,
        operation: 'replace',
        content,
        position: textareaRef.current?.selectionStart || 0,
      }

      collaborationEngine.broadcastLiveEdit(edit)
      onContentChange?.(content)
    }
  }, [content, sessionId, resourceId, resourceType, fieldName, currentUserId, currentUserName])

  const handleRemoteEdit = useCallback((edit: LiveEdit) => {
    if (edit.operation === 'replace') {
      // Check for conflicts
      if (content !== edit.content && content !== initialContent) {
        const conflict: ConflictedEdit = {
          id: edit.id,
          content: edit.content,
          timestamp: edit.timestamp,
          userId: edit.userId,
          userName: edit.userName,
        }
        setConflicts(prev => [...prev, conflict])
        setShowConflicts(true)
        return
      }

      setContent(edit.content)
    } else if (edit.operation === 'insert') {
      const textarea = textareaRef.current
      if (textarea) {
        const start = edit.position || 0
        const newContent = content.slice(0, start) + edit.content + content.slice(start)
        setContent(newContent)
      }
    } else if (edit.operation === 'delete') {
      const textarea = textareaRef.current
      if (textarea) {
        const start = edit.position || 0
        const end = start + (edit.length || 0)
        const newContent = content.slice(0, start) + content.slice(end)
        setContent(newContent)
      }
    }
  }, [content, initialContent])

  const updateEditCursors = useCallback((presenceData: any) => {
    if (presenceData.presence?.activity === 'editing' && presenceData.presence?.cursor) {
      const cursor: EditCursor = {
        userId: presenceData.userId,
        userName: presenceData.userName,
        position: presenceData.presence.cursor.position || 0,
        color: EDITOR_COLORS[Math.floor(Math.random() * EDITOR_COLORS.length)],
      }

      setEditCursors(prev => {
        const existing = prev.findIndex(c => c.userId === presenceData.userId)
        if (existing >= 0) {
          const updated = [...prev]
          updated[existing] = cursor
          return updated
        }
        return [...prev, cursor]
      })
    }
  }, [])

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value
    
    // Add to history if significant change
    if (Math.abs(newContent.length - content.length) > 5 || 
        newContent.split(' ').length !== content.split(' ').length) {
      setEditHistory(prev => [...prev.slice(0, historyIndex + 1), newContent])
      setHistoryIndex(prev => prev + 1)
    }
    
    setContent(newContent)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Handle shortcuts
    if ((e.metaKey || e.ctrlKey) && e.key === 's') {
      e.preventDefault()
      handleSave(content)
    } else if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
      e.preventDefault()
      undo()
    } else if ((e.metaKey || e.ctrlKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
      e.preventDefault()
      redo()
    }
  }

  const handleCursorMove = () => {
    const textarea = textareaRef.current
    if (textarea) {
      const position = textarea.selectionStart
      collaborationEngine.updatePresence(sessionId, currentUserId, {
        status: 'active',
        activity: 'editing',
        location: `${resourceType}/${resourceId}`,
        cursor: { position },
      })
    }
  }

  const handleSave = async (contentToSave: string, showToast = true) => {
    if (saving) return

    setSaving(true)
    try {
      if (onSave) {
        await onSave(contentToSave)
      }
      
      setLastSaved(new Date())
      
      if (showToast) {
        toast({
          title: 'Saved',
          description: 'Your changes have been saved successfully.',
        })
      }
    } catch (error) {
      console.error('Failed to save:', error)
      toast({
        title: 'Save failed',
        description: 'Unable to save your changes. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const lockForEditing = async () => {
    try {
      await collaborationEngine.lockForEdit(sessionId, resourceId, fieldName, currentUserId)
      toast({
        title: 'Editor locked',
        description: 'You now have exclusive editing rights.',
      })
    } catch (error) {
      console.error('Failed to lock editor:', error)
      toast({
        title: 'Lock failed',
        description: 'Unable to lock the editor.',
        variant: 'destructive',
      })
    }
  }

  const unlockEditor = async () => {
    try {
      await collaborationEngine.unlockEdit(sessionId, resourceId, fieldName)
      toast({
        title: 'Editor unlocked',
        description: 'Editor is now available for collaborative editing.',
      })
    } catch (error) {
      console.error('Failed to unlock editor:', error)
    }
  }

  const resolveConflict = (conflict: ConflictedEdit, accept: boolean) => {
    if (accept) {
      setContent(conflict.content)
      addToHistory(conflict.content)
    }
    setConflicts(prev => prev.filter(c => c.id !== conflict.id))
    
    if (conflicts.length <= 1) {
      setShowConflicts(false)
    }
  }

  const addToHistory = (newContent: string) => {
    setEditHistory(prev => [...prev.slice(0, historyIndex + 1), newContent])
    setHistoryIndex(prev => prev + 1)
  }

  const undo = () => {
    if (historyIndex > 0) {
      const previousContent = editHistory[historyIndex - 1]
      setContent(previousContent)
      setHistoryIndex(prev => prev - 1)
    }
  }

  const redo = () => {
    if (historyIndex < editHistory.length - 1) {
      const nextContent = editHistory[historyIndex + 1]
      setContent(nextContent)
      setHistoryIndex(prev => prev + 1)
    }
  }

  const canUndo = historyIndex > 0
  const canRedo = historyIndex < editHistory.length - 1
  const hasUnsavedChanges = content !== initialContent && (!lastSaved || new Date(lastSaved) < new Date())

  return (
    <TooltipProvider>
      <div className={cn('relative space-y-3', className)}>
        {/* Editor Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <Edit className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">{fieldName}</span>
            </div>
            
            {hasUnsavedChanges && (
              <Badge variant="outline" className="text-xs">
                <Type className="w-3 h-3 mr-1" />
                Unsaved
              </Badge>
            )}
            
            {isLocked && (
              <Badge variant="destructive" className="text-xs">
                <Lock className="w-3 h-3 mr-1" />
                Locked
              </Badge>
            )}
          </div>

          <div className="flex items-center space-x-1">
            {/* History Controls */}
            <div className="flex items-center border rounded">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    disabled={!canUndo}
                    onClick={undo}
                    className="h-7 px-2"
                  >
                    <Undo2 className="w-3 h-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Undo (Cmd+Z)</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    disabled={!canRedo}
                    onClick={redo}
                    className="h-7 px-2"
                  >
                    <Redo2 className="w-3 h-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Redo (Cmd+Y)</TooltipContent>
              </Tooltip>
            </div>

            {/* Lock Controls */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={isLocked ? unlockEditor : lockForEditing}
                  className="h-7 px-2"
                >
                  {isLocked ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isLocked ? 'Unlock for collaboration' : 'Lock for exclusive editing'}
              </TooltipContent>
            </Tooltip>

            {/* Save Button */}
            {onSave && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSave(content)}
                disabled={saving || !hasUnsavedChanges}
                className="h-7"
              >
                <Save className="w-3 h-3 mr-1" />
                {saving ? 'Saving...' : 'Save'}
              </Button>
            )}

            {/* Participants */}
            {showParticipants && activeEditors.length > 0 && (
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4 text-muted-foreground" />
                <div className="flex -space-x-1">
                  {activeEditors.slice(0, 3).map((editor, index) => (
                    <Avatar key={editor.userId} className="w-6 h-6 border-2 border-white">
                      <AvatarImage src={editor.avatar} />
                      <AvatarFallback 
                        className="text-xs"
                        style={{ backgroundColor: EDITOR_COLORS[index % EDITOR_COLORS.length] + '20' }}
                      >
                        {editor.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                {activeEditors.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{activeEditors.length - 3}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Conflicts Alert */}
        {showConflicts && conflicts.length > 0 && (
          <div className="rounded-md bg-yellow-50 border border-yellow-200 p-3">
            <div className="flex items-center">
              <AlertTriangle className="w-4 h-4 text-yellow-600 mr-2" />
              <h3 className="text-sm font-medium text-yellow-800">
                Editing Conflicts Detected
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowConflicts(false)}
                className="ml-auto h-6 px-2"
              >
                <EyeOff className="w-3 h-3" />
              </Button>
            </div>
            <div className="mt-2 space-y-2">
              {conflicts.map((conflict) => (
                <div key={conflict.id} className="flex items-center justify-between bg-white rounded p-2">
                  <div>
                    <p className="text-xs text-gray-600">
                      Changes by <strong>{conflict.userName}</strong>
                    </p>
                    <p className="text-xs text-gray-500 mt-1 truncate max-w-xs">
                      "{conflict.content.substring(0, 50)}..."
                    </p>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      onClick={() => resolveConflict(conflict, true)}
                      className="h-6 px-2 text-xs"
                    >
                      Accept
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => resolveConflict(conflict, false)}
                      className="h-6 px-2 text-xs"
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Editor */}
        <div className="relative">
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={handleContentChange}
            onKeyDown={handleKeyDown}
            onBlur={handleCursorMove}
            onSelect={handleCursorMove}
            placeholder={placeholder}
            disabled={readOnly || isLocked}
            className={cn(
              'min-h-[120px] resize-none',
              isLocked && 'opacity-50 cursor-not-allowed'
            )}
          />
          
          {/* Edit Cursors */}
          {editCursors.map((cursor) => (
            <div
              key={cursor.userId}
              className="absolute pointer-events-none"
              style={{
                left: `${cursor.position * 0.6}ch`, // Approximate character width
                top: '8px',
                borderLeft: `2px solid ${cursor.color}`,
                height: '20px',
              }}
            >
              <div
                className="absolute -top-6 -left-1 px-1 py-0.5 rounded text-xs text-white font-medium whitespace-nowrap"
                style={{ backgroundColor: cursor.color }}
              >
                {cursor.userName}
              </div>
            </div>
          ))}
        </div>

        {/* Status */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center space-x-4">
            {lastSaved && (
              <span>
                Last saved {formatDistanceToNow(lastSaved, { addSuffix: true })}
              </span>
            )}
            {autoSave && hasUnsavedChanges && (
              <span>Auto-saving...</span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <span>{content.length} characters</span>
            <span>•</span>
            <span>{content.split(/\s+/).filter(Boolean).length} words</span>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}