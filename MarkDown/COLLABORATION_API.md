# Collaboration API Documentation

## Overview

The Collaboration API provides real-time collaborative features for the Strategic Planning platform, including comments, notifications, activity feeds, and session management.

## Authentication

All collaboration API endpoints require authentication via Bearer token in the Authorization header:

```
Authorization: Bearer <your-supabase-jwt-token>
```

The middleware automatically validates tokens and adds user context to requests.

## Base URL

```
/api/collaboration/
```

## Endpoints

### 1. Comments API

#### GET /api/collaboration/comments

Retrieve comments for a specific resource.

**Query Parameters:**
- `resourceId` (required): ID of the resource
- `resourceType` (required): Type of resource ('plan', 'goal', 'initiative', 'dashboard')

**Response:**
```json
{
  "comments": [
    {
      "id": "uuid",
      "resourceId": "uuid", 
      "resourceType": "plan",
      "parentId": null,
      "authorId": "uuid",
      "authorName": "John Doe",
      "authorAvatar": "https://...",
      "content": "This is a comment",
      "mentions": ["user123"],
      "reactions": [
        {
          "emoji": "👍",
          "userId": "uuid",
          "userName": "Jane Smith",
          "createdAt": "2025-01-13T12:00:00Z"
        }
      ],
      "resolved": false,
      "createdAt": "2025-01-13T12:00:00Z",
      "updatedAt": "2025-01-13T12:00:00Z",
      "replies": []
    }
  ]
}
```

#### POST /api/collaboration/comments

Create a new comment.

**Request Body:**
```json
{
  "resourceId": "uuid",
  "resourceType": "plan", 
  "parentId": "uuid", // optional, for replies
  "content": "This is my comment",
  "mentions": ["user123"] // optional
}
```

**Response:**
```json
{
  "comment": {
    // Same structure as GET response
  }
}
```

#### PATCH /api/collaboration/comments/:id

Update an existing comment.

**Request Body:**
```json
{
  "content": "Updated content", // optional
  "reactions": [...], // optional
  "resolved": true, // optional
  "resolvedBy": "uuid", // optional
  "resolvedAt": "2025-01-13T12:00:00Z" // optional
}
```

#### DELETE /api/collaboration/comments/:id

Delete a comment (author or admin only).

---

### 2. Notifications API

#### GET /api/collaboration/notifications

Get user notifications.

**Query Parameters:**
- `limit` (optional): Number of notifications to return (default: 50)
- `unreadOnly` (optional): Return only unread notifications (default: false)
- `type` (optional): Filter by notification type
- `priority` (optional): Filter by priority level

**Response:**
```json
{
  "notifications": [
    {
      "id": "uuid",
      "userId": "uuid",
      "type": "mention",
      "title": "You were mentioned",
      "message": "John mentioned you in a comment",
      "resourceType": "plan",
      "resourceId": "uuid", 
      "actionUrl": "/plans/uuid",
      "priority": "high",
      "actors": [
        {
          "id": "uuid",
          "name": "John Doe",
          "avatar": "https://..."
        }
      ],
      "read": false,
      "createdAt": "2025-01-13T12:00:00Z"
    }
  ],
  "stats": {
    "total": 25,
    "unread": 5,
    "byType": {
      "mention": 3,
      "comment": 15,
      "activity": 7
    },
    "byPriority": {
      "high": 2,
      "medium": 18,
      "low": 5
    }
  }
}
```

#### PATCH /api/collaboration/notifications/:id

Mark notification as read/unread.

**Request Body:**
```json
{
  "read": true // or false
}
```

#### DELETE /api/collaboration/notifications/:id

Delete a notification.

#### POST /api/collaboration/notifications/bulk

Bulk operations on notifications.

**Request Body:**
```json
{
  "action": "markAllRead", // or "markAllUnread", "deleteAll"
  "notificationIds": ["uuid1", "uuid2"]
}
```

---

### 3. Activity Feed API

#### GET /api/collaboration/activity

Get activity feed.

**Query Parameters:**
- `sessionId` (optional): Filter by collaboration session
- `resourceId` (optional): Filter by resource ID
- `resourceType` (optional): Filter by resource type  
- `userId` (optional): Filter by user ID
- `limit` (optional): Number of activities (default: 100)
- `includeSystem` (optional): Include system activities (default: true)

**Response:**
```json
{
  "activities": [
    {
      "id": "uuid",
      "sessionId": "uuid",
      "resourceId": "uuid", 
      "resourceType": "plan",
      "userId": "uuid",
      "actorName": "John Doe",
      "actorAvatar": "https://...",
      "action": "comment_added",
      "description": "John added a comment",
      "metadata": {
        "commentId": "uuid",
        "isReply": false
      },
      "timestamp": "2025-01-13T12:00:00Z"
    }
  ],
  "grouped": {
    "2025-01-13": [...],
    "2025-01-12": [...]
  },
  "recent": [...], // Last 24 hours
  "stats": {
    "total": 50,
    "byAction": {
      "comment_added": 15,
      "edit": 10,
      "user_joined": 5
    },
    "byUser": {
      "John Doe": 20,
      "Jane Smith": 15
    }
  }
}
```

#### POST /api/collaboration/activity

Create a new activity entry.

**Request Body:**
```json
{
  "sessionId": "uuid", // optional
  "resourceId": "uuid", // optional
  "resourceType": "plan", // optional
  "action": "custom_action",
  "description": "User performed an action",
  "metadata": {} // optional
}
```

#### PUT /api/collaboration/activity

Get activity analytics.

**Request Body:**
```json
{
  "operation": "analytics",
  "resourceId": "uuid", // optional
  "resourceType": "plan", // optional
  "days": 7 // optional, default: 7
}
```

**Response:**
```json
{
  "analytics": {
    "totalActivities": 150,
    "uniqueUsers": 8,
    "dailyBreakdown": {
      "2025-01-13": 25,
      "2025-01-12": 30
    },
    "actionBreakdown": {
      "comment_added": 45,
      "edit": 30,
      "user_joined": 15
    },
    "topUsers": [
      {
        "name": "John Doe", 
        "count": 25
      }
    ]
  }
}
```

---

### 4. Session Management API

#### GET /api/collaboration/sessions

Get collaboration sessions.

**Query Parameters:**
- `sessionId` (optional): Get specific session info
- `resourceId` + `resourceType` (optional): Get/create session for resource

**Response (specific session):**
```json
{
  "sessionId": "uuid",
  "participants": [
    {
      "userId": "uuid",
      "name": "John Doe",
      "avatar": "https://...",
      "role": "editor",
      "joinedAt": "2025-01-13T12:00:00Z",
      "presence": {
        "status": "active",
        "activity": "editing",
        "location": "/plans/uuid",
        "cursor": {
          "x": 100,
          "y": 200
        }
      }
    }
  ],
  "participantCount": 3,
  "isActive": true
}
```

**Response (user sessions):**
```json
{
  "sessions": [
    {
      "id": "uuid",
      "resourceId": "uuid",
      "resourceType": "plan", 
      "active": true,
      "createdAt": "2025-01-13T12:00:00Z",
      "participants": [...]
    }
  ],
  "count": 2
}
```

#### POST /api/collaboration/sessions

Perform session actions.

**Request Body:**
```json
{
  "action": "join", // or "leave", "create", "updatePresence", "broadcastEvent"
  "sessionId": "uuid",
  "resourceId": "uuid", // for create action
  "resourceType": "plan", // for create action
  "presence": { // for updatePresence action
    "status": "active",
    "activity": "editing",
    "location": "/plans/uuid",
    "cursor": {
      "x": 100,
      "y": 200
    }
  },
  "event": "liveEdit", // for broadcastEvent action
  "data": {} // event data
}
```

#### DELETE /api/collaboration/sessions

End a collaboration session.

**Query Parameters:**
- `sessionId` (required): Session to end

---

## Real-time Events

The collaboration system emits real-time events via WebSocket connections:

### Event Types

1. **comment** - New comment created/updated/deleted
2. **notification** - New notification for user
3. **activity** - New activity in session
4. **presenceUpdate** - User presence changed
5. **participantJoined** - User joined session
6. **participantLeft** - User left session  
7. **liveEdit** - Real-time editing changes
8. **cursorMove** - Cursor position updates

### Event Structure

```javascript
{
  type: 'comment',
  sessionId: 'uuid',
  resourceId: 'uuid', 
  resourceType: 'plan',
  userId: 'uuid',
  userName: 'John Doe',
  timestamp: '2025-01-13T12:00:00Z',
  data: {
    // Event-specific data
  }
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE", // optional
  "details": {} // optional additional details
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

## Rate Limits

- General endpoints: 100 requests per 15 minutes per IP
- Authentication endpoints: Enhanced rate limiting
- WebSocket connections: 10 connections per user

## Security

- All requests require valid JWT authentication
- Department-scoped access control via RLS
- Rate limiting and DDoS protection
- Input validation and sanitization
- CORS protection
- Security headers included

## Usage Examples

### JavaScript/TypeScript

```typescript
// Get comments
const response = await fetch('/api/collaboration/comments?resourceId=plan123&resourceType=plan', {
  headers: {
    'Authorization': `Bearer ${userToken}`,
    'Content-Type': 'application/json'
  }
});

// Create comment
const newComment = await fetch('/api/collaboration/comments', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${userToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    resourceId: 'plan123',
    resourceType: 'plan',
    content: 'This is my comment',
    mentions: ['user456']
  })
});

// Join collaboration session
const session = await fetch('/api/collaboration/sessions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${userToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    action: 'join',
    sessionId: 'session123'
  })
});
```

## Integration with React Components

The API is designed to work seamlessly with the provided React components:

- `CommentsPanel` → Comments API
- `NotificationsPanel` → Notifications API  
- `ActivityFeed` → Activity API
- `PresenceIndicators` → Sessions API
- `LiveEditor` → Sessions + Activity APIs
- `CollaborationWrapper` → All APIs

Each component handles API calls, error states, and real-time updates automatically.

## Database Schema Requirements

The API requires these database tables:

- `comments` - Comment storage
- `notifications` - User notifications
- `activity_log` - Activity tracking
- `collaboration_sessions` - Session management
- `collaboration_participants` - Session participants
- `users` - User information
- Related tables for strategic plans, goals, initiatives

See the database schema documentation for complete table structures and relationships.

## Deployment Notes

### Environment Variables Required

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### WebSocket Configuration

For real-time features, ensure WebSocket support is enabled in your deployment environment. The collaboration engine handles WebSocket connections automatically.

### Performance Considerations

- Enable database connection pooling
- Consider Redis for session storage in production
- Monitor API response times and optimize queries as needed
- Implement pagination for large datasets

This API provides a complete collaboration foundation for your strategic planning platform with real-time features, comprehensive security, and seamless integration with the provided React components.