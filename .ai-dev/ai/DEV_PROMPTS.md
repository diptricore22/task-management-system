## SECTION 0 — Session Start
When to use: Paste this as Message 1 at the start of every development session.

Files to provide:
- `.ai-dev/ai/AI_RULES.md`
- `.ai-dev/ai/PROJECT_CONTEXT.md`

```markdown
We are continuing development on Team Task Management System.

Session bootstrap context:
- Read `.ai-dev/ai/AI_RULES.md` first and treat it as non-negotiable.
- Read `.ai-dev/ai/PROJECT_CONTEXT.md` second and use it as the active project source of truth.

Current phase: <Phase 1 | Phase 2 | Phase 3>

Execution rules for this session:
- Enforce role model: Admin, Member, Viewer.
- Enforce soft-delete (`deleted_at`) across all entities.
- Use Next.js API proxy pattern (`/api/[...path]/route.ts`) for browser-side API access.
- Use Prisma ORM + Zod validation; no raw SQL and no unvalidated input.
- Keep API response shape consistent with project spec.

Acknowledge loaded context, then wait for the task prompt.
```

## SECTION 1 — Project Scaffold
When to use: Initialize or regenerate the monorepo scaffold exactly to project architecture standards.

Files to provide:
- `.ai-dev/ai/AI_RULES.md`
- `.ai-dev/ai/PROJECT_CONTEXT.md`
- `.ai-dev/docs/ARCHITECTURE.md`

```markdown
Scaffold Team Task Management System using this exact stack and structure:

Stack constraints:
- Frontend: Next.js 14.x App Router + TypeScript + Tailwind CSS + shadcn/ui
- Backend: Express 4.18+ + TypeScript
- Database: PostgreSQL 15+ + Prisma 5.x
- Validation: Zod 3.x
- Auth: JWT in httpOnly cookies (access 15m, refresh 7d)
- Package manager: npm only

Create this workspace layout:
- `apps/web` for Next.js app
- `apps/api` for Express API
- `packages/types` optional shared types package
- root-level workspace scripts for `dev`, `dev:web`, `dev:api`, `build`, `test`, `lint`, `type-check`

Create frontend app routes from architecture:
- `/auth/login`
- `/auth/register`
- `/auth/invite/[token]`
- `/dashboard`
- `/projects`
- `/projects/[id]`
- `/projects/[id]/board`
- `/tasks/my-tasks`
- `/admin/reports`
- `/admin/users`
- `/settings`
- `/settings/account`

Create backend module directories:
- `auth`, `projects`, `tasks`, `assignments`, `dashboard`, `comments`, `labels`, `notifications`, `kanban`, `reports`

Create and wire env validation with these variables:
- `DATABASE_URL`
- `DIRECT_URL`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `RESEND_API_KEY`
- `EMAIL_FROM`
- `SMTP_HOST`
- `SMTP_PORT`
- `NODE_ENV`
- `API_PORT`
- `API_BASE_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `BCRYPT_ROUNDS`
- `RATE_LIMIT_WINDOW_MS`
- `RATE_LIMIT_MAX`
- `ENABLE_EMAIL_NOTIFICATIONS`
- `ENABLE_REGISTRATION`

Scaffold commands to apply:
1. Create root workspace and npm workspaces config.
2. Scaffold Next.js app in `apps/web` with TypeScript + Tailwind.
3. Initialize Express TypeScript app in `apps/api`.
4. Install Prisma in API app and initialize `prisma/schema.prisma`.
5. Add shared lint/test/typecheck scripts at root and app-level scripts.
6. Create `apps/web/src/app/api/[...path]/route.ts` proxy to API base URL.

Output required:
- Final directory tree.
- `package.json` scripts (root + each app).
- `.env.example` containing all required variables above.
- Any assumptions or deviations from architecture.
```

## SECTION 2 — Database: Initial Schema
When to use: Create the first complete Prisma schema for all core entities.

Files to provide:
- `.ai-dev/ai/AI_RULES.md`
- `.ai-dev/ai/PROJECT_CONTEXT.md`
- `.ai-dev/docs/SPECS/DATABASE_SPEC.md`

```markdown
Build the initial Prisma schema for Team Task Management System exactly from spec.

Define all tables/models explicitly:
- `users`
- `refresh_tokens`
- `invite_tokens`
- `projects`
- `project_members`
- `tasks`
- `comments`
- `labels`
- `task_labels`
- `activity_logs`
- `notifications`
- `notification_preferences`

Define enums:
- `UserRole`: ADMIN, MEMBER, VIEWER
- `ProjectStatus`: ACTIVE, ARCHIVED
- `ProjectRole`: ADMIN, MEMBER, VIEWER
- `TaskStatus`: TODO, IN_PROGRESS, IN_REVIEW, BLOCKED, DONE
- `TaskPriority`: LOW, MEDIUM, HIGH, CRITICAL

Mandatory column convention for all soft-deletable entities:
- `id` (UUID PK)
- `created_at`
- `updated_at`
- `deleted_at` (nullable)

Key relationships to enforce:
- users -> refresh_tokens (1:N)
- users -> invite_tokens via role/email workflow
- users <-> projects via `project_members` (M:N)
- projects -> tasks (1:N)
- tasks -> comments (1:N)
- tasks <-> labels via `task_labels` (M:N)
- projects/tasks/users -> activity_logs
- users -> notifications (1:N)
- users -> notification_preferences (1:1)

Business-critical relational constraints:
- Task must belong to exactly one project.
- Task assignee must reference a user.
- `project_members` unique on `(project_id, user_id)`.
- `task_labels` composite primary key `(task_id, label_id)`.

Include indexes from spec for filtering and soft-delete performance.

Output required:
- Full `schema.prisma`.
- Short section mapping each model to its business purpose.
```

## SECTION 3 — Database: Initial Migration & Seed
When to use: Generate and seed the first migration in a new environment.

Files to provide:
- `.ai-dev/ai/AI_RULES.md`
- `.ai-dev/ai/PROJECT_CONTEXT.md`
- `.ai-dev/docs/SPECS/DATABASE_SPEC.md`

```markdown
Create and apply the first database migration and seed for Team Task Management System.

Migration requirements:
- Migration name must be: `init_team_task_management_system_schema`
- Generate migration from Prisma schema without manual SQL edits.
- Include all enums, constraints, indexes, and soft-delete columns.

Seed requirements:
- Seed role personas aligned with security model:
  - Admin
  - Member
  - Viewer
- Seed baseline users for each role.
- Seed one starter project and project memberships for all 3 personas.
- Seed a few tasks with mixed status/priority/due dates.
- Seed notification preferences row(s).

Commands to execute:
- `npx prisma migrate dev --name init_team_task_management_system_schema`
- `npx prisma db seed`

Output required:
- Migration folder created path.
- Seed script summary (records inserted per table).
- Validation query checklist proving data exists and soft-delete defaults are null.
```

## SECTION 4 — Authentication Module
When to use: Implement end-to-end auth, profile, invite, and session lifecycle.

Files to provide:
- `.ai-dev/ai/AI_RULES.md`
- `.ai-dev/ai/PROJECT_CONTEXT.md`
- `.ai-dev/docs/PRD/features/FEAT_001_auth.md`
- `.ai-dev/docs/SPECS/API_SPEC.md`
- `.ai-dev/docs/SECURITY.md`

```markdown
Implement FEAT-001 Authentication & User Management for Team Task Management System.

Roles and permissions to enforce:
- Roles: Admin, Member, Viewer
- Admin-only action: invitation (`POST /api/auth/invite`)
- All protected endpoints require valid auth

Implement these endpoints exactly:
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/refresh`
- `POST /api/auth/invite`
- `POST /api/auth/invite/:token/accept`
- `GET /api/users/me`
- `PATCH /api/users/me`

JWT/cookie config:
- Access token expiry: 15 minutes
- Refresh token expiry: 7 days
- Store in httpOnly cookies
- `Secure` + `SameSite=Strict`
- Refresh token rotation and invalidation on logout

Security requirements:
- bcrypt hashing >= 12 rounds
- lock account 15 minutes after 5 failed attempts
- generic invalid credential message
- never return `password_hash`, token hashes, or raw invite token in API responses
- rate-limit login endpoint per security spec

Tables to use:
- `users`
- `refresh_tokens`
- `invite_tokens`

Acceptance criteria to cover (from PRD):
- Story 1 AC1-AC3
- Story 2 AC1-AC3
- Story 3 AC1-AC2
- Story 4 AC1-AC2
- Story 5 AC1-AC3
- Story 6 AC1-AC2

Output required:
- Route handlers + service layer + Zod schemas + middleware.
- Cookie handling implementation details.
- Test mapping to AUTH-U001..AUTH-U011 and AUTH-I001..AUTH-I016.
```

## SECTION 5 — Backend: one subsection per non-auth P0/P1 feature
### Backend: Project Management (CRUD) (FEAT-002)
When to use: Build project lifecycle and project-scope authorization rules.

Files to provide:
- `.ai-dev/ai/AI_RULES.md`
- `.ai-dev/ai/PROJECT_CONTEXT.md`
- `.ai-dev/docs/PRD/features/FEAT_002_projects.md`
- `.ai-dev/docs/SPECS/API_SPEC.md`
- `.ai-dev/docs/SPECS/DATABASE_SPEC.md`

```markdown
Implement backend FEAT-002 Project Management (CRUD).

Endpoints to implement:
- `POST /api/projects`
- `GET /api/projects`
- `GET /api/projects/:id`
- `PATCH /api/projects/:id`
- `PATCH /api/projects/:id/archive`
- `DELETE /api/projects/:id`
- `GET /api/projects/:id/members`
- `POST /api/projects/:id/members`
- `PATCH /api/projects/:id/members/:userId`
- `DELETE /api/projects/:id/members/:userId`

Tables involved:
- `projects`
- `project_members`
- `users`
- `tasks` (delete/archive warning and integrity)
- `activity_logs`

Role restrictions:
- Admin: create/update/archive/delete project, manage members
- Member/Viewer: read only projects where they are members

Acceptance criteria to enforce:
- Story 1 AC1-AC3
- Story 2 AC1-AC3
- Story 3 AC1-AC2
- Story 4 AC1-AC3
- Story 5 AC1-AC3

Critical rules:
- Soft-delete only (`deleted_at`)
- Last admin cannot be removed from project
- Membership-scoped reads on all project endpoints

Return implementation with controller/service/validation split and test mapping to PROJ-U001..PROJ-U010 and PROJ-I001..PROJ-I017.
```

### Backend: Task Management (CRUD + Statuses) (FEAT-003)
When to use: Implement task creation, listing, detail, update, and soft-delete.

Files to provide:
- `.ai-dev/ai/AI_RULES.md`
- `.ai-dev/ai/PROJECT_CONTEXT.md`
- `.ai-dev/docs/PRD/features/FEAT_003_tasks.md`
- `.ai-dev/docs/SPECS/API_SPEC.md`
- `.ai-dev/docs/SPECS/DATABASE_SPEC.md`

```markdown
Implement backend FEAT-003 Task Management.

Endpoints to implement:
- `POST /api/projects/:projectId/tasks`
- `GET /api/projects/:projectId/tasks`
- `GET /api/tasks/:id`
- `PATCH /api/tasks/:id`
- `DELETE /api/tasks/:id`

Tables involved:
- `tasks`
- `projects`
- `project_members`
- `users`
- `activity_logs`

Role restrictions:
- Admin/Member project members can create/edit tasks
- Viewer cannot create/edit/delete
- Delete allowed for task creator or Admin only

Acceptance criteria to enforce:
- Story 1 AC1-AC3
- Story 2 AC1-AC3
- Story 3 AC1-AC2
- Story 4 AC1-AC3
- Story 5 AC1-AC3

Critical rules:
- Task belongs to exactly one project
- Soft-delete only
- Assignee must be member of the same project
- Task filters: status, priority, assignee

Return implementation with pagination, filters, sort handling, and tests mapped to TASK-U001..TASK-U010 and TASK-I001..TASK-I017.
```

### Backend: Task Assignment & Team Members (FEAT-004)
When to use: Implement member management, assignment rules, and my-tasks aggregation.

Files to provide:
- `.ai-dev/ai/AI_RULES.md`
- `.ai-dev/ai/PROJECT_CONTEXT.md`
- `.ai-dev/docs/PRD/features/FEAT_004_assignments.md`
- `.ai-dev/docs/SPECS/API_SPEC.md`
- `.ai-dev/docs/SPECS/DATABASE_SPEC.md`

```markdown
Implement backend FEAT-004 Task Assignment & Team Members.

Endpoints to implement:
- `GET /api/projects/:id/members`
- `POST /api/projects/:id/members`
- `PATCH /api/projects/:id/members/:userId`
- `DELETE /api/projects/:id/members/:userId`
- `GET /api/users/me/tasks`
- `GET /api/notifications`
- `PATCH /api/notifications/:id/read`

Tables involved:
- `project_members`
- `tasks`
- `projects`
- `users`
- `notifications`

Role restrictions:
- Admin manages project membership and role changes
- Admin/Member can assign tasks to valid project members
- Viewer is read-only

Acceptance criteria to enforce:
- Story 1 AC1-AC3
- Story 2 AC1-AC3
- Story 3 AC1-AC3
- Story 4 AC1-AC3

Critical rules:
- Cannot assign task to non-project member
- Removing member unassigns their open tasks (`assignee_id = null`)
- Last admin protection remains enforced

Return implementation and tests mapped to MEM-U001..MEM-U009 and MEM-I001..MEM-I010.
```

### Backend: Dashboard & Activity Feed (FEAT-005)
When to use: Implement aggregated dashboard endpoints with strict member scoping.

Files to provide:
- `.ai-dev/ai/AI_RULES.md`
- `.ai-dev/ai/PROJECT_CONTEXT.md`
- `.ai-dev/docs/PRD/features/FEAT_005_dashboard.md`
- `.ai-dev/docs/SPECS/API_SPEC.md`
- `.ai-dev/docs/SPECS/DATABASE_SPEC.md`

```markdown
Implement backend FEAT-005 Dashboard & Activity Feed.

Endpoints to implement:
- `GET /api/dashboard/summary`
- `GET /api/dashboard/projects`
- `GET /api/dashboard/activity`
- `GET /api/dashboard/admin/overview`

Tables involved:
- `tasks`
- `projects`
- `project_members`
- `activity_logs`
- `users`

Role restrictions:
- All authenticated roles can access personal scoped dashboard endpoints
- Admin-only for `GET /api/dashboard/admin/overview`

Acceptance criteria to enforce:
- Story 1 AC1-AC3
- Story 2 AC1-AC3
- Story 3 AC1-AC3
- Story 4 AC1-AC3

Critical rules:
- Never leak project/task data outside user memberships
- Avoid N+1 queries; use Prisma aggregation/grouping

Return implementation and tests mapped to DASH-U001..DASH-U008 and DASH-I001..DASH-I007.
```

### Backend: Comments & Task Activity Log (FEAT-006)
When to use: Add task comments with edit-window rules and immutable activity history.

Files to provide:
- `.ai-dev/ai/AI_RULES.md`
- `.ai-dev/ai/PROJECT_CONTEXT.md`
- `.ai-dev/docs/PRD/features/FEAT_006_comments.md`
- `.ai-dev/docs/SPECS/API_SPEC.md`
- `.ai-dev/docs/SPECS/DATABASE_SPEC.md`

```markdown
Implement backend FEAT-006 Comments & Task Activity Log.

Endpoints to implement:
- `GET /api/tasks/:id/comments`
- `POST /api/tasks/:id/comments`
- `PATCH /api/comments/:id`
- `DELETE /api/comments/:id`

Tables involved:
- `comments`
- `activity_logs`
- `tasks`
- `project_members`
- `users`

Role restrictions:
- Admin/Member can post comments in projects they belong to
- Viewer can read only
- Delete comment by author or Admin

Acceptance criteria to enforce:
- Story 1 AC1-AC3
- Story 2 AC1-AC3
- Story 3 AC1-AC3
- Story 4 AC1-AC3

Critical rules:
- 15-minute edit window enforced server-side
- Activity log entries immutable
- Soft-delete comment records

Return implementation and tests mapped to COM-U001..COM-U010 and COM-I001..COM-I012.
```

### Backend: Labels & Filtering (FEAT-007)
When to use: Implement label CRUD and multi-criteria task filtering.

Files to provide:
- `.ai-dev/ai/AI_RULES.md`
- `.ai-dev/ai/PROJECT_CONTEXT.md`
- `.ai-dev/docs/PRD/features/FEAT_007_labels.md`
- `.ai-dev/docs/SPECS/API_SPEC.md`
- `.ai-dev/docs/SPECS/DATABASE_SPEC.md`

```markdown
Implement backend FEAT-007 Labels, Priorities & Filtering.

Endpoints to implement:
- `GET /api/projects/:id/labels`
- `POST /api/projects/:id/labels`
- `PATCH /api/labels/:id`
- `DELETE /api/labels/:id`
- `POST /api/tasks/:id/labels`
- `DELETE /api/tasks/:id/labels/:labelId`
- Extend `GET /api/projects/:projectId/tasks` filtering and sorting

Tables involved:
- `labels`
- `task_labels`
- `tasks`
- `projects`
- `project_members`

Role restrictions:
- Project Admin can create/edit/delete labels
- Admin/Member can assign/remove labels on tasks
- Viewer read-only

Acceptance criteria to enforce:
- Story 1 AC1-AC3
- Story 2 AC1-AC3
- Story 3 AC1-AC3
- Story 4 AC1-AC3

Critical rules:
- Label uniqueness per project
- AND logic across filter categories, OR logic within a category
- Soft-delete labels where spec requires soft-delete behavior

Return implementation with query-param parsing and URL-safe filter behavior.
```

### Backend: Due Date Reminders & Notifications (FEAT-008)
When to use: Implement notification preferences and scheduled reminder delivery.

Files to provide:
- `.ai-dev/ai/AI_RULES.md`
- `.ai-dev/ai/PROJECT_CONTEXT.md`
- `.ai-dev/docs/PRD/features/FEAT_008_notifications.md`
- `.ai-dev/docs/SPECS/API_SPEC.md`
- `.ai-dev/docs/SPECS/DATABASE_SPEC.md`

```markdown
Implement backend FEAT-008 Due Dates, Reminders & Notifications.

Endpoints to implement:
- `GET /api/notifications`
- `PATCH /api/notifications/read-all`
- `PATCH /api/notifications/:id/read`
- `GET /api/users/me/notification-preferences`
- `PATCH /api/users/me/notification-preferences`

Tables involved:
- `notifications`
- `notification_preferences`
- `tasks`
- `users`

Role restrictions:
- All authenticated users manage their own notifications/preferences only

Acceptance criteria to enforce:
- Story 1 AC1-AC3
- Story 2 AC1-AC3
- Story 3 AC1-AC2
- Story 4 AC1-AC3

Critical rules:
- Daily reminder job at 08:00 server time
- Overdue reminders deduplicated using `last_due_notified_at`
- Respect per-user email preference toggles

Return implementation including scheduler job, email service integration points, and failure-safe batch processing.
```

## SECTION 6 — Frontend: Base Layout & Shell
When to use: Build the global app shell, navigation, and role-aware layout behavior.

Files to provide:
- `.ai-dev/ai/AI_RULES.md`
- `.ai-dev/ai/PROJECT_CONTEXT.md`
- `.ai-dev/docs/ARCHITECTURE.md`
- `.ai-dev/ui/UI_GUIDELINES.md`
- `.ai-dev/PROJECT_BRIEF.md`

Design reference:
[ATTACH FILE: .ai-dev/ui/pages/dashboard.html]

```markdown
Implement the frontend base layout shell for Team Task Management System.

Use architecture routes and nav structure:
- Public routes: `/auth/login`, `/auth/register`, `/auth/invite/[token]`
- Protected routes: `/dashboard`, `/projects`, `/projects/[id]`, `/projects/[id]/board`, `/tasks/my-tasks`, `/settings`, `/settings/account`
- Admin routes: `/admin/reports`, `/admin/users`

Role-based layout rules:
- Admin: full navigation including admin routes
- Member: hide admin routes
- Viewer: read-only UX affordances and disabled/hide create-edit-delete actions

Layout requirements:
- Responsive sidebar + top header shell
- Shared loading and error boundaries
- Route guards for auth and role checks
- Mobile-first behavior from UI guidelines

Design implementation requirements:
- Follow `.ai-dev/ui/UI_GUIDELINES.md` tokens for color/spacing/typography
- Match visual structure from attached dashboard reference

Output required:
- Root layout structure
- Sidebar and header component breakdown
- Route guard strategy
- Role-based nav map
```

## SECTION 7 — Frontend: one subsection per P0/P1 feature
### Frontend: Authentication & User Management (FEAT-001)
When to use: Build auth screens, flows, and profile updates.

Files to provide:
- `.ai-dev/ai/AI_RULES.md`
- `.ai-dev/ai/PROJECT_CONTEXT.md`
- `.ai-dev/docs/PRD/features/FEAT_001_auth.md`
- `.ai-dev/docs/SPECS/API_SPEC.md`
- `.ai-dev/ui/UI_GUIDELINES.md`
- `.ai-dev/PROJECT_BRIEF.md`

Design reference:
[ATTACH FILE: .ai-dev/ui/pages/login.html]

```markdown
Implement FEAT-001 frontend screens and flows.

Routes to implement:
- `/auth/login`
- `/auth/register`
- `/auth/invite/[token]`
- profile view under `/settings`

API endpoints to call:
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/refresh`
- `POST /api/auth/invite`
- `POST /api/auth/invite/:token/accept`
- `GET /api/users/me`
- `PATCH /api/users/me`

User stories to satisfy:
- Story 1 through Story 6 in FEAT_001_auth.md

UI behavior:
- Inline validation and server error states
- Lockout messaging for failed attempts
- Secure redirect handling after login/logout
- Invite acceptance flow with token route
```

### Frontend: Project Management (CRUD) (FEAT-002)
When to use: Build project list/detail/settings experiences.

Files to provide:
- `.ai-dev/ai/AI_RULES.md`
- `.ai-dev/ai/PROJECT_CONTEXT.md`
- `.ai-dev/docs/PRD/features/FEAT_002_projects.md`
- `.ai-dev/docs/SPECS/API_SPEC.md`
- `.ai-dev/ui/UI_GUIDELINES.md`
- `.ai-dev/PROJECT_BRIEF.md`

Design reference:
[ATTACH FILE: .ai-dev/ui/pages/project-list.html]
[ATTACH FILE: .ai-dev/ui/pages/project-detail.html]

```markdown
Implement FEAT-002 frontend for project management.

Routes to implement:
- `/projects`
- `/projects/[id]`
- project settings area under `/projects/[id]/settings`

API endpoints to call:
- `POST /api/projects`
- `GET /api/projects`
- `GET /api/projects/:id`
- `PATCH /api/projects/:id`
- `PATCH /api/projects/:id/archive`
- `DELETE /api/projects/:id`
- `GET /api/projects/:id/members`

User stories to satisfy:
- Story 1 through Story 5 in FEAT_002_projects.md

UI behavior:
- create/edit/archive/delete flows with confirmation states
- active vs archived views
- role-aware action controls (Admin only for mutating actions)
```

### Frontend: Task Management (CRUD + Statuses) (FEAT-003)
When to use: Build project task list, detail, and task editing UX.

Files to provide:
- `.ai-dev/ai/AI_RULES.md`
- `.ai-dev/ai/PROJECT_CONTEXT.md`
- `.ai-dev/docs/PRD/features/FEAT_003_tasks.md`
- `.ai-dev/docs/SPECS/API_SPEC.md`
- `.ai-dev/ui/UI_GUIDELINES.md`
- `.ai-dev/PROJECT_BRIEF.md`

Design reference:
[ATTACH FILE: .ai-dev/ui/pages/project-detail.html]
[ATTACH FILE: .ai-dev/ui/pages/task-detail.html]

```markdown
Implement FEAT-003 frontend for task management.

Routes to implement:
- `/projects/[id]`
- task detail UI linked from project task list

API endpoints to call:
- `POST /api/projects/:projectId/tasks`
- `GET /api/projects/:projectId/tasks`
- `GET /api/tasks/:id`
- `PATCH /api/tasks/:id`
- `DELETE /api/tasks/:id`

User stories to satisfy:
- Story 1 through Story 5 in FEAT_003_tasks.md

UI behavior:
- fast create task workflow
- inline status updates
- filter bar for status/priority/assignee
- delete confirmation and optimistic UI updates where safe
```

### Frontend: Task Assignment & Team Members (FEAT-004)
When to use: Build membership management and my-tasks user workspace.

Files to provide:
- `.ai-dev/ai/AI_RULES.md`
- `.ai-dev/ai/PROJECT_CONTEXT.md`
- `.ai-dev/docs/PRD/features/FEAT_004_assignments.md`
- `.ai-dev/docs/SPECS/API_SPEC.md`
- `.ai-dev/ui/UI_GUIDELINES.md`
- `.ai-dev/PROJECT_BRIEF.md`

Design reference:
[ATTACH FILE: .ai-dev/ui/pages/project-detail.html]
[ATTACH FILE: .ai-dev/ui/pages/task-detail.html]

```markdown
Implement FEAT-004 frontend for assignments and team members.

Routes to implement:
- project members settings view under `/projects/[id]/settings/members`
- `/tasks/my-tasks`

API endpoints to call:
- `GET /api/projects/:id/members`
- `POST /api/projects/:id/members`
- `PATCH /api/projects/:id/members/:userId`
- `DELETE /api/projects/:id/members/:userId`
- `GET /api/users/me/tasks`
- `GET /api/notifications`
- `PATCH /api/notifications/:id/read`

User stories to satisfy:
- Story 1 through Story 4 in FEAT_004_assignments.md

UI behavior:
- searchable add-member modal
- assignee picker with project-members only
- grouped my-tasks view with done section
```

### Frontend: Dashboard & Activity Feed (FEAT-005)
When to use: Build the default post-login dashboard experience.

Files to provide:
- `.ai-dev/ai/AI_RULES.md`
- `.ai-dev/ai/PROJECT_CONTEXT.md`
- `.ai-dev/docs/PRD/features/FEAT_005_dashboard.md`
- `.ai-dev/docs/SPECS/API_SPEC.md`
- `.ai-dev/ui/UI_GUIDELINES.md`
- `.ai-dev/PROJECT_BRIEF.md`

Design reference:
[ATTACH FILE: .ai-dev/ui/pages/dashboard.html]

```markdown
Implement FEAT-005 frontend dashboard.

Route to implement:
- `/dashboard`

API endpoints to call:
- `GET /api/dashboard/summary`
- `GET /api/dashboard/projects`
- `GET /api/dashboard/activity`
- `GET /api/dashboard/admin/overview`

User stories to satisfy:
- Story 1 through Story 4 in FEAT_005_dashboard.md

UI behavior:
- stat cards for due today/overdue/in progress
- project health cards and admin-only health table
- activity feed with pagination/load more
- responsive two-column desktop to stacked mobile layout
```

### Frontend: Comments & Task Activity Log (FEAT-006)
When to use: Build comment composer, thread, and merged activity feed on task detail.

Files to provide:
- `.ai-dev/ai/AI_RULES.md`
- `.ai-dev/ai/PROJECT_CONTEXT.md`
- `.ai-dev/docs/PRD/features/FEAT_006_comments.md`
- `.ai-dev/docs/SPECS/API_SPEC.md`
- `.ai-dev/ui/UI_GUIDELINES.md`
- `.ai-dev/PROJECT_BRIEF.md`

Design reference:
[ATTACH FILE: .ai-dev/ui/pages/task-detail.html]

```markdown
Implement FEAT-006 frontend comments and task activity.

Route context:
- task detail screen linked from project task list

API endpoints to call:
- `GET /api/tasks/:id/comments`
- `POST /api/tasks/:id/comments`
- `PATCH /api/comments/:id`
- `DELETE /api/comments/:id`

User stories to satisfy:
- Story 1 through Story 4 in FEAT_006_comments.md

UI behavior:
- comment input with 5000-char limit feedback
- edit window affordance only for recent comments
- merged chronological comments + activity timeline
- role-aware action buttons (author/admin/delete, author/edit-within-window)
```

### Frontend: Labels, Priorities & Filtering (FEAT-007)
When to use: Build label management and advanced list filtering UX.

Files to provide:
- `.ai-dev/ai/AI_RULES.md`
- `.ai-dev/ai/PROJECT_CONTEXT.md`
- `.ai-dev/docs/PRD/features/FEAT_007_labels.md`
- `.ai-dev/docs/SPECS/API_SPEC.md`
- `.ai-dev/ui/UI_GUIDELINES.md`
- `.ai-dev/PROJECT_BRIEF.md`

Design reference:
[ATTACH FILE: .ai-dev/ui/pages/project-detail.html]

```markdown
Implement FEAT-007 frontend labels and filtering.

Route context:
- `/projects/[id]` task list with filter bar
- project settings labels management area

API endpoints to call:
- `GET /api/projects/:id/labels`
- `POST /api/projects/:id/labels`
- `PATCH /api/labels/:id`
- `DELETE /api/labels/:id`
- `POST /api/tasks/:id/labels`
- `DELETE /api/tasks/:id/labels/:labelId`
- `GET /api/projects/:projectId/tasks` with filter/sort query params

User stories to satisfy:
- Story 1 through Story 4 in FEAT_007_labels.md

UI behavior:
- label chips on task rows
- multi-select filters with active filter count
- sort controls and URL query state persistence
```

### Frontend: Due Dates, Reminders & Notifications (FEAT-008)
When to use: Build notification bell, list, and notification preference settings.

Files to provide:
- `.ai-dev/ai/AI_RULES.md`
- `.ai-dev/ai/PROJECT_CONTEXT.md`
- `.ai-dev/docs/PRD/features/FEAT_008_notifications.md`
- `.ai-dev/docs/SPECS/API_SPEC.md`
- `.ai-dev/ui/UI_GUIDELINES.md`
- `.ai-dev/PROJECT_BRIEF.md`

Design reference:
[ATTACH FILE: .ai-dev/ui/pages/dashboard.html]

```markdown
Implement FEAT-008 frontend due-date reminders and notifications UX.

Route context:
- global header notification bell
- profile/settings notification preferences page

API endpoints to call:
- `GET /api/notifications`
- `PATCH /api/notifications/read-all`
- `PATCH /api/notifications/:id/read`
- `GET /api/users/me/notification-preferences`
- `PATCH /api/users/me/notification-preferences`

User stories to satisfy:
- Story 1 through Story 4 in FEAT_008_notifications.md

UI behavior:
- unread badge on bell icon
- notification list with deep links to tasks
- per-type email preference toggles
- clear visual state for read vs unread notifications
```

## SECTION 8 — Testing: one subsection per P0/P1 feature
### Tests: Authentication & User Management (FEAT-001)
When to use: Implement and verify FEAT-001 coverage across backend, API, and frontend.

Files to provide:
- `.ai-dev/ai/AI_RULES.md`
- `.ai-dev/ai/PROJECT_CONTEXT.md`
- `.ai-dev/docs/PRD/features/FEAT_001_auth.md`
- `.ai-dev/docs/SPECS/API_SPEC.md`
- `.ai-dev/tests/TEST_PLAN.md`

```markdown
Write tests for FEAT-001 using existing test IDs and acceptance mappings.

Use these test IDs:
- Unit backend: AUTH-U001..AUTH-U011
- Integration API: AUTH-I001..AUTH-I016
- Frontend unit: AUTH-F001..AUTH-F008

Endpoints under test:
- `/api/auth/register`
- `/api/auth/login`
- `/api/auth/logout`
- `/api/auth/refresh`
- `/api/auth/invite`
- `/api/auth/invite/:token/accept`
- `/api/users/me`
- `/api/users/me`

AC mapping baseline:
- FEAT-001 Story 1 AC1-AC3
- FEAT-001 Story 2 AC1-AC3
- FEAT-001 Story 3 AC1-AC2
- FEAT-001 Story 4 AC1-AC2
- FEAT-001 Story 5 AC1-AC3
- FEAT-001 Story 6 AC1-AC2
```

### Tests: Project Management (CRUD) (FEAT-002)
When to use: Validate project/member lifecycle and role-gated access.

Files to provide:
- `.ai-dev/ai/AI_RULES.md`
- `.ai-dev/ai/PROJECT_CONTEXT.md`
- `.ai-dev/docs/PRD/features/FEAT_002_projects.md`
- `.ai-dev/docs/SPECS/API_SPEC.md`
- `.ai-dev/tests/TEST_PLAN.md`

```markdown
Write tests for FEAT-002 using existing test IDs and acceptance mappings.

Use these test IDs:
- Unit backend: PROJ-U001..PROJ-U010
- Integration API: PROJ-I001..PROJ-I017
- Frontend unit: PROJ-F001..PROJ-F009

Endpoints under test:
- `/api/projects`
- `/api/projects/:id`
- `/api/projects/:id/archive`
- `/api/projects/:id`
- `/api/projects/:id/members`
- `/api/projects/:id/members/:userId`

AC mapping baseline:
- FEAT-002 Story 1 AC1-AC3
- FEAT-002 Story 2 AC1-AC3
- FEAT-002 Story 3 AC1-AC2
- FEAT-002 Story 4 AC1-AC3
- FEAT-002 Story 5 AC1-AC3
```

### Tests: Task Management (CRUD + Statuses) (FEAT-003)
When to use: Validate task CRUD behavior, permissions, and filtering logic.

Files to provide:
- `.ai-dev/ai/AI_RULES.md`
- `.ai-dev/ai/PROJECT_CONTEXT.md`
- `.ai-dev/docs/PRD/features/FEAT_003_tasks.md`
- `.ai-dev/docs/SPECS/API_SPEC.md`
- `.ai-dev/tests/TEST_PLAN.md`

```markdown
Write tests for FEAT-003 using existing test IDs and acceptance mappings.

Use these test IDs:
- Unit backend: TASK-U001..TASK-U010
- Integration API: TASK-I001..TASK-I017
- Frontend unit: TASK-F001..TASK-F008

Endpoints under test:
- `/api/projects/:projectId/tasks`
- `/api/tasks/:id`

AC mapping baseline:
- FEAT-003 Story 1 AC1-AC3
- FEAT-003 Story 2 AC1-AC3
- FEAT-003 Story 3 AC1-AC2
- FEAT-003 Story 4 AC1-AC3
- FEAT-003 Story 5 AC1-AC3
```

### Tests: Task Assignment & Team Members (FEAT-004)
When to use: Validate member management, assignment constraints, and My Tasks behavior.

Files to provide:
- `.ai-dev/ai/AI_RULES.md`
- `.ai-dev/ai/PROJECT_CONTEXT.md`
- `.ai-dev/docs/PRD/features/FEAT_004_assignments.md`
- `.ai-dev/docs/SPECS/API_SPEC.md`
- `.ai-dev/tests/TEST_PLAN.md`

```markdown
Write tests for FEAT-004 using existing test IDs and acceptance mappings.

Use these test IDs:
- Unit backend: MEM-U001..MEM-U009
- Integration API: MEM-I001..MEM-I010
- Frontend unit: MEM-F001..MEM-F008

Endpoints under test:
- `/api/projects/:id/members`
- `/api/projects/:id/members/:userId`
- `/api/users/me/tasks`
- `/api/notifications`
- `/api/notifications/:id/read`

AC mapping baseline:
- FEAT-004 Story 1 AC1-AC3
- FEAT-004 Story 2 AC1-AC3
- FEAT-004 Story 3 AC1-AC3
- FEAT-004 Story 4 AC1-AC3
```

### Tests: Dashboard & Activity Feed (FEAT-005)
When to use: Validate dashboard aggregation correctness and role-based visibility.

Files to provide:
- `.ai-dev/ai/AI_RULES.md`
- `.ai-dev/ai/PROJECT_CONTEXT.md`
- `.ai-dev/docs/PRD/features/FEAT_005_dashboard.md`
- `.ai-dev/docs/SPECS/API_SPEC.md`
- `.ai-dev/tests/TEST_PLAN.md`

```markdown
Write tests for FEAT-005 using existing test IDs and acceptance mappings.

Use these test IDs:
- Unit backend: DASH-U001..DASH-U008
- Integration API: DASH-I001..DASH-I007
- Frontend unit: DASH-F001..DASH-F008

Endpoints under test:
- `/api/dashboard/summary`
- `/api/dashboard/projects`
- `/api/dashboard/activity`
- `/api/dashboard/admin/overview`

AC mapping baseline:
- FEAT-005 Story 1 AC1-AC3
- FEAT-005 Story 2 AC1-AC3
- FEAT-005 Story 3 AC1-AC3
- FEAT-005 Story 4 AC1-AC3
```

### Tests: Comments & Task Activity Log (FEAT-006)
When to use: Validate comment lifecycle and immutable activity feed behavior.

Files to provide:
- `.ai-dev/ai/AI_RULES.md`
- `.ai-dev/ai/PROJECT_CONTEXT.md`
- `.ai-dev/docs/PRD/features/FEAT_006_comments.md`
- `.ai-dev/docs/SPECS/API_SPEC.md`
- `.ai-dev/tests/TEST_PLAN.md`

```markdown
Write tests for FEAT-006 using existing test IDs and acceptance mappings.

Use these test IDs:
- Unit backend: COM-U001..COM-U010
- Integration API: COM-I001..COM-I012
- Frontend unit: COM-F001..COM-F010

Endpoints under test:
- `/api/tasks/:id/comments`
- `/api/comments/:id`

AC mapping baseline:
- FEAT-006 Story 1 AC1-AC3
- FEAT-006 Story 2 AC1-AC3
- FEAT-006 Story 3 AC1-AC3
- FEAT-006 Story 4 AC1-AC3
```

### Tests: Labels, Priorities & Filtering (FEAT-007)
When to use: Add dedicated FEAT-007 coverage where current test plan has feature references but no dedicated test ID block.

Files to provide:
- `.ai-dev/ai/AI_RULES.md`
- `.ai-dev/ai/PROJECT_CONTEXT.md`
- `.ai-dev/docs/PRD/features/FEAT_007_labels.md`
- `.ai-dev/docs/SPECS/API_SPEC.md`
- `.ai-dev/tests/TEST_PLAN.md`

```markdown
Create FEAT-007 tests using existing references plus new test IDs.

Current TEST_PLAN status:
- FEAT-007 appears in E2E Flow 4 AC references.
- No dedicated FEAT-007 unit/integration/frontend test ID series exists yet.

Define and implement new IDs in test files and update TEST_PLAN:
- Unit backend: `LBL-U001..LBL-U010`
- Integration API: `LBL-I001..LBL-I012`
- Frontend unit: `LBL-F001..LBL-F010`

Endpoints under test:
- `/api/projects/:id/labels`
- `/api/labels/:id`
- `/api/tasks/:id/labels`
- `/api/tasks/:id/labels/:labelId`
- `/api/projects/:projectId/tasks` (filter/sort)

AC mapping baseline:
- FEAT-007 Story 1 AC1-AC3
- FEAT-007 Story 2 AC1-AC3
- FEAT-007 Story 3 AC1-AC3
- FEAT-007 Story 4 AC1-AC3
```

### Tests: Due Dates, Reminders & Notifications (FEAT-008)
When to use: Add dedicated FEAT-008 coverage for notifications APIs and reminder jobs.

Files to provide:
- `.ai-dev/ai/AI_RULES.md`
- `.ai-dev/ai/PROJECT_CONTEXT.md`
- `.ai-dev/docs/PRD/features/FEAT_008_notifications.md`
- `.ai-dev/docs/SPECS/API_SPEC.md`
- `.ai-dev/tests/TEST_PLAN.md`

```markdown
Create FEAT-008 tests using existing references plus new test IDs.

Current TEST_PLAN status:
- No dedicated FEAT-008 unit/integration/frontend test ID series exists yet.

Define and implement new IDs in test files and update TEST_PLAN:
- Unit backend: `NOTIF-U001..NOTIF-U012`
- Integration API: `NOTIF-I001..NOTIF-I010`
- Frontend unit: `NOTIF-F001..NOTIF-F008`

Endpoints under test:
- `/api/notifications`
- `/api/notifications/read-all`
- `/api/notifications/:id/read`
- `/api/users/me/notification-preferences`

Also test scheduler behavior:
- due tomorrow email reminders
- overdue email reminders with dedupe (`last_due_notified_at`)

AC mapping baseline:
- FEAT-008 Story 1 AC1-AC3
- FEAT-008 Story 2 AC1-AC3
- FEAT-008 Story 3 AC1-AC2
- FEAT-008 Story 4 AC1-AC3
```

## SECTION 9 — Bug Fix Template
When to use: Diagnose and fix any implementation bug while preserving project rules.

Files to provide:
- `.ai-dev/ai/AI_RULES.md`
- `.ai-dev/ai/PROJECT_CONTEXT.md`
- `.ai-dev/dev/DEV_RULES.md`
- `.ai-dev/docs/PRD/features/FEAT_001_auth.md`

```markdown
Project: Team Task Management System

You are fixing a bug in an existing codebase.

Bug report:
- Description: [DESCRIBE THE BUG]
- Error output/logs: [PASTE ERROR]

Hard constraints:
- Follow `.ai-dev/ai/AI_RULES.md` and `.ai-dev/dev/DEV_RULES.md`.
- Keep soft-delete behavior (`deleted_at`) intact.
- Do not break role-based permissions (Admin, Member, Viewer).
- Use existing architecture boundaries:
  - frontend: `apps/web/src/app/*`, `apps/web/src/modules/*`
  - backend: `apps/api/src/modules/*`, `apps/api/src/middlewares/*`, `apps/api/src/lib/*`
  - db: `apps/api/prisma/*`

Required process:
1. Reproduce the bug.
2. Identify root cause with file/line references.
3. Implement minimal safe fix.
4. Add or update tests proving the fix.
5. Summarize changed files and why.

Return:
- Root cause summary
- Patch summary
- Test results
- Any follow-up risks
```

## SECTION 10 — Session Resume Template
When to use: Start a new session and continue from last logged progress.

Files to provide:
- `.ai-dev/ai/AI_RULES.md`
- `.ai-dev/ai/PROJECT_CONTEXT.md`
- `.ai-dev/docs/PRD/features/FEAT_001_auth.md`
- `.ai-dev/PROGRESS.md`

```markdown
We are continuing development on Team Task Management System.

Load context in this order:
1. `.ai-dev/ai/AI_RULES.md`
2. `.ai-dev/ai/PROJECT_CONTEXT.md`
3. `.ai-dev/docs/PRD/features/FEAT_001_auth.md`
4. `.ai-dev/PROGRESS.md`

Last session summary:
- <Paste completed work from PROGRESS.md>

Next task:
- <Paste next immediate task from PROGRESS.md>

Execution request:
- Continue implementation from the next task with production-quality code.
- Keep changes scoped and aligned to feature acceptance criteria.
- Run or update tests relevant to touched code.
- End with: changed files, validation/test outcomes, and remaining work.
```
