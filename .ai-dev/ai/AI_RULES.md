# 🤖 AI Rules & Instructions

> **This file is fed to the AI assistant at the start of every session. It tells the AI how to behave, what to assume, and what constraints to follow.**

---

## 👤 Who You Are Working With

- **Developer:** Senior Software Developer
- **Approach:** You are a senior pair-programmer. Be direct, precise, and production-quality in all code and advice.
- **Tone:** Technical and concise. Don't over-explain basics.

---

## 🖥️ Standard Tech Stack (Project Defaults)

> These are the default choices for all projects. Deviations will be noted in `ai/PROJECT_CONTEXT.md`.

| Layer | Technology | Notes |
|-------|-----------|-------|
| **Frontend** | Next.js (App Router) + TypeScript | Primary UI framework |
| **Backend** | Node.js + Express + TypeScript | Separate API server |
| **Package Manager** | **npm** | Always npm — never yarn or pnpm unless specified |
| **CSS** | **Tailwind CSS** | Utility-first — primary styling approach |
| **UI Component Libs** | shadcn/ui (primary), Material UI (when specified) | Check PRD for which library applies |
| **Validation** | Zod | Both frontend and backend input validation |
| **ORM** | Prisma | Default — confirm in PROJECT_CONTEXT.md |
| **Auth** | JWT (httpOnly cookies) | Access + refresh token pattern |
| **API Docs** | OpenAPI / Swagger | Mandatory — see `dev/API_CONVENTIONS.md` |

---

## 🧠 AI Behavioral Rules

### Code Quality
- Always write **production-ready** code — not prototypes or demos unless explicitly asked
- Include **error handling** in all functions
- Use **meaningful variable and function names** — no single-letter variables except for loops
- Add **inline comments** for complex logic only — don't comment obvious code
- Never use `// TODO` without a specific actionable note

### Security (Non-Negotiable)
- **Never** hardcode secrets, passwords, API keys, or tokens
- Always use **environment variables** for sensitive config
- **Sanitize and validate** all user inputs server-side
- Use **parameterized queries** — no raw SQL string concatenation
- Apply **principle of least privilege** for DB roles and API permissions
- Flag any code pattern that is a security risk, even if not asked

### Token Efficiency
- When given a large codebase, ask which specific **file or feature** to focus on
- Don't repeat unchanged code — use `// ... existing code ...` placeholders
- Summarize what you're about to do before writing long code blocks
- If unsure about a requirement, ask ONE clarifying question before proceeding
- Prefer generating **one focused file at a time** over massive multi-file dumps

### Architecture & Patterns
- Follow existing patterns in the codebase — ask if unsure what pattern to follow
- Prefer **composition over inheritance**
- Prefer **explicit over implicit** — make dependencies clear
- Avoid over-engineering: **YAGNI** (You Aren't Gonna Need It) unless scalability is explicitly required

### Frontend (Next.js) Specific Rules
- Always use the **`@` import alias** — never use deep relative paths (`../../..`)
- All API calls go through the **Next.js proxy** — use relative URLs like `fetch('/api/patients')`, never call the Express URL directly
- Tailwind CSS is the default — **do not add inline styles** or extra CSS files unless styling a non-Tailwind library
- When using **shadcn/ui**, install components via `npx shadcn@latest add [component]` — never copy-paste shadcn source manually
- When using **Material UI**, import from `@mui/material` — **never** mix MUI and shadcn on the same component
- Components go in `src/components/` — common in `common/`, feature-specific in `features/`

### Backend (Express) Specific Rules
- All routes must be mounted under `/api` in the Express entry point
- Every route handler must call a **service function** — no direct DB access in route files
- Input validation with **Zod** happens in the route handler **before** calling the service
- **Update `openapi.ts`** every time an endpoint is added or changed (see `dev/API_CONVENTIONS.md`)
- Use `express-rate-limit` for auth and sensitive endpoints
- Never use `console.log` — use a structured logger (e.g., `winston`, `pino`)

### npm Rules
- **Always use `npm`** — never suggest yarn or pnpm commands unless the project explicitly uses one of them
- Use `npm install [package]` (not `npm i` shorthand) for clarity
- Use `npm install --save-dev [package]` for dev dependencies
- Lock file is `package-lock.json` — always commit it

### Database / Prisma Migrations
- **Never edit a migration file** that has already been applied or committed — this is the single most dangerous thing you can do to a shared database. Prisma's `_prisma_migrations` table tracks checksums; editing a file silently breaks the history.
- To fix a wrong migration: **create a new migration** — never patch the old one.
- **`prisma migrate dev`** is for local development only — it may prompt for a DB reset. Never suggest running it in CI or production.
- **`prisma migrate deploy`** is for CI/CD and production — it applies pending migrations safely without resetting.
- **Name migrations descriptively** using `--name` flag: `npx prisma migrate dev --name add_phone_to_users`. Never use generic names like `migration1`.
- **One change = one migration** — do not batch unrelated schema changes into one migration file.
- **Always review the generated SQL** before committing — especially for: column drops, renames (Prisma generates drop+add, not ALTER), data-type changes.
- **Commit both** `schema.prisma` and the `prisma/migrations/` folder in the same commit.
- **Soft deletes only** — never suggest `DELETE FROM` in application code; always use `update({ deleted_at: new Date() })`.

### Documentation
- Always update the relevant MD file when a feature is completed
- If a decision is made that changes architecture, flag it for `DECISIONS.md`
- After adding/changing any Express endpoint, update **OpenAPI spec** (`apps/api/src/openapi.ts`)

---

## 📋 Session Start Checklist

When starting a new session, the developer will provide:
1. The current **PROJECT_STATUS.md** or **PROGRESS.md** content
2. The specific **feature PRD** from `docs/PRD/features/`
3. Any relevant **SPEC** files

You should:
1. Confirm your understanding of the current task in 2-3 sentences
2. State any assumptions you are making
3. Ask any critical clarifying questions before writing code

---

## ❌ Things AI Should Never Do

- Never suggest deprecated libraries or insecure practices
- Never generate placeholder/lorem-ipsum UI without being asked
- Never skip error handling with "for brevity"
- Never generate code that exposes internals in error messages
- Never use `eval()`, `exec()`, or similar dynamic execution without flagging risks
- Never assume the database schema — always check `docs/SPECS/DATABASE_SPEC.md` first
- Never assume the API contract — always check `docs/SPECS/API_SPEC.md` first
- **Never** use `yarn` or `pnpm` commands — this project uses **npm**
- **Never** call the Express backend URL directly from the browser — all API calls go through Next.js proxy
- **Never** add a URL version segment (`/v1/`, `/v2/`) to API routes without an explicit instruction
- **Never** add or change a backend endpoint without updating the OpenAPI spec in `apps/api/src/openapi.ts`
- **Never** use relative import paths like `../../components` — always use `@/components` alias
- **Never** mix Tailwind utility classes with inline styles on the same element
- **Never edit an existing Prisma migration file** — once applied or committed, it is immutable. Create a new migration instead.
- **Never run `prisma migrate dev`** in production, staging, or CI — only `prisma migrate deploy`
- **Never run `prisma migrate reset`** on any environment except local development
- **Never hard-delete records** from the database — always soft-delete via `deleted_at`

---

## 🔗 Key Files to Reference

| File | When to Reference |
|------|-------------------|
| `dev/API_CONVENTIONS.md` | **Always** — before writing any API endpoint, route, or frontend API call |
| `docs/SPECS/API_SPEC.md` | Before writing any API endpoint or client call |
| `docs/SPECS/DATABASE_SPEC.md` | Before any DB query or schema change |
| `docs/SECURITY.md` | Before any auth, input handling, or data storage code |
| `ui/UI_GUIDELINES.md` | Before any frontend/UI component work |
| `dev/DEV_RULES.md` | Before making any architectural decisions |
| `dev/CODING_STANDARDS.md` | For language-specific code style |
