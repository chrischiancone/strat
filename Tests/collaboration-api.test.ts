/**
 * Collaboration API Tests
 * 
 * These are example tests to verify the collaboration API endpoints work correctly.
 * Run with: npm test or use these examples for manual testing.
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'

// Mock setup - replace with your actual test setup
const API_BASE = 'http://localhost:3000/api/collaboration'
const TEST_TOKEN = 'your-test-jwt-token' // Replace with valid test token
const TEST_USER_ID = 'test-user-id'
const TEST_RESOURCE_ID = 'test-plan-id'

const headers = {
  'Authorization': `Bearer ${TEST_TOKEN}`,
  'Content-Type': 'application/json'
}

describe('Collaboration API', () => {
  let testCommentId: string
  let testSessionId: string
  let testNotificationId: string

  // Helper function for API calls
  async function apiCall(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers,
      ...options
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(`API Error ${response.status}: ${data.error || 'Unknown error'}`)
    }
    
    return { response, data }
  }

  describe('Comments API', () => {
    it('should create a new comment', async () => {
      const { data } = await apiCall('/comments', {
        method: 'POST',
        body: JSON.stringify({
          resourceId: TEST_RESOURCE_ID,
          resourceType: 'plan',
          content: 'This is a test comment',
          mentions: []
        })
      })

      expect(data.comment).toBeDefined()
      expect(data.comment.content).toBe('This is a test comment')
      expect(data.comment.resourceId).toBe(TEST_RESOURCE_ID)
      
      testCommentId = data.comment.id
    })

    it('should retrieve comments for a resource', async () => {
      const { data } = await apiCall(`/comments?resourceId=${TEST_RESOURCE_ID}&resourceType=plan`)

      expect(data.comments).toBeDefined()
      expect(Array.isArray(data.comments)).toBe(true)
      
      if (data.comments.length > 0) {
        const comment = data.comments[0]
        expect(comment.id).toBeDefined()
        expect(comment.content).toBeDefined()
        expect(comment.authorName).toBeDefined()
      }
    })

    it('should update a comment', async () => {
      if (!testCommentId) {
        throw new Error('No test comment ID available')
      }

      const { data } = await apiCall(`/comments/${testCommentId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          content: 'Updated test comment'
        })
      })

      expect(data.comment.content).toBe('Updated test comment')
    })

    it('should delete a comment', async () => {
      if (!testCommentId) {
        throw new Error('No test comment ID available')
      }

      const { data } = await apiCall(`/comments/${testCommentId}`, {
        method: 'DELETE'
      })

      expect(data.success).toBe(true)
    })
  })

  describe('Sessions API', () => {
    it('should create a collaboration session', async () => {
      const { data } = await apiCall('/sessions', {
        method: 'POST',
        body: JSON.stringify({
          action: 'create',
          resourceId: TEST_RESOURCE_ID,
          resourceType: 'plan'
        })
      })

      expect(data.sessionId).toBeDefined()
      expect(data.success).toBe(true)
      
      testSessionId = data.sessionId
    })

    it('should join a collaboration session', async () => {
      if (!testSessionId) {
        throw new Error('No test session ID available')
      }

      const { data } = await apiCall('/sessions', {
        method: 'POST',
        body: JSON.stringify({
          action: 'join',
          sessionId: testSessionId
        })
      })

      expect(data.success).toBe(true)
      expect(data.participant).toBeDefined()
    })

    it('should get session participants', async () => {
      if (!testSessionId) {
        throw new Error('No test session ID available')
      }

      const { data } = await apiCall(`/sessions?sessionId=${testSessionId}`)

      expect(data.participants).toBeDefined()
      expect(Array.isArray(data.participants)).toBe(true)
      expect(data.participantCount).toBeGreaterThan(0)
    })

    it('should update user presence', async () => {
      if (!testSessionId) {
        throw new Error('No test session ID available')
      }

      const { data } = await apiCall('/sessions', {
        method: 'POST',
        body: JSON.stringify({
          action: 'updatePresence',
          sessionId: testSessionId,
          presence: {
            status: 'active',
            activity: 'editing',
            location: '/plans/test',
            cursor: { x: 100, y: 200 }
          }
        })
      })

      expect(data.success).toBe(true)
    })
  })

  describe('Notifications API', () => {
    it('should get user notifications', async () => {
      const { data } = await apiCall('/notifications')

      expect(data.notifications).toBeDefined()
      expect(Array.isArray(data.notifications)).toBe(true)
      expect(data.stats).toBeDefined()
      
      if (data.notifications.length > 0) {
        testNotificationId = data.notifications[0].id
      }
    })

    it('should mark notification as read', async () => {
      if (!testNotificationId) {
        console.log('No test notification available, skipping test')
        return
      }

      const { data } = await apiCall(`/notifications/${testNotificationId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          read: true
        })
      })

      expect(data.success).toBe(true)
    })
  })

  describe('Activity Feed API', () => {
    it('should get activity feed', async () => {
      const { data } = await apiCall(`/activity?resourceId=${TEST_RESOURCE_ID}&resourceType=plan`)

      expect(data.activities).toBeDefined()
      expect(Array.isArray(data.activities)).toBe(true)
      expect(data.stats).toBeDefined()
    })

    it('should create activity entry', async () => {
      const { data } = await apiCall('/activity', {
        method: 'POST',
        body: JSON.stringify({
          resourceId: TEST_RESOURCE_ID,
          resourceType: 'plan',
          action: 'test_action',
          description: 'Test activity entry'
        })
      })

      expect(data.success).toBe(true)
      expect(data.activity).toBeDefined()
      expect(data.activity.action).toBe('test_action')
    })

    it('should get activity analytics', async () => {
      const { data } = await apiCall('/activity', {
        method: 'PUT',
        body: JSON.stringify({
          operation: 'analytics',
          resourceId: TEST_RESOURCE_ID,
          resourceType: 'plan',
          days: 7
        })
      })

      expect(data.analytics).toBeDefined()
      expect(data.analytics.totalActivities).toBeDefined()
      expect(data.analytics.uniqueUsers).toBeDefined()
    })
  })

  // Cleanup
  afterAll(async () => {
    // Clean up test session
    if (testSessionId) {
      try {
        await apiCall(`/sessions?sessionId=${testSessionId}`, {
          method: 'DELETE'
        })
      } catch (error) {
        console.log('Error cleaning up test session:', error)
      }
    }
  })
})

/**
 * Manual Testing Examples
 * 
 * Use these curl commands to test the API manually:
 */

const manualTestExamples = {
  // Get comments
  getComments: `curl -X GET "${API_BASE}/comments?resourceId=${TEST_RESOURCE_ID}&resourceType=plan" \\
  -H "Authorization: Bearer ${TEST_TOKEN}"`,

  // Create comment
  createComment: `curl -X POST "${API_BASE}/comments" \\
  -H "Authorization: Bearer ${TEST_TOKEN}" \\
  -H "Content-Type: application/json" \\
  -d '{"resourceId":"${TEST_RESOURCE_ID}","resourceType":"plan","content":"Test comment"}'`,

  // Get notifications
  getNotifications: `curl -X GET "${API_BASE}/notifications" \\
  -H "Authorization: Bearer ${TEST_TOKEN}"`,

  // Create session
  createSession: `curl -X POST "${API_BASE}/sessions" \\
  -H "Authorization: Bearer ${TEST_TOKEN}" \\
  -H "Content-Type: application/json" \\
  -d '{"action":"create","resourceId":"${TEST_RESOURCE_ID}","resourceType":"plan"}'`,

  // Get activity
  getActivity: `curl -X GET "${API_BASE}/activity?resourceId=${TEST_RESOURCE_ID}&resourceType=plan" \\
  -H "Authorization: Bearer ${TEST_TOKEN}"`
}

export { manualTestExamples }