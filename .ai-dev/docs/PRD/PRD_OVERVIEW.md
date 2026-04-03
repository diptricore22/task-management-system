# PRD Overview: Team Task Management System

**Document Version:** 1.0  
**Last Updated:** 2026-04-01  
**Status:** Draft for Review

---

## 1. EXECUTIVE SUMMARY

### Project Name
**Team Task Management System**

### Product Description
Team Task Management System is a collaborative web application designed to solve the critical problem of fragmented task coordination in engineering and cross-functional teams. Currently, teams lose significant time coordinating work via Slack messages, spreadsheets, and email threads, with no single source of truth for task status, ownership, and deadlines. This results in duplicated effort, dropped tasks, and delayed delivery.

The system provides a centralized platform where teams can create projects, create and assign tasks within those projects, and collaborate through comments and a shared activity feed. Members see a personal dashboard with all tasks assigned to them across every project. Admins can monitor team health, archive stale projects, and generate workload and delivery reports. The system enforces role-based access control to ensure contributors see only projects they belong to.

### Target Market & Users
**Primary Market:** Engineering teams and cross-functional product teams (10-100 members)  
**Industry:** Technology / Software Development / SaaS  
**User Types:**
- Engineering leads and project managers who need oversight and reporting capabilities
- Developers and contributors who need clear task visibility and collaboration tools
- Stakeholders and product managers who need read-only access to project progress

---

## 2. USER PERSONAS

### Persona 1: Alex - The Engineering Lead (Admin)
**Role:** Engineering Lead / Project Manager  
**Key Responsibilities:**
- Creating and managing projects across multiple teams
- Assigning team members to projects and tasks
- Monitoring team health and delivery metrics
- Making data-driven decisions about resource allocation

**Primary Goals:**
- Reduce time spent chasing status updates from 5+ hours/week to <1 hour/week
- Gain real-time visibility into team workload and bottlenecks
- Ensure no tasks fall through the cracks
- Generate reports for stakeholder updates

**Pain Points Resolved:**
- No more hunting through Slack threads for task status
- Automated workload visibility instead of manual spreadsheet tracking
- Clear accountability with task ownership and due dates
- Historical activity log for retrospectives and audits

---

### Persona 2: Jordan - The Developer (Member)
**Role:** Developer / Contributor  
**Key Responsibilities:**
- Completing assigned tasks across multiple projects
- Updating task status and progress
- Collaborating with teammates through comments
- Managing personal workload and priorities

**Primary Goals:**
- See all assigned tasks in one place across all projects
- Understand task priority and deadlines clearly
- Collaborate asynchronously without meeting overhead
- Focus on delivery, not coordination

**Pain Points Resolved:**
- Single dashboard view eliminates context-switching between tools
- Clear task descriptions and labels reduce ambiguity
- In-app notifications prevent missed assignments
- Activity feed keeps team aligned without status meetings

---

### Persona 3: Sam - The Stakeholder (Viewer)
**Role:** Product Manager / Stakeholder  
**Key Responsibilities:**
- Monitoring project progress and delivery timelines
- Understanding team capacity and blockers
- Making product decisions based on engineering reality
- Reporting to executive leadership

**Primary Goals:**
- Visibility into project status without interrupting engineers
- Early warning system for at-risk deliverables
- Understanding what's completed vs. in-progress vs. blocked
- Self-service access to project data

**Pain Points Resolved:**
- Real-time project status without scheduling sync meetings
- Historical completion trends for realistic planning
- Clear visibility into what's blocking delivery
- No risk of accidentally editing or deleting critical data

---

## 3. MVP FEATURE LIST

| Feature ID | Feature Name | Priority | Personas Affected | Notes |
|------------|--------------|----------|-------------------|-------|
| **FEAT-001** | Authentication & User Management | P0 | All | Email + password login. JWT httpOnly cookies. Roles: Admin, Member, Viewer. Account lockout after 5 failed attempts. |
| **FEAT-002** | Project Management (CRUD) | P0 | Admin, Member, Viewer | Create, archive, delete projects. Color coding for visual organization. Project membership management. Only Admins can create/delete. |
| **FEAT-003** | Task Management (CRUD + Statuses) | P0 | Admin, Member | 5 statuses (To Do, In Progress, In Review, Completed, Blocked). 4 priorities (Urgent, High, Medium, Low). Due dates. Soft-delete only. |
| **FEAT-004** | Task Assignment & Team Members | P0 | Admin, Member | Assign tasks to project members. "My Tasks" cross-project view. In-app notification system for assignments. |
| **FEAT-005** | Dashboard & Activity Feed | P1 | All | Personal task summary. Project health cards. Activity feed showing recent updates across all projects. |
| **FEAT-006** | Comments & Task Activity Log | P1 | Admin, Member | Comment threads on tasks. 15-minute edit window for comments. System-generated activity log for all task changes. |
| **FEAT-007** | Labels & Filtering | P1 | Admin, Member, Viewer | Custom labels per project. Multi-criteria filtering (status, priority, assignee, labels). Sort by due date, priority, created date. |
| **FEAT-008** | Due Date Reminders & Email Notifications | P1 | Admin, Member | Daily cron job for reminder checks. Email notifications for upcoming due dates. User notification preferences. |
| **FEAT-009** | Kanban Board View | P2 | Admin, Member, Viewer | Drag-and-drop board view alongside list view. Column-based status organization. Visual task cards with assignee and priority. |
| **FEAT-010** | Admin Reports & Analytics | P2 | Admin | Completion trend charts. Team workload table. Status distribution visualization. Export to CSV. |

---

## 4. OUT OF SCOPE (MVP)

The following features are explicitly **NOT** included in the MVP and will be considered for future phases:

**Phase 3+ Considerations:**
- Mobile native applications (iOS/Android) — web will be responsive-only for MVP
- OAuth / social login (Google, GitHub, Microsoft) — email/password only for MVP
- Third-party integrations (Slack, GitHub, Jira, Linear) — standalone system for MVP
- Time tracking or billing features — focus is on task management only
- Multi-organization / multi-tenant support — single organization deployment
- AI-powered task suggestions or smart scheduling
- File attachments on tasks — text-only collaboration for MVP
- Recurring task templates
- Sub-tasks or task dependencies
- Advanced permissions (beyond Admin/Member/Viewer roles)
- Real-time collaboration (WebSockets) — standard HTTP polling for activity feed
- Custom fields or project templates
- Gantt chart or timeline views
- Wiki or documentation features

---

## 5. KEY BUSINESS RULES

The following constraints **must** be enforced by the application code:

### Task & Project Rules
1. **Tasks belong to exactly one project** — they cannot be moved between projects
2. **A user can only be assigned a task if they are already a member of that project**
3. **Tasks cannot be hard-deleted** — all deletions are soft-deletes using `deleted_at` timestamp

### Role-Based Access Control
4. **Only Admins can:**
   - Create new projects
   - Manage project members (add/remove)
   - Archive or delete projects
   - Access the Admin Reports & Analytics feature

5. **Members can:**
   - Create, edit, and complete tasks in projects where they are members
   - Delete only tasks they personally created
   - Comment on tasks in their projects
   - Update their assigned tasks

6. **Viewers can:**
   - Read all content in projects where they are members
   - Cannot create, edit, or delete anything (strict read-only)

7. **The last Admin of a project cannot be removed** — projects must always have at least one Admin member

### Security & Authentication
8. **Passwords must be hashed with bcrypt (≥ 12 rounds)** — never stored or returned in plain text
9. **JWT access tokens expire in 15 minutes; refresh tokens expire in 7 days**
10. **Account locked for 15 minutes after 5 consecutive failed login attempts**
11. **All sensitive actions require authentication** — no anonymous access

### Data Integrity
12. **All database modifications must be validated with Zod schemas** on both frontend and backend
13. **Soft-delete pattern applies to all entities** (users, projects, tasks, comments) — `deleted_at` field instead of DELETE queries
14. **Audit trail required** — task activity log captures who changed what and when

---

## 6. HIGH-LEVEL MODULE BREAKDOWN

### Backend Modules (Express API)

#### `/api/auth`
- `POST /api/auth/register` — Create new user account
- `POST /api/auth/login` — Authenticate user, return JWT tokens
- `POST /api/auth/refresh` — Refresh access token using refresh token
- `POST /api/auth/logout` — Invalidate refresh token
- `GET /api/auth/me` — Get current authenticated user

#### `/api/projects`
- `GET /api/projects` — List all projects for current user (filtered by membership)
- `POST /api/projects` — Create new project (Admin only)
- `GET /api/projects/:id` — Get project details
- `PATCH /api/projects/:id` — Update project (Admin only)
- `DELETE /api/projects/:id` — Soft-delete project (Admin only)
- `POST /api/projects/:id/archive` — Archive project (Admin only)
- `POST /api/projects/:id/members` — Add member to project (Admin only)
- `DELETE /api/projects/:id/members/:userId` — Remove member (Admin only, enforces last-admin rule)

#### `/api/tasks`
- `GET /api/tasks` — List tasks (filterable by project, assignee, status, priority)
- `POST /api/tasks` — Create new task
- `GET /api/tasks/:id` — Get task details with full activity log
- `PATCH /api/tasks/:id` — Update task (enforces permission rules)
- `DELETE /api/tasks/:id` — Soft-delete task (creator or Admin only)
- `GET /api/tasks/my-tasks` — Get all tasks assigned to current user across projects

#### `/api/comments`
- `POST /api/tasks/:taskId/comments` — Add comment to task
- `PATCH /api/comments/:id` — Edit comment (15-min window, author only)
- `DELETE /api/comments/:id` — Soft-delete comment (author only)

#### `/api/users`
- `GET /api/users` — List all users (Admin only)
- `GET /api/users/:id` — Get user profile
- `PATCH /api/users/:id` — Update user profile (self or Admin)
- `PATCH /api/users/:id/role` — Update user role (Admin only)

#### `/api/reports` (Admin only)
- `GET /api/reports/completion-trends` — Task completion data over time
- `GET /api/reports/team-workload` — Workload distribution by team member
- `GET /api/reports/status-distribution` — Count of tasks by status

#### `/api/notifications`
- `GET /api/notifications` — Get notifications for current user
- `PATCH /api/notifications/:id/read` — Mark notification as read
- `PATCH /api/notifications/read-all` — Mark all notifications as read

---

### Frontend Modules (Next.js App Router)

#### Public Routes
- `/login` — Login and registration page (FEAT-001)
- `/forgot-password` — Password reset flow

#### Protected Routes (Authenticated Users)
- `/dashboard` — Personal dashboard with task summary and activity feed (FEAT-005)
- `/projects` — Project list view (FEAT-002)
- `/projects/[id]` — Project detail with task table (FEAT-002, FEAT-003)
- `/projects/[id]/board` — Kanban board view (FEAT-009)
- `/tasks/my-tasks` — Cross-project "My Tasks" view (FEAT-004)
- `/settings` — User profile and notification preferences
- `/settings/account` — Account settings, password change

#### Admin-Only Routes
- `/admin/reports` — Analytics and reporting dashboard (FEAT-010)
- `/admin/users` — User management (role assignment)

---

### Shared Modules & Utilities

#### Backend Shared
- **Validation Schemas** (`/lib/validation`) — Zod schemas for all API inputs
- **Authentication Middleware** (`/middleware/auth.ts`) — JWT verification, role checks
- **Error Handling** (`/middleware/errorHandler.ts`) — Centralized error responses
- **Database Models** (`/prisma/schema.prisma`) — Prisma ORM schema
- **Email Service** (`/services/email.ts`) — Transactional emails via Resend/Nodemailer
- **Notification Service** (`/services/notifications.ts`) — In-app notification creation
- **Scheduler** (`/jobs/reminders.ts`) — Daily cron for due date reminders

#### Frontend Shared
- **API Client** (`/lib/api.ts`) — Fetch wrapper with auth token handling
- **Auth Context** (`/contexts/AuthContext.tsx`) — Global auth state
- **UI Components** (`/components`) — Reusable shadcn/ui components
- **Validation Schemas** (`/lib/validation`) — Shared Zod schemas with backend
- **Hooks** (`/hooks`) — Custom React hooks for data fetching

---

## 7. RELEASE ROADMAP

### Phase 1: Foundation & Core Workflows (MVP Launch)
**Target:** Week 8  
**Features:** FEAT-001, FEAT-002, FEAT-003, FEAT-004  
**Goal:** Deliver minimum viable product that replaces spreadsheet-based task tracking

**Deliverables:**
- User authentication with role-based access control
- Project creation and member management
- Task CRUD with statuses, priorities, and due dates
- Task assignment and "My Tasks" view
- In-app notifications for task assignments

**Success Metrics:**
- Users can create projects and tasks without errors
- Task assignment flow works end-to-end
- All P0 business rules enforced by backend

---

### Phase 2: Collaboration & Discoverability (Post-MVP)
**Target:** Week 12 (4 weeks after Phase 1)  
**Features:** FEAT-005, FEAT-006, FEAT-007, FEAT-008  
**Goal:** Enable team collaboration and improve task discoverability

**Deliverables:**
- Dashboard with activity feed and project health cards
- Comment threads on tasks with 15-min edit window
- Custom labels and advanced filtering
- Due date email reminders with user preferences

**Success Metrics:**
- Average time to find a task reduces by 40%
- Comment adoption rate >60% of active users
- Email reminder delivery rate >95%

---

### Phase 3: Visualization & Analytics (Future)
**Target:** Week 16 (4 weeks after Phase 2)  
**Features:** FEAT-009, FEAT-010  
**Goal:** Provide alternative views and data-driven insights

**Deliverables:**
- Kanban board view with drag-and-drop
- Admin analytics dashboard with charts and workload table
- CSV export for reporting

**Success Metrics:**
- Kanban board accounts for >30% of task interactions
- Admins generate at least 1 report per week
- Completion trend data informs sprint planning

---

## 8. OPEN QUESTIONS

The following questions require stakeholder input before finalizing specs:

### User Permissions & Workflows
1. **Should Viewers be able to post comments, or is Viewer role strictly read-only including comments?**
   - **Assumption:** Viewers cannot post comments (strict read-only). Commenting requires Member role.
   - **Impact:** Affects comment creation permission logic and UI (hide comment input for Viewers)

2. **What is the maximum number of members per project (hard cap)?**
   - **Assumption:** No hard cap for MVP, but recommend 50 members per project for performance
   - **Impact:** May need pagination in member list UI and query optimization

3. **Should deleted tasks be restorable through a UI, or is soft-delete only for database safety?**
   - **Assumption:** Soft-delete is for DB safety only; no "Restore" UI in MVP. Restoration requires direct DB access.
   - **Impact:** If restoration UI is needed, add to Phase 2 backlog

4. **Is there a need for a public project share link (share with non-registered users)?**
   - **Assumption:** No. All project access requires authentication and explicit membership.
   - **Impact:** If public sharing is needed later, requires new permission model and anonymous access

5. **Should task order within a list/column be manually sortable via drag-and-drop?**
   - **Assumption:** Phase 1 uses automatic sorting (by due date, priority, created date). Phase 3 Kanban board adds drag-to-reorder.
   - **Impact:** Phase 1 does not store `order` or `position` fields; Phase 3 migration adds them

### Technical & Integration
6. **What is the preferred email provider for production (Resend vs. SendGrid vs. AWS SES)?**
   - **Assumption:** Resend for production (modern API, good DX). Nodemailer for local dev.
   - **Impact:** Affects email service configuration and cost projections

7. **Should we support login "remember me" beyond 7-day refresh token expiry?**
   - **Assumption:** No. 7-day refresh token is security best practice; users re-login after 7 days of inactivity.
   - **Impact:** If longer sessions required, adjust refresh token TTL and security review

8. **Are there any compliance requirements (SOC 2, GDPR, HIPAA)?**
   - **Assumption:** Internal tool with no compliance requirements for MVP. Standard security practices apply.
   - **Impact:** If compliance needed, adds audit logging, data retention policies, encryption requirements

---

**Document Owner:** Product Team  
**Technical Lead:** Engineering Lead  
**Reviewed By:** [Pending]  
**Approved By:** [Pending]

---

*This PRD serves as the authoritative source of truth for the Team Task Management System MVP. All feature work should reference this document and associated feature PRDs in `.ai-dev/docs/PRD/features/`.*
