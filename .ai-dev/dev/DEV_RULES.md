# ⚖️ Development Rules

> **Non-negotiable rules that apply to every line of code in this project.  
> Everyone on the team must follow these. AI tools must follow these.**

---

## 🏛️ Architecture Rules

1. **Separation of concerns** — UI logic never lives in API/service files. Business logic never lives in components.
2. **Single responsibility** — Every function/module does one thing well.
3. **No circular dependencies** — If A imports B, B must not import A.
4. **Feature-first folder structure** — Group files by feature, not by type, for large projects.
5. **Service layer is mandatory** — Controllers/route handlers call services. Services handle business logic. Direct DB calls from routes are forbidden.

---

## 📝 Code Quality Rules

### Naming
- Variables and functions: `camelCase`
- Classes and types: `PascalCase`
- Constants: `SCREAMING_SNAKE_CASE`
- Files: `kebab-case.ts` for utilities, `PascalCase.tsx` for components
- Database columns: `snake_case`

### Functions
- **Max function length:** 50 lines — extract if longer
- **Max parameters:** 3 — use an object/interface beyond 3
- **Pure functions preferred** — avoid side effects where possible
- **One level of abstraction per function** — no mixing high and low level

### Files
- **Max file length:** 300 lines — split if longer
- **One exported thing per file** (for components, services) — no barrel files with 20 exports

### Error Handling
- Never swallow errors silently: `catch(e) {}` is forbidden
- Always log errors with context before re-throwing or responding
- Use typed custom error classes, not raw `throw new Error(string)`
- Return early on errors — avoid deep nesting

---

## 🔐 Security Rules (Absolute)

See `docs/SECURITY.md` for full details.

1. **No hardcoded credentials** — ever, anywhere
2. **Validate all inputs server-side** — client validation is UX, not security
3. **Parameterize all queries** — no string concatenation in SQL
4. **No sensitive data in logs** — no emails, passwords, tokens, PII
5. **All endpoints need auth checks** — explicitly opt-out for public endpoints with a comment

---

## 🧪 Testing Rules

1. **Tests are not optional** — every feature must have at minimum: unit tests for service/business logic
2. **Tests live next to the code** — `feature.ts` → `feature.test.ts` in the same directory
3. **No production deploys without passing tests** (CI enforces this)
4. **Test naming:** `describe('[unit name]', () => { it('should [behavior]', ...) })`
5. **No test should depend on another test's state** — each test must be fully independent

---

## 🗄️ Database Rules

### General
1. **Never hard-delete** — always use `deleted_at` soft delete. All queries must filter `WHERE deleted_at IS NULL`.
2. **Never use raw SQL in application code** — use the ORM (Prisma). Raw queries are only acceptable for complex reports with a comment explaining why.
3. **Always use transactions** for any operation that writes to more than one table.
4. **Every new table needs** `id` (UUID), `created_at` (TIMESTAMPTZ), `updated_at` (TIMESTAMPTZ), `deleted_at` (TIMESTAMPTZ nullable).
5. **All schema changes via migrations** — no manual `ALTER TABLE` in production, ever.

---

### Database Migrations (Prisma)

#### The Core Rule

> **NEVER edit a migration file after it has been applied.**

Prisma tracks every migration in the `_prisma_migrations` table. Once a migration is marked as applied, it will **never run again** — editing the file changes the source but not the applied state, causing silent drift between your schema and your database. This leads to production incidents that are extremely hard to debug.

#### Golden Rules

| Rule | Detail |
|------|--------|
| **One change = one migration** | Keep migrations small and focused. One PR adding two features = two separate migration files. |
| **Commit migration files to git** | Migration files are the source of truth for your DB history. Never `.gitignore` them. |
| **Never edit after merging** | If a merged migration has a mistake, create a **new migration** to fix it — do not edit the old one. |
| **Name migrations descriptively** | Use clear, action-oriented snake_case names. Bad: `update1`. Good: `add_phone_to_users`, `create_orders_table`, `rename_status_to_is_active`. |
| **`migrate dev` for local only** | Creates migration files and applies them. It may prompt to reset the DB. Never run in CI or production. |
| **`migrate deploy` for production** | Applies pending migrations without resetting. This is the only safe command for production and CI. |

#### Migration Workflow

```bash
# 1. Edit schema.prisma (add/change models)

# 2. Generate + apply locally (creates the migration file)
npx prisma migrate dev --name add_phone_to_users

# 3. Review the generated SQL in prisma/migrations/
#    Confirm it matches your intent before committing

# 4. Commit both schema.prisma AND the migration folder
git add prisma/schema.prisma prisma/migrations/
git commit -m "db: add phone column to users table"

# 5. In CI / production — apply only, never generate
npx prisma migrate deploy
```

#### Migration Naming Convention

Format: `[verb]_[what]_[table/field]`

| Good name | What it signals |
|-----------|----------------|
| `create_users_table` | Initial creation |
| `add_phone_to_users` | Adding a column |
| `rename_status_to_is_active` | Renaming a column |
| `drop_legacy_sessions_table` | Dropping a table |
| `add_idx_appointments_patient_id` | Adding an index |

#### What AI Must Never Do with Migrations
- **Never edit** a migration file that has been committed — create a new one
- **Never run** `prisma migrate dev` in production — only `prisma migrate deploy`
- **Never run** `prisma migrate reset` on production
- **Always** review generated migration SQL for destructive operations (DROP, ALTER with data loss)
- **Always** add a new migration for schema changes — never edit `schema.prisma` without generating the corresponding migration

---

## 🎨 UI / Frontend Rules

**Package Manager: npm only.** Never use yarn or pnpm commands.

### Tailwind CSS (Default)
1. **Tailwind CSS is the default** styling approach — use utility classes, not custom CSS files
2. Never add inline styles — always use Tailwind classes or CSS Modules when Tailwind isn't enough
3. Use `cn()` utility (from `clsx` + `tailwind-merge`) to conditionally apply Tailwind classes
4. Design tokens (colors, spacing) go in `tailwind.config.ts` — not hardcoded as arbitrary values
5. Mobile-first always — default styles are mobile, `md:` and `lg:` prefixes for larger screens

### shadcn/ui (Primary Component Library)
1. Install components via CLI: `npx shadcn@latest add [component-name]` — never copy-paste source manually
2. Customise shadcn components via `cn()` prop overrides or by editing the installed component file in `src/components/ui/`
3. shadcn/ui is the **default** — use it for: Button, Input, Dialog, Select, Table, Card, Toast, etc.

### Material UI (When Specified in PRD)
1. Import only from `@mui/material` — no deep path imports like `@mui/material/Button/Button`
2. **Never mix MUI and shadcn/ui** on the same component — decide at the feature level which library to use
3. Use MUI's `sx` prop or `styled()` for MUI-specific overrides only
4. Check the PRD/feature spec before assuming MUI is required

### General
1. **Loading and error states required** — every async operation needs both
2. **No UI-blocking operations** — async calls must not freeze the UI
3. **Accessible by default** — use semantic HTML, ARIA labels, keyboard navigation
4. **Always use `@` import alias** — never use deep relative paths from `src/`

---

## 📤 API Rules

> See `dev/API_CONVENTIONS.md` for the full, detailed API conventions. Summary:

1. **All routes prefixed `/api/`** — e.g., `/api/users`, `/api/appointments`
2. **No URL versioning** — do NOT use `/api/v1/...`. Use `/api/` only. Introduce versioning only when a third-party or mobile consumer requires it.
3. **Express mounts all routes under `/api`** — `app.use('/api', apiRouter)`
4. **Frontend uses Next.js proxy** — browser calls `fetch('/api/...')`, never the Express URL directly
5. **OpenAPI spec is mandatory** — update `apps/api/src/openapi.ts` for every endpoint change
6. **Follow the API response envelope** defined in `docs/SPECS/TECHNICAL_SPEC.md`
7. **No information leakage in errors** — production errors must be generic
8. **Validate before processing** — reject invalid inputs immediately with Zod
9. **Idempotent where possible** — especially for payment/critical operations

---

## 🔄 Git / Version Control Rules

See `dev/GIT_WORKFLOW.md` for full details.

1. **Never commit directly to `main`**
2. **Branch naming:** `feat/feature-name`, `fix/bug-name`, `chore/task-name`, `hotfix/issue`
3. **Commit messages follow conventional commits:** `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`
4. **No commits with secrets** — use `.gitignore` and pre-commit hooks
5. **PR must pass CI** before merge

---

## 🚫 Absolute Prohibitions

These are NEVER acceptable, regardless of deadline pressure:

- `console.log()` in production code (use structured logger: `winston` or `pino`)
- `any` type in TypeScript (unless explicitly justified with a comment)
- `eval()`, `Function()`, or dynamic code execution
- `//TODO: fix later` without a ticket/issue reference
- Commented-out old code left in the codebase
- Password storage in plain text or MD5/SHA1
- Production database credentials in `.env.example` or documentation
- **`yarn` or `pnpm` commands** — this project uses npm
- **Calling the Express API URL directly** from browser-side code — always use the Next.js proxy
- **Adding/changing an Express endpoint** without updating the OpenAPI spec
- **URL version segments** (`/v1/`, `/v2/`) in API routes without an explicit decision recorded in `docs/DECISIONS.md`
- **Deep relative imports** like `../../components` — use `@/components` alias
- **Mixing shadcn/ui and MUI** on the same component
- **Editing an existing migration file** after it has been applied or committed to the main branch
- **Running `prisma migrate dev`** in production or CI environments — use `prisma migrate deploy`
- **Running `prisma migrate reset`** on a production or staging database
