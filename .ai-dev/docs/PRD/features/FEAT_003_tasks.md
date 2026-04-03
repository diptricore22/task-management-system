# 📋 Feature PRD — [FEAT-003: Task Management]

---

## Metadata

| Field | Value |
|-------|-------|
| **Feature ID** | FEAT-003 |
| **Feature Name** | Task Management (CRUD + Statuses) |
| **Priority** | P0 |
| **Phase** | Phase 1 |
| **Author** | Dev Team |
| **Created** | 2026-04-01 |
| **Last Updated** | 2026-04-01 |
| **Status** | Approved |

---

## Overview

### Problem Statement
> Tasks are the atomic unit of work in any project management system. Without robust task creation, editing, status tracking, and soft-deletion, the system cannot fulfill its core purpose. Teams need to capture work items quickly, move them through a lifecycle (Todo → In Progress → Done), and retrieve them reliably. 

### Proposed Solution
> Build a full CRUD Task module within the context of a Project. Each task has a title, optional description, status, priority, due date, and assignee. Tasks support a status workflow. Both list and detail views are provided. All delete operations are soft-deletes.

### Success Criteria
- [ ] User can create a task within a project in < 10 seconds
- [ ] Task status can be updated inline from the list view
- [ ] Task detail page loads with full information in < 500ms
- [ ] Soft-delete removes task from active views without purging DB records
- [ ] Task list supports filtering by status and assignee
- [ ] Pagination or infinite scroll handles 200+ tasks without performance degradation

---

## In Scope / Out of Scope

| In Scope | Out of Scope |
|----------|-------------|
| CRUD tasks within a project | Sub-tasks / task dependencies |
| Status workflow (5 statuses) | Recurring tasks |
| Priority levels (4 levels) | Time estimates / time logging |
| Due date field | File attachments (Phase 2) |
| Filter by status, priority, assignee | Custom workflows / status names |
| Task detail modal or page | Bulk task operations (Phase 2) |
| Soft-delete with restore option | Calendar view |

---

## User Stories

### Story 1 — Create Task
**As a** Member or Admin,  
**I want to** quickly create a task inside a project,  
**So that** work items are captured without friction.

**Acceptance Criteria:**
- [ ] Given I am on a project page, when I click "+ Add Task", then an inline form or modal appears
- [ ] Given a valid title, when I submit, then the task appears immediately in the list (optimistic UI)
- [ ] Given an empty title, when I try to submit, then I see "Task title is required" validation error

---

### Story 2 — View Task List
**As a** Member,  
**I want to** see all tasks in a project,  
**So that** I know what work exists and what the current status is.

**Acceptance Criteria:**
- [ ] Given I navigate to a project, when the page loads, then tasks are displayed in a list sorted by created date (newest first)
- [ ] Given more than 20 tasks, when I scroll, then additional tasks load via pagination or infinite scroll
- [ ] Given I apply a "Status: In Progress" filter, when the list updates, then only In Progress tasks are shown

---

### Story 3 — View Task Detail
**As a** Member,  
**I want to** click on a task to see its full detail,  
**So that** I can read the description, see who it's assigned to, and review comments.

**Acceptance Criteria:**
- [ ] Given I click on a task title, when the detail panel/page opens, then I see: title, description, status, priority, due date, assignee, and comments
- [ ] Given I am on the task detail, when I update the status, then the change is saved and reflected immediately

---

### Story 4 — Update Task
**As a** Member or Admin,  
**I want to** edit a task's title, description, status, priority, due date, and assignee,  
**So that** task details stay up to date as work progresses.

**Acceptance Criteria:**
- [ ] Given I edit the task title and click save, when the update succeeds, then the new title appears in the list view
- [ ] Given I change the status from "Todo" to "In Progress", when I save, then the status badge updates immediately
- [ ] Given I clear the due date, when I save, then the due date shows as "No due date"

---

### Story 5 — Delete Task
**As an** Admin or task creator,  
**I want to** delete a task that is no longer relevant,  
**So that** the project task list stays clean.

**Acceptance Criteria:**
- [ ] Given I click "Delete" on a task, when I confirm, then the task is removed from the list view
- [ ] Given the task is soft-deleted, when I query the DB, then `deleted_at` is set (not hard-deleted)
- [ ] Given I am a Member (not Admin), when I try to delete a task I did not create, then I receive a `403` error

---

## Functional Requirements

| ID | Requirement | Priority | Notes |
|----|-------------|----------|-------|
| FR-1 | Task must belong to a project | Must | |
| FR-2 | Task title: required, max 255 chars | Must | |
| FR-3 | Task description: optional, TEXT field | Should | |
| FR-4 | Task status: one of `todo`, `in_progress`, `in_review`, `blocked`, `done` | Must | |
| FR-5 | Task priority: one of `low`, `medium`, `high`, `critical` | Should | Default: `medium` |
| FR-6 | Task due date: optional DATE field | Should | |
| FR-7 | Task can be assigned to one member of the project | Should | |
| FR-8 | Status can be updated inline from task list without opening detail view | Should | |
| FR-9 | Task list filterable by: status, priority, assignee | Should | |
| FR-10 | Tasks support soft-delete (`deleted_at`) | Must | |
| FR-11 | Only task creator or Admin can delete a task | Must | |
| FR-12 | Tasks paginated: 20 per page (default), max 100 per page | Should | |

---

## Non-Functional Requirements

| Category | Requirement |
|----------|------------|
| **Performance** | Task list renders in < 500ms for 200 tasks with pagination |
| **Security** | Members can only view/edit tasks in projects they belong to |
| **Accessibility** | Status dropdown and priority selector must be keyboard and screen-reader accessible |
| **Scalability** | DB indexes on `project_id`, `assignee_id`, `status`, `due_date` |
| **Browser Support** | Chrome 90+, Firefox 90+, Safari 15+, Edge 90+ |

---

## UI / UX Requirements

### Reference Pages
- `apps/web/src/app/projects/[id]/page.tsx` — Task list view within project
- `apps/web/src/app/projects/[id]/tasks/[taskId]/page.tsx` — Task detail page

### User Flow
```
[Project page] → [Click "+ Add Task"] → [Inline row or modal: title + priority] 
→ [POST /api/projects/:id/tasks] → [Task appears at top of list]

[Click task title] → [Task detail page or slide-over panel]
→ [Edit fields] → [PATCH /api/tasks/:id] → [Saved + UI updates]

[Task overflow menu (•••)] → [Delete] → [Confirm modal] 
→ [DELETE /api/tasks/:id] → [Task removed from list]
```

### UI Components Needed
- `TaskRow` — inline list item: title, status badge, priority indicator, assignee avatar, due date, action menu
- `TaskStatusBadge` — colored pill: Todo / In Progress / In Review / Blocked / Done
- `PriorityIndicator` — icon + label: 🔴 Critical / 🟠 High / 🟡 Medium / ⚪ Low
- `AddTaskForm` — inline row or slide-over with fields
- `TaskDetailPanel` — full detail: all fields + comments section + activity log
- `FilterBar` — status, priority, assignee dropdowns
- `DeleteTaskModal` — simple confirm: "Are you sure?" + Cancel / Delete

### Design Notes
- Status badge colors: todo=gray, in_progress=blue, in_review=purple, blocked=red, done=green
- Priority indicators use icons, not just color, for accessibility
- Inline editing: click a field in the task detail to edit in place; auto-save on blur
- Empty state for task list: "No tasks yet — add your first task" with illustration

---

## API Requirements

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/projects/:projectId/tasks` | Create task in project |
| GET | `/api/projects/:projectId/tasks` | List tasks (with filters + pagination) |
| GET | `/api/tasks/:id` | Get single task detail |
| PATCH | `/api/tasks/:id` | Update task (title, description, status, priority, due_date, assignee_id) |
| DELETE | `/api/tasks/:id` | Soft-delete task |

**Query params for GET /tasks:**
- `status` — filter by status value(s)
- `priority` — filter by priority
- `assignee_id` — filter by assignee
- `page` — page number (default 1)
- `limit` — items per page (default 20, max 100)
- `sort` — `created_at_desc` (default) | `due_date_asc` | `priority_desc`

---

## Data Requirements

**New tables needed:**
- `tasks`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | |
| `project_id` | UUID | FK → projects.id, NOT NULL | |
| `title` | VARCHAR(255) | NOT NULL | |
| `description` | TEXT | NULL | |
| `status` | VARCHAR(20) | NOT NULL DEFAULT 'todo' | enum: todo, in_progress, in_review, blocked, done |
| `priority` | VARCHAR(20) | NOT NULL DEFAULT 'medium' | enum: low, medium, high, critical |
| `due_date` | DATE | NULL | |
| `assignee_id` | UUID | FK → users.id, NULL | |
| `created_by` | UUID | FK → users.id, NOT NULL | |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT NOW() | |
| `updated_at` | TIMESTAMPTZ | NOT NULL DEFAULT NOW() | |
| `deleted_at` | TIMESTAMPTZ | NULL | Soft delete |

**Indexes:**
- `idx_tasks_project_id` on `project_id`
- `idx_tasks_assignee_id` on `assignee_id`
- `idx_tasks_status` on `status`
- `idx_tasks_due_date` on `due_date`
- `idx_tasks_deleted_at` on `deleted_at`

---

## Security Considerations

- [ ] Input validation required for: `title` (required, max 255), `status` (enum), `priority` (enum), `due_date` (valid date or null), `assignee_id` (valid UUID or null)
- [ ] Authorization check: user must be member of the project; only task creator or admin can delete
- [ ] Data sensitivity: task descriptions may contain sensitive project info — enforce project membership scope
- [ ] All queries must filter `WHERE deleted_at IS NULL`

---

## Dependencies

| Dependency | Type | Notes |
|-----------|------|-------|
| FEAT-001 (Auth) | Feature prerequisite | All task routes require authentication |
| FEAT-002 (Projects) | Feature prerequisite | Tasks belong to projects; project membership scoping |

---

## Open Questions

| # | Question | Owner | Resolution |
|---|---------|-------|------------|
| 1 | Can a task be assigned to multiple people? | Product | Pending — current spec: one assignee |
| 2 | Should task status transitions be enforced (e.g., must go Todo→In Progress)? | Product | Pending — current spec: free transitions |
| 3 | Should task order within a list be manually sortable (drag-and-drop)? | Product | Pending — Phase 2 consideration |

---

## Implementation Notes

- Use Prisma enums for `status` and `priority` to enforce valid values at the ORM level
- The `GET /api/projects/:projectId/tasks` endpoint must verify project membership in middleware
- Inline status update from list view: `PATCH /api/tasks/:id` with only `{ status }` body
- For filter params: validate using Zod enum arrays; ignore unknown values
- Pagination: use `LIMIT / OFFSET` for now; migrate to cursor-based pagination if load testing shows issues

---

## Test Requirements

- [ ] Unit tests for: `tasks.service.ts` — create, list (scoped + filtered), update, soft-delete
- [ ] Unit tests for: status and priority enum validation
- [ ] Integration tests for: `POST /api/projects/:id/tasks`, `GET /api/projects/:id/tasks?status=todo`, `PATCH /api/tasks/:id`
- [ ] E2E tests for: create task flow, update status inline, task detail view

---

## Checklist

- [x] PRD reviewed and approved
- [x] Acceptance criteria defined
- [ ] UI pages referenced / created
- [ ] API spec updated
- [ ] DB spec updated
- [x] Security requirements reviewed
- [ ] Test cases written
- [ ] Implementation complete
- [ ] Tests passing
- [ ] CHANGELOG updated
