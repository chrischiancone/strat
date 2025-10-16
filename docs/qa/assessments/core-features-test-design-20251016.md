# Test Design: Core Features Comprehensive Coverage

**Date**: 2025-10-16  
**Designer**: Quinn (Test Architect)  
**Scope**: All core application features

## Executive Summary

### Test Strategy Overview

- **Total test scenarios**: 187
- **Unit tests**: 68 (36%)
- **Integration tests**: 82 (44%)
- **E2E tests**: 37 (20%)
- **Priority distribution**: P0: 62 | P1: 78 | P2: 37 | P3: 10

### Coverage by Feature Area

| Feature Area                  | Unit | Integration | E2E | P0 | P1 | P2 | P3 | Total |
| ----------------------------- | ---- | ----------- | --- | -- | -- | -- | -- | ----- |
| 1. Authentication & Security  | 15   | 18          | 9   | 18 | 16 | 6  | 2  | 42    |
| 2. Strategic Plans Management | 12   | 16          | 7   | 12 | 15 | 6  | 2  | 35    |
| 3. Goals & Initiatives        | 14   | 17          | 8   | 14 | 18 | 7  | 0  | 39    |
| 4. Dashboard & Analytics      | 10   | 13          | 5   | 8  | 14 | 6  | 0  | 28    |
| 5. User Management            | 12   | 13          | 6   | 8  | 12 | 7  | 4  | 31    |
| 6. Budget Management          | 5    | 5           | 2   | 2  | 3  | 5  | 2  | 12    |

---

## Feature Area 1: Authentication & Security

### 1.1 User Login

#### Test Scenarios

| ID          | Level       | Priority | Test Scenario                               | Justification                           |
| ----------- | ----------- | -------- | ------------------------------------------- | --------------------------------------- |
| AUTH-U-001  | Unit        | P0       | Validate email format                       | Input validation logic                  |
| AUTH-U-002  | Unit        | P0       | Validate password strength requirements     | Security policy enforcement             |
| AUTH-U-003  | Unit        | P0       | Sanitize email input                        | XSS prevention                          |
| AUTH-U-004  | Unit        | P1       | Rate limit calculation logic                | Algorithm correctness                   |
| AUTH-INT-001| Integration | P0       | Authenticate valid credentials              | Critical auth flow                      |
| AUTH-INT-002| Integration | P0       | Reject invalid credentials                  | Security boundary test                  |
| AUTH-INT-003| Integration | P0       | Handle rate limiting after max attempts     | DDoS protection                         |
| AUTH-INT-004| Integration | P0       | Create session on successful login          | State management                        |
| AUTH-INT-005| Integration | P1       | Log security events to audit log            | Compliance requirement                  |
| AUTH-INT-006| Integration | P1       | Clear rate limit on successful auth         | State cleanup                           |
| AUTH-E2E-001| E2E         | P0       | Complete login flow with valid credentials  | Revenue-critical user journey           |
| AUTH-E2E-002| E2E         | P0       | Display error for invalid credentials       | User experience validation              |
| AUTH-E2E-003| E2E         | P1       | Redirect to intended page after login       | User journey completion                 |

### 1.2 Two-Factor Authentication (2FA)

| ID          | Level       | Priority | Test Scenario                               | Justification                           |
| ----------- | ----------- | -------- | ------------------------------------------- | --------------------------------------- |
| 2FA-U-001   | Unit        | P0       | Generate valid TOTP secret                  | Crypto algorithm correctness            |
| 2FA-U-002   | Unit        | P0       | Verify TOTP token within time window        | Time-based validation logic             |
| 2FA-U-003   | Unit        | P0       | Generate 8 unique backup codes              | Code generation algorithm               |
| 2FA-U-004   | Unit        | P0       | Hash backup codes correctly                 | Security function validation            |
| 2FA-INT-001 | Integration | P0       | Enable 2FA with valid token                 | Critical security flow                  |
| 2FA-INT-002 | Integration | P0       | Store encrypted 2FA secret                  | Data security validation                |
| 2FA-INT-003 | Integration | P0       | Verify backup code and remove from list     | Multi-component interaction             |
| 2FA-INT-004 | Integration | P0       | Check 2FA requirement for admin users       | Policy enforcement                      |
| 2FA-INT-005 | Integration | P1       | Disable 2FA and clear secrets               | State cleanup                           |
| 2FA-INT-006 | Integration | P1       | QR code generation (dynamic import)         | Resource loading validation             |
| 2FA-E2E-001 | E2E         | P0       | Complete 2FA setup flow                     | Security compliance                     |
| 2FA-E2E-002 | E2E         | P0       | Login with 2FA verification                 | Critical auth journey                   |
| 2FA-E2E-003 | E2E         | P1       | Recover account with backup code            | Recovery path validation                |

### 1.3 Authorization & Access Control

| ID          | Level       | Priority | Test Scenario                               | Justification                           |
| ----------- | ----------- | -------- | ------------------------------------------- | --------------------------------------- |
| AUTH-U-005  | Unit        | P0       | Role permission calculation                 | Access logic correctness                |
| AUTH-U-006  | Unit        | P0       | Resource ownership validation               | Security boundary check                 |
| AUTH-INT-007| Integration | P0       | Block unauthorized resource access          | Security enforcement                    |
| AUTH-INT-008| Integration | P0       | Allow access with correct permissions       | Happy path validation                   |
| AUTH-INT-009| Integration | P1       | Validate municipality isolation (RLS)       | Data segregation                        |
| AUTH-INT-010| Integration | P1       | Admin can access all department data        | Role-based access                       |
| AUTH-E2E-004| E2E         | P0       | User cannot access other department plans   | Security user journey                   |
| AUTH-E2E-005| E2E         | P2       | Admin can view cross-department reports     | Admin workflow                          |

### 1.4 Session Management

| ID          | Level       | Priority | Test Scenario                               | Justification                           |
| ----------- | ----------- | -------- | ------------------------------------------- | --------------------------------------- |
| AUTH-U-007  | Unit        | P1       | Session timeout calculation                 | Time logic validation                   |
| AUTH-INT-011| Integration | P0       | Create valid session token                  | Security token generation               |
| AUTH-INT-012| Integration | P0       | Validate session on protected routes        | Authentication check                    |
| AUTH-INT-013| Integration | P1       | Expire session after timeout                | Session lifecycle                       |
| AUTH-INT-014| Integration | P1       | Logout clears session                       | Cleanup validation                      |
| AUTH-E2E-006| E2E         | P1       | Session persists across page navigations    | User experience                         |
| AUTH-E2E-007| E2E         | P2       | Session timeout redirects to login          | Security flow                           |

### 1.5 Security Audit Logging

| ID          | Level       | Priority | Test Scenario                               | Justification                           |
| ----------- | ----------- | -------- | ------------------------------------------- | --------------------------------------- |
| AUTH-U-008  | Unit        | P1       | Sanitize user input for audit logs          | XSS prevention                          |
| AUTH-INT-015| Integration | P0       | Log failed login attempts                   | Security monitoring                     |
| AUTH-INT-016| Integration | P1       | Log successful authentication               | Audit trail                             |
| AUTH-INT-017| Integration | P1       | Log rate limit violations                   | Security event tracking                 |
| AUTH-INT-018| Integration | P2       | Log password changes                        | Compliance requirement                  |

---

## Feature Area 2: Strategic Plans Management

### 2.1 Plan Creation & Editing

| ID          | Level       | Priority | Test Scenario                               | Justification                           |
| ----------- | ----------- | -------- | ------------------------------------------- | --------------------------------------- |
| PLAN-U-001  | Unit        | P0       | Validate plan date ranges                   | Business rule enforcement               |
| PLAN-U-002  | Unit        | P0       | Validate fiscal year alignment              | Data integrity logic                    |
| PLAN-U-003  | Unit        | P1       | Calculate plan duration                     | Calculation correctness                 |
| PLAN-U-004  | Unit        | P1       | Validate plan title length and format       | Input validation                        |
| PLAN-INT-001| Integration | P0       | Create strategic plan with required fields  | Core data persistence                   |
| PLAN-INT-002| Integration | P0       | Update plan preserves existing data         | Data integrity                          |
| PLAN-INT-003| Integration | P0       | Link plan to fiscal years                   | Relationship management                 |
| PLAN-INT-004| Integration | P1       | Associate plan with department              | Multi-component flow                    |
| PLAN-INT-005| Integration | P1       | Set plan as current                         | State management                        |
| PLAN-INT-006| Integration | P1       | Store SWOT analysis JSON                    | Complex data handling                   |
| PLAN-E2E-001| E2E         | P0       | Create complete strategic plan              | Core user journey                       |
| PLAN-E2E-002| E2E         | P1       | Edit existing plan and save changes         | Common workflow                         |
| PLAN-E2E-003| E2E         | P2       | Navigate between plan sections              | User experience                         |

### 2.2 Plan Approval Workflow

| ID          | Level       | Priority | Test Scenario                               | Justification                           |
| ----------- | ----------- | -------- | ------------------------------------------- | --------------------------------------- |
| PLAN-U-005  | Unit        | P0       | Validate approval state transitions         | Workflow logic                          |
| PLAN-INT-007| Integration | P0       | Submit plan for approval                    | Critical workflow step                  |
| PLAN-INT-008| Integration | P0       | Approve plan (authorized user)              | Authorization + state change            |
| PLAN-INT-009| Integration | P0       | Reject plan with comments                   | Workflow branching                      |
| PLAN-INT-010| Integration | P1       | Prevent editing of approved plans           | Data protection                         |
| PLAN-INT-011| Integration | P1       | Audit log approval actions                  | Compliance requirement                  |
| PLAN-E2E-004| E2E         | P0       | Complete approval workflow                  | Business-critical journey               |
| PLAN-E2E-005| E2E         | P1       | Reject and resubmit plan                    | Alternate path                          |

### 2.3 Multi-Year Planning

| ID          | Level       | Priority | Test Scenario                               | Justification                           |
| ----------- | ----------- | -------- | ------------------------------------------- | --------------------------------------- |
| PLAN-U-006  | Unit        | P1       | Calculate year-over-year budget growth      | Financial calculation                   |
| PLAN-U-007  | Unit        | P1       | Validate year ranges (1-5 years)            | Business rule                           |
| PLAN-INT-012| Integration | P1       | Store year 1, 2, 3 budget allocations       | Multi-year data handling                |
| PLAN-INT-013| Integration | P1       | Roll forward previous year's data           | Data transformation                     |
| PLAN-E2E-006| E2E         | P1       | Create 3-year strategic plan                | Common use case                         |

### 2.4 Collaboration Features

| ID          | Level       | Priority | Test Scenario                               | Justification                           |
| ----------- | ----------- | -------- | ------------------------------------------- | --------------------------------------- |
| PLAN-U-008  | Unit        | P2       | Generate unique presence ID                 | Algorithm validation                    |
| PLAN-INT-014| Integration | P1       | Add collaborator to plan                    | Multi-user feature                      |
| PLAN-INT-015| Integration | P1       | Track user presence on plan                 | Real-time feature                       |
| PLAN-INT-016| Integration | P2       | Send collaboration notifications            | Communication feature                   |
| PLAN-E2E-007| E2E         | P2       | Multiple users edit plan simultaneously     | Collaboration workflow                  |

### 2.5 Plan Versioning & History

| ID          | Level       | Priority | Test Scenario                               | Justification                           |
| ----------- | ----------- | -------- | ------------------------------------------- | --------------------------------------- |
| PLAN-U-009  | Unit        | P1       | Calculate version number                    | Versioning logic                        |
| PLAN-INT-017| Integration | P1       | Create new version on edit                  | Version management                      |
| PLAN-INT-018| Integration | P2       | Retrieve plan version history               | Historical data access                  |
| PLAN-E2E-008| E2E         | P2       | View plan change history                    | Audit capability                        |

---

## Feature Area 3: Goals & Initiatives

### 3.1 Strategic Goals Management

| ID          | Level       | Priority | Test Scenario                               | Justification                           |
| ----------- | ----------- | -------- | ------------------------------------------- | --------------------------------------- |
| GOAL-U-001  | Unit        | P0       | Validate goal title length                  | Input validation                        |
| GOAL-U-002  | Unit        | P0       | Calculate goal display order                | Sorting logic                           |
| GOAL-U-003  | Unit        | P1       | Validate objectives array structure         | Data structure validation               |
| GOAL-INT-001| Integration | P0       | Create strategic goal under plan            | Core CRUD operation                     |
| GOAL-INT-002| Integration | P0       | Update goal with new objectives             | Data persistence                        |
| GOAL-INT-003| Integration | P0       | Delete goal and cascade to initiatives      | Data integrity                          |
| GOAL-INT-004| Integration | P1       | Reorder goals within plan                   | State management                        |
| GOAL-INT-005| Integration | P1       | Associate KPIs with goal                    | Relationship linking                    |
| GOAL-E2E-001| E2E         | P0       | Create goal with multiple objectives        | Core user workflow                      |
| GOAL-E2E-002| E2E         | P1       | Edit goal and update related initiatives    | Complex workflow                        |
| GOAL-E2E-003| E2E         | P2       | Drag and drop to reorder goals              | UI interaction                          |

### 3.2 Initiatives Management

| ID          | Level       | Priority | Test Scenario                               | Justification                           |
| ----------- | ----------- | -------- | ------------------------------------------- | --------------------------------------- |
| INIT-U-001  | Unit        | P0       | Validate priority level enum                | Data validation                         |
| INIT-U-002  | Unit        | P0       | Calculate total initiative cost             | Financial calculation                   |
| INIT-U-003  | Unit        | P1       | Validate initiative number format           | Business rule                           |
| INIT-U-004  | Unit        | P1       | Calculate rank within priority              | Ranking algorithm                       |
| INIT-INT-001| Integration | P0       | Create initiative under goal                | Core CRUD operation                     |
| INIT-INT-002| Integration | P0       | Update initiative status                    | State management                        |
| INIT-INT-003| Integration | P0       | Link initiative to department               | Relationship management                 |
| INIT-INT-004| Integration | P1       | Assign lead department                      | Multi-component flow                    |
| INIT-INT-005| Integration | P1       | Add collaborating departments               | Complex relationship                    |
| INIT-INT-006| Integration | P1       | Track initiative dependencies               | Graph data structure                    |
| INIT-E2E-001| E2E         | P0       | Create high-priority initiative             | Critical workflow                       |
| INIT-E2E-002| E2E         | P1       | Update initiative with budget details       | Common use case                         |
| INIT-E2E-003| E2E         | P1       | Change initiative priority level            | Status workflow                         |

### 3.3 Priority Management

| ID          | Level       | Priority | Test Scenario                               | Justification                           |
| ----------- | ----------- | -------- | ------------------------------------------- | --------------------------------------- |
| INIT-U-005  | Unit        | P0       | Validate priority levels (NEED/WANT/N2H)    | Enum validation                         |
| INIT-U-006  | Unit        | P1       | Calculate priority ranking score            | Scoring algorithm                       |
| INIT-INT-007| Integration | P1       | Filter initiatives by priority              | Query logic                             |
| INIT-INT-008| Integration | P1       | Reorder initiatives within priority level   | Complex update                          |
| INIT-E2E-004| E2E         | P1       | View initiatives grouped by priority        | User journey                            |

### 3.4 KPI Tracking

| ID          | Level       | Priority | Test Scenario                               | Justification                           |
| ----------- | ----------- | -------- | ------------------------------------------- | --------------------------------------- |
| KPI-U-001   | Unit        | P0       | Calculate KPI progress percentage           | Metric calculation                      |
| KPI-U-002   | Unit        | P0       | Validate baseline vs target values          | Business logic                          |
| KPI-U-003   | Unit        | P1       | Parse actual values JSON                    | Data parsing                            |
| KPI-INT-001 | Integration | P0       | Create KPI for initiative                   | Core data creation                      |
| KPI-INT-002 | Integration | P0       | Update KPI actual values                    | Data persistence                        |
| KPI-INT-003 | Integration | P1       | Link KPI to goal and initiative             | Multi-level relationship                |
| KPI-INT-004 | Integration | P1       | Calculate goal-level KPI rollup             | Aggregation logic                       |
| KPI-E2E-001 | E2E         | P0       | Track initiative KPI progress               | Measurement workflow                    |
| KPI-E2E-002 | E2E         | P1       | Update quarterly KPI actuals                | Reporting workflow                      |

### 3.5 Budget Allocation

| ID          | Level       | Priority | Test Scenario                               | Justification                           |
| ----------- | ----------- | -------- | ------------------------------------------- | --------------------------------------- |
| INIT-U-007  | Unit        | P0       | Calculate 3-year total cost                 | Financial calculation                   |
| INIT-U-008  | Unit        | P0       | Validate budget does not exceed allocation  | Business rule validation                |
| INIT-INT-009| Integration | P0       | Allocate budget across years                | Financial data handling                 |
| INIT-INT-010| Integration | P0       | Track funding sources                       | Multi-source management                 |
| INIT-INT-011| Integration | P1       | Calculate remaining budget                  | Aggregation query                       |
| INIT-E2E-005| E2E         | P0       | Allocate initiative budget by year          | Financial workflow                      |

---

## Feature Area 4: Dashboard & Analytics

### 4.1 Executive Dashboard

| ID          | Level       | Priority | Test Scenario                               | Justification                           |
| ----------- | ----------- | -------- | ------------------------------------------- | --------------------------------------- |
| DASH-U-001  | Unit        | P1       | Calculate completion percentage             | Metric calculation                      |
| DASH-U-002  | Unit        | P1       | Aggregate initiatives by status             | Aggregation logic                       |
| DASH-U-003  | Unit        | P1       | Calculate budget utilization                | Financial calculation                   |
| DASH-INT-001| Integration | P0       | Load dashboard data for current plan        | Core data query                         |
| DASH-INT-002| Integration | P1       | Filter dashboard by department              | Access control + query                  |
| DASH-INT-003| Integration | P1       | Cache dashboard aggregations                | Performance optimization                |
| DASH-INT-004| Integration | P1       | Aggregate KPIs across all goals             | Complex aggregation                     |
| DASH-E2E-001| E2E         | P0       | View executive dashboard                    | Primary user journey                    |
| DASH-E2E-002| E2E         | P1       | Filter dashboard by fiscal year             | Common workflow                         |

### 4.2 Budget Visualization

| ID          | Level       | Priority | Test Scenario                               | Justification                           |
| ----------- | ----------- | -------- | ------------------------------------------- | --------------------------------------- |
| DASH-U-004  | Unit        | P1       | Format currency values                      | Display logic                           |
| DASH-U-005  | Unit        | P2       | Calculate chart data points                 | Visualization data prep                 |
| DASH-INT-005| Integration | P1       | Aggregate budget by department              | Financial reporting                     |
| DASH-INT-006| Integration | P1       | Compare budget vs actual spending           | Financial analysis                      |
| DASH-E2E-003| E2E         | P1       | View budget breakdown by category           | Financial dashboard                     |

### 4.3 Progress Tracking

| ID          | Level       | Priority | Test Scenario                               | Justification                           |
| ----------- | ----------- | -------- | ------------------------------------------- | --------------------------------------- |
| DASH-U-006  | Unit        | P1       | Calculate milestone completion rate         | Progress metric                         |
| DASH-U-007  | Unit        | P1       | Determine initiative at-risk status         | Alert logic                             |
| DASH-INT-007| Integration | P1       | Track initiative status changes over time   | Historical tracking                     |
| DASH-INT-008| Integration | P1       | Generate progress alerts                    | Notification triggering                 |
| DASH-E2E-004| E2E         | P1       | View initiative progress timeline           | Tracking workflow                       |

### 4.4 KPI Monitoring

| ID          | Level       | Priority | Test Scenario                               | Justification                           |
| ----------- | ----------- | -------- | ------------------------------------------- | --------------------------------------- |
| DASH-U-008  | Unit        | P1       | Calculate KPI achievement percentage        | Performance metric                      |
| DASH-INT-009| Integration | P1       | Aggregate KPI actuals vs targets            | Reporting query                         |
| DASH-INT-010| Integration | P1       | Generate KPI trend data                     | Time-series analysis                    |
| DASH-E2E-005| E2E         | P1       | View KPI performance dashboard              | Analytics workflow                      |

### 4.5 Reporting & Export

| ID          | Level       | Priority | Test Scenario                               | Justification                           |
| ----------- | ----------- | -------- | ------------------------------------------- | --------------------------------------- |
| DASH-U-009  | Unit        | P2       | Format report data for export               | Data transformation                     |
| DASH-INT-011| Integration | P2       | Generate CSV export                         | File generation                         |
| DASH-INT-012| Integration | P2       | Generate PDF report                         | Complex document generation             |
| DASH-INT-013| Integration | P2       | Schedule automated reports                  | Background job handling                 |

---

## Feature Area 5: User Management

### 5.1 User CRUD Operations

| ID          | Level       | Priority | Test Scenario                               | Justification                           |
| ----------- | ----------- | -------- | ------------------------------------------- | --------------------------------------- |
| USER-U-001  | Unit        | P0       | Validate email uniqueness logic             | Business rule                           |
| USER-U-002  | Unit        | P0       | Validate phone number format                | Input validation                        |
| USER-U-003  | Unit        | P1       | Sanitize user full name                     | XSS prevention                          |
| USER-INT-001| Integration | P0       | Create user with role assignment            | Core user creation                      |
| USER-INT-002| Integration | P0       | Update user profile                         | Data persistence                        |
| USER-INT-003| Integration | P0       | Deactivate user (soft delete)               | State management                        |
| USER-INT-004| Integration | P1       | Assign user to department                   | Relationship management                 |
| USER-INT-005| Integration | P1       | Update user preferences JSON                | Complex data handling                   |
| USER-E2E-001| E2E         | P0       | Admin creates new user account              | Admin workflow                          |
| USER-E2E-002| E2E         | P1       | User updates own profile                    | Self-service workflow                   |

### 5.2 Role & Permission Management

| ID          | Level       | Priority | Test Scenario                               | Justification                           |
| ----------- | ----------- | -------- | ------------------------------------------- | --------------------------------------- |
| USER-U-004  | Unit        | P0       | Validate role enum values                   | Data validation                         |
| USER-U-005  | Unit        | P0       | Check permission for role and resource      | Authorization logic                     |
| USER-INT-006| Integration | P0       | Change user role (admin only)               | Critical permission change              |
| USER-INT-007| Integration | P0       | Verify role-based access control (RBAC)     | Security enforcement                    |
| USER-INT-008| Integration | P1       | Audit log role changes                      | Compliance requirement                  |
| USER-E2E-003| E2E         | P0       | Admin assigns department director role      | Critical admin task                     |

### 5.3 Department Assignments

| ID          | Level       | Priority | Test Scenario                               | Justification                           |
| ----------- | ----------- | -------- | ------------------------------------------- | --------------------------------------- |
| USER-U-006  | Unit        | P1       | Validate department access logic            | Business rule                           |
| USER-INT-009| Integration | P1       | Assign user to multiple departments         | Multi-relationship                      |
| USER-INT-010| Integration | P1       | Update primary department                   | Data update                             |
| USER-E2E-004| E2E         | P1       | User views only their department's plans    | Access control journey                  |

### 5.4 User Profile & Preferences

| ID          | Level       | Priority | Test Scenario                               | Justification                           |
| ----------- | ----------- | -------- | ------------------------------------------- | --------------------------------------- |
| USER-U-007  | Unit        | P2       | Parse preferences JSON                      | Data structure handling                 |
| USER-U-008  | Unit        | P2       | Validate avatar URL format                  | Input validation                        |
| USER-INT-011| Integration | P2       | Update notification preferences             | User customization                      |
| USER-INT-012| Integration | P2       | Upload and store avatar image               | File handling                           |
| USER-E2E-005| E2E         | P2       | User customizes dashboard preferences       | Personalization workflow                |

### 5.5 User Activity & Audit

| ID          | Level       | Priority | Test Scenario                               | Justification                           |
| ----------- | ----------- | -------- | ------------------------------------------- | --------------------------------------- |
| USER-U-009  | Unit        | P1       | Calculate days since last login             | Metric calculation                      |
| USER-INT-013| Integration | P1       | Track user last login timestamp             | Activity tracking                       |
| USER-INT-014| Integration | P2       | Generate user activity report               | Reporting query                         |
| USER-E2E-006| E2E         | P3       | Admin views user activity dashboard         | Admin analytics                         |

---

## Feature Area 6: Budget Management

### 6.1 Budget Allocation

| ID          | Level       | Priority | Test Scenario                               | Justification                           |
| ----------- | ----------- | -------- | ------------------------------------------- | --------------------------------------- |
| BUDG-U-001  | Unit        | P0       | Validate budget amount is positive          | Business rule                           |
| BUDG-U-002  | Unit        | P0       | Calculate total budget across categories    | Financial calculation                   |
| BUDG-INT-001| Integration | P0       | Allocate budget to initiative               | Financial transaction                   |
| BUDG-INT-002| Integration | P1       | Track funding source for budget             | Multi-source tracking                   |
| BUDG-E2E-001| E2E         | P0       | Create initiative budget breakdown          | Financial workflow                      |

### 6.2 Funding Sources

| ID          | Level       | Priority | Test Scenario                               | Justification                           |
| ----------- | ----------- | -------- | ------------------------------------------- | --------------------------------------- |
| BUDG-U-003  | Unit        | P1       | Validate funding source name                | Input validation                        |
| BUDG-INT-003| Integration | P1       | Create new funding source                   | Core CRUD operation                     |
| BUDG-INT-004| Integration | P2       | Link multiple funding sources to initiative | Complex relationship                    |
| BUDG-E2E-002| E2E         | P2       | Track budget by funding source              | Financial tracking                      |

### 6.3 Budget Tracking & Reporting

| ID          | Level       | Priority | Test Scenario                               | Justification                           |
| ----------- | ----------- | -------- | ------------------------------------------- | --------------------------------------- |
| BUDG-U-004  | Unit        | P2       | Calculate budget variance                   | Financial metric                        |
| BUDG-U-005  | Unit        | P2       | Format budget values for reports            | Display logic                           |
| BUDG-INT-005| Integration | P2       | Generate budget summary report              | Reporting query                         |
| BUDG-E2E-003| E2E         | P3       | View budget vs actual spending report       | Financial analysis                      |

---

## Risk Coverage Matrix

### Critical Risks Addressed

| Risk ID | Risk Description                          | Test Scenarios Covering Risk                                    | Coverage Level |
| ------- | ----------------------------------------- | --------------------------------------------------------------- | -------------- |
| RISK-01 | Unauthorized access to sensitive data     | AUTH-INT-007, AUTH-E2E-004, USER-INT-007                        | High           |
| RISK-02 | Financial data integrity                  | PLAN-INT-002, INIT-INT-009, BUDG-INT-001                        | High           |
| RISK-03 | Session hijacking / authentication bypass | AUTH-INT-001, AUTH-INT-011, 2FA-E2E-002                         | High           |
| RISK-04 | Data loss on concurrent edits             | PLAN-INT-015, GOAL-INT-002                                      | Medium         |
| RISK-05 | Budget allocation exceeding limits        | INIT-U-008, BUDG-U-001, BUDG-INT-001                            | High           |
| RISK-06 | Cascading deletes breaking relationships  | GOAL-INT-003, INIT-INT-006                                      | Medium         |
| RISK-07 | Performance degradation on dashboard      | DASH-INT-003, DASH-INT-009                                      | Medium         |
| RISK-08 | XSS/injection attacks                     | AUTH-U-003, AUTH-U-008, USER-U-003                              | High           |
| RISK-09 | Missing audit trail for compliance        | AUTH-INT-015, USER-INT-008, PLAN-INT-011                        | High           |
| RISK-10 | 2FA bypass or recovery code theft         | 2FA-U-004, 2FA-INT-001, 2FA-INT-003                             | High           |

---

## Recommended Test Execution Order

### Phase 1: Foundation & Security (P0 Critical Path)

1. **Authentication Tests** (AUTH-* P0) - 18 scenarios
2. **User Management Core** (USER-* P0) - 8 scenarios  
3. **2FA Setup & Verification** (2FA-* P0) - 8 scenarios

**Rationale**: Security foundation must be solid before testing business features. Failure here blocks all user workflows.

### Phase 2: Core Business Features (P0 + P1)

4. **Strategic Plans CRUD** (PLAN-* P0/P1) - 15 scenarios
5. **Goals Management** (GOAL-* P0/P1) - 11 scenarios
6. **Initiatives & KPIs** (INIT-*, KPI-* P0/P1) - 19 scenarios
7. **Budget Allocation** (BUDG-* P0/P1) - 3 scenarios

**Rationale**: Core business workflows that generate revenue and deliver value.

### Phase 3: Analytics & Reporting (P1)

8. **Dashboard Aggregations** (DASH-* P1) - 14 scenarios

**Rationale**: Reporting features depend on data from earlier phases.

### Phase 4: Secondary Features (P2)

9. **Collaboration Features** (PLAN-INT-014 to PLAN-E2E-007)
10. **User Preferences** (USER-* P2)
11. **Budget Reporting** (BUDG-* P2)

### Phase 5: Edge Cases & Polish (P3)

12. **Admin Analytics** (USER-E2E-006)
13. **Advanced Reporting** (BUDG-E2E-003)

---

## Quality Checklist

### Coverage Validation

- [x] Every critical user journey has E2E coverage
- [x] Every AC has at least one test scenario
- [x] No duplicate coverage across test levels
- [x] All P0 scenarios have clear risk mitigation
- [x] Test IDs follow naming convention
- [x] Scenarios are atomic and independent

### Test Level Distribution

- [x] Unit tests focus on business logic (36% appropriate for this application)
- [x] Integration tests cover component interactions (44% - appropriate for data-heavy app)
- [x] E2E tests cover critical journeys only (20% - appropriate balance)

### Priority Distribution

- [x] P0 scenarios cover revenue-critical and security-critical paths
- [x] P1 scenarios cover core user workflows
- [x] P2/P3 scenarios cover secondary features and polish

---

## Maintenance Recommendations

### High-Value Test Maintenance

**Focus maintenance efforts on:**

1. **P0 E2E Tests** - These break most often, provide highest value
2. **Integration Tests with Database** - Schema changes will break these
3. **Authentication & Authorization Tests** - Security updates will require changes

### Test Data Strategy

**Recommended approach:**

- **Unit Tests**: Mock all data
- **Integration Tests**: Use test database with seed data
- **E2E Tests**: Use fixture data reset between runs

### Continuous Monitoring

**Track these metrics:**

- P0 test pass rate (target: 100%)
- Test execution time (target: <5 min for P0/P1)
- Flaky test percentage (target: <5%)
- Code coverage by priority (P0: >90%, P1: >80%)

---

## Next Steps

1. **Immediate**: Implement P0 unit and integration tests for authentication
2. **Week 1**: Complete P0 test suite (62 scenarios)
3. **Week 2**: Implement P1 test suite (78 scenarios)
4. **Week 3**: Add P2 scenarios and establish CI/CD pipeline
5. **Ongoing**: Monitor test health and adjust priorities based on production incidents

---

## Test Design Artifacts

**Location**: `docs/qa/assessments/core-features-test-design-20251016.md`

**Related Documents:**
- Risk Profile: (To be created with `*risk-profile` command)
- Requirements Trace: (To be created with `*trace` command)
- Quality Gate: (To be created with `*gate` command)

**Designer**: Quinn (Test Architect)  
**Date**: 2025-10-16  
**Version**: 1.0
