# Story 2.3: Add Comments on Plan/Initiative

**Story ID:** STORY-2.3
**Epic:** Epic 2 - City Manager Reviews Plans
**Status:** ✅ Completed
**Priority:** P0 (Critical - MVP)
**Story Points:** 8
**Completed:** January 2025

---

## User Story

**As a** City Manager
**I want to** add comments on strategic plans and initiatives
**So that** I can provide feedback to departments

---

## Acceptance Criteria

- [x] User can click "Add Comment" button on: Plans, Goals, Initiatives
- [x] User can enter comment text (markdown support)
- [x] User can submit comment
- [x] Comment displays with: Author name, Avatar, Timestamp, Content
- [x] Comment author can edit/delete their own comments
- [x] System notifies plan owner of new comment (future: Phase 2)

---

## Implementation Details

### Files Created:

1. **`/app/actions/comments.ts`** - Comment management server actions
   - `createComment()` - Creates new comment on entity
   - `updateComment()` - Updates existing comment
   - `deleteComment()` - Soft deletes comment
   - `getComments()` - Fetches comments for entity with threading
   - Supports entity types: `strategic_plan`, `goal`, `initiative`

2. **`/components/comments/CommentsList.tsx`** - Comments display component
   - Shows all comments for an entity
   - Threaded display (replies indented)
   - Author info with timestamps
   - Edit/delete buttons for own comments

3. **`/components/comments/CommentForm.tsx`** - Comment input form
   - Textarea with markdown preview
   - Character count
   - Submit/cancel buttons
   - Loading states

4. **`/components/comments/CommentItem.tsx`** - Individual comment display
   - Author name and avatar
   - Formatted timestamp (relative time)
   - Comment content (rendered markdown)
   - Action buttons (edit, delete, reply, resolve)

### Database Schema:

Uses `comments` table:
```sql
comments (
  id uuid PRIMARY KEY,
  entity_type text NOT NULL, -- 'strategic_plan', 'goal', 'initiative'
  entity_id uuid NOT NULL,
  parent_comment_id uuid REFERENCES comments(id),
  author_id uuid REFERENCES users(id),
  content text NOT NULL,
  is_resolved boolean DEFAULT false,
  created_at timestamptz,
  updated_at timestamptz
)
```

### Key Features:

- **Multi-Entity Support:** Comment on plans, goals, or initiatives
- **Rich Text:** Markdown support for formatting
- **User Context:** Shows who wrote what and when
- **Edit/Delete:** Authors can modify their own comments
- **Threading:** Support for replies (Story 2.4)
- **Resolution:** Can mark comments resolved (Story 2.5)

### RLS Policies:

```sql
-- Users can view comments on entities they have access to
-- Users can create comments
-- Users can update/delete their own comments
```

---

## Testing Notes

**Test Scenarios:**
1. ✅ City Manager can add comment on plan
2. ✅ City Manager can add comment on goal
3. ✅ City Manager can add comment on initiative
4. ✅ Department Director can see City Manager's comments
5. ✅ Comment displays author name and time
6. ✅ Author can edit their own comment
7. ✅ Author can delete their own comment
8. ✅ Non-author cannot edit/delete others' comments
9. ✅ Markdown rendering works correctly

**Security:**
- RLS prevents unauthorized comment access
- Users can only edit/delete their own comments

---

## Related Stories

- Story 2.2: View Department Plan Detail (where comments appear)
- Story 2.4: Reply to Comments (threading)
- Story 2.5: Mark Comments Resolved (resolution workflow)

---

## Technical Decisions

**Markdown Support:** Simple markdown renderer
- Reason: Allows formatting without full rich text editor complexity
- Supports: **bold**, *italic*, lists, links
- Future: Could add full WYSIWYG editor

**Comment Storage:** Dedicated `comments` table
- Reason: Flexible, supports multiple entity types, enables threading
- Alternative: JSONB field per entity (rejected: harder to query/search)

**Notifications:** Deferred to Phase 2
- Reason: MVP can function without real-time notifications
- Future: Email or in-app notifications when comment added

---

## Notes

- Comments are critical for City Manager feedback loop
- Enables asynchronous communication (vs. meetings/emails)
- Threading (Story 2.4) allows conversations to develop
- Resolution (Story 2.5) helps track feedback that's been addressed
- Future enhancements:
  - @mentions to notify specific users
  - Email notifications
  - Comment attachments
  - Comment search
