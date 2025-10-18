# Story 2.4: Reply to Comments (Threading)

**Story ID:** STORY-2.4
**Epic:** Epic 2 - City Manager Reviews Plans
**Status:** ✅ Completed
**Priority:** P0 (Critical - MVP)
**Story Points:** 5
**Completed:** January 2025

---

## User Story

**As a** City Manager or Department Director
**I want to** reply to comments
**So that** I can have a conversation about feedback

---

## Acceptance Criteria

- [x] User can click "Reply" on any comment
- [x] Reply appears indented under parent comment
- [x] Threading supports up to 3 levels
- [x] Reply notifications sent to parent comment author (future: Phase 2)

---

## Implementation Details

### Files Modified:

1. **`/app/actions/comments.ts`** - Extended for threading
   - `createComment()` accepts optional `parent_comment_id`
   - `getComments()` returns nested comment structure
   - Recursively builds comment tree up to 3 levels

2. **`/components/comments/CommentItem.tsx`** - Enhanced with Reply button
   - "Reply" button on each comment
   - Clicking shows inline reply form
   - Reply form includes reference to parent comment

3. **`/components/comments/CommentsList.tsx`** - Recursive rendering
   - Renders comments with indentation for replies
   - Visual threading indicators (connecting lines)
   - Limits depth to 3 levels (flatten deeper replies)

### Threading Logic:

```typescript
interface Comment {
  id: string
  content: string
  author: User
  parent_comment_id: string | null
  replies: Comment[]  // Nested comments
  depth: number        // 0 = top-level, 1-3 = replies
}
```

**Max Depth: 3 levels**
- Level 0: Top-level comment
- Level 1: Reply to top-level
- Level 2: Reply to reply
- Level 3: Reply to reply to reply
- Deeper replies are flattened to level 3

### Visual Design:

```
┌─ John Doe - 2 hours ago
│  "We should increase the budget for this initiative"
│  [Reply] [Edit] [Delete]
│
│  ├─ Jane Smith - 1 hour ago
│  │  "I agree, let's discuss at the next meeting"
│  │  [Reply] [Edit] [Delete]
│  │
│  │  └─ John Doe - 30 mins ago
│  │     "Sounds good, I'll prepare the analysis"
│  │     [Reply] [Edit] [Delete]
```

---

## Testing Notes

**Test Scenarios:**
1. ✅ User can reply to top-level comment
2. ✅ Reply appears indented under parent
3. ✅ User can reply to a reply (level 2)
4. ✅ User can reply to a reply to a reply (level 3)
5. ✅ Deeper replies are handled gracefully (flatten to level 3)
6. ✅ Threading visual indicators display correctly
7. ✅ Edit/delete works on threaded comments
8. ✅ Resolve works on entire thread (Story 2.5)

**Edge Cases:**
- Empty state when no replies
- Long reply chains don't break layout
- Deleted parent comment still shows replies

---

## Related Stories

- Story 2.3: Add Comments (foundation)
- Story 2.5: Mark Comments Resolved (applies to threads)

---

## Technical Decisions

**Max Depth: 3 levels**
- Reason: Balance between conversation depth and UI complexity
- Research: Most comment threads rarely go beyond 3 levels
- Alternative: Unlimited depth (rejected: layout issues, performance)

**Rendering: Recursive components**
- Reason: Clean, maintainable code for nested structure
- Performance: Acceptable for typical thread sizes (<100 comments)

**Storage: `parent_comment_id` foreign key**
- Reason: Simple, standard relational approach
- Query: Recursive CTE to fetch full tree
- Alternative: Materialized path (rejected: overkill for MVP)

---

## Notes

- Threading enables natural conversations between City Manager and Department Directors
- 3-level depth is sufficient for most feedback discussions
- Visual indentation makes thread structure clear
- Future enhancements:
  - Collapse/expand long threads
  - "Load more replies" for large threads
  - Notification when someone replies to your comment
  - Jump to specific comment via URL anchor
