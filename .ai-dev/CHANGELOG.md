# 📜 Changelog

> All notable changes to this project are documented here.  
> Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).  
> Versioning follows [Semantic Versioning](https://semver.org/): `MAJOR.MINOR.PATCH`

---

## Versioning Guide

| Type | When to bump |
|------|-------------|
| **MAJOR** (1.0.0) | Breaking changes, full feature revamp |
| **MINOR** (0.1.0) | New features, non-breaking |
| **PATCH** (0.0.1) | Bug fixes, small improvements |

---

## Change Types

- **Added** — New features
- **Changed** — Changes in existing functionality
- **Deprecated** — Features that will be removed in a future release
- **Removed** — Features removed in this release
- **Fixed** — Bug fixes
- **Security** — Security vulnerability fixes
- **Refactor** — Code restructuring without behavior change
- **Docs** — Documentation changes only

---

## [Unreleased]

### Added
- **FEAT-008: Due Dates, Reminders & Notifications** - User-controlled notification preferences and scheduled email reminders
  - 2 REST endpoints: GET/PATCH /api/users/me/notification-preferences for per-user notification setting management
  - Notification preferences: 4 independent toggles (email_due_tomorrow, email_overdue, email_assigned, email_commented)
  - Default preferences: due_tomorrow=true, overdue=true, assigned=true, commented=false
  - Daily scheduler service: runs at 08:00 AM to process due date reminders with batch processing
  - Due tomorrow reminders: finds tasks due next day (status != DONE, has assignee), creates in-app + email notifications
  - Overdue task reminders: finds overdue incomplete tasks with 24-hour debounce via last_due_notified_at timestamp
  - Email service with templates: 4 notification types (due_tomorrow, overdue, assigned, commented) with branded HTML
  - Email template features: responsive design, inline styles, brand colors, CTA buttons, unsubscribe links, task deep links
  - Graceful job failure handling: per-task try/catch, continues processing on failures, logs summary with success/error counts
  - Email provider integration points: TODO comments for Resend, SendGrid, Nodemailer setup
  - Scheduler integration points: TODO comments for node-cron and Bull queue setup
  - Authorization: users can only manage own preferences, no cross-user data access
  - In-app notifications always enabled: only email channel can be toggled off
  - Comprehensive test coverage: 132 tests covering all user stories and integration scenarios (NOTIF-U001..U004, NOTIF-I001..I012)

- **FEAT-007: Labels, Priorities & Filtering** - Advanced label management and powerful multi-criteria filtering
  - 7 REST endpoints: GET/POST /api/projects/:id/labels, PATCH/DELETE /api/labels/:id, POST/DELETE /api/tasks/:id/labels, GET /api/tasks/:id/labels
  - Label management: create, update (name/color), delete labels per project
  - Label uniqueness per project: prevents duplicate names within same project
  - Task labeling: add/remove labels with many-to-many support
  - Advanced filtering: status (OR logic), priority (OR), labels (OR), assignee, due date range (all fields AND together)
  - 4 sort options: created_at_desc (default), due_date_asc (nulls last), priority_desc (CRITICAL>HIGH>MEDIUM>LOW), title_asc
  - Filter query params: ?status=TODO,IN_PROGRESS&labels=l1,l2&sort=due_date_asc&page=1&limit=20
  - Pagination: 20 default, 100 max, with page/limit params
  - Hex color validation: #RRGGBB format, case-insensitive normalization
  - Cascading label deletion: removes from all tasks when label deleted
  - Permission scoping: admin-only label management, member+ can assign labels
  - URL-safe filter persistence: query params enable shareable filter links
  - Comprehensive test coverage: 116 tests covering all user stories and edge cases (LABEL-U001..U004, LABEL-I001..I016)

- **FEAT-006: Comments & Task Activity Log** - Task collaboration with comment CRUD and immutable activity tracking
  - 4 REST endpoints: GET/POST /api/tasks/:id/comments, PATCH/DELETE /api/comments/:id
  - Comment posting: members can post comments on tasks in their projects with author metadata
  - Comment editing with 15-minute window: server-side enforcement, sets edited_at timestamp, shows "(edited)" label when modified
  - Comment deletion: author can delete own comment anytime, admin can delete any comment, soft-delete pattern (deleted_at)
  - Task activity logging: system-generated immutable log tracking status_changed, priority_changed, assignee_changed, due_date_changed, task_created
  - Chronological activity feed: merged comments + activity logs sorted by created_at, with pagination (default 20, max 100)
  - Fine-grained field tracking: each activity log includes before/after values (from_value, to_value) for audit trail
  - Relative time formatting: "2h ago", "3d ago", with "(edited)" marker for edited comments
  - Human-readable action descriptions: "Alice changed status from TODO to IN_PROGRESS", "Bob changed assignee to Diana"
  - Permission scoping: comments scoped to project members, activity logs visible to all project members
  - Immutable activity logs: no edit/delete operations, system-generated only, permanent audit trail
  - Comprehensive test coverage: 62 tests covering all user stories and integration scenarios (COM-U001..U004, COM-I001..I012)

- **FEAT-005: Dashboard & Activity Feed** - Personal and admin dashboards with efficient aggregation queries
  - 4 REST endpoints: GET /api/dashboard/summary, /projects, /activity, /admin/overview
  - Personal task summary: overdue count, due today count, in progress count with empty state indicator
  - Project status cards: task counts by status, % complete, project metadata for all user projects
  - Activity feed: recent events across user's projects with actor, action, task, project context, pagination (max 100)
  - Admin project health overview: all projects with health indicators (red/yellow/green based on blocked/overdue counts)
  - Health indicator logic: red (blocked > 2 or overdue > 5), yellow (overdue 1-5), green (otherwise)
  - Zero N+1 queries: all data fetched via single queries with Prisma includes and aggregations
  - Permission scoping: personal endpoints show only user's projects/tasks, admin endpoint unrestricted
  - Date/time calculations: relative time formatting ("2h ago", "3d ago"), overdue logic with today boundary
  - Pagination support: 20 per page default, 100 maximum, with total and page count
  - Comprehensive test coverage: 34 tests covering all user stories and integration scenarios (DASH-U001..U008, DASH-I001..I007)

- **FEAT-004: Task Assignment & Team Members** - Complete member management and task assignment system with notifications
  - 7 REST endpoints: GET/POST/PATCH/DELETE /api/projects/:id/members, GET /api/users/me/tasks, GET/PATCH /api/notifications
  - Admin member management: add users with roles (ADMIN, MEMBER, VIEWER), update roles, remove members
  - Member removal with automatic task unassignment: open tasks (TODO, IN_PROGRESS, IN_REVIEW, BLOCKED) set assignee_id to NULL
  - Task assignment validation: users can only be assigned to tasks in projects they're members of
  - My Tasks endpoint: cross-project task list sorted by due_date ASC (nulls last), paginated, grouped by project
  - In-app notifications on task assignment: automatic notification creation when task assigned to user
  - Notification management: list, mark as read (single/all), with unread count and pagination
  - Last-admin protection: prevents removal or demotion of project's final admin
  - Soft-delete pattern maintained across all operations (project_members, notifications, tasks)
  - Activity logging for all member management operations
  - Comprehensive test coverage: 55 tests covering all user stories and business rules (MEM-U001..U009, MEM-I001..I010)

- **FEAT-002: Project Management (CRUD)** - Complete project management system with membership scoping
  - 10 REST endpoints: POST/GET/PATCH/DELETE /api/projects, GET/POST/PATCH/DELETE /api/projects/:id/members
  - Project CRUD with name, description, and color properties
  - Soft-delete pattern with deleted_at timestamp (never hard-deleted)
  - Membership scoping: admins see all projects, non-admins see only projects they're members of
  - Member management with role-based access (ADMIN, MEMBER, VIEWER)
  - Last-admin protection preventing removal of final project admin
  - Project archival status (ACTIVE/ARCHIVED separate from soft-delete)
  - Task stats in project responses (counts by status: todo, in_progress, in_review, blocked, done)
  - Activity logging on all CRUD operations (project_created, project_updated, project_archived, project_deleted, member_added, member_removed, member_role_updated)
  - Comprehensive test coverage: 58 tests mapping to PROJ-U001..U010 and PROJ-I001..I017

- **FEAT-003: Task Management (CRUD + Statuses)** - Complete task management with filtering, sorting, and pagination
  - 5 core REST endpoints: POST/GET /api/projects/:projectId/tasks, GET/PATCH/DELETE /api/tasks/:id
  - Task CRUD with title, description, status, priority, due_date, and assignee properties
  - Status workflow with 5 states: TODO, IN_PROGRESS, IN_REVIEW, BLOCKED, DONE (any transition allowed)
  - Priority levels: LOW, MEDIUM, HIGH, CRITICAL (default: MEDIUM)
  - Due date support (optional, ISO date format)
  - Task assignment with validation (assignee must be project member)
  - Soft-delete pattern with deleted_at timestamp (never hard-deleted)
  - Permission model: task creator or global admin can update/delete, all project members can view
  - List endpoint with advanced filtering: by status, priority, assignee_id
  - Sorting options: created_at_desc (default), due_date_asc, priority_desc
  - Pagination with configurable page/limit (min 1, max 100 per page, default 20)
  - Activity logging on all CRUD operations (task_created, task_updated, task_deleted)
  - Comprehensive test coverage: 66 tests mapping to TASK-U001..U010 and TASK-I001..I017+

---

## [0.1.0] — 2026-04-03

### Added
- **FEAT-001: Authentication & User Management** - Complete authentication system with JWT tokens, role-based access control, and user management
  - User registration and login with bcrypt password hashing
  - JWT access tokens (15 min expiry) and refresh tokens (7 day expiry) with rotation
  - Secure httpOnly cookies with SameSite=Strict protection
  - Role-based access control (ADMIN, MEMBER, VIEWER)
  - Admin-only user invitations with 72-hour token expiry
  - User profile management (GET/PATCH endpoints)
  - Rate limiting on auth endpoints (10/15min login, 5/hour register)
  - Database schema with 12 models including User, RefreshToken, InviteToken
  - Comprehensive input validation using Zod schemas
  - Seed data with 4 test accounts and sample projects

---

<!--
TEMPLATE FOR NEW ENTRY:

## [X.Y.Z] — YYYY-MM-DD

### Added
-

### Changed
-

### Fixed
-

### Security
-

### Removed
-
-->
