# Development Prompts — Phase-by-Phase AI Coding Guide

> **Use these prompts during active development — after all setup docs are complete.**  
> For generating initial project docs (PRD, architecture, specs), see `SETUP_PROMPTS.md` first.
> Replace everything in `[square brackets]` with your actual project values.

---

## How to Use This File

1. **Pick the right phase** for what you are building
2. **Feed AI the context files** listed at the top of each prompt
3. **Fill in every `[bracket]`** before sending the prompt
4. **Review the output** — verify it matches your Feature PRD acceptance criteria
5. **After every session** update: `.ai-dev/PROGRESS.md`, `.ai-dev/CHANGELOG.md`, `.ai-dev/PROJECT_STATUS.md`

---

## Development Phase Order

```
Phase 1  -> Database Design & Migrations
           1.1 Design full schema (Prisma + docs)
           1.2 Generate initial migration + seed
           1.3 Add schema changes (new migration)
           1.4 Review schema for issues
           1.5 Generate seed data
           1.6 Troubleshoot migration issues
Phase 2  -> Authentication Module
Phase 3  -> Core API (Backend)
Phase 4  -> Frontend -- Base Layout & Shell
Phase 5  -> UI -- Feature Pages (per feature)
Phase 6  -> Testing
Phase 7  -> Security Review
Phase 8  -> Bug Fix / Debugging
Phase 9  -> Documentation & Handoff
Phase 10 -> Resuming After a Break
```

> **Always include these context files at the start of every AI session:**  
> `.ai-dev/ai/AI_RULES.md` + `.ai-dev/ai/PROJECT_CONTEXT.md` + the active Feature PRD

---
---


# 🗄️ PHASE 1 — Database Design & Migrations

> **Read this before any database work:**  
> Full rules in `dev/DEV_RULES.md` → Database Rules section.  
> Schema template in `docs/SPECS/DATABASE_SPEC.md`.

---

## PROMPT 1.1 — Design the Full Database Schema

> **When:** All Feature PRDs are approved, before writing any code.  
> **Goal:** Complete Prisma schema + DATABASE_SPEC.md documentation for ALL features.

```
You are a senior database architect. Design for production — not prototypes.

Project: [App Name]
Database: PostgreSQL
ORM: Prisma

Feature being designed: [e.g., "Full MVP — all features"]
OR: [e.g., "Patient Management module only"]

Feature requirements (paste from PRD):
[Paste the "Data / Schema Needs" section from each relevant FEAT_XXX.md]

Existing schema (if any — paste current schema.prisma):
[Paste current schema, or write "None — greenfield"]

Mandatory conventions (follow these exactly — from DATABASE_SPEC.md):
- Primary keys: UUID using gen_random_uuid() — NEVER serial/autoincrement
- Every table MUST have: id (UUID), created_at (TIMESTAMPTZ), updated_at (TIMESTAMPTZ),
  deleted_at (TIMESTAMPTZ NULL) — soft delete pattern
- Column names: snake_case
- Table names: snake_case, plural
- Boolean columns: is_ prefix (e.g., is_active, is_verified)
- Money / amounts: BIGINT in smallest currency unit (paise / cents) — never DECIMAL
- All timestamps: TIMESTAMPTZ (never TIMESTAMP without TZ)
- Soft deletes only — never hard DELETE. All queries filter WHERE deleted_at IS NULL
- Foreign keys: always indexed
- JSON: use JSONB not JSON (PostgreSQL)

Please produce TWO outputs:

OUTPUT 1 — Prisma Schema (schema.prisma model blocks):
- All model definitions with correct types
- All relations (@relation)
- @map() for every snake_case column
- @@map() for every table name
- @@index() for all FK columns and commonly filtered columns
- @@unique() where applicable

OUTPUT 2 — DATABASE_SPEC.md Table Documentation:
For each table:
### Table: `[table_name]`
Purpose: [one sentence]
| Column | Type | Nullable | Default | Description |
Constraints: [PK, FKs, unique constraints]
Indexes: [list with reason for each]

Then add:
### Entity Relationship
[ASCII diagram showing all table relationships]

### Relationships Map
| Table A | Relation | Table B | FK Column | Cascade? |
```

---

## PROMPT 1.2 — Generate Initial Migration

> **When:** Schema design from PROMPT 1.1 is reviewed and approved.  
> **Goal:** Create the initial Prisma migration with seed data.

```
You are a senior backend developer working with Prisma + PostgreSQL.

I have a finalised Prisma schema. I need to set up the initial database migration.

Confirmed schema.prisma:
[Paste the full schema.prisma content from PROMPT 1.1 output]

Project: [App Name]
Environment: Local development (first-time setup)

Please provide:

1. MIGRATION SETUP COMMANDS
   The exact terminal commands to run, in order:
   a) Create/reset the local database
   b) Run the first migration
   c) Generate the Prisma client
   d) Run seed data

2. MIGRATION NAME
   Suggest the correct --name flag for this initial migration.
   Follow the convention: create_[main_entities]_tables
   Example: npx prisma migrate dev --name create_users_and_sessions_tables

3. SEED FILE (prisma/seed.ts)
   Generate a complete seed file that creates:
   - Default admin user (with BCRYPT-hashed password — show the pattern, not a real hash)
   - Any required lookup/enum data (roles, statuses, categories from the schema)
   - 2-3 test users per persona for development testing
   Use Prisma client — not raw SQL. Handle re-runs safely (upsert, not insert).

4. PACKAGE.JSON SEED SCRIPT
   The entry to add to package.json to enable: npm run db:seed

5. VERIFY COMMANDS
   Commands to confirm everything applied correctly:
   npx prisma studio (to visually inspect)
   [Any relevant SQL SELECT to verify seed data]

Migration conventions reminder:
- NEVER edit this migration file once committed
- File is immutable — fix mistakes with a NEW migration
- Commit: git add prisma/ && git commit -m "db: initial schema migration"
```

---

## PROMPT 1.3 — Add Schema Changes (New Migration)

> **When:** A feature requires changes to an existing schema (adding columns, tables, or indexes).  
> **Goal:** Generate a safe, focused new migration — never editing existing ones.  
> ⚠️ **Never use this to modify an existing migration file.**

```
You are a senior backend developer working with Prisma + PostgreSQL.

Project: [App Name]
Feature requiring schema change: [Feature name or FEAT-ID]

Current schema.prisma (the FULL current file):
[Paste the current schema.prisma]

Required changes (from the Feature PRD):
[Describe what needs to change, e.g.:]
- Add `phone` (VARCHAR 20, nullable) column to users table
- Add new table `appointments` with columns: ...
- Add index on appointments.patient_id

CRITICAL RULES for this task:
- DO NOT modify or reference any existing migration files — they are immutable
- Each change should be in its own migration if they are from different features
- Prisma renames = drop old column + add new column (data loss!) — flag this if it applies

Please provide:

1. UPDATED schema.prisma
   Show ONLY the changed/added model blocks (not the full file, to save tokens).
   Be explicit about what was added vs what was changed.

2. MIGRATION COMMAND
   npx prisma migrate dev --name [descriptive_name]
   Name must follow: [verb]_[what]_[table_or_field]
   Examples: add_phone_to_users, create_appointments_table, add_idx_appointments_patient_id

3. GENERATED SQL PREVIEW
   Show what SQL Prisma will likely generate for this change.
   Flag any DESTRUCTIVE operations (DROP COLUMN, type changes, renames).
   If destructive: provide the zero-downtime safe migration strategy.

4. ZERO-DOWNTIME STRATEGY (if adding NOT NULL column to existing table with data):
   Step 1: Add column as NULLABLE → migrate → deploy
   Step 2: Write backfill script for existing rows
   Step 3: Add NOT NULL constraint → migrate → deploy

5. UPDATE CHECKLIST
   - [ ] schema.prisma updated
   - [ ] Migration generated and SQL reviewed
   - [ ] No existing migration files edited
   - [ ] Both schema.prisma + prisma/migrations/ committed together
   - [ ] DATABASE_SPEC.md updated with new table/column docs
   - [ ] API_SPEC.md updated if new fields are exposed via API
```

---

## PROMPT 1.4 — Review Schema for Issues

> **When:** Schema is written, before applying the migration.  
> **Goal:** Catch problems before they reach production.

```
Review the following Prisma schema / SQL DDL for production readiness:

[Paste your schema.prisma or SQL DDL]

Check for ALL of the following and report each issue with: Issue / Risk / Fix:

1. INDEXES
   - Missing indexes on FK columns (must have index on EVERY FK)
   - Missing indexes on columns used in WHERE clauses (deleted_at, status, is_active, etc.)
   - Composite index candidates (common multi-column queries)
   - Unnecessary indexes that add write overhead without query benefit

2. DATA TYPES
   - Money/amounts stored as DECIMAL or FLOAT (should be BIGINT in smallest unit)
   - Timestamps without timezone (should be TIMESTAMPTZ)
   - JSON instead of JSONB (PostgreSQL — use JSONB)
   - Status/enum fields as plain VARCHAR (consider PostgreSQL enum or separate lookup table)

3. CONSTRAINTS
   - Missing NOT NULL where a value is always required
   - Missing UNIQUE where duplicates would be a data integrity bug
   - FK constraints without ON DELETE policy — should it CASCADE, RESTRICT, or SET NULL?

4. SOFT DELETE COMPLIANCE
   - Any table missing deleted_at column
   - Queries or relations that might bypass soft delete filter

5. STANDARD COLUMNS
   - Any table missing: id (UUID), created_at, updated_at, deleted_at

6. N+1 QUERY RISK
   - Relations that will commonly be loaded together — suggest eager loading patterns
   - Missing junction tables for many-to-many that are implemented as arrays

7. SECURITY
   - PII fields that should be encrypted at rest (emails, phones, health data)
   - Sensitive fields that should never be returned in API responses by default

8. SCALABILITY
   - Tables that will grow very large and need partitioning later
   - Missing pagination-friendly ordering columns

Output as a numbered issue list. For each: state the issue, the risk if not fixed, and the exact fix.
End with a PASS / NEEDS CHANGES verdict.
```

---

## PROMPT 1.5 — Generate Seed Data

> **When:** Schema is applied, need realistic seed data for development/testing.  
> **Goal:** A complete, re-runnable seed file using Prisma client.

```
You are a senior backend developer.

Project: [App Name]
Database: PostgreSQL + Prisma

Current schema.prisma:
[Paste schema.prisma]

User personas in this system: [e.g., Admin, Doctor, Receptionist, Patient]

Generate a complete prisma/seed.ts file that:

1. CREATES DEFAULT ADMIN USER
   - Email: admin@[project].dev
   - Password: "Admin@1234" (bcrypt hashed — 10 rounds)
   - All required fields filled

2. CREATES ONE TEST USER PER PERSONA
   - [persona]@test.dev pattern for emails
   - Realistic fake data (not "test", "foo", "bar")
   - All enum/status fields set to sensible defaults

3. CREATES LOOKUP / REFERENCE DATA
   - Any static data the app needs to function (roles, categories, statuses, etc.)
   - From the schema: [list any enum tables or lookup tables]

4. IS SAFE TO RE-RUN
   - Use upsert (not create) for all seed records — never fails on re-run
   - Use findOrCreate pattern where upsert is not possible

5. LOGS WHAT WAS CREATED
   - console.log summary at the end: "Seeded: 1 admin, 3 users, [counts]"

Also provide:
- The package.json "prisma": { "seed": "..." } entry to enable: npm run db:seed
- The command to run it: npx prisma db seed
- Notes on resetting + reseeding local DB: npx prisma migrate reset (local only!)
```

---

## PROMPT 1.6 — Troubleshoot Migration Issues

> **When:** A migration fails or the schema is out of sync.  
> **Goal:** Diagnose and fix safely without touching applied migration files.

```
I have a Prisma migration issue on [local / staging / production].

Error message:
[Paste the exact error output]

Environment: [local dev / CI / staging / production]

Current state:
- npx prisma migrate status output: [paste output]
- schema.prisma (current): [paste]
- Last known working migration: [migration name or "unknown"]

What I was trying to do: [describe the change you were making]

IMPORTANT: I must NOT edit any already-applied migration files.
IMPORTANT: I must NOT run prisma migrate reset on staging or production.

Please diagnose:
1. What caused this error
2. Whether this is a schema drift, checksum mismatch, or failed migration
3. The safest recovery path for [this environment]
4. Exact commands to run (in order)
5. What to commit after recovery

For each suggested command: explain what it does and the risk if it goes wrong.
```

---


# 🔐 PHASE 2 — Authentication Module

---

## PROMPT 2.1 — Plan Auth Architecture

> **When:** Starting the auth module for the first time.  
> **Goal:** Get a clear implementation plan before writing code.

```
You are a senior security engineer and backend developer.

Project: [App Name]
Stack: Next.js 14 (frontend) + Node.js/Express (backend API) + PostgreSQL + Prisma
Package manager: npm
Auth approach: JWT with httpOnly cookies (access token 15min, refresh token 30 days)

Architecture note:
- The browser calls fetch('/api/...') — proxied by Next.js to Express at :3003
- Auth routes live on the Express backend: POST /api/auth/login, /api/auth/register, etc.
- Next.js middleware validates JWT and redirects protected pages

I need to implement authentication with these requirements (from FEAT-001 PRD):
- Email + password registration and login
- JWT access token (15 min expiry) + refresh token (30 day expiry)
- Tokens stored in httpOnly, Secure, SameSite=Strict cookies
- Account lockout after 5 failed attempts for 15 minutes
- Rate limiting on auth endpoints (10 req / 15 min window)
- Role-based: [your roles, e.g., admin, doctor, receptionist]

Before writing any code, give me:
1. Implementation plan — list of files to create/modify in order (frontend + backend separately)
2. How Next.js middleware will protect pages (redirect to /login if no valid JWT)
3. How the frontend API client will send/receive httpOnly cookies
4. The token refresh strategy
5. Any security risks with this approach
6. Folder structure for auth on both frontend and backend

I will use this plan to drive the implementation step by step.
```

---

## PROMPT 2.2 — Implement Auth Service (Backend Logic)

> **When:** Plan is approved.  
> **Goal:** Generate the service layer — business logic only, no routes yet.

```
You are a senior backend developer.

Project: [App Name]
Stack: Node.js + Express + TypeScript + PostgreSQL + Prisma + Zod
Package manager: npm

Security requirements (from docs/SECURITY.md):
- Passwords hashed with bcrypt (12 rounds)
- JWTs signed with JWT_SECRET from environment variables
- Tokens set as httpOnly, Secure, SameSite=Strict cookies
- Generic error messages — never distinguish "wrong password" vs "wrong email"
- Input validation with Zod before any DB operation
- Never use console.log — use the project logger (winston/pino)

Database schema (relevant part):
[Paste your `users` table from DATABASE_SPEC.md]

Existing patterns in the codebase:
- Services live in `apps/api/src/services/`
- All functions return typed data or throw typed custom errors
- Custom errors: AuthError, ValidationError, ConflictError, NotFoundError

Please generate ONLY the auth service file: `apps/api/src/services/auth.service.ts`

It should contain these functions:
1. `registerUser(input)` — validate, check duplicate email, hash password, create user, return user (no password hash)
2. `loginUser(input)` — validate, find user, verify password, check lockout counter, update last_login_at, return tokens
3. `refreshAccessToken(refreshToken)` — validate refresh token from DB, return new access token
4. `logoutUser(userId)` — invalidate/delete refresh token from DB

Use Zod for input validation. Use custom error classes.
Do NOT include Express route handlers — service layer only.
Output: single file only. Use '// ... existing code ...' if extending an existing file.
```

---

## PROMPT 2.3 — Implement Auth API Routes

> **When:** Service layer is done and reviewed.  
> **Goal:** Wire up the API endpoints.

```
You are a senior backend developer.

The auth service is already implemented at `apps/api/src/services/auth.service.ts` with these exports:
[Paste the function signatures / exports from auth.service.ts]

API contract from docs/SPECS/API_SPEC.md:
[Paste the auth endpoints section from API_SPEC.md]

Architecture rules (from dev/API_CONVENTIONS.md):
- All routes mount under `/api` via `app.use('/api', apiRouter)` in Express
- Route files contain THIN handlers — they call the service, not business logic
- All responses follow the envelope: { success, data?, error? }
- Rate limiting: use express-rate-limit on login and register
- After implementing each route, update `apps/api/src/openapi.ts` with the endpoint spec

Please generate the Express route files:
1. `apps/api/src/routes/auth.ts` — all auth routes (register, login, logout, refresh)
2. `apps/api/src/middleware/authenticate.ts` — middleware that validates JWT from httpOnly cookie

For each route handler:
- Parse and validate input with Zod BEFORE calling the service
- Catch typed errors and map to correct HTTP status codes
- Never expose internal error details in production (always use generic messages)
- Set httpOnly cookies using Express `res.cookie()` with proper options

Also write the openapi.ts update for these endpoints at the end.
Generate auth.ts first, then authenticate.ts middleware.
```

---

## PROMPT 2.4 — Implement Auth Middleware

> **When:** Routes are done.  
> **Goal:** Protect all non-public routes.

```
You are a senior fullstack developer.

Project: [App Name]
Frontend: Next.js 14 App Router + TypeScript
Backend: Express on :3003 — all `/api/...` calls proxied from Next.js

Auth approach: JWT in httpOnly cookie named 'access_token'
- JWT_SECRET is on the Express backend (env var)
- Next.js middleware reads the cookie to protect pages
- Frontend gets user info from GET /api/auth/me (returns user from JWT)

I need:
1. `apps/web/src/middleware.ts` — Next.js middleware that:
   - Intercepts requests to all routes under `/dashboard`, `/admin` (page routes)
   - Reads the httpOnly cookie `access_token`
   - If missing or invalid → redirect to `/login`
   - For `/api/` routes (not auth): let Next.js proxy to Express; Express middleware handles auth

2. `apps/web/src/context/AuthContext.tsx` — React context that:
   - Stores the current user state: `{ user, isLoading, isAuthenticated }`
   - On mount: calls `GET /api/auth/me` to load user
   - Exposes `login(credentials)`, `logout()` functions that call the Express API
   - Uses @/ alias for all imports

3. `apps/web/src/lib/api.ts` — API client utility:
   - Base URL is `''` (empty string — same-origin, proxied by Next.js)
   - Helper functions: get, post, patch, del
   - Include credentials: true on all requests (sends cookies)
   - On 401 response: trigger logout/redirect to login

Follow Coding Standards — TypeScript strict, no any, full error handling.
Generate middleware.ts first, then AuthContext.tsx, then api.ts.
```

---
---

# 🔌 PHASE 3 — Core API (Backend Module)

---

## PROMPT 3.1 — Plan a Feature's Backend

> **When:** Starting a new backend feature module (e.g., Patients, Orders, Products).  
> **Goal:** Get a complete backend implementation plan.

```
You are a senior backend developer.

Project: [App Name]
Stack: Node.js + Express + TypeScript + PostgreSQL + Prisma + Zod
Package manager: npm

I am implementing the backend for: [Feature Name, e.g., "Patient Management"]

Feature PRD summary:
[Paste the "Functional Requirements" and "API Requirements" sections from the Feature PRD]

Database schema (already migrated):
[Paste the relevant Prisma model(s)]

Existing patterns in the codebase:
- Services live in `apps/api/src/services/`
- Routes live in `apps/api/src/routes/` — thin handlers only
- Response shape: { success, data, error, meta }
- Auth middleware: `authenticate` from `apps/api/src/middleware/authenticate.ts`
  — attaches `req.user = { id, role }` to request
- Validation: Zod schemas defined in `apps/api/src/schemas/`
- After any route change: update `apps/api/src/openapi.ts`

Before writing code, give me:
1. List of files to create (service file, route file, Zod schema file, types)
2. Function signatures for the service layer
3. Edge cases to handle (not-found, unauthorized, duplicate, pagination)
4. Business rules specific to this feature from the PRD
5. Which openapi.ts sections need updating

I'll ask you to implement each file one at a time after this.
```

---

## PROMPT 3.2 — Implement Service Layer for a Feature

> **When:** Plan is approved.  
> **Goal:** Feature-specific service with business logic.

```
You are a senior backend developer.

Implement ONLY the service file: `apps/api/src/services/[feature].service.ts`

Feature: [Feature name]
Prisma models available: [list model names]
Auth: `req.user` provides `{ id, role }` (set by authenticate middleware)

Required functions:
1. `getAll(filters, pagination, requestingUser)` — list with soft-delete filter, pagination, role-based filtering
2. `getById(id, requestingUser)` — check ownership/permission, return or throw NotFoundError
3. `create(input, requestingUser)` — validate business rules, create record, return (no sensitive fields)
4. `update(id, input, requestingUser)` — check exists + permission, update, return
5. `softDelete(id, requestingUser)` — check permission, set deleted_at = now(), return

Business rules for this feature:
[Paste from PRD functional requirements]

Rules to follow:
- Always filter `deleted_at: null` (Prisma) in all queries
- Use Prisma transactions for multi-table writes
- Throw typed errors: NotFoundError, ForbiddenError, ConflictError
- Return data without sensitive fields (no passwordHash, etc.)
- Never use console.log — use the project logger

Output: single file only. No Express route handlers in this file.
```

---

## PROMPT 3.3 — Implement API Routes for a Feature

> **When:** Service layer is tested.  
> **Goal:** REST endpoints wired to service.

```
You are a senior backend developer.

The service is at `apps/api/src/services/[feature].service.ts` with these exports:
[Paste function signatures]

Zod schema is at `apps/api/src/schemas/[feature].schema.ts`:
[Paste Zod schema]

API contract (from API_SPEC.md):
[Paste the relevant endpoint docs]

Architecture rules:
- Routes are THIN: validate → authenticate → call service → return response
- All routes are under `/api/[resource]` (no version prefix)
- Authenticate using the `authenticate` middleware for protected routes
- Use `express-rate-limit` on sensitive endpoints only
- After implementing: add endpoint docs to `apps/api/src/openapi.ts`

Generate these Express route files:
1. `apps/api/src/routes/[resource].ts` — all CRUD routes for this resource:
   - GET / (list with pagination)
   - POST / (create)
   - GET /:id (single)
   - PATCH /:id (update)
   - DELETE /:id (soft delete)

For each handler:
- Apply `authenticate` middleware on protected routes
- Validate input with Zod BEFORE calling service
- Catch typed errors and map to HTTP codes: NotFoundError→404, ForbiddenError→403, ConflictError→409
- Always return the response envelope: { success, data?, error?, meta? }

After the route file, also generate the openapi.ts additions for these endpoints.
Generate the route file first.
```

---
---

# 🎨 PHASE 4 — Frontend — Base Layout & Shell

---

## PROMPT 4.1 — Implement App Shell / Layout

> **When:** Backend auth is done, starting frontend.  
> **Goal:** Build the root layout, sidebar, and navigation shell.

```
You are a senior frontend developer working in Next.js 14 App Router with TypeScript.

Stack: Next.js + Tailwind CSS + shadcn/ui
Package manager: npm
Import alias: always use @/ for imports from src/

API proxy: All API calls go to `/api/...` (relative URL) — Next.js proxies to Express backend.
Auth: JWT in httpOnly cookie — read from AuthContext (`@/context/AuthContext`).

HTML reference for layout structure:
[Paste the full content of ui/pages/_PAGE_TEMPLATE.html — for structure reference only]

I need to implement the authenticated app shell using Tailwind CSS + shadcn/ui:

1. `apps/web/src/app/(dashboard)/layout.tsx` — root layout for authenticated pages
   - Wraps page content with Sidebar + TopBar
   - Reads current user from AuthContext
   - Protects from unauthenticated access (redirect to /login)

2. `apps/web/src/components/layout/Sidebar.tsx` — sidebar navigation
   - Use Tailwind CSS for styling (no CSS Modules)
   - Use Next.js `usePathname()` to highlight active nav item
   - Collapsible on mobile (hamburger button + overlay)
   - Nav items passed as array prop: `{ label, href, icon }[]`
   - Icons from `lucide-react` (already included with shadcn)

3. `apps/web/src/components/layout/TopBar.tsx`
   - Page title on the left
   - User avatar + dropdown on the right (use shadcn DropdownMenu)
   - Dropdown has: Profile, Settings, Logout
   - Logout calls `logout()` from AuthContext which calls POST /api/auth/logout

Rules:
- Tailwind classes only — no inline styles, no CSS Modules
- Use `cn()` from `@/lib/utils` for conditional classes
- All imports use @/ alias
- All interactive elements have focus:ring styles
- Mobile-first — sidebar hidden on mobile behind hamburger

Generate Sidebar.tsx first, then TopBar.tsx, then layout.tsx.
```

---

## PROMPT 4.2 — Implement Reusable UI Components

> **When:** Layout is done, starting feature pages.  
> **Goal:** Build the core component library before feature-specific UI.

```
You are a senior frontend developer.

Stack: Next.js + TypeScript + Tailwind CSS + shadcn/ui
Import alias: always use @/ — e.g., @/components/ui/button, @/lib/utils

Component to implement: [e.g., DataTable, UserAvatar, StatusBadge, ConfirmDialog]

First check if shadcn/ui has this component:
- If YES: install with `npx shadcn@latest add [component-name]` and extend/wrap it
- If NO: build it from scratch using Tailwind CSS

Requirements for [ComponentName]:
[Describe what the component does and its props]

Example — if building a custom StatusBadge:
- Props: status ('active' | 'inactive' | 'pending'), size? ('sm' | 'md')
- Uses Tailwind color utilities for each status
- Exported from @/components/common/StatusBadge.tsx

Rules:
- TypeScript — fully typed props interface
- Tailwind CSS only — no CSS Modules, no inline styles
- Use cn() from @/lib/utils for conditional classes
- If wrapping shadcn: import from @/components/ui/[shadcn-component]
- Forward ref support if it wraps an interactive element
- Fully accessible: proper ARIA, focus ring
- Show a usage example in a JSDoc comment above the component

Output: single file `apps/web/src/components/[category]/[ComponentName].tsx`
```

---
---

# 📄 PHASE 5 — UI Feature Pages

---

## PROMPT 5.1 — Implement a List/Table Page

> **When:** Building the page that lists records for a feature.  
> **Goal:** Complete list page with data fetching, loading states, search.

```
You are a senior frontend developer working in Next.js 14 App Router with TypeScript.

Stack: Tailwind CSS + shadcn/ui
Package manager: npm
Import alias: always use @/ for all imports from src/

Feature: [Feature name, e.g., "Patient List"]
API endpoint: GET /api/patients — returns { success, data: Patient[], meta: { pagination } }
Note: This is a relative URL — Next.js proxies /api/* to Express backend.
Type definition for Patient: [paste the Patient TypeScript interface]

HTML reference for layout structure (adapt to Tailwind + shadcn):
[Paste the relevant table section from ui/pages/_PAGE_TEMPLATE.html — for layout reference]

Implement: `apps/web/src/app/(dashboard)/patients/page.tsx`

Requirements:
1. Server Component — fetch data server-side using `fetch('/api/patients', { cache: 'no-store' })`
2. Data table using shadcn Table component (`@/components/ui/table`)
   Columns: [list your columns with their type]
3. Pagination using shadcn Pagination or a custom component
4. "Create New" button (shadcn Button) linking to /patients/new
5. Loading state: use Suspense + loading.tsx skeleton
6. Empty state: shadcn Card with icon + message + CTA button
7. Error boundary: if fetch fails, show error state with retry

Also implement: `apps/web/src/app/(dashboard)/patients/loading.tsx`
— Use shadcn Skeleton component for table rows

Use Tailwind for layout, shadcn components for UI elements.
All imports use @/ alias. No inline styles.
Generate page.tsx first, then loading.tsx.
```

---

## PROMPT 5.2 — Implement a Create/Edit Form Page

> **When:** Building the form to create or edit a record.  
> **Goal:** Complete form page with validation, API call, and success/error handling.

```
You are a senior frontend developer in Next.js 14 App Router with TypeScript.

Stack: Tailwind CSS + shadcn/ui + React Hook Form
Package manager: npm
Import alias: always use @/

Feature: [Feature name, e.g., "Create/Edit Patient"]
PRD acceptance criteria for this form:
[Paste the relevant acceptance criteria]

API (relative URLs — proxied to Express via Next.js):
- Create: POST /api/patients — body: { name, dateOfBirth, phone, email? }
- Edit: PATCH /api/patients/{id} — body: same fields (all optional)
- API client: use `@/lib/api` apiClient utility

HTML reference (adapt to Tailwind + shadcn):
[Paste ui/pages/form.html — for section layout reference only]

Implement: `apps/web/src/app/(dashboard)/patients/[id]/edit/page.tsx`

Requirements:
1. If `id === 'new'` → create mode. If `id` is a UUID → edit mode (fetch existing via GET /api/patients/{id})
2. Use React Hook Form + Zod resolver for validation
3. shadcn/ui form components: Form, FormField, FormItem, FormLabel, FormControl, FormMessage
4. shadcn Input, Select, Textarea for fields
5. Submit button: shadcn Button with loading state during API call
6. On success → redirect to /patients/[id] using Next.js router + show shadcn Toast
7. On API error → show shadcn Alert at top of form with error message
8. Cancel button → router.back()

Form fields:
[List each field: name, type, required/optional, Zod rule]

Rules: Tailwind only, @/ alias for all imports, no inline styles.
Output: page.tsx only.
```

---

## PROMPT 5.3 — Implement a Detail/View Page

> **When:** Building the read-only detail view for a single record.  
> **Goal:** Clean, information-rich detail page.

```
You are a senior frontend developer.

Feature: [Feature name, e.g., "Patient Detail"]
API: GET /api/patients/{id} — returns Patient with [list nested relations if any]

Type definition:
[Paste TypeScript interface]

Implement: `src/app/(dashboard)/patients/[id]/page.tsx`

Requirements:
1. Server Component — fetch patient data server-side
2. Show 404 page if patient not found (use notFound() from next/navigation)
3. Page has:
   - Header with patient name + status badge + Edit/Delete action buttons
   - Info card: core patient details in a 2-column grid
   - Activity/history section at the bottom (if applicable)
4. Delete button opens a confirmation modal before calling DELETE /api/patients/{id}
5. After delete → redirect to /patients with success message

Design: match ui/UI_GUIDELINES.md card and badge styles.
Use CSS Modules. Generate page.tsx only.
```

---
---

# 🧪 PHASE 6 — Testing

---

## PROMPT 6.1 — Generate Unit Tests for a Service

> **When:** Service layer implementation is complete.  
> **Goal:** Comprehensive unit tests with mocking.

```
You are a senior software engineer writing unit tests.

Testing framework: Vitest
File to test: `src/services/[feature].service.ts`

Here is the service code:
[Paste the full service file content]

Prisma is used for DB access. Mock it with vi.mock.
Auth user for tests: { id: 'test-uuid', role: 'admin' }

Write tests for EVERY function in the service. For each function, test:
1. Happy path — correct input, expected output
2. Not found — resource doesn't exist → NotFoundError thrown
3. Forbidden — wrong user/role → ForbiddenError thrown  
4. Duplicate — creating duplicate record → ConflictError thrown
5. Edge cases specific to business rules: [list from PRD]

Follow test structure:
describe('[ServiceName]', () => {
  describe('[functionName]', () => {
    it('should [behavior] when [condition]')
  })
})

Output: `src/services/[feature].service.test.ts` — complete file.
```

---

## PROMPT 6.2 — Generate Integration Tests for API Routes

> **When:** API routes are complete.  
> **Goal:** Test endpoints end-to-end including auth and validation.

```
You are a senior software engineer writing integration tests.

Framework: Vitest + Supertest (or Next.js test utils)
Routes to test:
- GET /api/[resource] — list
- POST /api/[resource] — create
- GET /api/[resource]/{id} — get single
- PATCH /api/[resource]/{id} — update
- DELETE /api/[resource]/{id} — soft delete

For each endpoint, write tests for:
1. ✅ Success case — correct data, authenticated user
2. 🔒 No auth → 401
3. 🔒 Wrong role → 403
4. ❌ Invalid input → 400 with validation error details
5. ❌ Not found → 404
6. ❌ Duplicate (where applicable) → 409

API response envelope:
{ success: boolean, data?: T, error?: { code, message } }

Route handler code:
[Paste the route file]

Output: `src/app/api/[resource]/route.test.ts` — complete file.
```

---

## PROMPT 6.3 — Write Acceptance Test Checklist

> **When:** Feature is coded and tested.  
> **Goal:** Final manual QA checklist mapped to PRD acceptance criteria.

```
You are a QA engineer.

Feature: [Feature name]
Acceptance criteria from PRD:
[Paste all Given/When/Then criteria for this feature]

Test environment: [describe — local dev, test DB seeded with...]

Generate a manual QA checklist that:
1. Maps each acceptance criterion to 1-2 specific manual test steps
2. Includes edge cases beyond the AC (e.g., mobile viewport, slow network, empty states)
3. Includes security spot-checks:
   - Try accessing another user's data URL directly
   - Try submitting with missing required fields
   - Try extremely long inputs
4. Marks which criteria need automated test coverage too

Format as a table:
| AC ID | Scenario | Steps | Expected Result | Status |
```

---
---

# 🔒 PHASE 7 — Security Review

---

## PROMPT 7.1 — Security Audit a Feature

> **When:** A feature module is complete and ready for review.  
> **Goal:** Catch security issues before shipping.

```
You are a senior security engineer.

Conduct a security review of the following files for this feature: [Feature name]

Checklist to evaluate against (from docs/SECURITY.md):
☐ All inputs validated server-side
☐ No raw SQL — parameterized queries only
☐ Authorization checks present on all endpoints
☐ Resource ownership checked (users can't access others' data)
☐ No sensitive data in error responses
☐ No secrets hardcoded
☐ Rate limiting applied to sensitive endpoints
☐ Tokens/sessions handled securely

Files to review:
[Paste each file content with filename header]

For each issue found:
- File and line number
- Severity: Critical / High / Medium / Low
- Issue description
- Recommended fix with code example

If no issues found in a category, say "✅ Clear" for that item.
```

---
---

# 🐛 PHASE 8 — Bug Fix / Debugging

---

## PROMPT 8.1 — Debug an Error

> **When:** Something isn't working.  
> **Goal:** Fast, precise diagnosis and fix.

```
You are a senior debugger.

Project: [App Name]
Stack: [Your stack]

Error I'm seeing:
[Paste the exact error message or stack trace]

Where it happens: [e.g., "When I submit the login form"]

Relevant file(s):
[Paste only the function/section where the error originates — not the whole file]

Expected behavior: [What should happen]
Actual behavior: [What is happening instead]

Recent changes: [What did you change right before this broke?]

Please:
1. Identify the root cause
2. Explain why this error occurs
3. Give me the exact fix (code snippet)
4. Tell me if this could affect any other part of the codebase
```

---

## PROMPT 8.2 — Fix a Failing Test

> **When:** CI is failing or a test you wrote isn't passing.  
> **Goal:** Understand and fix the test failure.

```
Failing test output:
[Paste the full test failure output]

Test file:
[Paste the failing test(s)]

Source file being tested:
[Paste the relevant source function]

Please:
1. Explain why the test is failing
2. Is this a test bug or a source code bug?
3. Show me the fix — either the corrected test or the corrected source code
4. Double check: does the fix match the acceptance criteria for this feature?

Acceptance criteria for this feature:
[Paste the relevant AC from ACCEPTANCE_CRITERIA.md]
```

---
---

# 📚 PHASE 9 — Documentation & Handoff

---

## PROMPT 9.1 — Update CHANGELOG After a Feature

> **When:** A feature module is complete and merged.  
> **Goal:** Write a good changelog entry.

```
I just completed the [Feature name] module (FEAT-XXX).

Here is what was built:
[Paste your bullet points of what was implemented]

Here is what changed from the original PRD (scope changes):
[Any deviations or additions]

Any bug fixes included:
[List bugs fixed]

Please write a CHANGELOG.md entry in this exact format:
## [0.X.0] — YYYY-MM-DD
### Added
-
### Changed
-
### Fixed
-

Follow the style from: [paste a sample entry from your existing CHANGELOG.md]
Keep entries concise — one line per item, written in past tense.
```

---

## PROMPT 9.2 — Update API Spec After Implementation

> **When:** The implemented API differs from the design, or new endpoints were added.  
> **Goal:** Keep API_SPEC.md in sync with actual code.

```
The following API route is now implemented. Please write its documentation entry
for API_SPEC.md following the existing format in that file.

Implemented route file:
[Paste the route handler code]

Zod validation schema:
[Paste the Zod schema]

Please document:
1. Method + path + description
2. Auth requirement (required/none/role)
3. Request body (with field name, type, required/optional, validation)
4. Response 200/201 shape (JSON example)
5. All possible error responses (status code + error code + when it occurs)

Match the style and format of the existing entries in API_SPEC.md.
```

---
---

# ⏩ PHASE 10 — Resuming After a Break

---

## PROMPT 10.1 — Resume Prompt (Standard)

> **When:** Coming back to the project after any gap.  
> **Goal:** Instantly restore full context for you and the AI.

```
I'm resuming work on [Project Name]. Here is my current project state:

=== FROM PROJECT_STATUS.md ===
[Paste the "Current Sprint / Phase" and "Feature Status" sections]

=== FROM PROGRESS.md (last session) ===
[Paste the last session entry — Accomplished, Decisions Made, Next Steps]

=== CURRENT TASK ===
I need to continue with: [specific task from "Next Steps"]
File to work on: [filename]

=== PROJECT CONTEXT ===
[Paste ai/PROJECT_CONTEXT.md — or the condensed version]

Please:
1. Confirm you understand the current state in 2-3 sentences
2. State what the immediate next action should be
3. Ask if you need any clarification before we start
```

---

## PROMPT 10.2 — Re-orient on a Specific File

> **When:** You're not sure where a file fits in the overall system.  
> **Goal:** Get AI to quickly map an existing file to the project context.

```
Here is a file from my project:
[Paste the file content]

filename: [path/to/file.ts]

Based on my project context below, explain:
1. What this file does in plain English
2. What other files depend on it (and how)
3. What this file depends on
4. What the next natural thing to add/change here would be, based on the features in progress

Project context:
[Paste ai/PROJECT_CONTEXT.md]

Current feature being worked on: [Feature name]
Current feature PRD summary: [2-3 sentences]
```

---
---

## 📌 Quick Reference — Single-Shot Utility Prompts

These can be used at any phase:

---

### 🔧 Refactor a Function

```
Refactor this function to: [specific goal, e.g., "extract validation logic", "make it more readable", "reduce cyclomatic complexity"]

Current code:
[paste function]

Constraints:
- Keep the same function signature and return type
- Don't change behaviour — only structure
- Follow: dev/CODING_STANDARDS.md conventions
- Add/update JSDoc comment

Show me what changed and why.
```

---

### 🧹 Code Review Checklist

```
Please review this code file against these standards:
1. dev/DEV_RULES.md — architecture and code quality rules
2. docs/SECURITY.md — security checklist
3. dev/CODING_STANDARDS.md — naming and structure conventions

File: [filename]
[paste code]

Format your review as:
- ✅ Passes: [item]
- ⚠️ Suggestion: [item + recommendation]
- ❌ Issue: [item + severity + required fix]
```

---

### 📐 Create TypeScript Interfaces from Schema

```
Based on this database schema, generate TypeScript interfaces for use in the frontend:
[Paste Prisma model or table definition]

Generate:
1. Base type (maps 1:1 to DB row) — use camelCase for field names
2. Create input type (omit: id, createdAt, updatedAt, deletedAt)
3. Update input type (all fields optional except id)
4. API response type (includes nested relations: [list them])

Place in: `src/types/[feature].types.ts`
Export all interfaces. No classes, no enums unless necessary.
```

---

### 🗑️ Soft Delete Pattern

```
I need to implement soft delete for [resource name].

Current hard delete implementation (if any):
[paste code or "none"]

Using:
- Prisma
- Column: deleted_at: DateTime? @db.Timestamptz
- Pattern: never hard DELETE — set deleted_at = NOW()
- All queries must filter WHERE deleted_at IS NULL

Generate:
1. The softDelete service function
2. The DELETE route handler (should actually soft-delete)
3. Updated list/findById queries with soft-delete filter
4. A restore function (set deleted_at = null) — optional

Output one function at a time. Start with the service function.
```

---

*Last Updated: 2026-03-18 | Part of AI-Dev Boilerplate*
