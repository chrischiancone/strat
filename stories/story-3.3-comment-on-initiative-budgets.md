# Story 3.3: Comment on Initiative Budgets

**Story ID:** STORY-3.3
**Epic:** Epic 3 - Finance Validates Budgets
**Status:** ✅ Completed
**Priority:** P0 (High - MVP)
**Story Points:** 3
**Completed:** January 2025

---

## User Story

**As a** Finance Director
**I want to** add comments on initiative budgets
**So that** I can provide feedback on cost estimates or funding sources

---

## Acceptance Criteria

- [x] User can add comment on initiative budget (same comment system as Epic 2)
- [x] Comment appears in initiative detail view
- [x] Department is notified of comment (future: Phase 2)
- [x] User can mark budget comment resolved
- [x] Unresolved budget comments count displays on initiative

---

## Implementation Details

### Files Modified:

1. **`/app/actions/comments.ts`** - Enhanced comment resolution permissions
   - Added support for 'initiative' entity type in `resolveComment()`
   - Finance role can now resolve comments on initiative budgets
   - Department members can resolve comments on their own initiatives
   - City Manager and Admin can resolve any comment
   - Plan creator (created_by) can resolve comments on their initiatives

2. **`/app/actions/initiative-detail.ts`** - Added plan creator to response
   - Updated `InitiativeDetailData` type to include `plan.created_by`
   - Added `created_by` to strategic plan query
   - Returns plan creator for proper comment ownership

3. **`/app/(dashboard)/plans/[id]/initiatives/[initiativeId]/page.tsx`** - Fixed comment ownership
   - Changed `entityOwnerId` from `userId` to `initiative.plan.created_by`
   - Ensures correct permission checks for comment resolution
   - CommentsSection now has proper entity owner reference

### Comment System Integration:

The initiative detail page already had the `CommentsSection` component integrated from Story 3.2. Story 3.3 focused on:

1. **Permission Enhancements** - Ensuring Finance can comment and resolve
2. **Entity Ownership** - Properly identifying who owns the initiative
3. **Resolution Logic** - Adding 'initiative' support to the resolution workflow

### Resolution Permissions for Initiatives:

```typescript
// In resolveComment() function
canResolve =
  comment.author_id === currentUser.id ||              // Comment author
  userProfile.role === 'city_manager' ||               // City Manager
  userProfile.role === 'admin' ||                      // Admin
  userProfile.role === 'finance' ||                    // Finance (new!)
  userProfile.department_id === plan.department_id ||  // Department member
  plan.created_by === currentUser.id                   // Plan creator
```

### Key Features:

✅ **Finance Can Comment:**
- Finance Director can add comments to any initiative budget
- Comments appear in initiative detail view
- Finance comments are visible to department staff

✅ **Finance Can Resolve:**
- Finance role has permission to mark comments as resolved
- Important for closing the feedback loop after budget corrections

✅ **Unresolved Count Display:**
- Badge shows count of unresolved comments
- Helps Finance track which initiatives still need attention
- Format: "N unresolved" badge in blue

✅ **Threaded Conversations:**
- Department staff can reply to Finance comments
- Max 3 levels of threading (from Epic 2)
- Supports ongoing budget discussions

✅ **Department Notification:**
- Marked as "future: Phase 2" in epic
- Email/in-app notifications will be added later
- Current workflow: Department sees comments when viewing initiative

---

## Testing Notes

**Test Scenarios:**
1. ✅ Finance can view initiative detail page
2. ✅ Finance can add comment on initiative budget
3. ✅ Comment appears immediately in comments section
4. ✅ Finance can mark their own comment as resolved
5. ✅ Finance can mark department comments as resolved
6. ✅ Department staff can see Finance comments
7. ✅ Department staff can reply to Finance comments
8. ✅ Department staff can resolve comments on their initiatives
9. ✅ Unresolved count displays correctly
10. ✅ Unresolved count updates when comment marked resolved
11. ✅ City Manager can resolve any comment
12. ✅ Admin can resolve any comment

**Permission Checks:**
- Finance can comment on initiatives from any department (✅)
- Finance cannot edit initiative budgets, only comment (✅)
- Department staff can only view initiatives from their department (✅)
- Non-authenticated users cannot access comments (✅)

**Edge Cases:**
- Initiative with no comments (shows "No comments yet" message)
- Multiple comments from Finance and Department (threads display correctly)
- Resolving comment with replies (parent can be resolved independently)
- Very long comments (text wraps correctly)

---

## Related Stories

- Story 3.1: View All Initiative Budgets Dashboard (entry point for Finance)
- Story 3.2: View Initiative Budget Detail (page where comments appear)
- Story 2.3: Add Comments on Plan/Initiative (underlying comment system)
- Story 2.5: Mark Comments Resolved (resolution workflow)

---

## Technical Decisions

**Reuse Epic 2 Comment System:**
- Decision: Use existing CommentsSection component with 'initiative' entity type
- Reason: Consistent UX, reduces code duplication, proven functionality
- Benefit: Comments work identically across plans, goals, and initiatives

**Finance Resolution Permission:**
- Decision: Finance role can resolve any initiative comment
- Reason: Finance is validating budgets and needs to close feedback loops
- Alternative: Finance can only comment, not resolve (rejected: slows workflow)

**Entity Ownership:**
- Decision: Plan creator (strategic_plans.created_by) is entity owner
- Reason: Initiatives inherit ownership from their parent plan
- Benefit: Department Director who created plan can manage all initiative comments

**Department-Level Access:**
- Decision: Any department member can resolve comments on their initiatives
- Reason: Collaborative budget development, multiple staff may address feedback
- Benefit: Faster response to Finance questions

**No Notifications (Phase 2):**
- Decision: Defer email/in-app notifications to Phase 2
- Reason: MVP focus on core functionality, notifications are enhancement
- Workaround: Department staff check initiatives regularly during budget cycle

---

## Security Considerations

**Access Control:**
- Comments use same RLS policies as strategic plans and initiatives
- Finance can view/comment on any initiative (municipality-scoped)
- Department staff can only view/comment on their own initiatives
- All comment actions validated at server action level

**Data Privacy:**
- Budget comments may contain sensitive financial discussions
- Only authorized roles (Finance, Department, City Manager, Admin) have access
- Comments tracked with author info (full_name, email) for accountability

**Permission Validation:**
- `resolveComment()` validates permissions before marking resolved
- Checks role, department, and entity ownership
- Prevents unauthorized users from resolving comments

---

## Notes

- This story completes the budget validation feedback mechanism
- Finance can now view budgets (Story 3.2) and provide feedback (Story 3.3)
- Department workflow: Create initiative → Finance comments → Department addresses → Finance resolves
- Comment resolution helps Finance track which budget questions are answered
- Future Phase 2: Email notifications when Finance comments on budget

**Typical Workflow:**
1. Finance reviews initiative budget on detail page
2. Finance adds comment: "Please clarify Year 2 equipment costs"
3. Department receives notification (Phase 2) or sees comment when viewing initiative
4. Department replies: "Updated breakdown: $50k for servers, $20k for laptops"
5. Finance reviews response
6. Finance marks comment as resolved
7. Initiative moves to "validated" status (Story 3.7 - optional)

**Future Enhancements:**
- Email notifications when Finance comments
- In-app notification badge count
- Filter initiatives by "has unresolved comments"
- Comment templates for common Finance questions
- Bulk comment actions (resolve multiple at once)
- Comment search/filtering
- Comment analytics (average resolution time, most common questions)

---

**Story Created:** January 2025
**Story Completed:** January 2025
