# 📝 Project Brief

> **This is the SINGLE INPUT FILE for your project.**  
> Filled in for: **Team Task Management System**

---

## 1. Project Identity

| Field | Your Answer |
|-------|------------|
| **Project Name** | Team Task Management System |
| **One-Line Description** | A collaborative web app for engineering teams to organize, assign, and track tasks across projects in real time |
| **Project Type** | Web App / Internal SaaS |
| **Industry / Domain** | Productivity / Project Management |
| **Development Status** | Greenfield |

---

## 2. The Problem

```
Engineering and cross-functional teams lose significant time coordinating work 
via Slack messages, spreadsheets, and email threads. There is no single source 
of truth for task status, ownership, and deadlines. Team leads spend hours each 
week chasing status updates instead of focusing on delivery. Contributors miss 
deadlines because they have no visibility into their personal task queue across 
multiple projects. The result: duplicated effort, dropped tasks, and delayed 
delivery.
```

---

## 3. The Solution

```
Team Task Management System is a web application where teams can create projects, 
create and assign tasks within those projects, and collaborate through comments 
and a shared activity feed. Members see a personal dashboard with all tasks 
assigned to them across every project. Admins can monitor team health, archive 
stale projects, and generate workload and delivery reports. The system enforces 
role-based access control so contributors see only projects they belong to.
```

---

## 4. Target Users & Personas

| Persona | Role | Primary Need |
|---------|------|-------------|
| **Admin** | Engineering lead / project manager | Create projects, manage members, monitor health, view reports |
| **Member** | Developer / contributor | See assigned tasks, update status, collaborate via comments |
| **Viewer** | Stakeholder / product manager | Read-only access to project progress and task status |

---

## 5. Core Features (MVP)

| # | Feature | Priority | Notes |
|---|---------|----------|-------|
| 1 | Authentication & User Management | P0 | Email + password. Roles: Admin, Member, Viewer. JWT httpOnly cookies |
| 2 | Project Management (CRUD) | P0 | Create, archive, delete projects. Color coding. Project membership |
| 3 | Task Management (CRUD + Statuses) | P0 | 5 statuses, 4 priorities, due dates, soft-delete |
| 4 | Task Assignment & Team Members | P0 | Assign tasks to members, "My Tasks" cross-project view, in-app notifications |
| 5 | Dashboard & Activity Feed | P1 | Personal task summary, project health cards, activity feed |
| 6 | Comments & Task Activity Log | P1 | Comment on tasks, 15-min edit window, system activity log |
| 7 | Labels & Filtering | P1 | Custom labels per project, multi-criteria task filtering, sort options |
| 8 | Due Date Reminders & Email Notifications | P1 | Daily job, email reminders, notification preferences |
| 9 | Kanban Board View | P2 | Drag-and-drop board alongside list view |
| 10 | Admin Reports & Analytics | P2 | Completion trends, workload table, status distribution |

---

## 6. Out of Scope (MVP)

- Mobile native app (web-responsive only)
- OAuth / social login
- Slack / GitHub / Jira integrations (Phase 3)
- Time tracking or billing
- Multi-organization / multi-tenant support
- AI-powered suggestions
- File attachments on tasks (Phase 2 consideration)
- Recurring tasks
- Sub-tasks / task dependencies

---

## 7. Key Business Rules

1. Tasks belong to exactly one project — they cannot be moved between projects
2. A user can only be assigned a task if they are already a member of that project
3. Only Admins can create projects, manage members, archive/delete projects, and access reports
4. Members can create, edit, and complete tasks; they can only delete tasks they created
5. Viewers can read everything in their projects but cannot create, edit, or delete anything
6. All records use soft-delete — `deleted_at` is set, never hard-deleted
7. Passwords are hashed with bcrypt (≥ 12 rounds) — never stored or returned in plain text
8. JWT access tokens expire in 15 minutes; refresh tokens expire in 7 days
9. Account locked for 15 minutes after 5 consecutive failed login attempts
10. The last Admin of a project cannot be removed from that project

---

## 8. Tech Stack

| Layer | Default | Your Choice |
|-------|---------|------------|
| Frontend | Next.js 14 + Tailwind + shadcn/ui | **Confirmed** |
| Backend | Node.js + Express + TypeScript | **Confirmed** |
| Database | PostgreSQL + Prisma | **Confirmed** |
| Auth | JWT (httpOnly cookies) | **Confirmed** |
| File Storage | None | Not needed for MVP |
| Email | Resend (transactional) | Production; Nodemailer for dev |
| Payments | None | Not applicable |
| Deployment | Vercel (frontend) + Railway (backend + DB) | Target |

---

## 9. UI & Design Preferences

### 9a. Design Style

| Aspect | Your Preference |
|--------|----------------|
| **Style** | Modern SaaS — dark mode default, clean and professional |
| **Color tone** | Dark slate/indigo base with violet/blue accent. High-contrast status badges |
| **Complexity** | Data-rich tables and forms with a clean Kanban board |
| **Reference apps** | Linear (task list), Notion (sidebar nav), Jira (project + board) |
| **Logo/Brand** | To be created — simple wordmark + icon |

### 9b. Design File References

| Screen / Feature | Source | Path or URL | Notes |
|---|---|---|---|
| Login / Register | `FILE` | `.ai-dev/ui/pages/login.html` | Clean SaaS-style auth page |
| Dashboard | `FILE` | `.ai-dev/ui/pages/dashboard.html` | Stat cards + project grid + activity feed |
| Project List | `FILE` | `.ai-dev/ui/pages/project-list.html` | Card grid with color badges |
| Project Detail (task list) | `FILE` | `.ai-dev/ui/pages/project-detail.html` | Table view with filter bar |
| Task Detail (slide-over) | `FILE` | `.ai-dev/ui/pages/task-detail.html` | Full detail with comments |
| Kanban Board | `FILE` | `.ai-dev/ui/pages/kanban-board.html` | Linear-style board |
| Reports | `FILE` | `.ai-dev/ui/pages/reports.html` | Charts + workload table |

---

## 10. Data & Integrations

| Integration | Purpose | Required for MVP? |
|-------------|---------|-----------------|
| Resend | Transactional email (invites, reminders) | Yes — Phase 1 (invites); Phase 2 (reminders) |
| PostgreSQL | Primary database | Yes |

---

## 11. Non-Functional Requirements

| Requirement | Target |
|------------|--------|
| **API response time** | < 300ms for 95th percentile on standard queries |
| **Concurrent users** | Up to 100 team members simultaneously |
| **Data compliance** | Internal tool — no HIPAA/GDPR requirements for MVP |
| **Accessibility** | WCAG 2.1 AA for all core flows |
| **Browser support** | Chrome 90+, Firefox 90+, Safari 15+, Edge 90+ |
| **Mobile support** | Responsive web — no native app needed |

---

## 12. Team & Timeline

| Field | Value |
|-------|-------|
| **Team size** | Solo developer (AI-assisted) |
| **Development approach** | AI-assisted solo |
| **MVP target** | 8 weeks from project start (Phase 1: FEAT-001 to FEAT-006) |
| **Phase 2 timeline** | 4 weeks after MVP (FEAT-007 to FEAT-010) |

---

## 13. Open Questions / Unknowns

1. Should viewers be able to post comments, or read-only everything including comments?
2. What is the maximum number of members per project (hard cap)?
3. Should deleted tasks be restorable through a UI, or soft-delete only for DB safety?
4. Is there a need for a public project share link (share with non-registered users)?
5. Should task order within a list/column be manually sortable via drag-and-drop?

---

## 14. Existing Codebase

| Field | Value |
|-------|-------|
| **Existing repo** | N/A — Greenfield |
| **Current tech stack** | N/A |
| **What to keep** | N/A |
| **Known technical debt** | N/A |

---

*Last updated: 2026-04-01 (UI mockups completed)*
