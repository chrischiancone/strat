# Story 2.6: Approve/Reject Plans

**Story ID:** STORY-2.6
**Epic:** Epic 2 - City Manager Reviews Plans
**Status:** ✅ Completed
**Priority:** P0 (High - MVP)
**Story Points:** 8
**Completed:** January 2025

---

## User Story

**As a** City Manager
**I want to** approve or request revisions on department strategic plans
**So that** I can ensure all plans meet quality standards before final approval

---

## Acceptance Criteria

- [x] City Manager can view plan with "Approve" and "Request Revisions" action buttons
- [x] When approving: System marks plan status as "approved", records approval timestamp and user
- [x] When requesting revisions: System prompts for revision notes, marks plan as "revision_requested"
- [x] Department Director is notified when plan status changes (via status display)
- [x] Approval history is tracked and viewable (audit logs)
- [x] Plan status badge updates to reflect current state
- [x] Only City Manager and Admin roles can approve plans
- [x] Department Director can resubmit after addressing revisions

---

## Implementation Details

### Files Created/Modified:

1. **`/app/actions/plan-approval.ts`** - Server actions for plan approval workflow
   - `updatePlanStatus()` - Updates plan status with validation
   - `getApprovalHistory()` - Fetches approval history from audit logs
   - `approvePlan()` - Marks plan as approved
   - `requestRevisions()` - Requests revisions with notes
   - `submitPlanForReview()` - Department submits for review
   - `publishPlan()` - Publishes approved plan

2. **`/components/plans/PlanApprovalActions.tsx`** - Approval action buttons component
   - Context-aware buttons based on user role and plan status
   - Dialogs for approval notes and revision feedback
   - Loading states and error handling

3. **`/components/plans/ApprovalHistory.tsx`** - Timeline view of approval history
   - Displays audit log entries for plan status changes
   - Shows timestamps, users, and notes
   - Color-coded badges for different status types

### Key Features:

- **Status Validation:** Enforces valid status transitions (e.g., can't approve a draft)
- **Audit Trail:** All approval actions logged to `audit_logs` table
- **Role-Based Access:** Only authorized users can perform approval actions
- **Revision Feedback:** City Manager can provide detailed feedback for improvements
- **Resubmission Flow:** Department can address feedback and resubmit

### Database Updates:

- Uses existing `strategic_plans` columns: `status`, `approved_by`, `approved_at`
- Leverages `audit_logs` table for approval history tracking

---

## Testing Notes

**Test Scenarios:**
1. ✅ City Manager can approve a submitted plan
2. ✅ City Manager can request revisions with notes
3. ✅ Department Director can resubmit after revisions
4. ✅ Approval history displays correctly
5. ✅ Non-authorized users cannot see approval buttons
6. ✅ Status badges update correctly after actions

---

## Related Stories

- Story 2.3: Comment on Plans (related - feedback mechanism)
- Story 2.5: View Plan Detail (prerequisite - where approval buttons appear)

---

## Notes

- Approval workflow is critical for quality control
- Audit trail ensures accountability and transparency
- Future enhancement: Email notifications when status changes
