# 📋 Feature PRD — [FEAT-004: Task Assignment & Team Members]

---

## Metadata

| Field | Value |
|-------|-------|
| **Feature ID** | FEAT-004 |
| **Feature Name** | Task Assignment & Team Members |
| **Priority** | P0 |
| **Phase** | Phase 1 |
| **Author** | Dev Team |
| **Created** | 2026-04-01 |
| **Last Updated** | 2026-04-01 |
| **Status** | Approved |

---

## Overview

### Problem Statement
> A task without an owner is a task that doesn't get done. Teams need to clearly see who is responsible for each piece of work. Without proper assignment and member management within projects, accountability breaks down and work falls through the cracks.

### Proposed Solution
> Build a **Team Members** module that lets Admins add/remove users from projects and assign tasks to specific members. Members can see their own task load ("My Tasks" view). The system tracks who is assigned what, enabling workload visibility at a glance.

### Success Criteria
- [ ] Admin can add an existing user to a project with a role (member or viewer)
- [ ] Admin can remove a member from a project
- [ ] A task can be assigned to any member of its project
- [ ] "My Tasks" view shows all tasks assigned to the current user across all projects
- [ ] Reassigning a task notifies the new assignee (in-app notification, not email for MVP)

---

## In Scope / Out of Scope

| In Scope | Out of Scope |
|----------|-------------|
| Add/remove users from a project | Workspace-level user management (separate admin panel) |
| Assign task to a project member | Multiple assignees per task |
| Project member roles (member, viewer) | Custom role permissions per project |
| "My Tasks" cross-project view | Workload balancing / capacity planning |
| In-app notification on assignment | Email notification on assignment (FEAT-008) |

---

## User Stories

### Story 1 — Add Member to Project
**As an** Admin,  
**I want to** add a registered user to a project,  
**So that** they can see the project's tasks and be assigned work.

**Acceptance Criteria:**
- [ ] Given I open project settings > Members, when I search by name or email, then matching users appear in a dropdown
- [ ] Given I select a user and choose their role, when I click "Add", then they immediately appear in the members list
- [ ] Given the user is already in the project, when I try to add them again, then I see "This user is already a member of this project"

---

### Story 2 — Remove Member from Project
**As an** Admin,  
**I want to** remove a user from a project,  
**So that** they lose access and can no longer be assigned tasks in this project.

**Acceptance Criteria:**
- [ ] Given I click "Remove" next to a member, when I confirm, then they are removed from the members list
- [ ] Given the removed member has open tasks, when they are removed, then their tasks become unassigned (assignee_id = null)
- [ ] Given I try to remove the last Admin from a project, when I confirm, then I see "Cannot remove the only admin from this project"

---

### Story 3 — Assign Task to Member
**As an** Admin or Member,  
**I want to** assign a task to a project member,  
**So that** one person is clearly responsible for completing it.

**Acceptance Criteria:**
- [ ] Given I open a task detail, when I click the Assignee field, then I see a dropdown of all project members
- [ ] Given I select an assignee, when I save, then the task shows the assignee's avatar and name
- [ ] Given I clear the assignee, when I save, then the task shows "Unassigned"

---

### Story 4 — My Tasks View
**As a** Member,  
**I want to** see all tasks assigned to me across all projects in one view,  
**So that** I can manage my personal workload without checking each project individually.

**Acceptance Criteria:**
- [ ] Given I navigate to "My Tasks", when the page loads, then I see all non-deleted tasks assigned to me, grouped by project
- [ ] Given I have no assigned tasks, when I view "My Tasks", then I see an empty state: "No tasks assigned to you yet"
- [ ] Given a task is completed, when I view "My Tasks", then completed tasks appear in a separate "Done" section

---

## Functional Requirements

| ID | Requirement | Priority | Notes |
|----|-------------|----------|-------|
| FR-1 | Admin can add any registered workspace user to a project | Must | |
| FR-2 | Project member roles: `member` (can edit tasks) or `viewer` (read-only) | Must | |
| FR-3 | Task assignee must be a member of the task's project | Must | |
| FR-4 | Removing a member sets their task `assignee_id` to NULL | Must | |
| FR-5 | Cannot remove the last admin from a project | Must | |
| FR-6 | "My Tasks" view lists all non-deleted tasks assigned to current user | Must | |
| FR-7 | "My Tasks" grouped by project, sorted by due_date ASC (no due date last) | Should | |
| FR-8 | In-app notification when a task is assigned to a user | Should | Simple DB record; bell icon UI |
| FR-9 | Admin can change a member's role within a project | Should | |
| FR-10 | Project members page shows: name, email, role, date joined | Should | |

---

## Non-Functional Requirements

| Category | Requirement |
|----------|------------|
| **Performance** | "My Tasks" must load in < 500ms for up to 200 assigned tasks |
| **Security** | Users can only be assigned tasks in projects they belong to — enforce server-side |
| **Accessibility** | Member search dropdown must be keyboard navigable |
| **Scalability** | project_members join table indexed on both project_id and user_id |
| **Browser Support** | Chrome 90+, Firefox 90+, Safari 15+, Edge 90+ |

---

## UI / UX Requirements

### Reference Pages
- `apps/web/src/app/projects/[id]/settings/members/page.tsx` — Project member management
- `apps/web/src/app/my-tasks/page.tsx` — "My Tasks" personal view

### User Flow
```
[Project Settings > Members] → [Search input] → [Select user + role] 
→ [POST /api/projects/:id/members] → [Member appears in list]

[Task detail > Assignee field] → [Member picker dropdown] 
→ [Select member] → [PATCH /api/tasks/:id { assignee_id }]
→ [Assignee avatar shown]

[Sidebar: "My Tasks"] → [GET /api/users/me/tasks] 
→ [Tasks grouped by project, sorted by due date]
```

### UI Components Needed
- `MemberListPage` — table: avatar, name, email, role badge, date joined, remove button
- `AddMemberModal` — user search input + role selector + Add button
- `AssigneePicker` — dropdown inside task detail showing project members with avatars
- `MyTasksPage` — grouped task list per project, with status badges and due dates
- `InAppNotificationBell` — header icon with unread count badge

### Design Notes
- Assignee picker should show user avatar + name in dropdown items
- "My Tasks" page: use project color as a left border or badge on each task row
- Empty states must be friendly and indicate action to take

---

## API Requirements

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects/:id/members` | List project members |
| POST | `/api/projects/:id/members` | Add user to project |
| PATCH | `/api/projects/:id/members/:userId` | Update member role |
| DELETE | `/api/projects/:id/members/:userId` | Remove user from project |
| GET | `/api/users/me/tasks` | Get all tasks assigned to current user |
| GET | `/api/notifications` | Get unread in-app notifications |
| PATCH | `/api/notifications/:id/read` | Mark notification as read |

---

## Data Requirements

**Tables affected:**
- `project_members` — add/update/delete rows
- `tasks` — `assignee_id` cleared when member removed

**New tables needed:**
- `notifications` — `id`, `user_id` (FK), `type` (VARCHAR 50), `payload` (JSONB), `read_at` (TIMESTAMPTZ nullable), `created_at`

---

## Security Considerations

- [ ] Input validation required for: `user_id` (must exist), `role` (enum: member, viewer)
- [ ] Authorization check: only `admin` can add/remove/change roles of members
- [ ] Members cannot assign a task to a user who is not in the project — validate `assignee_id` against project membership in service layer
- [ ] Audit log entry for: member added, member removed, task assigned

---

## Dependencies

| Dependency | Type | Notes |
|-----------|------|-------|
| FEAT-001 (Auth) | Feature prerequisite | User accounts must exist before adding to projects |
| FEAT-002 (Projects) | Feature prerequisite | Projects must exist to have members |
| FEAT-003 (Tasks) | Feature prerequisite | Tasks must exist to assign them |

---

## Open Questions

| # | Question | Owner | Resolution |
|---|---------|-------|------------|
| 1 | Can a Member add other members to a project, or only Admin? | Product | Pending — current spec: Admin only |
| 2 | Should removed members be able to see project history (read-only)? | Product | Pending |

---

## Implementation Notes

- `project_members` unique constraint: `UNIQUE(project_id, user_id)` to prevent duplicates
- When removing a member: use a DB transaction — update `tasks` SET `assignee_id = NULL` + delete from `project_members`
- "My Tasks": `SELECT tasks.* FROM tasks JOIN project_members ON tasks.project_id = project_members.project_id WHERE project_members.user_id = :userId AND tasks.assignee_id = :userId AND tasks.deleted_at IS NULL`
- Notifications: create records in `notifications` table when `assignee_id` changes in `tasks.service.ts`

---

## Test Requirements

- [ ] Unit tests for: `members.service.ts` — add, remove (including task reassignment logic), role update
- [ ] Unit tests for: "my tasks" query with multi-project assignment
- [ ] Integration tests for: `POST /api/projects/:id/members`, `DELETE /api/projects/:id/members/:userId`
- [ ] E2E tests for: add member flow, assign task flow, "My Tasks" view

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
