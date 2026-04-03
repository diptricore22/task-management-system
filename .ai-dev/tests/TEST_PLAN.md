# 🧪 Comprehensive Test Plan
# Team Task Management System

---

## Document Info

| Field | Value |
|-------|-------|
| **Document Version** | 1.0 |
| **Created** | 2026-04-01 |
| **Testing Stack** | Jest + Supertest (backend), Jest + React Testing Library (frontend) |
| **Based on Features** | FEAT-001 through FEAT-010 |
| **Target Coverage** | Backend: 85%, Frontend: 80% |

---

## 1. TEST STRATEGY

### Testing Pyramid Distribution
- **Unit Tests (70%)**: Fast, isolated testing of individual functions and components
- **Integration Tests (25%)**: API endpoint testing and database interactions
- **E2E Tests (5%)**: Critical user journeys and cross-feature workflows

### Mock vs Real Database Strategy
**Use Real Test Database For:**
- All integration tests (API endpoints)
- Authentication flows
- Data persistence validation
- Complex queries and aggregations

**Use Mocks For:**
- External email service (Resend/Nodemailer)
- JWT token generation/verification in unit tests
- Date/time functions for consistent test runs
- File system operations

### Coverage Targets
- **Backend Services**: 85% line coverage minimum
- **Frontend Components**: 80% line coverage minimum
- **API Endpoints**: 100% endpoint coverage (all methods/paths)
- **Critical Paths**: 100% AC coverage for P0 features

### Test Data Strategy
**Approach**: Factory functions + database fixtures
- **Factories**: Dynamic test data generation for varied scenarios
- **Fixtures**: Static seed data for consistent baseline tests
- **Cleanup**: Database reset between integration test suites

---

## 2. UNIT TESTS — BACKEND SERVICES

### Authentication Service (auth.service.ts)

| Test ID | Module/Service | Scenario | Input | Expected Output | AC Reference |
|---------|---------------|----------|-------|------------------|--------------|
| AUTH-U001 | auth.service/register | Valid registration | {name, email, password} | User created, password hashed | FEAT-001 Story 1 AC1 |
| AUTH-U002 | auth.service/register | Duplicate email | Existing email | 409 error thrown | FEAT-001 Story 1 AC2 |
| AUTH-U003 | auth.service/login | Valid credentials | {email, password} | JWT tokens returned | FEAT-001 Story 2 AC1 |
| AUTH-U004 | auth.service/login | Invalid credentials | {email, wrong_password} | 401 error thrown | FEAT-001 Story 2 AC2 |
| AUTH-U005 | auth.service/login | Account lockout | 5th failed attempt | Account locked error | FEAT-001 Story 2 AC3 |
| AUTH-U006 | auth.service/refreshToken | Valid refresh token | Valid token | New access token | FEAT-001 Story 3 AC1 |
| AUTH-U007 | auth.service/refreshToken | Expired refresh token | Expired token | 401 error thrown | FEAT-001 Story 3 AC2 |
| AUTH-U008 | auth.service/logout | Valid logout | User session | Tokens invalidated | FEAT-001 Story 4 AC1 |
| AUTH-U009 | auth.service/invite | Valid invite by admin | {email, role} | Invite token generated | FEAT-001 Story 5 AC1 |
| AUTH-U010 | auth.service/acceptInvite | Valid invite acceptance | {token, password} | User activated | FEAT-001 Story 5 AC2 |
| AUTH-U011 | auth.service/acceptInvite | Expired invite | 73-hour old token | 400 error thrown | FEAT-001 Story 5 AC3 |

### Project Service (projects.service.ts)

| Test ID | Module/Service | Scenario | Input | Expected Output | AC Reference |
|---------|---------------|----------|-------|------------------|--------------|
| PROJ-U001 | projects.service/create | Valid project creation | {name, description, color} | Project created | FEAT-002 Story 1 AC1 |
| PROJ-U002 | projects.service/create | Name too long | {name: 101chars} | Validation error | FEAT-002 Story 1 AC2 |
| PROJ-U003 | projects.service/list | Member access | Member user | Only member projects | FEAT-002 Story 2 AC1 |
| PROJ-U004 | projects.service/list | Admin access | Admin user | All projects | FEAT-002 Story 2 AC2 |
| PROJ-U005 | projects.service/update | Valid project update | {name, description, color} | Project updated | FEAT-002 Story 3 AC1 |
| PROJ-U006 | projects.service/update | Empty name | {name: ""} | Validation error | FEAT-002 Story 3 AC2 |
| PROJ-U007 | projects.service/archive | Archive project | Project ID | Status = archived | FEAT-002 Story 4 AC1 |
| PROJ-U008 | projects.service/archive | Restore project | Archived project | Status = active | FEAT-002 Story 4 AC3 |
| PROJ-U009 | projects.service/softDelete | Delete project | Project ID | deleted_at set | FEAT-002 Story 5 AC2 |
| PROJ-U010 | projects.service/softDelete | Delete with tasks | Project with tasks | Warning + tasks archived | FEAT-002 Story 5 AC3 |

### Task Service (tasks.service.ts)

| Test ID | Module/Service | Scenario | Input | Expected Output | AC Reference |
|---------|---------------|----------|-------|------------------|--------------|
| TASK-U001 | tasks.service/create | Valid task creation | {title, projectId} | Task created | FEAT-003 Story 1 AC2 |
| TASK-U002 | tasks.service/create | Empty title | {title: ""} | Validation error | FEAT-003 Story 1 AC3 |
| TASK-U003 | tasks.service/list | Project task list | Project ID | Tasks for project | FEAT-003 Story 2 AC1 |
| TASK-U004 | tasks.service/list | Pagination | {page: 2, limit: 20} | Page 2 of tasks | FEAT-003 Story 2 AC2 |
| TASK-U005 | tasks.service/list | Filter by status | {status: "in_progress"} | Only in_progress tasks | FEAT-003 Story 2 AC3 |
| TASK-U006 | tasks.service/update | Valid task update | {title, status, priority} | Task updated | FEAT-003 Story 4 AC1 |
| TASK-U007 | tasks.service/update | Status change | {status: "done"} | Status updated + activity log | FEAT-003 Story 4 AC2 |
| TASK-U008 | tasks.service/softDelete | Delete by creator | Task creator | Task soft-deleted | FEAT-003 Story 5 AC1 |
| TASK-U009 | tasks.service/softDelete | Delete by non-creator | Different member | 403 error thrown | FEAT-003 Story 5 AC3 |
| TASK-U010 | tasks.service/softDelete | Delete by admin | Admin user | Task soft-deleted | FEAT-003 Story 5 AC1 |

### Member Service (members.service.ts)

| Test ID | Module/Service | Scenario | Input | Expected Output | AC Reference |
|---------|---------------|----------|-------|------------------|--------------|
| MEM-U001 | members.service/addToProject | Valid member addition | {userId, projectId, role} | Member added | FEAT-004 Story 1 AC2 |
| MEM-U002 | members.service/addToProject | Duplicate member | Existing member | Error thrown | FEAT-004 Story 1 AC3 |
| MEM-U003 | members.service/removeFromProject | Valid member removal | {userId, projectId} | Member removed | FEAT-004 Story 2 AC1 |
| MEM-U004 | members.service/removeFromProject | Tasks reassignment | Member with tasks | Tasks unassigned | FEAT-004 Story 2 AC2 |
| MEM-U005 | members.service/removeFromProject | Last admin check | Last admin | Error thrown | FEAT-004 Story 2 AC3 |
| MEM-U006 | members.service/assignTask | Valid assignment | {taskId, assigneeId} | Task assigned | FEAT-004 Story 3 AC2 |
| MEM-U007 | members.service/assignTask | Non-member assignment | Non-project member | Error thrown | FEAT-004 FR-3 |
| MEM-U008 | members.service/getMyTasks | User's tasks | User ID | Cross-project tasks | FEAT-004 Story 4 AC1 |
| MEM-U009 | members.service/getMyTasks | No assigned tasks | User ID | Empty state | FEAT-004 Story 4 AC2 |

### Dashboard Service (dashboard.service.ts)

| Test ID | Module/Service | Scenario | Input | Expected Output | AC Reference |
|---------|---------------|----------|-------|------------------|--------------|
| DASH-U001 | dashboard.service/getPersonalSummary | Task summary calculation | User ID | Due today/overdue counts | FEAT-005 Story 1 AC1 |
| DASH-U002 | dashboard.service/getPersonalSummary | No overdue tasks | User ID | "All caught up" state | FEAT-005 Story 1 AC2 |
| DASH-U003 | dashboard.service/getProjectCards | Project health cards | User ID | Project status breakdown | FEAT-005 Story 2 AC1 |
| DASH-U004 | dashboard.service/getProjectCards | 100% completion | Completed project | Green completed badge | FEAT-005 Story 2 AC2 |
| DASH-U005 | dashboard.service/getActivityFeed | Activity feed generation | User ID | Recent activity events | FEAT-005 Story 3 AC1 |
| DASH-U006 | dashboard.service/getActivityFeed | Empty activity | No activity | Empty state message | FEAT-005 Story 3 AC3 |
| DASH-U007 | dashboard.service/getAdminOverview | Admin health table | Admin user | All projects health | FEAT-005 Story 4 AC1 |
| DASH-U008 | dashboard.service/getAdminOverview | Health indicators | Projects data | Red/yellow/green status | FEAT-005 Story 4 AC2-3 |

### Comments Service (comments.service.ts)

| Test ID | Module/Service | Scenario | Input | Expected Output | AC Reference |
|---------|---------------|----------|-------|------------------|--------------|
| COM-U001 | comments.service/create | Valid comment creation | {taskId, body, authorId} | Comment created | FEAT-006 Story 1 AC1 |
| COM-U002 | comments.service/create | Empty comment | {body: ""} | Validation error | FEAT-006 Story 1 AC2 |
| COM-U003 | comments.service/create | Comment too long | {body: 5001chars} | Validation error | FEAT-006 Story 1 AC3 |
| COM-U004 | comments.service/update | Edit within 15min | Recent comment | Comment edited | FEAT-006 Story 2 AC1 |
| COM-U005 | comments.service/update | Edit after 15min | Old comment | 403 error thrown | FEAT-006 Story 2 AC2 |
| COM-U006 | comments.service/update | Edit with changes | Updated content | "edited" label added | FEAT-006 Story 2 AC3 |
| COM-U007 | comments.service/delete | Delete own comment | Comment author | Comment soft-deleted | FEAT-006 Story 3 AC1 |
| COM-U008 | comments.service/delete | Admin delete any | Admin user | Any comment deleted | FEAT-006 Story 3 AC2 |
| COM-U009 | comments.service/delete | Member delete others | Non-author member | 403 error thrown | FEAT-006 Story 3 AC3 |
| COM-U010 | comments.service/getTaskActivity | Activity log retrieval | Task ID | Comments + activity merged | FEAT-006 Story 4 AC1 |

---

## 3. INTEGRATION TESTS — API ENDPOINTS

### Authentication Endpoints

| Test ID | Method + Path | Scenario | Auth State | Expected Status | Expected Body | AC Reference |
|---------|--------------|----------|------------|-----------------|---------------|--------------|
| AUTH-I001 | POST /api/auth/register | Valid registration | None | 201 | User object (no password) | FEAT-001 Story 1 AC1 |
| AUTH-I002 | POST /api/auth/register | Duplicate email | None | 409 | Error: email exists | FEAT-001 Story 1 AC2 |
| AUTH-I003 | POST /api/auth/register | Invalid email | None | 400 | Validation errors | FEAT-001 Story 1 AC3 |
| AUTH-I004 | POST /api/auth/register | Password too short | None | 400 | Validation errors | FEAT-001 Story 1 AC3 |
| AUTH-I005 | POST /api/auth/login | Valid credentials | None | 200 | User + cookies set | FEAT-001 Story 2 AC1 |
| AUTH-I006 | POST /api/auth/login | Invalid email | None | 401 | Generic auth error | FEAT-001 Story 2 AC2 |
| AUTH-I007 | POST /api/auth/login | Invalid password | None | 401 | Generic auth error | FEAT-001 Story 2 AC2 |
| AUTH-I008 | POST /api/auth/login | Account locked | Locked account | 423 | Account locked error | FEAT-001 Story 2 AC3 |
| AUTH-I009 | POST /api/auth/logout | Valid logout | Authenticated | 200 | Success + cookies cleared | FEAT-001 Story 4 AC1 |
| AUTH-I010 | POST /api/auth/logout | No auth | None | 401 | Unauthorized | Standard 401 |
| AUTH-I011 | POST /api/auth/refresh | Valid refresh | Valid refresh token | 200 | New access token | FEAT-001 Story 3 AC1 |
| AUTH-I012 | POST /api/auth/refresh | Expired refresh | Expired token | 401 | Token expired | FEAT-001 Story 3 AC2 |
| AUTH-I013 | POST /api/auth/invite | Admin sends invite | Admin auth | 201 | Invite created | FEAT-001 Story 5 AC1 |
| AUTH-I014 | POST /api/auth/invite | Member sends invite | Member auth | 403 | Admin required | FEAT-001 FR-9 |
| AUTH-I015 | POST /api/auth/invite/token/accept | Valid invite accept | None | 200 | User activated | FEAT-001 Story 5 AC2 |
| AUTH-I016 | POST /api/auth/invite/token/accept | Expired invite | None | 400 | Invite expired | FEAT-001 Story 5 AC3 |

### Project Endpoints

| Test ID | Method + Path | Scenario | Auth State | Expected Status | Expected Body | AC Reference |
|---------|--------------|----------|------------|-----------------|---------------|--------------|
| PROJ-I001 | POST /api/projects | Admin creates project | Admin auth | 201 | Project object | FEAT-002 Story 1 AC1 |
| PROJ-I002 | POST /api/projects | Member creates project | Member auth | 403 | Admin required | FEAT-002 FR-1 |
| PROJ-I003 | POST /api/projects | Invalid name | Admin auth | 400 | Validation errors | FEAT-002 Story 1 AC2 |
| PROJ-I004 | POST /api/projects | No auth | None | 401 | Unauthorized | Standard 401 |
| PROJ-I005 | GET /api/projects | Member gets projects | Member auth | 200 | Member's projects only | FEAT-002 Story 2 AC1 |
| PROJ-I006 | GET /api/projects | Admin gets projects | Admin auth | 200 | All projects | FEAT-002 Story 2 AC2 |
| PROJ-I007 | GET /api/projects | No auth | None | 401 | Unauthorized | Standard 401 |
| PROJ-I008 | GET /api/projects/:id | Valid project access | Member auth | 200 | Project details | FEAT-002 Story 2 |
| PROJ-I009 | GET /api/projects/:id | Non-member access | Other member auth | 403 | Access denied | Security requirement |
| PROJ-I010 | GET /api/projects/:id | Project not found | Member auth | 404 | Not found | Standard 404 |
| PROJ-I011 | PATCH /api/projects/:id | Admin updates project | Admin auth | 200 | Updated project | FEAT-002 Story 3 AC1 |
| PROJ-I012 | PATCH /api/projects/:id | Member updates project | Member auth | 403 | Admin required | FEAT-002 FR-1 |
| PROJ-I013 | PATCH /api/projects/:id | Empty name update | Admin auth | 400 | Validation errors | FEAT-002 Story 3 AC2 |
| PROJ-I014 | PATCH /api/projects/:id/archive | Archive project | Admin auth | 200 | Archived project | FEAT-002 Story 4 AC1 |
| PROJ-I015 | PATCH /api/projects/:id/archive | Restore project | Admin auth | 200 | Active project | FEAT-002 Story 4 AC3 |
| PROJ-I016 | DELETE /api/projects/:id | Delete project | Admin auth | 200 | Success message | FEAT-002 Story 5 AC2 |
| PROJ-I017 | DELETE /api/projects/:id | Delete with tasks | Admin auth | 200 | Warning + success | FEAT-002 Story 5 AC3 |

### Task Endpoints

| Test ID | Method + Path | Scenario | Auth State | Expected Status | Expected Body | AC Reference |
|---------|--------------|----------|------------|-----------------|---------------|--------------|
| TASK-I001 | POST /api/projects/:projectId/tasks | Valid task creation | Member auth | 201 | Task object | FEAT-003 Story 1 AC2 |
| TASK-I002 | POST /api/projects/:projectId/tasks | Empty title | Member auth | 400 | Validation errors | FEAT-003 Story 1 AC3 |
| TASK-I003 | POST /api/projects/:projectId/tasks | Non-member creates | Other member auth | 403 | Access denied | Security requirement |
| TASK-I004 | GET /api/projects/:projectId/tasks | Get project tasks | Member auth | 200 | Task list (newest first) | FEAT-003 Story 2 AC1 |
| TASK-I005 | GET /api/projects/:projectId/tasks | Pagination | Member auth | 200 | Paginated results | FEAT-003 Story 2 AC2 |
| TASK-I006 | GET /api/projects/:projectId/tasks | Filter by status | Member auth | 200 | Filtered tasks | FEAT-003 Story 2 AC3 |
| TASK-I007 | GET /api/projects/:projectId/tasks | Non-member access | Other member auth | 403 | Access denied | Security requirement |
| TASK-I008 | GET /api/tasks/:id | Get task detail | Member auth | 200 | Full task detail | FEAT-003 Story 3 AC1 |
| TASK-I009 | GET /api/tasks/:id | Non-member access | Other member auth | 403 | Access denied | Security requirement |
| TASK-I010 | GET /api/tasks/:id | Task not found | Member auth | 404 | Not found | Standard 404 |
| TASK-I011 | PATCH /api/tasks/:id | Update task title | Member auth | 200 | Updated task | FEAT-003 Story 4 AC1 |
| TASK-I012 | PATCH /api/tasks/:id | Update task status | Member auth | 200 | Updated task + activity | FEAT-003 Story 4 AC2 |
| TASK-I013 | PATCH /api/tasks/:id | Clear due date | Member auth | 200 | "No due date" | FEAT-003 Story 4 AC3 |
| TASK-I014 | PATCH /api/tasks/:id | Non-member update | Other member auth | 403 | Access denied | Security requirement |
| TASK-I015 | DELETE /api/tasks/:id | Creator deletes | Task creator auth | 200 | Success message | FEAT-003 Story 5 AC1 |
| TASK-I016 | DELETE /api/tasks/:id | Admin deletes | Admin auth | 200 | Success message | FEAT-003 Story 5 AC1 |
| TASK-I017 | DELETE /api/tasks/:id | Member deletes others | Other member auth | 403 | Access denied | FEAT-003 Story 5 AC3 |

### Member Management Endpoints

| Test ID | Method + Path | Scenario | Auth State | Expected Status | Expected Body | AC Reference |
|---------|--------------|----------|------------|-----------------|---------------|--------------|
| MEM-I001 | GET /api/projects/:id/members | Get project members | Member auth | 200 | Member list | FEAT-004 Story 1 |
| MEM-I002 | GET /api/projects/:id/members | Non-member access | Other member auth | 403 | Access denied | Security requirement |
| MEM-I003 | POST /api/projects/:id/members | Admin adds member | Admin auth | 201 | Member added | FEAT-004 Story 1 AC2 |
| MEM-I004 | POST /api/projects/:id/members | Member adds member | Member auth | 403 | Admin required | FEAT-004 FR-1 |
| MEM-I005 | POST /api/projects/:id/members | Add duplicate member | Admin auth | 409 | Already member error | FEAT-004 Story 1 AC3 |
| MEM-I006 | DELETE /api/projects/:id/members/:userId | Admin removes member | Admin auth | 200 | Member removed | FEAT-004 Story 2 AC1 |
| MEM-I007 | DELETE /api/projects/:id/members/:userId | Remove last admin | Admin auth | 400 | Cannot remove last admin | FEAT-004 Story 2 AC3 |
| MEM-I008 | PATCH /api/projects/:id/members/:userId | Update member role | Admin auth | 200 | Role updated | FEAT-004 FR-9 |
| MEM-I009 | GET /api/users/me/tasks | Get my tasks | Member auth | 200 | User's tasks across projects | FEAT-004 Story 4 AC1 |
| MEM-I010 | GET /api/users/me/tasks | No assigned tasks | Member auth | 200 | Empty array | FEAT-004 Story 4 AC2 |

### Dashboard Endpoints

| Test ID | Method + Path | Scenario | Auth State | Expected Status | Expected Body | AC Reference |
|---------|--------------|----------|------------|-----------------|---------------|--------------|
| DASH-I001 | GET /api/dashboard/summary | Personal task summary | Member auth | 200 | Task counts by status | FEAT-005 Story 1 AC1 |
| DASH-I002 | GET /api/dashboard/projects | Project status cards | Member auth | 200 | Project health data | FEAT-005 Story 2 AC1 |
| DASH-I003 | GET /api/dashboard/activity | Activity feed | Member auth | 200 | Recent activity events | FEAT-005 Story 3 AC1 |
| DASH-I004 | GET /api/dashboard/activity | Paginated activity | Member auth | 200 | Paginated activity | FEAT-005 Story 3 AC2 |
| DASH-I005 | GET /api/dashboard/admin/overview | Admin project health | Admin auth | 200 | All projects health | FEAT-005 Story 4 AC1 |
| DASH-I006 | GET /api/dashboard/admin/overview | Member access admin | Member auth | 403 | Admin required | FEAT-005 Security |
| DASH-I007 | GET /api/dashboard/* | No auth access | None | 401 | Unauthorized | Security requirement |

### Comments Endpoints

| Test ID | Method + Path | Scenario | Auth State | Expected Status | Expected Body | AC Reference |
|---------|--------------|----------|------------|-----------------|---------------|--------------|
| COM-I001 | GET /api/tasks/:id/comments | Get task comments | Member auth | 200 | Comments + activity | FEAT-006 Story 4 AC1 |
| COM-I002 | GET /api/tasks/:id/comments | Non-member access | Other member auth | 403 | Access denied | Security requirement |
| COM-I003 | POST /api/tasks/:id/comments | Post valid comment | Member auth | 201 | Comment created | FEAT-006 Story 1 AC1 |
| COM-I004 | POST /api/tasks/:id/comments | Empty comment | Member auth | 400 | Validation errors | FEAT-006 Story 1 AC2 |
| COM-I005 | POST /api/tasks/:id/comments | Comment too long | Member auth | 400 | Too long error | FEAT-006 Story 1 AC3 |
| COM-I006 | POST /api/tasks/:id/comments | Non-member comment | Other member auth | 403 | Access denied | Security requirement |
| COM-I007 | PATCH /api/comments/:id | Edit own comment | Comment author | 200 | Updated comment | FEAT-006 Story 2 AC1 |
| COM-I008 | PATCH /api/comments/:id | Edit after 15min | Comment author | 403 | Edit window expired | FEAT-006 Story 2 AC2 |
| COM-I009 | PATCH /api/comments/:id | Edit others comment | Other member auth | 403 | Not comment author | Security requirement |
| COM-I010 | DELETE /api/comments/:id | Delete own comment | Comment author | 200 | Comment deleted | FEAT-006 Story 3 AC1 |
| COM-I011 | DELETE /api/comments/:id | Admin delete any | Admin auth | 200 | Comment deleted | FEAT-006 Story 3 AC2 |
| COM-I012 | DELETE /api/comments/:id | Member delete others | Other member auth | 403 | Access denied | FEAT-006 Story 3 AC3 |

---

## 4. UNIT TESTS — FRONTEND COMPONENTS

### Authentication Components

| Test ID | Component | Scenario | User Action | Expected Result | AC Reference |
|---------|-----------|----------|-------------|-----------------|--------------|
| AUTH-F001 | LoginForm | Valid login submission | Enter valid credentials + submit | Form submits with correct data | FEAT-001 Story 2 AC1 |
| AUTH-F002 | LoginForm | Invalid credentials | Enter invalid email + submit | Shows validation error | FEAT-001 Story 2 AC2 |
| AUTH-F003 | LoginForm | Account lockout display | Receive 423 response | Shows lockout message | FEAT-001 Story 2 AC3 |
| AUTH-F004 | RegisterForm | Valid registration | Enter valid data + submit | Form submits + redirects | FEAT-001 Story 1 AC1 |
| AUTH-F005 | RegisterForm | Duplicate email | Enter existing email + submit | Shows "email exists" error | FEAT-001 Story 1 AC2 |
| AUTH-F006 | RegisterForm | Password validation | Enter short password | Shows password length error | FEAT-001 Story 1 AC3 |
| AUTH-F007 | ProfileForm | Update profile | Change name + save | Shows success message | FEAT-001 Story 6 AC1 |
| AUTH-F008 | ProfileForm | Email already taken | Enter taken email + save | Shows "email taken" error | FEAT-001 Story 6 AC2 |

### Project Components

| Test ID | Component | Scenario | User Action | Expected Result | AC Reference |
|---------|-----------|----------|-------------|-----------------|--------------|
| PROJ-F001 | CreateProjectModal | Valid project creation | Enter name/description + submit | Modal closes + project created | FEAT-002 Story 1 AC1 |
| PROJ-F002 | CreateProjectModal | Name too long | Enter 101 character name | Shows validation error | FEAT-002 Story 1 AC2 |
| PROJ-F003 | ProjectListPage | Member project list | Load page as member | Shows only member projects | FEAT-002 Story 2 AC1 |
| PROJ-F004 | ProjectListPage | Admin project list | Load page as admin | Shows all projects | FEAT-002 Story 2 AC2 |
| PROJ-F005 | ProjectListPage | Empty project list | Load page with no projects | Shows create first project CTA | FEAT-002 Story 2 AC3 |
| PROJ-F006 | ProjectSettingsPage | Update project details | Edit name/color + save | Changes reflected immediately | FEAT-002 Story 3 AC1 |
| PROJ-F007 | ProjectSettingsPage | Empty name update | Clear name + save | Shows validation error | FEAT-002 Story 3 AC2 |
| PROJ-F008 | ArchiveConfirmModal | Archive project | Click archive + confirm | Project archived | FEAT-002 Story 4 AC1 |
| PROJ-F009 | DeleteConfirmModal | Delete project | Type name + confirm | Project deleted | FEAT-002 Story 5 AC1 |

### Task Components

| Test ID | Component | Scenario | User Action | Expected Result | AC Reference |
|---------|-----------|----------|-------------|-----------------|--------------|
| TASK-F001 | AddTaskForm | Valid task creation | Enter title + submit | Task appears in list | FEAT-003 Story 1 AC2 |
| TASK-F002 | AddTaskForm | Empty title | Submit without title | Shows validation error | FEAT-003 Story 1 AC3 |
| TASK-F003 | TaskRow | Inline status update | Change status dropdown | Status updates immediately | FEAT-003 Story 4 AC2 |
| TASK-F004 | TaskDetailPanel | Task detail display | Click task title | Shows full task detail | FEAT-003 Story 3 AC1 |
| TASK-F005 | TaskDetailPanel | Update task fields | Edit title + save | Changes saved + reflected | FEAT-003 Story 4 AC1 |
| TASK-F006 | TaskDetailPanel | Clear due date | Remove due date + save | Shows "No due date" | FEAT-003 Story 4 AC3 |
| TASK-F007 | FilterBar | Filter by status | Select "In Progress" filter | Only in-progress tasks shown | FEAT-003 Story 2 AC3 |
| TASK-F008 | TaskRow | Delete task button | Click delete + confirm | Task removed from list | FEAT-003 Story 5 AC1 |

### Assignment Components

| Test ID | Component | Scenario | User Action | Expected Result | AC Reference |
|---------|-----------|----------|-------------|-----------------|--------------|
| MEM-F001 | AddMemberModal | Add member to project | Search user + select role + add | Member appears in list | FEAT-004 Story 1 AC2 |
| MEM-F002 | AddMemberModal | Add duplicate member | Select existing member | Shows "already member" error | FEAT-004 Story 1 AC3 |
| MEM-F003 | AssigneePicker | Assign task | Select assignee from dropdown | Task shows assignee avatar | FEAT-004 Story 3 AC2 |
| MEM-F004 | AssigneePicker | Clear assignment | Clear assignee field | Task shows "Unassigned" | FEAT-004 Story 3 AC3 |
| MEM-F005 | MyTasksPage | Personal task view | Navigate to my tasks | Shows all assigned tasks | FEAT-004 Story 4 AC1 |
| MEM-F006 | MyTasksPage | No assigned tasks | Visit with no tasks | Shows "No tasks assigned" | FEAT-004 Story 4 AC2 |
| MEM-F007 | MyTasksPage | Completed tasks | Task status = done | Appears in "Done" section | FEAT-004 Story 4 AC3 |
| MEM-F008 | MemberListPage | Remove member | Click remove + confirm | Member removed from list | FEAT-004 Story 2 AC1 |

### Dashboard Components

| Test ID | Component | Scenario | User Action | Expected Result | AC Reference |
|---------|-----------|----------|-------------|-----------------|--------------|
| DASH-F001 | DashboardPage | Personal stats display | Load dashboard | Shows due today/overdue counts | FEAT-005 Story 1 AC1 |
| DASH-F002 | StatCard | No overdue tasks | Load with no overdue | Shows "All caught up! 🎉" | FEAT-005 Story 1 AC2 |
| DASH-F003 | StatCard | Click task stat | Click "Due Today" count | Navigates to My Tasks | FEAT-005 Story 1 AC3 |
| DASH-F004 | ProjectHealthCard | Project status display | Load projects | Shows task counts by status | FEAT-005 Story 2 AC1 |
| DASH-F005 | ProjectHealthCard | 100% complete project | All tasks done | Shows "Completed" green badge | FEAT-005 Story 2 AC2 |
| DASH-F006 | ProjectHealthCard | Click project card | Click project card | Navigates to project detail | FEAT-005 Story 2 AC3 |
| DASH-F007 | ActivityFeedItem | Activity display | Load activity feed | Shows human-readable events | FEAT-005 Story 3 AC1 |
| DASH-F008 | ActivityFeedItem | No activity | Empty activity | Shows "No recent activity" | FEAT-005 Story 3 AC3 |

### Comments Components

| Test ID | Component | Scenario | User Action | Expected Result | AC Reference |
|---------|-----------|----------|-------------|-----------------|--------------|
| COM-F001 | CommentInput | Post comment | Type comment + send | Comment appears at bottom | FEAT-006 Story 1 AC1 |
| COM-F002 | CommentInput | Empty comment | Try to submit empty | Submit button disabled | FEAT-006 Story 1 AC2 |
| COM-F003 | CommentInput | Character limit | Type 5000+ characters | Shows character count warning | FEAT-006 Story 1 AC3 |
| COM-F004 | CommentInput | Keyboard submit | Type comment + Ctrl+Enter | Comment submitted | Design note |
| COM-F005 | CommentItem | Edit comment | Click edit + modify + save | Comment updated with "(edited)" | FEAT-006 Story 2 AC3 |
| COM-F006 | CommentItem | Edit after 15min | Try to edit old comment | No edit option shown | FEAT-006 Story 2 AC2 |
| COM-F007 | CommentItem | Delete own comment | Click delete + confirm | Comment removed from feed | FEAT-006 Story 3 AC1 |
| COM-F008 | CommentItem | Admin delete any | Admin clicks delete + confirm | Any comment removed | FEAT-006 Story 3 AC2 |
| COM-F009 | TaskActivityFeed | Mixed activity | Load task detail | Shows comments + activity merged | FEAT-006 Story 4 AC1 |
| COM-F010 | ActivityLogItem | Activity log display | Status change occurs | Shows immutable activity entry | FEAT-006 Story 4 AC3 |

---

## 5. CRITICAL USER FLOW TESTS (E2E)

### Flow 1: Complete User Onboarding
**Priority**: P0 - Core registration and first-use experience

**Steps:**
1. Navigate to registration page
2. Enter valid name, email, password
3. Submit registration form
4. Verify redirect to dashboard
5. Verify welcome state (no projects)
6. Click "Create your first project"
7. Enter project name and description
8. Verify project appears in projects list
9. Navigate to project detail page
10. Create first task
11. Verify task appears in project and "My Tasks"

**Expected Outcome**: New user can register and create their first project with a task

**AC References**: FEAT-001 Story 1, FEAT-002 Story 1, FEAT-003 Story 1, FEAT-004 Story 4

### Flow 2: Team Collaboration Workflow
**Priority**: P0 - Core team management and task assignment

**Steps:**
1. Admin logs in
2. Creates new project with color and description
3. Invites member via email (mock email service)
4. Member accepts invite and sets password
5. Member logs in and sees new project
6. Admin creates task in project
7. Admin assigns task to member
8. Member navigates to "My Tasks"
9. Member updates task status to "In Progress"
10. Member adds comment to task
11. Admin views project dashboard and sees progress

**Expected Outcome**: Full team collaboration from invite to task completion

**AC References**: FEAT-001 Story 5, FEAT-002 Story 1, FEAT-003 Story 1&4, FEAT-004 Story 1&3, FEAT-006 Story 1

### Flow 3: Project Management Lifecycle
**Priority**: P1 - Complete project lifecycle from creation to archive

**Steps:**
1. Admin creates project with multiple tasks
2. Admin adds multiple members to project
3. Assigns tasks to different members
4. Members update task statuses over time
5. Admin views project health dashboard
6. Members complete all tasks
7. Admin views completion report
8. Admin archives project
9. Verify archived project not in active list
10. Admin restores project from archived

**Expected Outcome**: Complete project lifecycle management

**AC References**: FEAT-002 Story 1&3&4, FEAT-004 Story 1&3, FEAT-005 Story 2&4, FEAT-003 Story 4

### Flow 4: Task Management and Filtering
**Priority**: P1 - Advanced task management features

**Steps:**
1. Create project with 20+ tasks
2. Set various statuses, priorities, and assignees
3. Apply multiple filters (status + assignee)
4. Sort by due date and priority
5. Update task status inline from list
6. Bulk verify filters persist in URL
7. Open task detail and add comments
8. Verify activity log records all changes
9. Test task deletion by creator vs admin

**Expected Outcome**: Advanced task management and filtering works correctly

**AC References**: FEAT-003 Story 2&4&5, FEAT-006 Story 1&4, FEAT-007 Story 3&4

### Flow 5: Admin Dashboard and Health Monitoring
**Priority**: P2 - Admin oversight and project health

**Steps:**
1. Admin with multiple projects logs in
2. Views dashboard with project health cards
3. Identifies project with blocked tasks
4. Navigates to project detail
5. Reviews member workload distribution
6. Reassigns tasks to balance load
7. Views activity feed for recent changes
8. Checks completion trends over time
9. Exports or reviews detailed analytics

**Expected Outcome**: Admin can monitor and manage team health effectively

**AC References**: FEAT-005 Story 1&2&4, FEAT-010 Story 1&2&3

---

## 6. EDGE CASES & NEGATIVE TESTS

### Authentication Edge Cases
- **Concurrent login attempts**: Multiple rapid login requests with same credentials
- **Session collision**: User logs in on multiple devices simultaneously
- **Token edge conditions**: Access token expires during API call
- **Password edge cases**: Unicode passwords, very long passwords, special characters
- **Email edge cases**: Invalid email formats, very long emails, unicode emails
- **Account lockout race**: Multiple failed attempts from different sessions
- **Invite token reuse**: Attempting to use invite token multiple times

### Project Management Edge Cases
- **Project name collisions**: Multiple admins creating projects with same name
- **Member removal cascading**: Remove member who is sole assignee of critical tasks
- **Project deletion with references**: Delete project with active tasks and comments
- **Archive/restore race conditions**: Multiple admins archiving/restoring simultaneously
- **Color validation**: Invalid hex colors, missing # symbol, case sensitivity
- **Project access boundary**: Member tries to access project after removal
- **Last admin protection**: Various attempts to circumvent last admin rule

### Task Management Edge Cases
- **Assignment validation**: Assign task to user who is not project member
- **Concurrent task updates**: Multiple users updating same task simultaneously
- **Status transition validation**: Invalid status changes, skipping status steps
- **Due date edge cases**: Past due dates, far future dates, invalid date formats
- **Priority validation**: Invalid priority values, missing priority
- **Task deletion cascading**: Delete task with comments and activity history
- **Pagination boundary**: Request page beyond available data

### Data Integrity Edge Cases
- **Soft delete verification**: Ensure deleted records never appear in queries
- **Foreign key constraints**: Orphaned records after cascade deletes
- **Activity log completeness**: All task changes generate activity logs
- **Comment edit window**: Precise 15-minute boundary testing
- **notification delivery**: Failed email sends don't crash system
- **Database transaction rollbacks**: Verify partial failures roll back completely

### Performance Edge Cases
- **Large task lists**: Projects with 1000+ tasks
- **Deep comment threads**: Tasks with 100+ comments
- **High user load**: 50+ concurrent users accessing same project
- **Complex filter combinations**: Multiple filters with large datasets
- **Dashboard with many projects**: User member of 50+ projects
- **Activity feed volume**: High-activity projects with frequent updates

### Security Edge Cases
- **Cross-project access**: Attempts to access resources across projects
- **Role escalation**: Member attempting admin actions
- **JWT tampering**: Modified tokens, revoked tokens still in use
- **CSRF protection**: State-changing requests without proper CSRF tokens
- **Rate limit bypass**: Attempts to exceed rate limits
- **SQL injection**: Malicious input in all user-controlled fields
- **XSS vectors**: Script injection in comments, project names, task titles

---

## 7. TEST DATA REQUIREMENTS

### User Personas (Seed Data)
```javascript
// Admin persona
{
  id: "admin-001",
  name: "Alice Administrator",
  email: "alice@company.com",
  role: "admin",
  password: "hashedSecurePassword123"
}

// Member persona
{
  id: "member-001",
  name: "Bob Developer",
  email: "bob@company.com",
  role: "member",
  password: "hashedSecurePassword123"
}

// Viewer persona
{
  id: "viewer-001",
  name: "Carol Stakeholder",
  email: "carol@company.com",
  role: "viewer",
  password: "hashedSecurePassword123"
}
```

### Project Test Data
```javascript
// Active project with full team
{
  id: "proj-001",
  name: "Mobile App Redesign",
  description: "Complete redesign of the mobile application UI",
  color: "#3B82F6",
  status: "active",
  created_by: "admin-001"
}

// Project with many tasks for pagination testing
{
  id: "proj-002",
  name: "API Integration Testing",
  description: "Large project for testing pagination and filtering",
  color: "#EF4444",
  status: "active",
  created_by: "admin-001"
}

// Archived project for status testing
{
  id: "proj-003",
  name: "Legacy System Migration",
  description: "Completed migration project",
  color: "#10B981",
  status: "archived",
  created_by: "admin-001"
}
```

### Task Test Data Scenarios
```javascript
// Tasks with all status combinations
const taskStatuses = ["todo", "in_progress", "in_review", "blocked", "done"];
const taskPriorities = ["low", "medium", "high", "critical"];

// Overdue tasks for dashboard testing
{
  id: "task-overdue-001",
  title: "Critical Bug Fix",
  due_date: "2026-03-25", // Past date
  status: "in_progress",
  priority: "critical",
  assignee_id: "member-001"
}

// Tasks due today/tomorrow for notification testing
{
  id: "task-due-today",
  title: "Deploy to Staging",
  due_date: "2026-04-01", // Today
  status: "in_review",
  priority: "high",
  assignee_id: "member-001"
}
```

### Comment Test Data
```javascript
// Recent comment (editable)
{
  id: "comment-001",
  task_id: "task-001",
  author_id: "member-001",
  body: "Working on the API integration, should be ready by tomorrow.",
  created_at: "2026-04-01T10:30:00Z" // < 15 min ago
}

// Old comment (non-editable)
{
  id: "comment-002",
  task_id: "task-001",
  author_id: "admin-001",
  body: "Please prioritize this task for the sprint.",
  created_at: "2026-03-31T09:00:00Z", // > 15 min ago
  edited_at: null
}
```

### Activity Log Test Data
```javascript
// Status change activity
{
  id: "activity-001",
  project_id: "proj-001",
  task_id: "task-001",
  actor_id: "member-001",
  action: "status_changed",
  payload: {
    from: "todo",
    to: "in_progress",
    task_title: "Implement user authentication"
  },
  created_at: "2026-04-01T09:15:00Z"
}

// Assignment change activity
{
  id: "activity-002",
  project_id: "proj-001",
  task_id: "task-002",
  actor_id: "admin-001",
  action: "task_assigned",
  payload: {
    assignee_name: "Bob Developer",
    task_title: "Design database schema"
  },
  created_at: "2026-04-01T08:45:00Z"
}
```

### Notification Test Data
```javascript
// Unread assignment notification
{
  id: "notif-001",
  user_id: "member-001",
  type: "task_assigned",
  payload: {
    task_id: "task-001",
    task_title: "Implement user authentication",
    assigned_by: "Alice Administrator",
    project_name: "Mobile App Redesign"
  },
  read_at: null,
  created_at: "2026-04-01T09:00:00Z"
}
```

### Factory Functions for Dynamic Data
```javascript
// User factory
function createUser({
  name = "Test User",
  email = "test@example.com",
  role = "member"
} = {}) {
  return {
    id: generateUUID(),
    name,
    email,
    role,
    password: hashPassword("password123"),
    created_at: new Date().toISOString()
  };
}

// Task factory with relationships
function createTask({
  title = "Test Task",
  project_id,
  assignee_id = null,
  status = "todo",
  priority = "medium",
  due_date = null
} = {}) {
  return {
    id: generateUUID(),
    title,
    project_id,
    assignee_id,
    status,
    priority,
    due_date,
    created_by: "admin-001",
    created_at: new Date().toISOString()
  };
}
```

### Test Database Setup Script
```sql
-- Reset database to clean state
TRUNCATE users, projects, tasks, comments,
         project_members, activity_logs,
         notifications CASCADE;

-- Insert test users
INSERT INTO users (id, name, email, role, password_hash, created_at)
VALUES
  ('admin-001', 'Alice Administrator', 'alice@company.com', 'admin', $1, NOW()),
  ('member-001', 'Bob Developer', 'bob@company.com', 'member', $2, NOW()),
  ('viewer-001', 'Carol Stakeholder', 'carol@company.com', 'viewer', $3, NOW());

-- Insert test projects with membership
INSERT INTO projects (id, name, description, color, status, created_by, created_at)
VALUES
  ('proj-001', 'Mobile App Redesign', 'Complete redesign of mobile app', '#3B82F6', 'active', 'admin-001', NOW()),
  ('proj-002', 'API Integration Testing', 'Large project for testing', '#EF4444', 'active', 'admin-001', NOW());

-- Add project memberships
INSERT INTO project_members (project_id, user_id, role, joined_at)
VALUES
  ('proj-001', 'admin-001', 'admin', NOW()),
  ('proj-001', 'member-001', 'member', NOW()),
  ('proj-001', 'viewer-001', 'viewer', NOW()),
  ('proj-002', 'admin-001', 'admin', NOW()),
  ('proj-002', 'member-001', 'member', NOW());
```

### Performance Test Data Volume
- **Users**: 100 test users across all roles
- **Projects**: 20 projects with varying member counts
- **Tasks**: 500 tasks across all projects and statuses
- **Comments**: 1000 comments across tasks
- **Activity Logs**: 2000 activity entries
- **Notifications**: 200 notifications in various read states

This test data foundation ensures reliable, comprehensive testing across all features while maintaining realistic usage patterns.

---

**Document End** - Last updated: 2026-04-01