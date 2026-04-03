# 📋 Feature PRD — [FEAT-002: Project Management]

---

## Metadata

| Field | Value |
|-------|-------|
| **Feature ID** | FEAT-002 |
| **Feature Name** | Project Management (CRUD) |
| **Priority** | P0 |
| **Phase** | Phase 1 |
| **Author** | Dev Team |
| **Created** | 2026-04-01 |
| **Last Updated** | 2026-04-01 |
| **Status** | Approved |

---

## Overview

### Problem Statement
> Without a way to group tasks, everything becomes one flat list. Teams working on multiple products or initiatives need a container-level concept (projects) that organizes work into meaningful, nameable units. Without projects, it's impossible to filter, report, or assign ownership at scale.

### Proposed Solution
> Build a **Projects** module where Admins can create, update, archive, and delete projects. Each project has a name, optional description, status, and an associated color/icon for quick visual identification. Members are scoped to projects — they can only see tasks within projects they belong to.

### Success Criteria
- [ ] Admin can create a project with name, description, and color
- [ ] Projects list loads in < 1 second
- [ ] Admin can archive a project (hides it from active view; data preserved)
- [ ] Admin can delete a project (soft-delete; tasks retained)
- [ ] Members can only view projects they have been added to
- [ ] Project detail page shows all tasks, members, and activity

---

## In Scope / Out of Scope

| In Scope | Out of Scope |
|----------|-------------|
| Create / read / update / archive / soft-delete projects | Hard-delete of projects and task data |
| Project color and optional icon | File storage per project |
| Role-scoped visibility (project membership) | Project templates |
| Project status (Active / Archived) | Sub-projects / nested projects |
| Project detail view with task list | Gantt chart / timeline view (Phase 2) |

---

## User Stories

### Story 1 — Create Project
**As an** Admin,  
**I want to** create a new project with a name and description,  
**So that** I can group related tasks under a single workspace.

**Acceptance Criteria:**
- [ ] Given a valid name (required, ≤ 100 chars), when I submit, then the project is created and I am taken to the project detail page
- [ ] Given a name longer than 100 characters, when I submit, then I see validation error "Project name must be 100 characters or fewer"
- [ ] Given a duplicate project name (for this admin's workspace), when I submit, then I see a warning (not a hard block — projects can share names)

---

### Story 2 — View Projects
**As a** Member,  
**I want to** see a list of all projects I belong to,  
**So that** I can navigate to the tasks I'm responsible for.

**Acceptance Criteria:**
- [ ] Given I am logged in, when I visit `/projects`, then I see only projects I have been added to
- [ ] Given I am an Admin, when I visit `/projects`, then I see all projects in the workspace
- [ ] Given there are no projects, when I visit `/projects`, then I see a call-to-action to create the first project

---

### Story 3 — Edit Project
**As an** Admin,  
**I want to** update a project's name, description, and color,  
**So that** project details stay accurate over time.

**Acceptance Criteria:**
- [ ] Given a valid update, when I save, then changes are reflected immediately without a page reload
- [ ] Given an empty name, when I save, then a validation error appears inline

---

### Story 4 — Archive Project
**As an** Admin,  
**I want to** archive a project that is no longer active,  
**So that** the project is hidden from the active list but not permanently deleted.

**Acceptance Criteria:**
- [ ] Given I click "Archive", when I confirm, then the project moves to the "Archived" section
- [ ] Given a project is archived, when a Member navigates to it via direct URL, then they see a banner: "This project is archived"
- [ ] Given a project is archived, when Admin clicks "Restore", then it moves back to the active list

---

### Story 5 — Delete Project
**As an** Admin,  
**I want to** permanently remove a project (soft-delete),  
**So that** the workspace stays clean.

**Acceptance Criteria:**
- [ ] Given I click "Delete", when I confirm by typing the project name, then the project is soft-deleted and disappears from all views
- [ ] Given the project is soft-deleted, when I query the DB, then `deleted_at` is set
- [ ] Given the project has active tasks, when I attempt to delete it, then I see a warning: "This project has N tasks. They will also be archived."

---

## Functional Requirements

| ID | Requirement | Priority | Notes |
|----|-------------|----------|-------|
| FR-1 | Admin can create a project with name (required), description (optional), color (required) | Must | |
| FR-2 | Projects are scoped to the workspace (single-org for MVP) | Must | |
| FR-3 | Members can only see projects they belong to | Must | |
| FR-4 | Admins see all projects | Must | |
| FR-5 | Projects have a status: `active` or `archived` | Must | |
| FR-6 | Archived projects appear in a separate "Archived" section | Should | |
| FR-7 | Admin can restore an archived project | Should | |
| FR-8 | Soft-delete sets `deleted_at`; purged from all queries via `WHERE deleted_at IS NULL` | Must | |
| FR-9 | Delete is confirmed via a type-to-confirm modal | Should | Prevents accidental deletion |
| FR-10 | Project detail page shows: members, task count by status, recent activity | Should | |

---

## Non-Functional Requirements

| Category | Requirement |
|----------|------------|
| **Performance** | Projects list loads in < 500ms for up to 100 projects |
| **Security** | Only authenticated users can view projects; only admins can create/delete |
| **Accessibility** | All project action buttons have ARIA labels |
| **Scalability** | Supports up to 500 projects per workspace |
| **Browser Support** | Chrome 90+, Firefox 90+, Safari 15+, Edge 90+ |

---

## UI / UX Requirements

### Reference Pages
- `apps/web/src/app/projects/page.tsx` — Projects list page
- `apps/web/src/app/projects/[id]/page.tsx` — Project detail page
- `apps/web/src/app/projects/[id]/settings/page.tsx` — Project settings (name, color, archive, delete)

### User Flow
```
[Sidebar: Projects] → [/projects list] → [Click + New Project] 
→ [Modal: name, description, color] → [POST /api/projects] 
→ redirect [/projects/:id] → [task list + members]

[Project settings icon] → [/projects/:id/settings] 
→ [Edit name/description] → [PATCH /api/projects/:id]
→ [Archive] → [PATCH /api/projects/:id/archive]
→ [Delete] → [type-to-confirm modal] → [DELETE /api/projects/:id]
```

### UI Components Needed
- `ProjectCard` — name, color badge, task count, last updated
- `ProjectListPage` — grid or list layout with "New Project" CTA
- `CreateProjectModal` — name, description, color picker
- `ProjectDetailPage` — task table + member list + activity feed
- `ProjectSettingsPage` — edit form + danger zone (archive / delete)
- `ArchiveConfirmModal` — simple confirm
- `DeleteConfirmModal` — type-to-confirm

### Design Notes
- Color badge on project card must meet WCAG AA contrast ratio
- "Danger zone" (delete/archive) placed at bottom of settings with red section header
- Empty state for projects list: illustration + "Create your first project" CTA

---

## API Requirements

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/projects` | Create project (admin only) |
| GET | `/api/projects` | List all projects for current user |
| GET | `/api/projects/:id` | Get project detail |
| PATCH | `/api/projects/:id` | Update project name/description/color |
| PATCH | `/api/projects/:id/archive` | Archive or restore project |
| DELETE | `/api/projects/:id` | Soft-delete project |

---

## Data Requirements

**Tables affected:**
- `projects` — new records on create; `deleted_at` on delete; `status` on archive/restore

**New tables needed:**
- `projects` — `id` (UUID PK), `name` (VARCHAR 100), `description` (TEXT nullable), `color` (VARCHAR 7), `status` (VARCHAR 20 DEFAULT 'active'), `created_by` (UUID FK → users.id), `created_at`, `updated_at`, `deleted_at`
- `project_members` — `id`, `project_id` (FK), `user_id` (FK), `role` (VARCHAR 20 DEFAULT 'member'), `joined_at`

---

## Security Considerations

- [ ] Input validation required for: `name`, `description`, `color` (must be valid hex)
- [ ] Authorization check: create/archive/delete restricted to `admin` role
- [ ] Members can only GET projects they belong to — enforce in service layer, not just frontend
- [ ] Soft-delete: `deleted_at IS NULL` must be appended to all project queries
- [ ] Audit log entry for: project created, archived, deleted

---

## Dependencies

| Dependency | Type | Notes |
|-----------|------|-------|
| FEAT-001 (Auth) | Feature prerequisite | Must be complete — all routes require auth |

---

## Open Questions

| # | Question | Owner | Resolution |
|---|---------|-------|------------|
| 1 | Should there be a max projects per workspace limit? | Tech | Pending |
| 2 | Can Members create projects or only Admins? | Product | Pending — current spec: Admin only |

---

## Implementation Notes

- Prisma relation: `Project` has many `ProjectMember`, has many `Task`
- Service layer always applies `WHERE deleted_at IS NULL` — never filter in route handler
- Color field: validate as 7-char hex string `#RRGGBB` using Zod regex
- `project_members` is the join table for scoped visibility — all member queries JOIN through this

---

## Test Requirements

- [ ] Unit tests for: `projects.service.ts` — create, list (scoped), archive, delete
- [ ] Integration tests for: `POST /api/projects`, `GET /api/projects`, `DELETE /api/projects/:id`
- [ ] E2E tests for: Create project flow, archive flow, member visibility scoping

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
