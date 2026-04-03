# Setup Prompts — Ready-to-Paste AI Prompts

> **These prompts are ready to copy and paste directly — no manual bracket filling.**  
> Before using any prompt: feed your AI the context files listed for that step.  
> The AI reads everything it needs from your `PROJECT_BRIEF.md`.

---

## Before You Begin

**Step 1 — Fill in your project brief completely:**  
Open `.ai-dev/PROJECT_BRIEF.md` and fill in all 14 sections before running any prompt.

**Step 2 — For every prompt below, start a fresh AI session with:**
```
Message 1 (send this first, wait for acknowledgement):

"I am setting up a new software project. I will provide you with context files first,
then give you a specific task. Do not do anything yet — just read and acknowledge.

--- AI_RULES.md START ---
[paste the full contents of .ai-dev/ai/AI_RULES.md]
--- AI_RULES.md END ---

--- PROJECT_BRIEF.md START ---
[paste the full contents of .ai-dev/PROJECT_BRIEF.md]
--- PROJECT_BRIEF.md END ---

Confirm you have read both files and are ready for the task."
```

**Step 3 — Then send the prompt for that step (copy from below and paste as-is).**

---

## Prompt Order

| Step | Output file |
|---|---|
| [STEP 0 — Generate UI Mockups](#step-0--generate-ui-mockups-optional) (Optional) | `.ai-dev/ui/pages/[screen].html` |
| [STEP 1 — PRD Overview](#step-1--prd-overview) | `.ai-dev/docs/PRD/PRD_OVERVIEW.md` |
| [STEP 2 — Feature PRDs](#step-2--feature-prds) | `.ai-dev/docs/PRD/features/FEAT_XXX_*.md` |
| [STEP 3 — Architecture](#step-3--architecture) | `.ai-dev/docs/ARCHITECTURE.md` |
| [STEP 4 — Database Spec](#step-4--database-spec) | `.ai-dev/docs/SPECS/DATABASE_SPEC.md` |
| [STEP 5 — API Spec](#step-5--api-spec) | `.ai-dev/docs/SPECS/API_SPEC.md` |
| [STEP 6 — Security](#step-6--security) | `.ai-dev/docs/SECURITY.md` |
| [STEP 7 — Test Plan](#step-7--test-plan) | `.ai-dev/tests/TEST_PLAN.md` |
| [STEP 8 — AI Context](#step-8--ai-context) | `.ai-dev/ai/PROJECT_CONTEXT.md` |
| [STEP 9 — Project Tracking](#step-9--project-tracking) | `.ai-dev/PROJECT_STATUS.md` + `.ai-dev/PROGRESS.md` |
| [STEP 10 — Dev Prompts](#step-10--dev-prompts) | `.ai-dev/ai/DEV_PROMPTS.md` ⭐ |

---
---

## STEP 0 — Generate UI Mockups (Optional)

> **Run this ONLY for screens marked `GENERATE` in your `PROJECT_BRIEF.md` Section 9b.**  
> Skip entirely if all your screens have design files (`FILE`/`FIGMA`/`URL`) or are `PENDING`.  
> Run this BEFORE Step 1 so the generated files are ready for Step 10 to reference.

**Save output to:** `.ai-dev/ui/pages/[screen-name].html` (one file per screen)  
**Run once per `GENERATE` screen** in your design reference table.

**Context to feed AI first:** `AI_RULES.md` + `PROJECT_BRIEF.md` + the relevant `FEAT_XXX_*.md`

---
**COPY THIS PROMPT:**
```
You are a senior UI/UX designer and frontend developer.

You have read my PROJECT_BRIEF.md and the relevant Feature PRD.

Generate a functional HTML mockup for the following screen:
[Screen name — copy from your Section 9b GENERATE row, e.g., "Main Dashboard"]
[Feature PRD — copy from your Section 9b Notes, e.g., "FEAT-002 Patient Management"]

Design requirements (from PROJECT_BRIEF.md Section 9a):
- Style preference: [copy from Section 9a Style row]
- Color tone: [copy from Section 9a Color tone row]
- Complexity: [copy from Section 9a Complexity row]
- Reference apps: [copy from Section 9a Reference apps row]

The mockup must:
1. Be a single self-contained HTML file (inline CSS and minimal vanilla JS only)
2. Accurately represent the UI flows from the Feature PRD user stories
3. Show all key UI states: empty state, populated state, loading indicator, error state
4. Include all form fields, buttons, and actions described in the Feature PRD
5. Use realistic placeholder data matching the project domain
6. Be responsive (mobile and desktop)
7. Match the design style from Section 9a above
8. NOT use any external CDN or framework (fully offline-capable)

Include ALL screens/states for this feature in one file using simple tab or
section navigation (e.g., list view, detail view, create/edit form).

This file will be used as the design reference for frontend development.

Output: a single, complete HTML file.
Save as: .ai-dev/ui/pages/[kebab-screen-name].html
```
---

> **After running:** Update your `PROJECT_BRIEF.md` Section 9b — change the row from `GENERATE` to `FILE`
> and set the Path to `.ai-dev/ui/pages/[kebab-screen-name].html`

> **Repeat** this prompt for each `GENERATE` screen in your design reference table.

---
---

## STEP 1 — PRD Overview

**Save output to:** `.ai-dev/docs/PRD/PRD_OVERVIEW.md`

**Context to feed AI first:** `AI_RULES.md` + `PROJECT_BRIEF.md`

---
**COPY THIS PROMPT:**
```
You are a senior product manager and software architect.

You have read my PROJECT_BRIEF.md. Using everything in that brief, generate a
complete PRD Overview document for this project.

Extract all values directly from the brief — do not ask me for information you
can find there. Make reasonable, documented assumptions for anything that is unclear.

Generate the following sections:

1. EXECUTIVE SUMMARY
   - Project name (from brief Section 1)
   - One-paragraph description of what the product does and the problem it solves
     (from brief Sections 2 and 3)
   - Target market and users (from brief Section 4)

2. USER PERSONAS
   Using the personas from brief Section 4:
   For each persona — Name, Role, Key responsibilities, Primary goals, Pain points resolved

3. MVP FEATURE LIST
   Using the features from brief Section 5:
   | Feature ID | Feature Name | Priority | Personas Affected | Notes |
   (FEAT-001, FEAT-002, etc.)

4. OUT OF SCOPE (MVP)
   From brief Section 6 — list explicitly what will NOT be built

5. KEY BUSINESS RULES
   From brief Section 7 — list all constraints that code must enforce

6. HIGH-LEVEL MODULE BREAKDOWN
   Based on the features and tech stack in the brief:
   - Backend route groups (Express /api/... paths)
   - Frontend page groups (Next.js routes)
   - Shared utilities or services

7. RELEASE ROADMAP
   | Phase | Features (by Feature ID) | Goal |
   Phase 1 = P0 features (MVP launch)
   Phase 2 = P1 features
   Phase 3 = P2 features

8. OPEN QUESTIONS
   From brief Section 13, plus any assumptions you made that need confirmation

Output this as structured markdown.
This will be saved as .ai-dev/docs/PRD/PRD_OVERVIEW.md
```
---

---
---

## STEP 2 — Feature PRDs

**Save output to:** `.ai-dev/docs/PRD/features/FEAT_[NNN]_[feature-name].md`  
**Run once per feature** — for each P0 and P1 feature listed in PRD_OVERVIEW.md.

**Context to feed AI first:** `AI_RULES.md` + `PROJECT_BRIEF.md` + `docs/PRD/PRD_OVERVIEW.md`

---
**COPY THIS PROMPT:**
```
You are a senior software architect and product manager.

You have read my PROJECT_BRIEF.md and PRD_OVERVIEW.md.

Write a complete, detailed Feature PRD for the next unwritten P0 or P1 feature
from the MVP Feature List in PRD_OVERVIEW.md.

(If I specify a feature: write the PRD for [feature name or FEAT-ID from PRD_OVERVIEW])
(If I don't specify: start with the highest-priority unwritten feature)

Extract all values from the brief and PRD_OVERVIEW — do not ask for information
already there. Use the business rules, personas, and tech stack from those documents.

Structure the Feature PRD as follows:

1. HEADER
   - Feature ID: (FEAT-001, FEAT-002, etc. — from PRD_OVERVIEW)
   - Feature Name:
   - Priority: (P0/P1/P2)
   - Personas involved:
   - Status: Draft

2. OVERVIEW
   What this feature does and why it is needed (1 paragraph)

3. USER STORIES
   Format: "As a [persona], I want to [action] so that [benefit]"
   Write one story per persona that interacts with this feature

4. ACCEPTANCE CRITERIA
   For each user story, write in Given/When/Then format.
   Include: happy path, error cases, edge cases, permission checks.
   Label each: AC-001, AC-002, etc.

5. FUNCTIONAL REQUIREMENTS
   | ID | Requirement | Priority | Notes |
   FR-001, FR-002, etc.

6. NON-FUNCTIONAL REQUIREMENTS
   - Performance (response time target from brief Section 11)
   - Security requirements
   - Accessibility level (from brief Section 11)

7. API ENDPOINTS (outline only — no implementation)
   | Method | Path | Description | Auth required | Roles allowed |

8. DATABASE CHANGES
   - Tables to create or modify
   - New columns or indexes needed
   - Any data migrations required

9. UI / UX NOTES
   - Key screens and flows
   - Component types needed (form, table, modal, etc.)
   - Reference: .ai-dev/ui/UI_GUIDELINES.md

10. SECURITY CHECKLIST
    - [ ] Input validation
    - [ ] Authentication check
    - [ ] Authorisation / role check
    - [ ] Rate limiting needed?
    - [ ] PII or sensitive data involved?
    - [ ] Audit logging needed?

11. OPEN QUESTIONS
    Anything unclear that must be decided before implementation

Output as markdown.
Save as .ai-dev/docs/PRD/features/FEAT_[NNN]_[kebab-feature-name].md
```
---

> **Repeat this prompt for each feature.** Each time, the AI will pick the next
> unwritten feature — or you can specify one by name.

---
---

## STEP 3 — Architecture

**Save output to:** `.ai-dev/docs/ARCHITECTURE.md`

**Context to feed AI first:** `AI_RULES.md` + `PROJECT_BRIEF.md` + `docs/PRD/PRD_OVERVIEW.md`

---
**COPY THIS PROMPT:**
```
You are a senior software architect.

You have read my PROJECT_BRIEF.md and PRD_OVERVIEW.md.

Generate the complete ARCHITECTURE.md for this project.
Use the tech stack from brief Section 8 and the features from PRD_OVERVIEW.md.
If the brief leaves a choice open, make an opinionated decision and document your rationale.

MANDATORY STRUCTURE: This project uses a modular monorepo architecture.
Every feature is a self-contained module under apps/web/src/modules/ (frontend)
and apps/api/src/modules/ (backend). No exceptions.

The canonical structure is:
root/
├── apps/
│   ├── web/                              # Next.js frontend
│   │   └── src/
│   │       ├── app/                      # App Router — pages only, no logic
│   │       │   ├── layout.tsx
│   │       │   ├── [feature]/page.tsx    # One per feature
│   │       │   └── api/[...path]/route.ts  # Proxy — forwards to Express
│   │       ├── modules/                  # Feature modules
│   │       │   └── [feature]/
│   │       │       ├── components/
│   │       │       ├── hooks/
│   │       │       ├── services/
│   │       │       ├── store/            # optional
│   │       │       └── types.ts
│   │       ├── components/               # Shared UI (common/, ui/)
│   │       ├── lib/                      # api-client.ts, config.ts
│   │       ├── styles/
│   │       └── types/
│   └── api/                              # Express backend
│       ├── src/
│       │   ├── core/                     # app.ts, server.ts
│       │   ├── modules/                  # Feature modules
│       │   │   └── [feature]/
│       │   │       ├── [feature].routes.ts
│       │   │       ├── [feature].controller.ts
│       │   │       ├── [feature].service.ts
│       │   │       ├── [feature].validation.ts
│       │   │       └── [feature].types.ts
│       │   ├── middlewares/              # auth.middleware.ts, error.middleware.ts
│       │   ├── lib/                      # prisma.ts
│       │   ├── config/                   # env.ts
│       │   └── utils/
│       └── prisma/                       # schema.prisma, migrations/, seed.ts
├── packages/                             # Shared types/ui/config (only if needed)
├── .env
├── .env.example
└── package.json                          # npm workspaces root

Generate the following sections:

1. SYSTEM OVERVIEW
   ASCII diagram: Browser -> Next.js (:3000) -> Express (:3003) -> PostgreSQL
   Note the proxy layer: Next.js /api/[...path]/route.ts forwards all /api/* to Express

2. FOLDER STRUCTURE (COMPLETE)
   Using the modular structure above, show the ACTUAL folders for THIS project.
   Replace [feature] placeholders with the real feature names from PRD_OVERVIEW.md.
   Include every folder and key file with a one-line description.

3. MODULE LIST
   Table: | Module | Frontend path | Backend path | Description |
   One row per feature from PRD_OVERVIEW MVP Feature List.

4. TECHNOLOGY DECISIONS
   | Layer | Technology | Version | Why chosen |
   Cover: frontend, UI library, backend, ORM, auth, file storage, email, payments, deployment

5. KEY ARCHITECTURAL DECISIONS
   For each decision that differs from defaults or needs explanation:
   - Decision / Rationale / Trade-offs

6. API ARCHITECTURE
   - Base URL: /api/
   - Proxy: Next.js app/api/[...path]/route.ts -> http://localhost:3003
   - Auth: JWT httpOnly cookie
   - Success: { success: true, data, message }
   - Error: { success: false, error, code }
   - Pagination: ?page&limit&sort&order

7. DATABASE ARCHITECTURE
   - PostgreSQL + Prisma, Prisma client singleton at apps/api/src/lib/prisma.ts
   - Soft delete pattern, UUID PKs, TIMESTAMPTZ for all timestamps
   - Migration strategy

8. ENVIRONMENT VARIABLES
   | Variable | Type | Example value | Used by | Required |
   Cover all vars this project needs (DB, JWT, external services from brief)

9. LOCAL DEVELOPMENT SETUP
   Exact commands to get a new developer running:
   git clone, npm install, .env setup, prisma migrate dev, prisma db seed, npm run dev

10. DEPLOYMENT OVERVIEW
    From brief Section 12: target environment, build commands, config notes.

Output as markdown.
Save as .ai-dev/docs/ARCHITECTURE.md
```
---


---
---

## STEP 4 — Database Spec

**Save output to:** `.ai-dev/docs/SPECS/DATABASE_SPEC.md`

**Context to feed AI first:** `AI_RULES.md` + `PROJECT_BRIEF.md` + all `FEAT_XXX_*.md` files

---
**COPY THIS PROMPT:**
```
You are a senior database architect. Design for production — not prototypes.

You have read my PROJECT_BRIEF.md and all Feature PRD files.

Design the complete database schema for this project.
Extract data requirements from the "Database Changes" section of every Feature PRD.
Use the business rules from brief Section 7 as hard constraints.

MANDATORY conventions (non-negotiable — from DEV_RULES.md):
- Primary keys: UUID using gen_random_uuid() — NEVER serial or autoincrement
- Every table MUST have: id, created_at, updated_at, deleted_at (soft delete)
- Column names: snake_case
- Table names: snake_case, plural
- Boolean columns: is_ prefix (is_active, is_verified, is_deleted)
- Money / amounts: BIGINT in smallest currency unit (paise or cents) — NEVER DECIMAL
- All timestamps: TIMESTAMPTZ — never TIMESTAMP without timezone
- Soft deletes only — never hard DELETE — always filter WHERE deleted_at IS NULL
- Foreign keys: always indexed
- JSON columns: JSONB not JSON

Produce TWO outputs:

OUTPUT 1 — PRISMA SCHEMA (schema.prisma model blocks)
For every table:
- Full model definition with all fields and types
- @relation() decorators for all relationships
- @map("snake_case_name") for every field
- @@map("table_name") for every model
- @@index() on every FK column and every commonly filtered column
- @@unique() where data uniqueness must be enforced

OUTPUT 2 — TABLE DOCUMENTATION (for DATABASE_SPEC.md)
For each table:
### Table: `table_name`
**Purpose:** one sentence
| Column | Type | Nullable | Default | Description |
**Constraints:** PK, FKs, unique constraints
**Indexes:** name and reason for each

Then append:
### Entity Relationship Diagram (ASCII)
### Relationships Map
| Table A | Relation | Table B | FK Column | On Delete |
### Migration Notes
(anything unusual about applying this schema)

Output both as markdown.
Save as .ai-dev/docs/SPECS/DATABASE_SPEC.md
```
---

---
---

## STEP 5 — API Spec

**Save output to:** `.ai-dev/docs/SPECS/API_SPEC.md`

**Context to feed AI first:**  
`AI_RULES.md` + `PROJECT_BRIEF.md` + all `FEAT_XXX_*.md` files + `DATABASE_SPEC.md`

---
**COPY THIS PROMPT:**
```
You are a senior backend engineer documenting a production REST API.

You have read my PROJECT_BRIEF.md, all Feature PRDs, and DATABASE_SPEC.md.

Document the complete REST API for this project.
Extract all required endpoints from the "API Endpoints" section of every Feature PRD.
Apply the business rules from brief Section 7 to every endpoint's auth and role logic.

Conventions (non-negotiable):
- Base URL: /api/
- No URL versioning (frontend and backend deploy together)
- Standard success: { success: true, data: {...}, message: "..." }
- Standard error: { success: false, error: "...", code: "ERROR_CODE" }
- List endpoints support: ?page=1&limit=20&sort=field&order=asc|desc
- Soft-deleted records never returned unless admin requests explicitly
- All auth uses JWT via httpOnly cookie

For every endpoint, document:

### [METHOD] [PATH]
**Description:** what it does
**Auth:** required / not required
**Roles:** which roles can call this (from personas in brief Section 4)
**Request:**
- Headers: (Authorization cookie if applicable)
- Body: | Field | Type | Required | Validation | Description |
- Query params: | Param | Type | Default | Description |
**Response 200:** JSON shape with a realistic example
**Error responses:** | Status | Code | When |

Organise by feature module (one section per feature from PRD_OVERVIEW).

Also include:
1. AUTHENTICATION ENDPOINTS section with full detail on:
   POST /api/auth/register
   POST /api/auth/login
   POST /api/auth/refresh
   POST /api/auth/logout

2. COMMON ERROR CODES table
   | Code | HTTP Status | Meaning |

3. API OVERVIEW section at the top:
   - Base URL, auth mechanism, response format, pagination, rate limiting

Output as markdown.
Save as .ai-dev/docs/SPECS/API_SPEC.md
```
---

---
---

## STEP 6 — Security

**Save output to:** `.ai-dev/docs/SECURITY.md`

You are a senior security engineer.

You have read my PROJECT_BRIEF.md, ARCHITECTURE.md, and API_SPEC.md.

Produce a complete Security document for this project.
Use the data compliance requirements from brief Section 11.
Use the persona roles from brief Section 4 for the permission matrix.
Identify any PII or sensitive data from brief Sections 2, 4, and 5.

Generate the following sections:

1. THREAT MODEL
   | Threat | Attack Vector | Risk Level | Mitigation |
   Categories: Authentication, Authorisation, Injection, Data Exposure,
   CSRF, XSS, Rate Limiting, Session Hijacking, Insecure Direct Object Reference

2. AUTHENTICATION & AUTHORISATION
   - JWT + httpOnly cookie: exact config (algorithm, expiry, rotation)
   - Refresh token strategy
   - Account lockout rules (failed attempts, lockout duration)
   - PERMISSION MATRIX:
     | Action | Admin | [Persona 2] | [Persona 3] | [Persona N] |
     (use actual persona names from brief — one column per role)

3. INPUT VALIDATION REQUIREMENTS
   | Endpoint Group | Validation Rules | Sanitisation Required |

4. DATA PROTECTION
   - Fields that must be encrypted at rest (list from schema)
   - Fields that MUST NEVER appear in API responses
   - PII data handling and retention (from compliance requirement in brief)
   - Logging rules: what to log, what never to log

5. RATE LIMITING
   | Endpoint or Group | Limit | Window | Action on Breach |

6. INFRASTRUCTURE SECURITY
   - CORS policy (allowed origins)
   - HTTP security headers (Helmet.js config values)
   - Environment variable handling rules
   - Secrets management

7. PRE-LAUNCH SECURITY CHECKLIST
   Every item that must be verified before go-live.
   - [ ] each item

Output as markdown.
Save as .ai-dev/docs/SECURITY.md
**Context to feed AI first:**  
`AI_RULES.md` + `PROJECT_BRIEF.md` + `ARCHITECTURE.md` + `API_SPEC.md`

---
**COPY THIS PROMPT:**
```
You are a senior security engineer.

You have read my PROJECT_BRIEF.md, ARCHITECTURE.md, and API_SPEC.md.

Produce a complete Security document for this project.
Use the data compliance requirements from brief Section 11.
Use the persona roles from brief Section 4 for the permission matrix.
Identify any PII or sensitive data from brief Sections 2, 4, and 5.

Generate the following sections:

1. THREAT MODEL
   | Threat | Attack Vector | Risk Level | Mitigation |
   Categories: Authentication, Authorisation, Injection, Data Exposure,
   CSRF, XSS, Rate Limiting, Session Hijacking, Insecure Direct Object Reference

2. AUTHENTICATION & AUTHORISATION
   - JWT + httpOnly cookie: exact config (algorithm, expiry, rotation)
   - Refresh token strategy
   - Account lockout rules (failed attempts, lockout duration)
   - PERMISSION MATRIX:
     | Action | Admin | [Persona 2] | [Persona 3] | [Persona N] |
     (use actual persona names from brief — one column per role)

3. INPUT VALIDATION REQUIREMENTS
   | Endpoint Group | Validation Rules | Sanitisation Required |

4. DATA PROTECTION
   - Fields that must be encrypted at rest (list from schema)
   - Fields that MUST NEVER appear in API responses
   - PII data handling and retention (from compliance requirement in brief)
   - Logging rules: what to log, what never to log

5. RATE LIMITING
   | Endpoint or Group | Limit | Window | Action on Breach |

6. INFRASTRUCTURE SECURITY
   - CORS policy (allowed origins)
   - HTTP security headers (Helmet.js config values)
   - Environment variable handling rules
   - Secrets management

7. PRE-LAUNCH SECURITY CHECKLIST
   Every item that must be verified before go-live.
   - [ ] each item

Output as markdown.
Save as .ai-dev/docs/SECURITY.md
```
---

---
---

## STEP 7 — Test Plan

**Save output to:** `.ai-dev/tests/TEST_PLAN.md`

**Context to feed AI first:**  
`AI_RULES.md` + `PROJECT_BRIEF.md` + all `FEAT_XXX_*.md` files (Acceptance Criteria sections)

---
**COPY THIS PROMPT:**
```
You are a senior QA engineer and test architect.

You have read my PROJECT_BRIEF.md and all Feature PRD files.

Produce a complete Test Plan using the Acceptance Criteria from every Feature PRD
as the basis for test cases.

Testing stack: Jest + Supertest (backend), Jest + React Testing Library (frontend).

Generate:

1. TEST STRATEGY
   - Testing pyramid: % split between unit / integration / E2E
   - What to mock vs what to use a real test DB for
   - Coverage targets: backend (%), frontend (%)
   - Test data strategy (fixtures, factories, or seeds)

2. UNIT TESTS — BACKEND SERVICES
   For each service layer function identified in the Feature PRDs:
   | Test ID | Module/Service | Scenario | Input | Expected Output | AC Reference |

3. INTEGRATION TESTS — API ENDPOINTS
   For every endpoint in the API:
   | Test ID | Method + Path | Scenario | Auth State | Expected Status | Expected Body |
   For each endpoint include: happy path, auth failure (401), forbidden (403),
   not found (404), validation failure (400)

4. UNIT TESTS — FRONTEND COMPONENTS
   For each key component or page:
   | Test ID | Component | Scenario | User Action | Expected Result | AC Reference |

5. CRITICAL USER FLOW TESTS (E2E)
   Step-by-step test scripts for the top 3-5 most important user journeys.
   Base these on the highest-priority user stories in the Feature PRDs.

6. EDGE CASES & NEGATIVE TESTS
   List all edge cases that MUST have explicit test coverage.

7. TEST DATA REQUIREMENTS
   What seed data is needed for the test suite to run reliably.
   (Match this to the personas and scenarios in the Feature PRDs)

Output as markdown.
Save as .ai-dev/tests/TEST_PLAN.md
```
---

---
---

## STEP 8 — AI Context

**Save output to:** `.ai-dev/ai/PROJECT_CONTEXT.md`

**Context to feed AI first:**  
`AI_RULES.md` + ALL files generated in Steps 1–7

---
**COPY THIS PROMPT:**
```
You are a technical writer creating a compressed context file for AI coding assistants.

You have read all my project documentation: PROJECT_BRIEF, PRD_OVERVIEW, all Feature PRDs,
ARCHITECTURE, DATABASE_SPEC, API_SPEC, SECURITY, and TEST_PLAN.

Create PROJECT_CONTEXT.md — a single compressed file that will be fed to an AI
at the start of every development session to provide essential context without
using too many tokens.

Rules for this file:
- Maximum 500 lines total
- Use tables and bullet points — avoid paragraphs
- Every section must be scannable in under 30 seconds
- Include only what an AI needs to write correct code for this project

Sections to include:

1. PROJECT SNAPSHOT
   3-4 sentences: what it is, who uses it, current phase, tech stack summary

2. TECH STACK (table)
   | Layer | Technology | Version | Key Config Note |

3. FOLDER STRUCTURE (abbreviated)
   Only the folders an AI must know to navigate correctly.
   2-line max description per folder.

4. FEATURE STATUS (table)
   | Feature ID | Name | Priority | Status |
   All features from PRD_OVERVIEW, status = "Not Started"

5. KEY BUSINESS RULES
   Numbered list — the constraints code must ALWAYS enforce.
   Copy verbatim from brief Section 7 + any additions from Feature PRDs.

6. API QUICK REFERENCE
   - Base URL, auth method, response shapes (single line each)
   - Table of all endpoints: Method | Path | Auth | Roles

7. DATABASE QUICK REFERENCE
   - Naming rules (one line each)
   - List of all tables with one-line purpose
   - Mandatory columns reminder

8. DEV RULES (critical subset only)
   The 6-8 rules from DEV_RULES.md the AI must ALWAYS follow.
   (Never hard-delete, always soft-delete, never edit applied migrations, etc.)

9. FILE MAP
   | Topic | File to reference |
   (e.g., "Full DB schema" -> .ai-dev/docs/SPECS/DATABASE_SPEC.md)

Output as markdown.
Save as .ai-dev/ai/PROJECT_CONTEXT.md
```
---

---
---

## STEP 9 — Project Tracking

**Save output to:** `.ai-dev/PROJECT_STATUS.md` + `.ai-dev/PROGRESS.md`

**Context to feed AI first:**  
`AI_RULES.md` + `PRD_OVERVIEW.md` + all `FEAT_XXX_*.md` files

---
**COPY THIS PROMPT:**
```
You are a project manager setting up tracking documents for a new software project.

You have read my PRD_OVERVIEW.md and all Feature PRD files.

Generate TWO tracking documents. Output them as two clearly separated markdown blocks.

---

FILE 1 — PROJECT_STATUS.md

Structure:
# [Project Name] — Project Status

**Phase:** 0 — Documentation Complete, Development Not Started
**Last Updated:** [today's date]

## Feature Tracker
| Feature ID | Feature Name | Priority | Status | Notes |
(List every feature from PRD_OVERVIEW MVP Feature List)
(All start as: Not Started)

## Progress Overview
```
P0 Features: 0 / [N] complete
P1 Features: 0 / [N] complete
P2 Features: 0 / [N] complete
Overall:     [==========-] 0%
```

## Current Sprint Focus
_Not started — complete documentation review before beginning_

## Blockers
_None_

## Recent Changes
_(none yet — project initialised)_

---

FILE 2 — PROGRESS.md

Structure:
# [Project Name] — Development Progress Log

> Update this file at the END of every coding session.
> The "Resume Prompt" section is what you paste to AI at the START of the next session.

## How to use this file
[2-sentence explanation of the session diary pattern]

## Session Template (copy for each new session)
---
### Session — [YYYY-MM-DD]
**Duration:** [X hours]
**Feature(s) worked on:** [FEAT-ID: Feature Name]

**Completed this session:**
- [ ] item

**In Progress:**
- item (next step: ...)

**Blocked on:**
- None

**Next Session — Start With:**
> [Specific task to pick up immediately]

**AI Resume Prompt for Next Session:**
```
We are continuing development on [Project Name].

Context files to provide:
- .ai-dev/ai/AI_RULES.md
- .ai-dev/ai/PROJECT_CONTEXT.md
- .ai-dev/docs/PRD/features/[Active Feature PRD]
- .ai-dev/docs/SPECS/[relevant spec if DB or API work]

Last session summary:
[Paste what was completed]

Next task:
[Paste "Next Session — Start With" from above]
```
---

## Session Log
_(Add sessions above this line, newest first)_

---

Output both files as separate markdown blocks, clearly labelled FILE 1 and FILE 2.
Save FILE 1 as .ai-dev/PROJECT_STATUS.md
Save FILE 2 as .ai-dev/PROGRESS.md
```
---

---
---

## After Step 9

Run Step 10 to generate your project-specific ready-to-paste development prompts.

---
---

## STEP 10 — Dev Prompts

**Save output to:** `.ai-dev/ai/DEV_PROMPTS.md` ⭐  
**This is the file you use for the entire development phase.**

**Context to feed AI first:**  
`AI_RULES.md` + `PROJECT_CONTEXT.md` + `PRD_OVERVIEW.md` + all `FEAT_XXX_*.md` files + `DATABASE_SPEC.md` + `API_SPEC.md` + `SECURITY.md` + `TEST_PLAN.md`

> Feed everything — the AI needs all docs to pre-fill every prompt correctly.

---
**COPY THIS PROMPT:**
```
You are a senior software architect and AI prompt engineer.

You have read ALL of my project documentation:
- PROJECT_BRIEF.md (including Section 9b: Design File References table)
- PROJECT_CONTEXT.md
- PRD_OVERVIEW.md
- All FEAT_XXX_*.md Feature PRDs
- DATABASE_SPEC.md
- API_SPEC.md
- SECURITY.md
- TEST_PLAN.md

Generate DEV_PROMPTS.md — a project-specific, ready-to-paste development prompts file.

CRITICAL RULES:
1. NO generic [brackets] for values available in the docs — use actual values
2. Use ACTUAL feature names, table names, endpoint paths from the docs
3. Use ACTUAL role names from SECURITY.md
4. Use ACTUAL Feature PRD filenames (e.g., FEAT_001_user-auth.md)
5. Every prompt block must include a "Files to provide" list with exact .ai-dev/ paths
6. Prompts must be self-contained — developer copies the block and pastes as-is

DESIGN REFERENCE RULES (read Section 9b carefully):
For every frontend section that needs a design reference:
- Source = FILE  -> inject: [ATTACH FILE: .ai-dev/ui/pages/[filename from Section 9b]]
- Source = FIGMA -> inject: [OPEN IN BROWSER: [Figma URL from Section 9b] — share with AI as screenshot]
- Source = URL   -> inject: [OPEN: [URL from Section 9b] — share with AI as screenshot]
- Source = GENERATE -> inject: [ATTACH FILE: .ai-dev/ui/pages/[generated filename].html]
  (assume Step 0 was run and file exists at that path)
- Source = PENDING -> inject: [ATTACH DESIGN: screenshot of [Screen name] — upload before running this prompt]

Generate the following sections:

## SECTION 0 — Session Start (every session)
Generate a session start template:
- Exact paths: .ai-dev/ai/AI_RULES.md and .ai-dev/ai/PROJECT_CONTEXT.md
- Content includes actual project name, current phase placeholder
- Format: paste as Message 1 before any task prompt

## SECTION 1 — Project Scaffold
ONE ready prompt:
- Actual tech stack (Next.js version, Express version, Prisma version from PROJECT_CONTEXT)
- Actual folder structure from ARCHITECTURE.md
- Actual env variable names from ARCHITECTURE.md
- Exact scaffold commands for this stack
Files: AI_RULES.md + PROJECT_CONTEXT.md + ARCHITECTURE.md

## SECTION 2 — Database: Initial Schema
ONE ready prompt:
- Lists ALL table names from DATABASE_SPEC.md explicitly
- States key relationships
- Includes mandatory column convention
Files: AI_RULES.md + PROJECT_CONTEXT.md + DATABASE_SPEC.md

## SECTION 3 — Database: Initial Migration & Seed
ONE ready prompt:
- Actual migration name: init_[projectname]_schema
- Actual seed roles/personas from SECURITY.md
- References DATABASE_SPEC.md
Files: AI_RULES.md + PROJECT_CONTEXT.md + DATABASE_SPEC.md

## SECTION 4 — Authentication Module
ONE ready prompt:
- Actual role names from SECURITY.md
- Actual auth endpoint paths from API_SPEC.md
- JWT config from SECURITY.md
- Actual permission matrix
- References actual auth Feature PRD filename
Files: AI_RULES.md + PROJECT_CONTEXT.md + [auth FEAT file] + API_SPEC.md + SECURITY.md

## SECTION 5 — Backend: one subsection per non-auth P0/P1 feature
For EACH feature:
### Backend: [Actual Feature Name] ([FEAT-ID])
- Actual API endpoint paths for this feature from API_SPEC.md
- Actual tables this feature uses from DATABASE_SPEC.md
- Actual AC IDs from Feature PRD
- Actual role restrictions
- References actual FEAT filename
Files: AI_RULES.md + PROJECT_CONTEXT.md + [actual FEAT file] + API_SPEC.md + DATABASE_SPEC.md

## SECTION 6 — Frontend: Base Layout & Shell
ONE ready prompt:
- Actual page routes from ARCHITECTURE.md
- Actual nav structure
- Role-based layout from SECURITY.md
- Design reference from Section 9b for the main layout/shell screen
  (apply the DESIGN REFERENCE RULES above)
Files: AI_RULES.md + PROJECT_CONTEXT.md + ARCHITECTURE.md + UI_GUIDELINES.md
+ [design reference per rules above]

## SECTION 7 — Frontend: one subsection per P0/P1 feature
For EACH feature:
### Frontend: [Actual Feature Name] ([FEAT-ID])
- Actual page routes for this feature from ARCHITECTURE.md
- Actual API endpoints to call from API_SPEC.md
- Actual user story IDs from Feature PRD
- Design reference for THIS feature's screens, using DESIGN REFERENCE RULES above
  (look up each screen in Section 9b and apply the correct reference format)
Files: AI_RULES.md + PROJECT_CONTEXT.md + [actual FEAT file] + API_SPEC.md + UI_GUIDELINES.md
+ [design reference per rules above]

## SECTION 8 — Testing: one subsection per P0/P1 feature
For EACH feature:
### Tests: [Actual Feature Name] ([FEAT-ID])
- Actual test case IDs from TEST_PLAN.md
- Actual endpoints from API_SPEC.md
- Actual AC IDs from Feature PRD
Files: AI_RULES.md + PROJECT_CONTEXT.md + [actual FEAT file] + API_SPEC.md + TEST_PLAN.md

## SECTION 9 — Bug Fix Template
ONE reusable prompt:
- Actual project name
- Actual file path patterns
- Reference to .ai-dev/dev/DEV_RULES.md
- Keep [DESCRIBE THE BUG] and [PASTE ERROR] as the only fill-in placeholders
Files: AI_RULES.md + PROJECT_CONTEXT.md + [relevant FEAT or spec file]

## SECTION 10 — Session Resume Template
ONE prompt:
- Actual project name
- Exact paths: .ai-dev/ai/AI_RULES.md, .ai-dev/ai/PROJECT_CONTEXT.md
- Template for developer to fill in last session summary and next task
Files: AI_RULES.md + PROJECT_CONTEXT.md + [active FEAT file] + PROGRESS.md

FORMATTING RULES:
- Each section header: ## SECTION N — Name
- Each subsection (per feature): ### [Type]: [Feature Name] ([FEAT-ID])
- "When to use:" one-liner before each prompt
- "Files to provide:" block before each prompt code block
- Prompt inside ``` code block
- Design references on their own line, clearly visible

Output as markdown. Save as .ai-dev/ai/DEV_PROMPTS.md
```

---

---
---

## After Step 10 — You Are Development Ready

You now have:

| File | Purpose |
|---|---|
| `.ai-dev/ai/DEV_PROMPTS.md` | ⭐ Project-specific copy-paste prompts for every dev task |
| `.ai-dev/ai/DEMO_PROMPTS.md` | Generic phase reference (fallback if needed) |
| `.ai-dev/ai/PROJECT_CONTEXT.md` | Feed to AI at the start of every session |
| `.ai-dev/ai/AI_RULES.md` | Feed to AI at the start of every session |
| `.ai-dev/ui/pages/` | Design reference files (uploaded or generated) |

**Next steps:**
1. Review `DEV_PROMPTS.md` — verify all feature names, file refs, and design references are correct
2. For `PENDING` design rows — upload your design files to `.ai-dev/ui/pages/` and update `PROJECT_BRIEF.md` Section 9b
3. Open `DEVELOPMENT.md` → Phase 1 (Scaffold) — start building
