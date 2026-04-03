# 📋 Feature PRD — [FEAT-005: Dashboard & Activity Feed]

---

## Metadata

| Field | Value |
|-------|-------|
| **Feature ID** | FEAT-005 |
| **Feature Name** | Dashboard & Activity Feed |
| **Priority** | P1 |
| **Phase** | Phase 1 |
| **Author** | Dev Team |
| **Created** | 2026-04-01 |
| **Last Updated** | 2026-04-01 |
| **Status** | Approved |

---

## Overview

### Problem Statement
> After login, users land on the application with no context about what needs their attention. Without a dashboard, they must manually navigate each project to find their assigned tasks, overdue items, and recent changes — a slow and frustrating experience. Team leads (Admins) have no health overview of all projects at a glance.

### Proposed Solution
> Build a **Dashboard** as the default post-login landing page. It surfaces: tasks assigned to the current user, overdue tasks, today's tasks, project-level status cards, and a global activity feed showing recent actions across all the user's projects.

### Success Criteria
- [ ] Dashboard loads within 1 second for a workspace with 20 projects and 500 tasks
- [ ] Dashboard correctly shows only tasks and projects relevant to the current user
- [ ] Activity feed shows the last 50 events with author, action, and timestamp
- [ ] Overdue tasks section is visually distinct and sorted by most overdue first
- [ ] Admin's dashboard includes a project summary table with health indicators

---

## In Scope / Out of Scope

| In Scope | Out of Scope |
|----------|-------------|
| Personal task summary (my tasks today / overdue) | Real-time live updates (websockets) — Phase 2 |
| Project status cards (task count by status) | Custom dashboard widgets |
| Global activity feed (recent events across projects) | Scheduled reports or email digests |
| Admin overview: all projects health summary | Analytics charts (bar, burndown) — FEAT-010 |
| Quick links: "My Tasks", recent projects | Pinned tasks or favorites |

---

## User Stories

### Story 1 — Personal Task Overview
**As a** Member,  
**I want to** see my assigned tasks summarized on my dashboard,  
**So that** I know what to work on today without navigating each project.

**Acceptance Criteria:**
- [ ] Given I log in, when the dashboard loads, then I see: "Due Today" (N tasks), "Overdue" (N tasks), "In Progress" (N tasks)
- [ ] Given I have no overdue tasks, when viewing the dashboard, then the overdue section shows "All caught up! 🎉"
- [ ] Given I click on a task in the dashboard, when it opens, then it takes me to the task detail

---

### Story 2 — Project Status Cards
**As a** Member or Admin,  
**I want to** see a status summary for each of my projects,  
**So that** I can quickly assess the health of my work at a project level.

**Acceptance Criteria:**
- [ ] Given I have 3 projects, when the dashboard loads, then I see 3 project cards each showing: project name, task counts by status (todo/in progress/done), and % complete
- [ ] Given a project has 100% tasks done, when I view the dashboard, then its card shows a "Completed" green badge
- [ ] Given I click a project card, when it opens, then it takes me to the project detail page

---

### Story 3 — Activity Feed
**As a** Member,  
**I want to** see a real-time (polled) feed of recent activity across my projects,  
**So that** I am informed of changes made by teammates without checking each project manually.

**Acceptance Criteria:**
- [ ] Given teammates have created tasks, changed statuses, and added comments, when I view the activity feed, then I see human-readable events: "Alice changed task 'API Integration' to In Review"
- [ ] Given the feed has more than 20 entries, when I scroll, then more entries load (infinite scroll or "Load more")
- [ ] Given no activity has occurred, when I view the feed, then it shows "No recent activity"

---

### Story 4 — Admin Project Health Overview
**As an** Admin,  
**I want to** see a high-level table of all projects and their health status,  
**So that** I can identify blocked or at-risk projects without opening each one.

**Acceptance Criteria:**
- [ ] Given I am an Admin and log in, when the dashboard loads, then I see a table: project name | total tasks | done | in progress | blocked | overdue count | health indicator
- [ ] Given a project has 3+ blocked tasks, when shown in the table, then its health indicator is 🔴 red
- [ ] Given a project has no blocked tasks and < 10% overdue, when shown, then its health indicator is 🟢 green

---

## Functional Requirements

| ID | Requirement | Priority | Notes |
|----|-------------|----------|-------|
| FR-1 | Dashboard shows personal task summary: due today, overdue, in progress counts | Must | |
| FR-2 | Dashboard shows project cards for projects user is a member of | Must | |
| FR-3 | Project card shows: task count by status, % complete, last updated | Must | |
| FR-4 | Activity feed shows last 50 events across the user's projects | Should | |
| FR-5 | Activity feed entries: who, what action, which task/project, when (relative time) | Should | |
| FR-6 | Activity feed supports "Load more" (pagination) | Should | |
| FR-7 | Admin sees additional project health table above project cards | Should | |
| FR-8 | Health indicator logic: 🔴 if blocked > 2 or overdue > 5 tasks; 🟡 if overdue 1-5; 🟢 otherwise | Should | |
| FR-9 | All dashboard data is scoped to projects the current user belongs to | Must | |
| FR-10 | Dashboard data is fresh on each load (no aggressive caching for MVP) | Must | |

---

## Non-Functional Requirements

| Category | Requirement |
|----------|------------|
| **Performance** | Dashboard API response < 800ms; UI first meaningful paint < 1s |
| **Security** | Dashboard data never leaks tasks from projects user is not a member of |
| **Accessibility** | Color-blind-friendly health indicators (use icons + color, not color alone) |
| **Scalability** | Dashboard queries use indexes — no N+1 queries |
| **Browser Support** | Chrome 90+, Firefox 90+, Safari 15+, Edge 90+ |

---

## UI / UX Requirements

### Reference Pages
- `apps/web/src/app/dashboard/page.tsx` — Main dashboard page (default landing after login)

### User Flow
```
[Login success] → redirect → [/dashboard]
→ Parallel fetch: 
   GET /api/dashboard/summary    → personal stats
   GET /api/dashboard/projects   → project cards
   GET /api/dashboard/activity   → activity feed
→ Render all sections; skeleton loaders while fetching
```

### UI Components Needed
- `StatCard` — icon + label + number (e.g., "Overdue: 3")
- `ProjectHealthCard` — project name, color bar, task status breakdown, % complete, health dot
- `ProjectHealthTable` — admin-only: full project health overview table
- `ActivityFeedItem` — avatar, name, action text, task/project link, relative timestamp
- `DashboardPage` — layout: stats row → project cards grid → activity feed column
- `SkeletonLoader` — display during data fetching

### Design Notes
- Overdue count card: use red color with warning icon
- Activity feed: right column on desktop, below stats on mobile
- Admin view: collapsible project health table at top of dashboard
- Use relative time for timestamps: "2 hours ago", "Yesterday", "3 days ago" (via date-fns)

---

## API Requirements

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/summary` | Personal task stats: overdue count, due today, in progress |
| GET | `/api/dashboard/projects` | Project cards with task status counts and % complete |
| GET | `/api/dashboard/activity` | Activity feed with pagination (default: 20 items) |
| GET | `/api/dashboard/admin/overview` | Admin-only: all projects health table |

---

## Data Requirements

**New tables needed:**
- `activity_logs` — records every significant event in the system

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | |
| `project_id` | UUID | FK → projects.id, NULL | Which project |
| `task_id` | UUID | FK → tasks.id, NULL | Which task (if applicable) |
| `actor_id` | UUID | FK → users.id, NOT NULL | Who performed the action |
| `action` | VARCHAR(50) | NOT NULL | e.g., `task_created`, `status_changed`, `member_added` |
| `payload` | JSONB | NULL | Before/after values or extra context |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT NOW() | |

**Indexes:**
- `idx_activity_logs_project_id` on `project_id`
- `idx_activity_logs_actor_id` on `actor_id`
- `idx_activity_logs_created_at` on `created_at DESC`

---

## Security Considerations

- [ ] Activity feed must only show events from projects the current user is a member of
- [ ] Admin overview endpoint must check `role = 'admin'` server-side
- [ ] Dashboard summary must scope to the current user's `user_id` only
- [ ] No PII in activity log `payload` beyond user name and task title

---

## Dependencies

| Dependency | Type | Notes |
|-----------|------|-------|
| FEAT-001 (Auth) | Feature prerequisite | Dashboard requires authenticated user |
| FEAT-002 (Projects) | Feature prerequisite | Project cards require projects data |
| FEAT-003 (Tasks) | Feature prerequisite | Stats are derived from tasks |
| FEAT-004 (Members) | Feature prerequisite | Scoping requires project_members table |

---

## Open Questions

| # | Question | Owner | Resolution |
|---|---------|-------|------------|
| 1 | Should the dashboard auto-refresh on a timer, or only on page load? | Product | Pending — MVP: page load only |
| 2 | Should activity feed show actions from the user themselves? | Product | Pending |

---

## Implementation Notes

- Use `Promise.all()` on the frontend to fetch all dashboard sections in parallel
- Dashboard API endpoints should use Prisma `groupBy` and aggregation queries — avoid N+1
- Activity log entries are written by the service layer, not the route handler
- Use a single `activity_logs` service method: `logActivity({ actorId, projectId, taskId, action, payload })` — call this from tasks.service, members.service, etc.
- For relative time formatting, use `date-fns formatDistanceToNow()`

---

## Test Requirements

- [ ] Unit tests for: dashboard aggregation queries (summary, projects, activity)
- [ ] Unit tests for: activity log scoping (verify non-member projects are excluded)
- [ ] Integration tests for: `GET /api/dashboard/summary`, `GET /api/dashboard/activity`
- [ ] E2E tests for: dashboard load after login, activity feed scroll

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
