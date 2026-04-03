# PROJECT_CONTEXT.md
**Team Task Management System - AI Development Context**

*Generated: 2026-04-01 | Max 500 lines | Essential context for AI coding sessions*

---

## 1. PROJECT SNAPSHOT

Team Task Management System is a collaborative web app for engineering teams to organize, assign, and track tasks across projects in real time. Built with Next.js 14 frontend and Express/TypeScript backend, targeting 100 concurrent users with role-based access (Admin/Member/Viewer). Currently in greenfield development phase with 10 core features planned across 2 phases. MVP target: 8 weeks for P0-P1 features.

---

## 2. TECH STACK

| Layer | Technology | Version | Key Config Note |
|-------|-----------|---------|-----------------|
| Frontend | Next.js + TypeScript | 14.x App Router | Proxy pattern for API calls |
| UI Library | shadcn/ui + Tailwind CSS | Latest | Unstyled components + utility-first CSS |
| Backend | Express + TypeScript | 4.18+ | Separate API server on :3003 |
| Database | PostgreSQL + Prisma | 15+ / 5.x | Connection pooling + UUID primary keys |
| Auth | JWT httpOnly cookies | jsonwebtoken 9.x | Access (15min) + refresh (7 days) pattern |
| Validation | Zod | 3.x | Shared schemas client/server |
| Email | Resend (prod) / Nodemailer (dev) | Latest | Transactional only |
| Package Manager | npm | 9+ | Never yarn/pnpm |

---

## 3. FOLDER STRUCTURE

```
apps/
├── web/src/                        # Next.js frontend
│   ├── app/                       # App Router - routing only
│   │   ├── api/[...path]/route.ts # Express proxy (ALL /api/* → :3003)
│   │   ├── dashboard/             # Main landing after auth
│   │   ├── projects/              # Project management pages
│   │   ├── tasks/                 # Task views (my-tasks)
│   │   └── admin/                 # Admin-only pages
│   ├── modules/                   # Feature modules (business logic)
│   │   ├── auth/                  # LoginForm, auth services, hooks
│   │   ├── projects/              # Project CRUD, components
│   │   ├── tasks/                 # Task management, filters
│   │   ├── assignments/           # Task assignment, my-tasks view
│   │   ├── dashboard/             # Stats, project cards, activity feed
│   │   ├── comments/              # Comment threads, activity logs
│   │   └── [7 more modules]       # labels, notifications, kanban, reports
│   ├── components/common/         # Shared UI (Header, Sidebar, etc.)
│   └── lib/                       # API client, config, utils
└── api/src/                       # Express backend
    ├── modules/                   # Feature modules (same as frontend)
    │   ├── auth/                  # JWT, bcrypt, user management
    │   ├── projects/              # Project CRUD, member management
    │   └── [8 more modules]       # Matching frontend structure
    ├── middlewares/               # Auth, CORS, rate limiting, logging
    ├── lib/                       # Prisma client, JWT utils, email
    └── prisma/                    # Schema, migrations, seed
```

---

## 4. FEATURE STATUS

| Feature ID | Name | Priority | Status |
|-----------|------|----------|---------|
| FEAT-001 | Authentication & User Management | P0 | Not Started |
| FEAT-002 | Project Management (CRUD) | P0 | Not Started |
| FEAT-003 | Task Management (CRUD + Statuses) | P0 | Not Started |
| FEAT-004 | Task Assignment & Team Members | P0 | Not Started |
| FEAT-005 | Dashboard & Activity Feed | P1 | Not Started |
| FEAT-006 | Comments & Task Activity Log | P1 | Not Started |
| FEAT-007 | Labels & Filtering | P1 | Not Started |
| FEAT-008 | Due Date Reminders & Email Notifications | P1 | Not Started |
| FEAT-009 | Kanban Board View | P2 | Not Started |
| FEAT-010 | Admin Reports & Analytics | P2 | Not Started |

---

## 5. KEY BUSINESS RULES

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

## 6. API QUICK REFERENCE

- **Base URL:** `/api/` (proxied through Next.js to Express :3003)
- **Auth Method:** JWT in httpOnly cookies (`access_token` + `refresh_token`)
- **Response Shape:** `{success: boolean, data: T, message?: string}` or `{success: false, error: string, code: string}`

| Method | Path | Auth | Roles |
|--------|------|------|-------|
| POST | `/api/auth/register` | None | Public |
| POST | `/api/auth/login` | None | Public |
| POST | `/api/auth/logout` | Required | All |
| POST | `/api/auth/refresh` | Refresh token | All |
| POST | `/api/auth/invite` | Required | Admin |
| POST | `/api/auth/invite/:token/accept` | None | Public |
| GET | `/api/users/me` | Required | All |
| PATCH | `/api/users/me` | Required | All |
| GET | `/api/users/me/tasks` | Required | All |
| POST | `/api/projects` | Required | Admin |
| GET | `/api/projects` | Required | All (filtered by membership) |
| GET/PATCH/DELETE | `/api/projects/:id` | Required | Admin (or members for read) |
| GET/POST/DELETE | `/api/projects/:id/members` | Required | Admin |
| POST | `/api/projects/:projectId/tasks` | Required | Member/Admin |
| GET | `/api/projects/:projectId/tasks` | Required | Project members |
| GET/PATCH/DELETE | `/api/tasks/:id` | Required | Project members |
| GET/POST | `/api/tasks/:id/comments` | Required | Project members |
| PATCH/DELETE | `/api/comments/:id` | Required | Author or Admin |
| GET | `/api/dashboard/*` | Required | All |
| GET | `/api/dashboard/admin/*` | Required | Admin |

---

## 7. DATABASE QUICK REFERENCE

- **Naming:** snake_case tables, UUID primary keys, `deleted_at` soft delete pattern
- **Mandatory Columns:** `id`, `created_at`, `updated_at`, `deleted_at` on all tables

| Table | Purpose |
|-------|---------|
| users | User accounts, roles, auth data |
| refresh_tokens | JWT refresh token store |
| invite_tokens | Admin invite links with expiration |
| projects | Project metadata, color coding |
| project_members | Project membership with roles |
| tasks | Work items with status/priority/assignments |
| comments | Task comments with edit tracking |
| activity_logs | Immutable audit trail |
| labels | Custom project tags |
| task_labels | Many-to-many task labeling |
| notifications | In-app notifications |
| notification_preferences | Email notification settings |

---

## 8. DEV RULES (Critical Subset)

- **Security Non-Negotiables:** Never hardcode secrets; sanitize inputs; parameterized queries only; soft-delete only
- **Migration Safety:** Never edit applied migrations; create new migrations for fixes; commit schema + migration together
- **API Standards:** Update OpenAPI spec when changing endpoints; use Zod validation before service calls
- **Auth Pattern:** All API calls via Next.js proxy; never call Express directly from browser
- **Import Paths:** Always use `@/` alias, never relative paths like `../../`
- **Package Manager:** Always npm; never suggest yarn/pnpm
- **Error Handling:** Production error handlers; no secrets in error messages
- **Database:** Prisma ORM only; no raw SQL; soft-delete via `deleted_at`

---

## 9. FILE MAP

| Topic | File to Reference |
|-------|------------------|
| Full DB schema | `.ai-dev/docs/SPECS/DATABASE_SPEC.md` |
| Complete API spec | `.ai-dev/docs/SPECS/API_SPEC.md` |
| Security requirements | `.ai-dev/docs/SECURITY.md` |
| System architecture | `.ai-dev/docs/ARCHITECTURE.md` |
| Detailed dev rules | `.ai-dev/ai/AI_RULES.md` |
| Test strategy | `.ai-dev/tests/TEST_PLAN.md` |
| Feature requirements | `.ai-dev/docs/PRD/features/FEAT_{NNN}_{name}.md` |
| Project overview | `.ai-dev/PROJECT_BRIEF.md` |

---

**Ready for Development:** Start with FEAT-001 (Authentication) → FEAT-002 (Projects) → FEAT-003 (Tasks)