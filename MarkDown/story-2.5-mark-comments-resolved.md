# Story 2.5: Mark Comments Resolved

**Story ID:** STORY-2.5
**Epic:** Epic 2 - City Manager Reviews Plans
**Status:** ✅ Completed
**Priority:** P1 (Medium)
**Story Points:** 5
**Completed:** January 2025

---

## User Story

**As a** Department Director
**I want to** mark comments as resolved
**So that** I can indicate I've addressed the feedback

---

## Acceptance Criteria

- [x] User can click "Resolve" button on comments they created or own the entity
- [x] Resolved comments show checkmark icon and "Resolved" badge
- [x] Resolved comments collapse by default (can expand to view)
- [x] Unresolved comment count displays on plans/initiatives
- [x] City Manager can see which comments are resolved vs. open

---

## Implementation Details

### Files Modified:

1. **`/app/actions/comments.ts`** - Added resolution functions
   - `resolveComment()` - Marks comment as resolved
   - `unresolveComment()` - Reopens resolved comment
   - `getUnresolvedCommentCount()` - Counts open comments per entity

2. **`/components/comments/CommentItem.tsx`** - Added Resolve button
   - "Resolve" button for entity owners and comment authors
   - Visual indicator for resolved status (checkmark + badge)
   - Option to unresolve if needed

3. **`/components/comments/CommentsList.tsx`** - Collapse resolved
   - Resolved comments collapsed by default
   - "Show resolved comments" toggle
   - Count of resolved vs. unresolved

4. **Plan/Initiative components** - Added comment count badges
   - Unresolved comment count displayed
   - Red badge when comments need attention
   - Clicking badge scrolls to comments section

### Resolution Logic:

**Who can resolve:**
- Comment author (person who wrote it)
- Entity owner (plan/initiative creator)
- City Manager (on any comment)
- Admin (on any comment)

**Resolution applies to:**
- Single comment (not entire thread)
- Child comments inherit parent resolution state (optional)

### Visual Design:

**Unresolved Comment:**
```
┌─ John Doe - 2 hours ago
│  "Please clarify the budget for Year 2"
│  [Reply] [Resolve] [Edit] [Delete]
```

**Resolved Comment (collapsed):**
```
┌─ ✓ John Doe - 2 hours ago [Resolved]
│  "Please clarify the budget..." [Expand]
```

**Resolved Comment (expanded):**
```
┌─ ✓ John Doe - 2 hours ago [Resolved]
│  "Please clarify the budget for Year 2"
│  [Reply] [Unresolve] [Edit] [Delete]
│
│  └─ Jane Smith - 1 hour ago
│     "Updated the budget breakdown"
```

**Comment Count Badge:**
```
Initiative Title                    💬 3
                                    ^unresolved
```

---

## Testing Notes

**Test Scenarios:**
1. ✅ Department Director can resolve comment on their plan
2. ✅ City Manager can resolve any comment
3. ✅ Resolved comment shows checkmark and badge
4. ✅ Resolved comments collapse by default
5. ✅ User can expand resolved comment to view
6. ✅ User can unresolve a resolved comment
7. ✅ Unresolved count updates correctly
8. ✅ Comment count badge displays on entity
9. ✅ Non-owners cannot resolve others' comments

**Edge Cases:**
- Resolving parent comment doesn't auto-resolve replies
- Deleting resolved comment updates count
- Zero unresolved comments hides badge

---

## Related Stories

- Story 2.3: Add Comments (foundation)
- Story 2.4: Reply to Comments (threading)

---

## Technical Decisions

**Resolution Scope: Per comment (not thread)**
- Reason: Allows granular tracking of which issues addressed
- Alternative: Resolve entire thread (rejected: loses granularity)

**Default State: Collapsed when resolved**
- Reason: Reduces visual clutter, focuses on open issues
- Users can still expand to view resolved discussion

**Who can resolve: Entity owners + comment authors**
- Reason: Owner knows when feedback addressed, author knows when question answered
- City Manager override: Can resolve any comment (quality control)

**Database: Boolean flag**
- `is_resolved` column on `comments` table
- Simple, fast to query
- Alternative: Separate `comment_resolutions` table (rejected: overcomplicated)

---

## Notes

- Resolution workflow helps track feedback lifecycle
- Critical for City Manager to see which issues are still open
- Prevents "comment clutter" as discussions grow
- Unresolved count acts as todo list for Department Directors
- Future enhancements:
  - Auto-resolve when certain actions taken (e.g., budget updated)
  - Resolution reason/note
  - Re-open resolved comments if issue resurfaces
  - Resolution statistics in reporting
  - Filter entities by "has unresolved comments"
