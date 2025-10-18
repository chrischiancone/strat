# Strategic Planning System - Training & Onboarding Guide

**Version 1.0** | **Last Updated: January 2025**

---

## Table of Contents

1. [Overview](#overview)
2. [System Setup](#system-setup)
3. [User Onboarding Checklist](#user-onboarding-checklist)
4. [Role-Based Training Plans](#role-based-training-plans)
5. [Training Session Outlines](#training-session-outlines)
6. [Administrator Guide](#administrator-guide)
7. [Common Training Scenarios](#common-training-scenarios)
8. [Training Resources](#training-resources)

---

## Overview

### Purpose of This Guide

This guide is designed for:
- **System Administrators** preparing to launch the Strategic Planning System
- **Training Coordinators** onboarding new users
- **Department Directors** training their staff
- **Trainers** conducting user orientation sessions

### Training Philosophy

The Strategic Planning System is designed to be intuitive, but effective training ensures:
- Users understand their role and responsibilities
- Plans are created consistently across departments
- Budget data is accurate and validated
- The system is adopted successfully

### Training Approach

**Recommended Approach**: Role-based training with hands-on practice

- **Duration**: 2-4 hours per role (split into multiple sessions)
- **Format**: Combination of demonstration and hands-on exercises
- **Group Size**: 5-10 users per session for optimal interaction
- **Environment**: Use test/training environment if available

---

## System Setup

### Pre-Launch Checklist

Before training any users, ensure:

#### Technical Setup
- [ ] System deployed and accessible at production URL
- [ ] SSL certificate installed (HTTPS enabled)
- [ ] Email service configured and tested
- [ ] Database backed up
- [ ] Browser compatibility tested

#### Administrative Setup
- [ ] Municipality name and logo configured
- [ ] Branding/appearance settings applied
- [ ] At least one admin user created
- [ ] Fiscal years created (current + next 2-3 years)
- [ ] All departments created
- [ ] Email templates configured
- [ ] Notification settings configured

#### Test Data
- [ ] Test users created for each role
- [ ] Test strategic plan created
- [ ] Sample initiatives with budgets created
- [ ] Test approval workflow completed

---

## User Onboarding Checklist

### For Each New User

#### Step 1: Pre-Creation (Admin)
- [ ] Verify user's role and department
- [ ] Confirm email address is correct
- [ ] Check for existing account (avoid duplicates)

#### Step 2: Account Creation (Admin)
- [ ] Create user account: Admin → Users → Create New User
- [ ] Assign correct role
- [ ] Assign department (if applicable)
- [ ] Send invitation email

#### Step 3: First Login (User)
- [ ] User receives invitation email
- [ ] User clicks link and sets password
- [ ] User logs in successfully
- [ ] User completes profile (photo, contact info)

#### Step 4: Orientation (Trainer/Admin)
- [ ] Provide user with role-specific training materials
- [ ] Schedule or conduct training session
- [ ] Grant access to test/sandbox environment (if available)
- [ ] Assign mentor or point of contact for questions

#### Step 5: Verification (Admin)
- [ ] Verify user can log in
- [ ] Verify user can access appropriate features
- [ ] Verify user cannot access restricted features
- [ ] Check permissions are correct

---

## Role-Based Training Plans

### Department Director Training

**Duration**: 3-4 hours (two 2-hour sessions)

**Session 1: Strategic Plan Creation (2 hours)**

**Topics:**
1. System overview and navigation (15 min)
2. Creating a new strategic plan (15 min)
3. Editing plan metadata and department info (15 min)
4. Completing SWOT analysis (15 min)
5. Defining strategic goals (20 min)
6. Creating initiatives (40 min)

**Hands-On Exercise:**
- Create a test strategic plan
- Add 2 goals
- Create 1 initiative with budget

**Session 2: Budgets, KPIs, and Approval (2 hours)**

**Topics:**
1. Budget breakdown and funding sources (30 min)
2. ROI analysis (20 min)
3. Defining KPIs (20 min)
4. Inviting collaborators (10 min)
5. Department dashboard (15 min)
6. Submitting for review and approval workflow (15 min)
7. Q&A (10 min)

**Hands-On Exercise:**
- Complete budget for test initiative
- Add KPIs
- Review dashboard
- Submit plan for review

**Competency Checklist:**
After training, director should be able to:
- [ ] Create a new strategic plan
- [ ] Complete all required plan sections
- [ ] Add goals and initiatives
- [ ] Enter budget data accurately
- [ ] Define meaningful KPIs
- [ ] Invite staff as collaborators
- [ ] Submit plan for City Manager review
- [ ] Respond to feedback and comments
- [ ] View department dashboard

---

### Strategic Planner Training

**Duration**: 2-3 hours (single session)

**Topics:**
1. System overview and navigation (10 min)
2. Accessing assigned plans (10 min)
3. Editing plan sections (15 min)
4. Creating and editing initiatives (30 min)
5. Budget data entry (30 min)
6. Adding and updating KPIs (15 min)
7. Responding to comments (10 min)
8. Q&A (10 min)

**Hands-On Exercise:**
- Edit an existing test plan
- Add 2 initiatives with budgets
- Add 2 KPIs
- Post a comment response

**Competency Checklist:**
After training, planner should be able to:
- [ ] Access plans they're assigned to
- [ ] Edit plan sections (SWOT, environmental scan, etc.)
- [ ] Create and edit initiatives
- [ ] Enter accurate budget data
- [ ] Add and update KPIs
- [ ] Post comments and respond to feedback
- [ ] Understand validation rules
- [ ] Know when to escalate to Department Director

---

### City Manager Training

**Duration**: 2 hours (single session)

**Topics:**
1. System overview for City Manager role (15 min)
2. Viewing all department plans (15 min)
3. Reviewing plan sections (20 min)
4. Adding comments and providing feedback (15 min)
5. Approval workflow and requesting changes (15 min)
6. City-wide dashboards (20 min)
7. Generating City Council reports (15 min)
8. Q&A (5 min)

**Hands-On Exercise:**
- Review a test strategic plan
- Add comments to multiple sections
- Request changes on one plan
- Approve another plan
- Generate a test City Council report

**Competency Checklist:**
After training, City Manager should be able to:
- [ ] View all department strategic plans
- [ ] Navigate and review plan sections
- [ ] Add meaningful comments and feedback
- [ ] Request plan revisions when needed
- [ ] Approve plans that meet standards
- [ ] View and interpret city-wide dashboards
- [ ] Generate and download City Council reports
- [ ] Export data to Excel

---

### Finance Director Training

**Duration**: 2 hours (single session)

**Topics:**
1. Finance role overview (10 min)
2. Viewing all initiative budgets (15 min)
3. Budget validation process (20 min)
4. Funding source tracking (20 min)
5. Flagging budget issues (15 min)
6. Finance dashboard (20 min)
7. Grant tracking and reporting (15 min)
8. Q&A (5 min)

**Hands-On Exercise:**
- Review 3 test initiative budgets
- Validate one correct budget
- Flag issues on one problematic budget
- Add budget comments
- Review finance dashboard
- Export budget data to Excel

**Competency Checklist:**
After training, Finance Director should be able to:
- [ ] Access all initiative budgets across departments
- [ ] Validate budget math and categories
- [ ] Track funding sources and status
- [ ] Add budget comments
- [ ] Flag budget issues that need attention
- [ ] View finance dashboard
- [ ] Filter and analyze grant-funded initiatives
- [ ] Export budget data for detailed analysis

---

### Administrator Training

**Duration**: 4 hours (two 2-hour sessions)

**Session 1: User and Department Management (2 hours)**

**Topics:**
1. Admin role and responsibilities (15 min)
2. Creating and managing users (30 min)
3. Role assignment and permissions (20 min)
4. Department management (20 min)
5. Fiscal year configuration (20 min)
6. Q&A (15 min)

**Session 2: System Configuration and Maintenance (2 hours)**

**Topics:**
1. System settings and configuration (30 min)
2. Branding and appearance (15 min)
3. Notification settings (15 min)
4. Audit log review (20 min)
5. Backup and recovery (15 min)
6. Troubleshooting common issues (20 min)
7. Q&A (5 min)

**Competency Checklist:**
After training, administrator should be able to:
- [ ] Create and manage user accounts
- [ ] Assign roles and permissions correctly
- [ ] Create and edit departments
- [ ] Configure fiscal years
- [ ] Update system settings
- [ ] Customize branding
- [ ] Review audit logs
- [ ] Perform manual backups
- [ ] Troubleshoot common user issues
- [ ] Understand when to escalate technical issues

---

## Training Session Outlines

### Session: Creating Your First Strategic Plan

**Audience**: Department Directors
**Duration**: 90 minutes
**Format**: Instructor-led with hands-on practice

#### Outline

**Introduction (10 minutes)**
- Welcome and introductions
- Training objectives
- Overview of strategic planning process

**System Navigation (10 minutes)**
- Logging in
- Dashboard overview
- Navigation menu
- Accessing plans

**Creating a Plan (15 minutes)**
- Click-through demonstration
- Fiscal year selection
- Plan metadata
- Department pre-population

**Hands-On: Create Your Plan (10 minutes)**
- Participants create test plans
- Instructor circulates to assist
- Quick troubleshooting

**Completing Plan Sections (20 minutes)**
- Plan overview and executive summary
- SWOT analysis
- Environmental scan (overview)
- Benchmarking (overview)

**Hands-On: Complete Basic Sections (15 minutes)**
- Participants complete plan metadata and SWOT
- Peer review and feedback
- Q&A

**Wrap-Up (10 minutes)**
- Review key takeaways
- Preview of next session (goals and initiatives)
- Resources and support contacts
- Q&A

---

### Session: Budgets and Financial Analysis

**Audience**: Department Directors and Strategic Planners
**Duration**: 90 minutes
**Format**: Instructor-led with hands-on practice

#### Outline

**Review and Warm-Up (5 minutes)**
- Recap of previous session
- Questions from homework/practice

**Budget Categories Explained (15 minutes)**
- Personnel costs
- Equipment and technology
- Professional services
- Training and development
- Materials and supplies
- Other costs

**Budget Entry Demo (15 minutes)**
- Live demonstration of budget entry
- Multi-year budgeting
- Auto-calculation features
- Common mistakes to avoid

**Funding Sources (15 minutes)**
- Types of funding sources
- Funding status options
- Adding multiple sources
- Validation rules

**Hands-On: Enter Budget Data (20 minutes)**
- Participants enter budget for test initiative
- Add multiple funding sources
- Verify totals match
- Instructor assistance as needed

**ROI Analysis (10 minutes)**
- Financial ROI calculation
- Non-financial benefits
- ROI documentation best practices

**Hands-On: Complete ROI (10 minutes)**
- Participants complete ROI for test initiative

**Wrap-Up (10 minutes)**
- Key takeaways
- Common budget errors to avoid
- Resources for help
- Q&A

---

### Session: City Manager Review Workflow

**Audience**: City Manager, Assistant City Manager
**Duration**: 60 minutes
**Format**: Interactive demonstration and practice

#### Outline

**Introduction (5 minutes)**
- Role of City Manager in strategic planning
- Review and approval workflow overview

**Accessing Plans (10 minutes)**
- Viewing all department plans
- Filtering by status and department
- Understanding plan status workflow

**Reviewing a Plan (15 minutes)**
- Navigating plan sections
- Evaluating plan quality
- Checking for completeness
- Budget review considerations

**Adding Feedback (10 minutes)**
- Adding comments to sections
- Using @mentions
- Requesting specific changes
- Best practices for constructive feedback

**Approval Actions (10 minutes)**
- Approving a plan
- Requesting revisions
- Understanding impact of status changes

**Hands-On Practice (10 minutes)**
- Review and comment on test plan
- Practice approval workflow
- Q&A

---

## Administrator Guide

### Preparing for Training

#### 1-2 Weeks Before Training

**Technical Preparation:**
- [ ] Verify system is stable and accessible
- [ ] Create test user accounts for training
- [ ] Create sample strategic plans for demonstration
- [ ] Test email notifications
- [ ] Prepare training environment (if separate from production)

**Materials Preparation:**
- [ ] Print handouts (Quick Reference Guide)
- [ ] Prepare slide deck (if using)
- [ ] Create training checklist
- [ ] Prepare sign-in sheets
- [ ] Set up evaluation forms

**Logistics:**
- [ ] Reserve training room with:
  - [ ] Computers or laptops (one per participant)
  - [ ] Projector/screen for demonstrations
  - [ ] Reliable Wi-Fi
  - [ ] Power outlets
- [ ] Send calendar invites to participants
- [ ] Send pre-training email with:
  - [ ] Date, time, location
  - [ ] What to bring (laptop optional if computers provided)
  - [ ] Login credentials (if using test accounts)
  - [ ] Pre-reading materials (optional)

#### Day of Training

**Setup (30 minutes before):**
- [ ] Test projector and screen sharing
- [ ] Verify Wi-Fi connectivity
- [ ] Log into system on instructor computer
- [ ] Open sample plans for demonstration
- [ ] Distribute handouts
- [ ] Set up sign-in sheet

**During Training:**
- [ ] Start on time
- [ ] Allow time for hands-on practice
- [ ] Circulate during exercises
- [ ] Encourage questions
- [ ] Take notes on common issues

**After Training:**
- [ ] Collect evaluation forms
- [ ] Follow up via email with:
  - [ ] Training materials (digital)
  - [ ] Quick reference guide
  - [ ] Support contact information
  - [ ] Link to schedule follow-up training if needed

---

### Creating Training Content

#### Slide Deck Template

**Suggested Sections:**
1. Title slide with agenda
2. What is the Strategic Planning System?
3. Benefits and value proposition
4. Navigation overview (screenshots)
5. Role-specific features
6. Live demonstration
7. Hands-on exercise instructions
8. Key takeaways
9. Resources and support
10. Q&A

#### Video Tutorials

**Recommended Videos to Create:**
- Logging in and first-time setup (3 min)
- Creating a strategic plan (5 min)
- Adding goals and initiatives (5 min)
- Entering budget data (5 min)
- Submitting a plan for review (3 min)
- City Manager review workflow (5 min)
- Finance budget validation (5 min)
- Admin: Creating users and departments (5 min)

**Video Tools:**
- Loom (screen recording with narration)
- OBS Studio (free, open-source)
- QuickTime (macOS screen recording)

---

## Common Training Scenarios

### Scenario 1: New Department Using System for First Time

**Situation**: Police Department is creating their first strategic plan in the system.

**Training Approach:**
1. **Kickoff Meeting** (30 min)
   - Department Director and strategic planning team
   - Review strategic planning process
   - Set timeline and milestones
   - Assign roles (who will enter data)

2. **Full Training** (3 hours)
   - Department Director training
   - Strategic Planner training
   - Hands-on time with coaching

3. **Check-In Sessions** (weekly)
   - 30-minute check-ins to review progress
   - Answer questions
   - Troubleshoot issues

4. **Pre-Submission Review** (1 hour)
   - Review complete plan before submission
   - Check for errors and completeness
   - Final Q&A

**Success Factors:**
- Dedicated time commitment from department
- Early involvement of strategic planning staff
- Regular check-ins to prevent getting stuck
- Access to trainer/admin for questions

---

### Scenario 2: Finance Director Onboarding

**Situation**: New Finance Director needs to learn budget validation process.

**Training Approach:**
1. **Role Overview** (30 min)
   - Finance Director's role in strategic planning
   - Budget validation responsibilities
   - Integration with budget development process

2. **System Training** (90 min)
   - Accessing all initiative budgets
   - Budget validation process
   - Funding source tracking
   - Flagging issues and adding comments
   - Finance dashboard
   - Excel exports

3. **Shadowing** (1-2 hours)
   - Shadow outgoing Finance Director (if available)
   - Review real budget examples
   - Practice flagging common issues

4. **Independent Practice** (ongoing)
   - Review 3-5 initiative budgets independently
   - Trainer reviews feedback for quality

**Success Factors:**
- Understanding of municipal budgeting process
- Clear criteria for budget validation
- Examples of good vs. problematic budgets
- Ongoing support during first budget cycle

---

### Scenario 3: Annual Refresher Training

**Situation**: System has been in use for one year, new planning cycle starting.

**Training Approach:**
1. **What's New** (30 min)
   - New features added in past year
   - Process improvements
   - Lessons learned from previous cycle

2. **Best Practices Review** (30 min)
   - Examples of excellent plans from previous cycle
   - Common mistakes to avoid
   - Tips for efficiency

3. **Open Q&A and Troubleshooting** (30 min)
   - Answer questions from previous cycle
   - Address any pain points
   - Collect feedback for improvements

4. **Role-Specific Breakouts** (30 min)
   - Directors: Advanced features and tips
   - Planners: Efficiency techniques
   - Reviewers: Faster review workflows

**Success Factors:**
- Celebrate successes from previous cycle
- Address pain points openly
- Incorporate user feedback
- Focus on efficiency improvements

---

## Training Resources

### Documentation

**Required Reading:**
- User Guide (full version)
- Quick Reference Guide
- Role-specific sections of training guide

**Optional Reading:**
- Strategic planning best practices
- Budget development guidelines
- KPI framework documentation

### Hands-On Materials

**Test Scenarios:**

**Scenario A: Create Basic Plan**
- Department: Parks and Recreation
- Fiscal Years: FY2026-2028
- Create 2 goals:
  - Goal 1: Improve park accessibility
  - Goal 2: Enhance recreation programs
- Create 1 initiative per goal with budget

**Scenario B: Enter Complex Budget**
- Initiative: New Community Center
- 3-year budget: $2.5M
- Multiple funding sources:
  - General Fund: $1M (secured)
  - Federal Grant: $1M (pending)
  - Bond: $500K (secured)
- Budget breakdown across all categories

**Scenario C: City Manager Review**
- Review test strategic plan
- Find 3 items needing clarification
- Add comments
- Request one revision
- Approve after revision

### Training Evaluation

**Post-Training Survey Questions:**

**Rate 1-5 (1=Poor, 5=Excellent):**
1. How would you rate the overall quality of this training?
2. How well did the training meet your expectations?
3. How would you rate the instructor's knowledge?
4. How would you rate the hands-on exercises?
5. How comfortable do you feel using the system now?

**Open-Ended Questions:**
1. What was the most valuable part of the training?
2. What topics need more coverage?
3. What would you change about the training?
4. Do you have any questions that weren't answered?
5. What additional support do you need?

---

## Training Checklist for Administrators

### Before System Launch

- [ ] Complete system configuration
- [ ] Create all departments and fiscal years
- [ ] Create test data for demonstrations
- [ ] Prepare training materials
- [ ] Schedule training sessions for all roles
- [ ] Send calendar invites with pre-reading materials

### Week 1: Administrator Training

- [ ] Conduct administrator training (2 sessions)
- [ ] Verify admins can create users and departments
- [ ] Establish support processes

### Week 2-3: Department Training

- [ ] Conduct Department Director training (2 sessions each)
- [ ] Conduct Strategic Planner training (1 session each)
- [ ] Schedule check-in sessions

### Week 3-4: Leadership Training

- [ ] Conduct City Manager training
- [ ] Conduct Finance Director training
- [ ] Demonstrate city-wide dashboards

### Ongoing Support

- [ ] Hold weekly office hours for questions
- [ ] Send weekly tips email
- [ ] Create FAQ based on common questions
- [ ] Update training materials based on feedback
- [ ] Plan refresher training for Year 2

---

## Post-Training Support

### Support Channels

**Tier 1: Self-Service**
- User Guide
- Quick Reference Guide
- Video tutorials
- FAQ section

**Tier 2: Peer Support**
- Department mentor/champion
- Email to training coordinator
- Scheduled office hours

**Tier 3: Technical Support**
- Help desk ticket
- Email to admin team
- Escalation to IT/developers for bugs

### Office Hours

**Recommended Schedule:**
- **Weeks 1-4 after launch**: 3x per week, 1 hour each
- **Months 2-3**: 2x per week, 1 hour each
- **Month 4+**: 1x per week, 1 hour each
- **Ongoing**: On-demand scheduling

**Office Hours Format:**
- Drop-in or pre-scheduled
- Screen sharing for troubleshooting
- Record common questions for FAQ

### Training Metrics to Track

**Adoption Metrics:**
- % of users who have logged in
- % of departments with plans created
- % of plans submitted on time
- Average time to create plan

**Quality Metrics:**
- % of plans approved on first submission
- Average number of revision requests
- Budget validation error rate

**Support Metrics:**
- Number of support tickets
- Average resolution time
- Common issues/questions
- User satisfaction scores

---

## Conclusion

Successful adoption of the Strategic Planning System depends on:

1. **Thorough Training**: Role-specific, hands-on training
2. **Ongoing Support**: Office hours, documentation, peer mentors
3. **Continuous Improvement**: Feedback loops, annual refresher training
4. **Executive Sponsorship**: City Manager and Finance Director engagement

**Remember**: Training is not a one-time event. Plan for ongoing support and annual refresher sessions to ensure continued success.

---

**Questions or feedback on training?**

Contact: training@yourmunicipalityemail.com

---

**Document Version**: 1.0
**Last Updated**: January 2025
**Next Review**: July 2025
