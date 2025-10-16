export { CollaborationWrapper } from './CollaborationWrapper'
export { CommentsPanel } from './CommentsPanel'
export { PresenceIndicators, useCursorTracking } from './PresenceIndicators'
export { NotificationsPanel } from './NotificationsPanel'
export { ActivityFeed } from './ActivityFeed'
export { LiveEditor } from './LiveEditor'

// Re-export types from the collaboration engine for convenience
export type {
  Comment,
  CommentReaction,
  Notification,
  ActivityFeedItem,
  SessionParticipant,
  PresenceInfo,
  LiveEdit,
  CollaborationSession,
} from '@/lib/collaboration/collaboration-engine'
