# 🏗️ System Architecture
**Team Task Management System**

> **Generated:** 2026-04-01
> **Architecture Type:** Modular Monorepo with Feature-Based Domain Separation

---

## 1. SYSTEM OVERVIEW

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │    │                 │    │                 │
│    Browser      │───▶│   Next.js       │───▶│   Express API   │───▶│  PostgreSQL     │
│                 │    │   (:3000)       │    │   (:3003)       │    │   (:5432)       │
│                 │    │                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
                               │
                               │ Proxy Layer
                               ▼
                       ┌─────────────────┐
                       │                 │
                       │ /api/[...path]  │
                       │ route.ts        │
                       │                 │
                       └─────────────────┘
```

**Data Flow:**
1. Browser makes requests to Next.js app (localhost:3000)
2. UI routes serve pages directly from App Router
3. API routes (`/api/*`) are proxied through `/api/[...path]/route.ts` to Express server
4. Express server (localhost:3003) handles all business logic and database operations
5. Prisma ORM manages PostgreSQL connection and queries

**Key Architectural Principles:**
- **Feature-based modularity** — each feature is self-contained
- **Separation of concerns** — UI, API, and data layers are distinct
- **Single source of truth** — Express API owns all business logic
- **Proxy pattern** — Next.js never calls Express directly; all goes through proxy

---

## 2. FOLDER STRUCTURE

```
team-task-management-system/
├── apps/
│   ├── web/                                    # Next.js 14 frontend application
│   │   └── src/
│   │       ├── app/                            # App Router - routing only, no logic
│   │       │   ├── layout.tsx                  # Root layout with auth context
│   │       │   ├── page.tsx                    # Landing page (redirect to dashboard)
│   │       │   ├── api/
│   │       │   │   └── [...path]/
│   │       │   │       └── route.ts            # Express proxy - forwards all /api/* calls
│   │       │   ├── auth/
│   │       │   │   ├── login/page.tsx          # Login page
│   │       │   │   ├── register/page.tsx       # Registration page
│   │       │   │   └── invite/[token]/page.tsx # Invite acceptance page
│   │       │   ├── dashboard/page.tsx          # Main dashboard - landing after auth
│   │       │   ├── projects/
│   │       │   │   ├── page.tsx                # Project list page
│   │       │   │   ├── [id]/page.tsx           # Project detail with task list
│   │       │   │   └── [id]/board/page.tsx     # Kanban board view
│   │       │   ├── tasks/
│   │       │   │   └── my-tasks/page.tsx       # Cross-project "My Tasks" view
│   │       │   ├── admin/
│   │       │   │   ├── reports/page.tsx        # Admin analytics dashboard
│   │       │   │   └── users/page.tsx          # User management (role assignment)
│   │       │   └── settings/
│   │       │       ├── page.tsx                # User profile settings
│   │       │       └── account/page.tsx        # Account settings, password change
│   │       ├── modules/                        # Feature modules - core business logic
│   │       │   ├── auth/
│   │       │   │   ├── components/             # LoginForm, RegisterForm, InviteModal
│   │       │   │   ├── hooks/                  # useAuth, useInvite
│   │       │   │   ├── services/               # auth-api.ts
│   │       │   │   └── types.ts                # User, AuthState interfaces
│   │       │   ├── projects/
│   │       │   │   ├── components/             # ProjectCard, ProjectForm, ProjectList
│   │       │   │   ├── hooks/                  # useProjects, useProjectMembers
│   │       │   │   ├── services/               # projects-api.ts
│   │       │   │   └── types.ts                # Project, ProjectMember interfaces
│   │       │   ├── tasks/
│   │       │   │   ├── components/             # TaskItem, TaskForm, TaskFilter, StatusBadge
│   │       │   │   ├── hooks/                  # useTasks, useTaskDetail
│   │       │   │   ├── services/               # tasks-api.ts
│   │       │   │   └── types.ts                # Task, TaskStatus, TaskPriority enums
│   │       │   ├── assignments/
│   │       │   │   ├── components/             # AssigneeSelect, MyTasksView
│   │       │   │   ├── hooks/                  # useAssignments, useMyTasks
│   │       │   │   ├── services/               # assignments-api.ts
│   │       │   │   └── types.ts                # Assignment interfaces
│   │       │   ├── dashboard/
│   │       │   │   ├── components/             # StatCard, ProjectHealthCard, ActivityFeed
│   │       │   │   ├── hooks/                  # useDashboard, useActivity
│   │       │   │   ├── services/               # dashboard-api.ts
│   │       │   │   └── types.ts                # DashboardData, ActivityLogItem
│   │       │   ├── comments/
│   │       │   │   ├── components/             # CommentThread, CommentForm, CommentItem
│   │       │   │   ├── hooks/                  # useComments, useTaskActivity
│   │       │   │   ├── services/               # comments-api.ts
│   │       │   │   └── types.ts                # Comment, ActivityLog interfaces
│   │       │   ├── labels/
│   │       │   │   ├── components/             # LabelManager, LabelSelect, FilterBar
│   │       │   │   ├── hooks/                  # useLabels, useTaskFilters
│   │       │   │   ├── services/               # labels-api.ts
│   │       │   │   └── types.ts                # Label, FilterOptions interfaces
│   │       │   ├── notifications/
│   │       │   │   ├── components/             # NotificationBell, NotificationList
│   │       │   │   ├── hooks/                  # useNotifications, useEmailPrefs
│   │       │   │   ├── services/               # notifications-api.ts
│   │       │   │   └── types.ts                # Notification, EmailPreference interfaces
│   │       │   ├── kanban/
│   │       │   │   ├── components/             # KanbanBoard, KanbanColumn, TaskCard
│   │       │   │   ├── hooks/                  # useKanbanData, useDragDrop
│   │       │   │   ├── services/               # kanban-api.ts
│   │       │   │   └── types.ts                # KanbanData, DragResult interfaces
│   │       │   └── reports/
│   │       │       ├── components/             # CompletionChart, WorkloadTable, StatusPie
│   │       │       ├── hooks/                  # useReports, useAnalytics
│   │       │       ├── services/               # reports-api.ts
│   │       │       └── types.ts                # ReportData, ChartConfig interfaces
│   │       ├── components/                     # Shared UI components
│   │       │   ├── common/
│   │       │   │   ├── Header.tsx              # Navigation, user menu, logout
│   │       │   │   ├── Sidebar.tsx             # Project navigation, quick links
│   │       │   │   ├── LoadingSpinner.tsx      # Global loading component
│   │       │   │   └── ErrorBoundary.tsx       # Error handling wrapper
│   │       │   └── ui/                         # shadcn/ui components
│   │       │       ├── button.tsx              # Shadcn button component
│   │       │       ├── input.tsx               # Shadcn input component
│   │       │       ├── select.tsx              # Shadcn select component
│   │       │       ├── badge.tsx               # Shadcn badge component
│   │       │       ├── card.tsx                # Shadcn card component
│   │       │       ├── dialog.tsx              # Shadcn modal/dialog
│   │       │       ├── dropdown-menu.tsx       # Shadcn dropdown
│   │       │       ├── form.tsx                # Shadcn form wrapper
│   │       │       ├── sheet.tsx               # Shadcn slide-over panel
│   │       │       ├── table.tsx               # Shadcn data table
│   │       │       └── toast.tsx               # Shadcn notification toasts
│   │       ├── lib/                            # Core utilities and configuration
│   │       │   ├── api-client.ts               # Fetch wrapper with auth token handling
│   │       │   ├── config.ts                   # App config, constants, feature flags
│   │       │   ├── utils.ts                    # Utility functions (cn, date formatting)
│   │       │   └── validations.ts              # Shared Zod schemas (client-side)
│   │       ├── styles/
│   │       │   └── globals.css                 # Tailwind imports, global styles
│   │       └── types/
│   │           ├── api.ts                      # API response types, pagination
│   │           └── shared.ts                   # Types used across multiple modules
│   └── api/                                    # Express backend application
│       ├── src/
│       │   ├── core/                           # Application bootstrapping
│       │   │   ├── app.ts                      # Express app setup, middleware, routes
│       │   │   └── server.ts                   # Server startup, port binding
│       │   ├── modules/                        # Feature modules - business logic
│       │   │   ├── auth/
│       │   │   │   ├── auth.routes.ts          # POST /register, /login, /logout, /refresh
│       │   │   │   ├── auth.controller.ts      # Route handlers with validation
│       │   │   │   ├── auth.service.ts         # Business logic: JWT, bcrypt, DB ops
│       │   │   │   ├── auth.validation.ts      # Zod schemas for auth inputs
│       │   │   │   └── auth.types.ts           # Auth-specific interfaces
│       │   │   ├── projects/
│       │   │   │   ├── projects.routes.ts      # CRUD routes for projects
│       │   │   │   ├── projects.controller.ts  # Request validation and response handling
│       │   │   │   ├── projects.service.ts     # Project business logic, member management
│       │   │   │   ├── projects.validation.ts  # Project input schemas
│       │   │   │   └── projects.types.ts       # Project-related interfaces
│       │   │   ├── tasks/
│       │   │   │   ├── tasks.routes.ts         # CRUD routes for tasks, status updates
│       │   │   │   ├── tasks.controller.ts     # Task request handling
│       │   │   │   ├── tasks.service.ts        # Task business logic, status validation
│       │   │   │   ├── tasks.validation.ts     # Task input schemas
│       │   │   │   └── tasks.types.ts          # Task enums, interfaces
│       │   │   ├── assignments/
│       │   │   │   ├── assignments.routes.ts   # Task assignment, my-tasks endpoint
│       │   │   │   ├── assignments.controller.ts
│       │   │   │   ├── assignments.service.ts  # Assignment logic, permission checks
│       │   │   │   ├── assignments.validation.ts
│       │   │   │   └── assignments.types.ts
│       │   │   ├── dashboard/
│       │   │   │   ├── dashboard.routes.ts     # Dashboard data aggregation endpoints
│       │   │   │   ├── dashboard.controller.ts
│       │   │   │   ├── dashboard.service.ts    # Stats calculation, activity queries
│       │   │   │   ├── dashboard.validation.ts
│       │   │   │   └── dashboard.types.ts
│       │   │   ├── comments/
│       │   │   │   ├── comments.routes.ts      # Comment CRUD, activity log
│       │   │   │   ├── comments.controller.ts
│       │   │   │   ├── comments.service.ts     # Comment logic, edit window enforcement
│       │   │   │   ├── comments.validation.ts
│       │   │   │   └── comments.types.ts
│       │   │   ├── labels/
│       │   │   │   ├── labels.routes.ts        # Label CRUD, task filtering
│       │   │   │   ├── labels.controller.ts
│       │   │   │   ├── labels.service.ts       # Label management, filter logic
│       │   │   │   ├── labels.validation.ts
│       │   │   │   └── labels.types.ts
│       │   │   ├── notifications/
│       │   │   │   ├── notifications.routes.ts # Notification CRUD, preferences
│       │   │   │   ├── notifications.controller.ts
│       │   │   │   ├── notifications.service.ts # Email sending, cron job logic
│       │   │   │   ├── notifications.validation.ts
│       │   │   │   └── notifications.types.ts
│       │   │   ├── kanban/
│       │   │   │   ├── kanban.routes.ts        # Board data, drag-drop updates
│       │   │   │   ├── kanban.controller.ts
│       │   │   │   ├── kanban.service.ts       # Position updates, status changes
│       │   │   │   ├── kanban.validation.ts
│       │   │   │   └── kanban.types.ts
│       │   │   └── reports/
│       │   │       ├── reports.routes.ts       # Analytics endpoints, CSV export
│       │   │       ├── reports.controller.ts
│       │   │       ├── reports.service.ts      # Data aggregation, chart generation
│       │   │       ├── reports.validation.ts
│       │   │       └── reports.types.ts
│       │   ├── middlewares/                    # Cross-cutting concerns
│       │   │   ├── auth.middleware.ts          # JWT verification, role checking
│       │   │   ├── error.middleware.ts         # Global error handler
│       │   │   ├── cors.middleware.ts          # CORS configuration
│       │   │   ├── rate-limit.middleware.ts    # API rate limiting
│       │   │   └── logging.middleware.ts       # Request/response logging
│       │   ├── lib/                            # Core utilities and database
│       │   │   ├── prisma.ts                   # Prisma client singleton
│       │   │   ├── jwt.ts                      # JWT sign/verify utilities
│       │   │   ├── email.ts                    # Email service (Resend/Nodemailer)
│       │   │   ├── bcrypt.ts                   # Password hashing utilities
│       │   │   └── logger.ts                   # Winston/Pino structured logger
│       │   ├── config/                         # Configuration and environment
│       │   │   ├── env.ts                      # Environment variable validation
│       │   │   └── constants.ts                # App constants, defaults
│       │   └── utils/                          # Helper functions
│       │       ├── date.ts                     # Date formatting, timezone utils
│       │       ├── crypto.ts                   # Token generation, hashing
│       │       └── validation.ts               # Shared validation helpers
│       ├── prisma/                             # Database schema and migrations
│       │   ├── schema.prisma                   # Main Prisma schema file
│       │   ├── migrations/                     # Auto-generated migration files
│       │   │   └── [timestamp]_[description]/
│       │   │       └── migration.sql           # Individual migration SQL
│       │   └── seed.ts                         # Database seeding script
│       └── tsconfig.json                       # TypeScript config for API
├── packages/                                   # Shared packages (if needed)
│   └── types/                                  # Shared TypeScript types (optional)
│       └── index.ts                            # Common types across apps
├── .env                                        # Development environment variables
├── .env.example                                # Environment variable template
├── package.json                                # Root workspace configuration
├── tsconfig.json                               # Root TypeScript configuration
├── tailwind.config.js                          # Tailwind CSS configuration
└── .gitignore                                  # Git ignore patterns
```

---

## 3. MODULE LIST

| Module ID | Feature Name | Frontend Path | Backend Path | Description |
|-----------|--------------|---------------|--------------|-------------|
| **auth** | Authentication & User Management | `apps/web/src/modules/auth/` | `apps/api/src/modules/auth/` | Email+password login, JWT tokens, user registration, role management (Admin/Member/Viewer) |
| **projects** | Project Management (CRUD) | `apps/web/src/modules/projects/` | `apps/api/src/modules/projects/` | Create, archive, delete projects; color coding; project membership management |
| **tasks** | Task Management (CRUD + Statuses) | `apps/web/src/modules/tasks/` | `apps/api/src/modules/tasks/` | 5 statuses, 4 priorities, due dates, soft-delete pattern, task CRUD operations |
| **assignments** | Task Assignment & Team Members | `apps/web/src/modules/assignments/` | `apps/api/src/modules/assignments/` | Assign tasks to project members, "My Tasks" cross-project view, in-app notifications |
| **dashboard** | Dashboard & Activity Feed | `apps/web/src/modules/dashboard/` | `apps/api/src/modules/dashboard/` | Personal task summary, project health cards, global activity feed |
| **comments** | Comments & Task Activity Log | `apps/web/src/modules/comments/` | `apps/api/src/modules/comments/` | Comment threads on tasks, 15-minute edit window, system-generated activity log |
| **labels** | Labels & Filtering | `apps/web/src/modules/labels/` | `apps/api/src/modules/labels/` | Custom labels per project, multi-criteria filtering, sort options |
| **notifications** | Due Date Reminders & Email Notifications | `apps/web/src/modules/notifications/` | `apps/api/src/modules/notifications/` | Daily cron job, email reminders, user notification preferences |
| **kanban** | Kanban Board View | `apps/web/src/modules/kanban/` | `apps/api/src/modules/kanban/` | Drag-and-drop board view, column-based status organization, visual task cards |
| **reports** | Admin Reports & Analytics | `apps/web/src/modules/reports/` | `apps/api/src/modules/reports/` | Completion trend charts, team workload table, status distribution, CSV export |

---

## 4. TECHNOLOGY DECISIONS

| Layer | Technology | Version | Rationale |
|-------|------------|---------|-----------|
| **Frontend Framework** | Next.js | 14.x (App Router) | **Chosen for:** SSR, file-based routing, React ecosystem, excellent DX. App Router for server components and layouts. |
| **UI Component Library** | shadcn/ui | Latest | **Chosen for:** Unstyled, customizable, Tailwind-native, copy-paste approach vs heavy library dependencies. |
| **CSS Framework** | Tailwind CSS | 3.x | **Chosen for:** Utility-first, fast prototyping, design consistency, excellent with shadcn/ui. No CSS-in-JS overhead. |
| **Backend Framework** | Express.js + TypeScript | 4.18+ | **Chosen for:** Mature, lightweight, extensive middleware ecosystem, TypeScript support. No need for full framework like Nest.js for this size. |
| **Package Manager** | npm | 9+ | **Chosen for:** Standard tooling, reliable lockfile, workspace support. No yarn/pnpm complexity needed. |
| **Database** | PostgreSQL | 15+ | **Chosen for:** ACID compliance, JSON support, excellent Prisma integration, mature for production workloads. |
| **ORM** | Prisma | 5.x | **Chosen for:** TypeScript-first, excellent DX, migration system, query optimization, type safety. |
| **Authentication** | JWT (httpOnly cookies) | jsonwebtoken 9.x | **Chosen for:** Stateless, secure cookie storage, access+refresh pattern, no session store complexity. |
| **Validation** | Zod | 3.x | **Chosen for:** TypeScript-first, runtime safety, schema sharing between client/server, excellent error messages. |
| **Email Service** | Resend (prod), Nodemailer (dev) | Latest | **Chosen for:** Resend has modern API, excellent DX. Nodemailer for local dev without external deps. |
| **File Storage** | None (MVP) | N/A | **Decision:** File attachments are out of scope for MVP. Will reassess in Phase 2. |
| **Deployment - Frontend** | Vercel | Latest | **Chosen for:** Optimized for Next.js, zero-config deployments, preview deployments, CDN. |
| **Deployment - Backend + DB** | Railway | Latest | **Chosen for:** Simple Express deployments, managed PostgreSQL, environment management, cost-effective. |

---

## 5. KEY ARCHITECTURAL DECISIONS

### Decision 1: Modular Monorepo vs. Microservices
**Decision:** Use modular monorepo with feature-based modules
**Rationale:**
- Team size: Single developer doesn't need microservice complexity
- Development speed: Shared types, easier debugging, single deployment
- Complexity: 10 features don't justify distributed system overhead
**Trade-offs:** Less service isolation but much simpler operations

### Decision 2: Next.js as API Proxy vs. Direct Backend Calls
**Decision:** All API calls go through Next.js proxy (`/api/[...path]/route.ts`)
**Rationale:**
- CORS simplicity: Frontend and API appear as same origin
- Auth consistency: Cookies work seamlessly
- Deployment flexibility: Can change backend URL without frontend rebuild
**Trade-offs:** Extra network hop but eliminates CORS issues

### Decision 3: Express over Next.js API Routes for Backend
**Decision:** Separate Express server instead of Next.js API routes
**Rationale:**
- Business logic separation: Cleaner architecture boundaries
- Database connections: Better connection pooling vs serverless functions
- Testing: Easier unit/integration testing of API logic
**Trade-offs:** More complexity but better scalability and testability

### Decision 4: JWT in httpOnly Cookies vs. localStorage
**Decision:** Store JWT in httpOnly cookies with refresh token pattern
**Rationale:**
- Security: Immune to XSS attacks, CSRF protection with SameSite
- UX: Auto-refresh mechanism maintains sessions
- Standards: Following OAuth 2.0 best practices
**Trade-offs:** More complex implementation but significantly more secure

### Decision 5: Soft Delete vs. Hard Delete
**Decision:** Soft delete pattern for all entities using `deleted_at` field
**Rationale:**
- Data recovery: Accidental deletions can be restored
- Audit trail: Maintains referential integrity for activity logs
- Compliance: Data retention for future compliance requirements
**Trade-offs:** Slightly more complex queries but much safer operations

### Decision 6: Feature-Based Module Structure
**Decision:** Each feature is a complete module with own components/hooks/services
**Rationale:**
- Scalability: New features don't affect existing code
- Team growth: Multiple developers can work on different features
- Maintenance: Clear ownership boundaries and easier debugging
**Trade-offs:** Some code duplication but much better organization

---

## 6. API ARCHITECTURE

### Base Configuration
- **Base URL:** `/api/` (all endpoints are prefixed with `/api/`)
- **Proxy Layer:** `apps/web/src/app/api/[...path]/route.ts` → `http://localhost:3003`
- **Content Type:** `application/json` for requests and responses
- **Authentication:** JWT access token in httpOnly cookie (`access_token`)
- **Refresh Pattern:** Refresh token in httpOnly cookie (`refresh_token`)

### Standard Response Format
```typescript
// Success Response
{
  success: true,
  data: T,                // Actual data payload
  message?: string,       // Optional success message
  pagination?: {          // For paginated endpoints
    page: number,
    limit: number,
    total: number,
    totalPages: number
  }
}

// Error Response
{
  success: false,
  error: string,          // Human-readable error message
  code: string,           // Machine-readable error code
  details?: object        // Optional additional error details
}
```

### Authentication Flow
1. **Login:** `POST /api/auth/login` → Sets both `access_token` and `refresh_token` cookies
2. **Protected Endpoints:** Include `Authorization: Bearer <token>` header (auto-handled by proxy)
3. **Token Refresh:** Auto-refresh via middleware when access token expires
4. **Logout:** `POST /api/auth/logout` → Clears both cookies, invalidates refresh token

### Pagination Standard
```typescript
// Query Parameters
?page=1&limit=20&sort=created_at&order=desc

// Response Format (when data is array)
{
  success: true,
  data: T[],
  pagination: {
    page: 1,
    limit: 20,
    total: 156,
    totalPages: 8
  }
}
```

### Error Handling
- **400 Bad Request:** Validation errors, malformed input
- **401 Unauthorized:** Missing or invalid authentication
- **403 Forbidden:** Valid auth but insufficient permissions
- **404 Not Found:** Resource doesn't exist
- **409 Conflict:** Duplicate entry (e.g., email already exists)
- **422 Unprocessable Entity:** Business logic violations
- **500 Internal Server Error:** Unexpected server errors

---

## 7. DATABASE ARCHITECTURE

### Prisma Configuration
- **Client Location:** `apps/api/src/lib/prisma.ts` (singleton pattern)
- **Schema File:** `apps/api/prisma/schema.prisma`
- **Migrations:** Auto-generated in `apps/api/prisma/migrations/`
- **Connection:** PostgreSQL with connection pooling

### Data Patterns
```prisma
// Standard field patterns for all models
model ExampleTable {
  id          String    @id @default(uuid())          // UUID primary keys
  created_at  DateTime  @default(now()) @db.Timestamptz
  updated_at  DateTime  @updatedAt @db.Timestamptz
  deleted_at  DateTime? @db.Timestamptz               // Soft delete pattern

  // ... feature-specific fields

  @@map("example_table")                              // snake_case table names
}
```

### Core Entities
- **users** — User accounts, roles, authentication data
- **projects** — Project metadata, settings, color coding
- **project_members** — Many-to-many join table for project membership
- **tasks** — Task data, status, priority, due dates, assignments
- **comments** — Task comments with edit tracking
- **activity_logs** — System-generated event log for all changes
- **labels** — Custom tags per project
- **task_labels** — Many-to-many join for task labeling
- **notifications** — In-app notifications
- **email_preferences** — User notification settings
- **refresh_tokens** — JWT refresh token store (for invalidation)
- **invite_tokens** — Admin invite links with expiration

### Migration Strategy
```bash
# Development
npx prisma migrate dev --name descriptive_change_name

# Production/CI
npx prisma migrate deploy

# Schema changes
1. Edit schema.prisma
2. Run migrate dev (creates migration file)
3. Review generated SQL before commit
4. Commit both schema.prisma and migration files together
```

### Indexing Strategy
```prisma
// Performance indexes for common queries
model Task {
  // ... fields

  @@index([project_id])                    // Filter by project
  @@index([assignee_id])                   // Filter by assignee
  @@index([status])                        // Filter by status
  @@index([due_date])                      // Sort/filter by due date
  @@index([created_at])                    // Sort by creation
  @@index([deleted_at])                    // Soft delete queries
}

model ActivityLog {
  // ... fields

  @@index([project_id, created_at])        // Dashboard activity feed
  @@index([actor_id])                      // User activity
}
```

---

## 8. ENVIRONMENT VARIABLES

| Variable | Type | Example | Used By | Required | Description |
|----------|------|---------|---------|----------|-------------|
| **Database** |
| `DATABASE_URL` | string | `postgresql://user:pass@localhost:5432/taskdb` | API | ✅ | PostgreSQL connection string |
| `DIRECT_URL` | string | `postgresql://user:pass@localhost:5432/taskdb` | API | ✅ | Direct DB connection (Prisma) |
| **Authentication** |
| `JWT_SECRET` | string | `your-super-secure-jwt-secret-key` | API | ✅ | JWT signing secret (min 32 chars) |
| `JWT_REFRESH_SECRET` | string | `your-refresh-token-secret-key` | API | ✅ | Refresh token signing secret |
| **Email Services** |
| `RESEND_API_KEY` | string | `re_123abc...` | API | ✅ (prod) | Resend service API key |
| `EMAIL_FROM` | string | `noreply@taskapp.com` | API | ✅ (prod) | Sender email address |
| `SMTP_HOST` | string | `localhost` | API | ✅ (dev) | SMTP host for Nodemailer |
| `SMTP_PORT` | number | `1025` | API | ✅ (dev) | SMTP port for local email |
| **Application** |
| `NODE_ENV` | string | `development` | API | ✅ | Environment mode |
| `API_PORT` | number | `3003` | API | ❌ | Express server port (default: 3003) |
| `API_BASE_URL` | string | `http://localhost:3003` | Web | ❌ | Backend URL for proxy (default: :3003) |
| `NEXTAUTH_URL` | string | `http://localhost:3000` | Web | ❌ | Frontend URL (default: :3000) |
| `NEXTAUTH_SECRET` | string | `your-nextjs-secret-key` | Web | ✅ | Next.js session secret |
| **Security** |
| `BCRYPT_ROUNDS` | number | `12` | API | ❌ | Password hashing rounds (default: 12) |
| `RATE_LIMIT_WINDOW_MS` | number | `900000` | API | ❌ | Rate limit window (default: 15 min) |
| `RATE_LIMIT_MAX` | number | `100` | API | ❌ | Max requests per window |
| **Feature Flags** |
| `ENABLE_EMAIL_NOTIFICATIONS` | boolean | `true` | API | ❌ | Enable email sending (default: true) |
| `ENABLE_REGISTRATION` | boolean | `false` | API | ❌ | Allow public registration (default: false) |

### Environment Files
```bash
# .env.example (committed to repo)
DATABASE_URL="postgresql://user:password@localhost:5432/taskdb"
JWT_SECRET="your-super-secure-jwt-secret-key"
RESEND_API_KEY="re_your_api_key_here"
# ... all required variables with example values

# .env.local (ignored by git)
# Copy from .env.example and fill in real values
```

---

## 9. LOCAL DEVELOPMENT SETUP

### Prerequisites
- Node.js 18+ and npm 9+
- PostgreSQL 15+ running locally
- Git

### Step-by-Step Setup
```bash
# 1. Clone Repository
git clone <repository-url>
cd team-task-management-system

# 2. Install Dependencies
npm install

# 3. Environment Configuration
cp .env.example .env
# Edit .env with your local values:
# - Set DATABASE_URL to your local PostgreSQL
# - Set JWT_SECRET to a secure random string (min 32 chars)
# - Set EMAIL_* variables for local email testing

# 4. Database Setup
cd apps/api
npx prisma migrate dev --name init_schema
npx prisma db seed
cd ../..

# 5. Start Development Servers (in parallel)
npm run dev

# Alternative: Start servers individually
# Terminal 1: npm run dev:api    (Express on :3003)
# Terminal 2: npm run dev:web    (Next.js on :3000)
```

### Development Commands
```bash
# Root workspace commands
npm run dev          # Start both web and api servers
npm run build        # Build both apps for production
npm run test         # Run all tests
npm run lint         # Lint all packages
npm run type-check   # TypeScript validation

# API-specific commands
npm run dev:api      # Start Express server with nodemon
npm run build:api    # Build API for production
npm run test:api     # Run API unit tests

# Web-specific commands
npm run dev:web      # Start Next.js dev server
npm run build:web    # Build web app for production
npm run test:web     # Run web unit tests

# Database commands
npm run db:migrate   # Run pending Prisma migrations
npm run db:seed      # Seed database with test data
npm run db:reset     # Reset database (dev only)
npm run db:studio    # Open Prisma Studio
```

### Local URLs
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3003
- **Prisma Studio:** http://localhost:5555 (when running)

### Test Accounts (from seed)
```typescript
// Created by prisma/seed.ts
{
  email: "admin@test.com",
  password: "admin123",
  role: "admin"
},
{
  email: "member@test.com",
  password: "member123",
  role: "member"
},
{
  email: "viewer@test.com",
  password: "viewer123",
  role: "viewer"
}
```

---

## 10. DEPLOYMENT OVERVIEW

### Target Environment
**Frontend:** Vercel (optimized for Next.js)
**Backend + Database:** Railway (Express + PostgreSQL)

### Build Commands
```bash
# Frontend (Vercel)
Build Command: npm run build:web
Output Directory: apps/web/.next
Install Command: npm install

# Backend (Railway)
Build Command: npm run build:api
Start Command: npm run start:api
Port: Auto-assigned via $PORT env var
```

### Environment Configuration

#### Vercel Environment Variables
```bash
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=production-secret-key
API_BASE_URL=https://your-api.railway.app
```

#### Railway Environment Variables
```bash
NODE_ENV=production
DATABASE_URL=postgresql://${{Postgres.USER}}:${{Postgres.PASSWORD}}@${{Postgres.HOST}}:${{Postgres.PORT}}/${{Postgres.DATABASE}}
JWT_SECRET=production-jwt-secret-key
JWT_REFRESH_SECRET=production-refresh-secret-key
RESEND_API_KEY=your-production-resend-key
EMAIL_FROM=noreply@yourdomain.com
BCRYPT_ROUNDS=12
```

### Deployment Process

#### Initial Deployment
```bash
# 1. Deploy Backend (Railway)
# - Connect GitHub repo to Railway
# - Add environment variables
# - Deploy from main branch
# - Note the assigned Railway URL

# 2. Run Database Migrations
# In Railway console:
npx prisma migrate deploy
npx prisma db seed

# 3. Deploy Frontend (Vercel)
# - Connect GitHub repo to Vercel
# - Add environment variables (use Railway URL for API_BASE_URL)
# - Deploy from main branch
```

#### Continuous Deployment
- **Automatic:** Both platforms auto-deploy on push to `main` branch
- **Preview:** Vercel creates preview deployments for all PRs
- **Database:** Migrations run automatically via Railway build hook

### Production Considerations
- **CORS:** Configured to allow requests from Vercel domain
- **Rate Limiting:** Enabled for production with higher limits
- **Error Monitoring:** Structured logging with Winston/Pino
- **Health Checks:** `/api/health` endpoint for monitoring
- **SSL/TLS:** Enforced by both Vercel and Railway
- **CDN:** Vercel provides global CDN for static assets

---

**Architecture Document Complete**
*Last Updated: 2026-04-01*
*Ready for implementation: Start with FEAT-001 (Authentication)*
