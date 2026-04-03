# Development Guide — task_management_system

> **Start here every time you work on this project.**  
> This file is a navigator — it tells you what to do and where to find the details.

---

## Quick Reference

| I want to... | Go to |
|---|---|
| Set up project docs from scratch | [Phase 0 — Documentation Setup](#phase-0--documentation-setup) below |
| Scaffold source code | [Phase 1 — Scaffold](#phase-1--scaffold-source-code) below |
| Start a coding session / resume work | [Daily — Session Start](#daily--session-start) below |
| Build a feature | [Daily — Feature Loop](#daily--feature-loop) below |
| Find a ready-to-paste dev prompt | `.ai-dev/ai/DEV_PROMPTS.md` ⭐ |
| Run setup prompts (generate docs) | `.ai-dev/ai/SETUP_PROMPTS.md` |
| Generic phase reference prompts | `.ai-dev/ai/DEMO_PROMPTS.md` |
| Dev rules and conventions | `.ai-dev/dev/DEV_RULES.md` |
| Coding standards | `.ai-dev/dev/CODING_STANDARDS.md` |
| Git workflow | `.ai-dev/dev/GIT_WORKFLOW.md` |
| API conventions | `.ai-dev/dev/API_CONVENTIONS.md` |
| Database migration rules | `.ai-dev/dev/DEV_RULES.md` → Database section |

---
---

## Phase 0 — Documentation Setup

> **Do this once — before writing any code.**  
> All documentation is generated from your project brief using AI prompts.

### Step 1 — Fill in the Project Brief

Open **`.ai-dev/PROJECT_BRIEF.md`** and fill in every section.

This is the input for every setup prompt. The more detail you provide, the better every generated document will be. Set aside 30–60 minutes for this.

### Step 2 — Generate All Project Documents

Open **`.ai-dev/ai/SETUP_PROMPTS.md`** and run the 9 prompts in order:

| Prompt | Output file |
|---|---|
| STEP 1 — PRD Overview | `.ai-dev/docs/PRD/PRD_OVERVIEW.md` |
| STEP 2 — Feature PRDs (one per feature) | `.ai-dev/docs/PRD/features/FEAT_XXX_*.md` |
| STEP 3 — Architecture | `.ai-dev/docs/ARCHITECTURE.md` |
| STEP 4 — Database Spec | `.ai-dev/docs/SPECS/DATABASE_SPEC.md` |
| STEP 5 — API Spec | `.ai-dev/docs/SPECS/API_SPEC.md` |
| STEP 6 — Security | `.ai-dev/docs/SECURITY.md` |
| STEP 7 — Test Plan | `.ai-dev/tests/TEST_PLAN.md` |
| STEP 8 — AI Context | `.ai-dev/ai/PROJECT_CONTEXT.md` |
| STEP 9 — Project Tracking | `.ai-dev/PROJECT_STATUS.md` + `.ai-dev/PROGRESS.md` |
| **STEP 10 — Dev Prompts** ⭐ | **`.ai-dev/ai/DEV_PROMPTS.md`** |

Each prompt in `SETUP_PROMPTS.md` tells you:
- What context files to feed the AI
- The full prompt to copy and send
- Where to save the output

### Step 3 — Review Every Generated Document

Before writing code, validate everything:

- [ ] `PRD_OVERVIEW.md` — feature list and priorities match your vision
- [ ] Each `FEAT_XXX_*.md` — acceptance criteria cover all personas and edge cases
- [ ] `ARCHITECTURE.md` — folder structure and tech decisions are correct
- [ ] `DATABASE_SPEC.md` — all tables, columns, types, and indexes are right
- [ ] `API_SPEC.md` — all endpoints, methods, payloads are documented
- [ ] `SECURITY.md` — auth, data protection, and rate limiting requirements covered
- [ ] `TEST_PLAN.md` — all critical user flows have test cases
- [ ] `PROJECT_CONTEXT.md` — AI context summary is accurate and concise
- [ ] `PROJECT_STATUS.md` — all features listed with correct priorities

Edit docs directly — AI output is a first draft, not the final word.

---
---

## Phase 1 — Scaffold Source Code

> **Do this after all 9 documents are reviewed.**  
> Use AI to scaffold the project structure based on `ARCHITECTURE.md`.

**Feed this context to AI:**
```
1. .ai-dev/ai/AI_RULES.md
2. .ai-dev/ai/PROJECT_CONTEXT.md
3. .ai-dev/docs/ARCHITECTURE.md
```

Ask AI to generate:
- Exact folder structure from `ARCHITECTURE.md`
- `package.json` and install commands for your stack
- Config files: ESLint, Prettier, tsconfig, `.env.example`
- Prisma init and base `schema.prisma`
- Git initial commit

After scaffolding, start development using `DEMO_PROMPTS.md` — Phase 1 first (database).

---
---

## Daily — Session Start

> **Do this every time you open the project — even after one day away.**

```
1. Read   .ai-dev/PROGRESS.md          -> where you left off
2. Check  .ai-dev/PROJECT_STATUS.md    -> active features and blockers
3. Run    git log --oneline -10         -> last commits
4. Open   .ai-dev/ai/DEMO_PROMPTS.md   -> Phase 10 for the resume prompt
```

**AI resume prompt (Phase 10):**
```
Feed AI:
  .ai-dev/ai/AI_RULES.md
  .ai-dev/ai/PROJECT_CONTEXT.md
  The active Feature PRD

Then say:
  "We are continuing task_management_system.
   Last session: [paste last PROGRESS.md entry]
   Next task: [specific next step]"
```

---
---

## Daily — Feature Loop

```
PRD -> DB -> API -> UI -> Tests -> Update Docs -> Commit
```

**Before starting a feature:**
1. Read the Feature PRD: `.ai-dev/docs/PRD/features/FEAT_XXX_*.md`
2. Check schema: `.ai-dev/docs/SPECS/DATABASE_SPEC.md`
3. Check endpoints: `.ai-dev/docs/SPECS/API_SPEC.md`
4. Check folder structure: `.ai-dev/docs/ARCHITECTURE.md`

**Development order and which prompt to use:**

| Step | What to build | Use from `DEV_PROMPTS.md` |
|---|---|---|
| 1 | DB migration (if schema changes) | Section 2 or 3 |
| 2 | Service / business logic | Section 5: Backend: [Feature] |
| 3 | API route + validation | Section 5: Backend: [Feature] |
| 4 | Frontend page / layout | Section 6 or 7: Frontend: [Feature] |
| 5 | Feature UI components | Section 7: Frontend: [Feature] |
| 6 | Tests | Section 8: Tests: [Feature] |

> For any task not in `DEV_PROMPTS.md`, fall back to `.ai-dev/ai/DEMO_PROMPTS.md`

**After every feature:**
1. `npm run test` — all pass
2. Update `.ai-dev/CHANGELOG.md`
3. Tick off feature in `.ai-dev/PROJECT_STATUS.md`
4. Write session diary in `.ai-dev/PROGRESS.md`
5. `git push` → PR → review → merge

---

## Project Contacts

| Role | Name | Contact |
|---|---|---|
| Lead Developer | _[Name]_ | _[email / Slack]_ |
| Project Manager | _[Name]_ | _[email / Slack]_ |

---

_Last updated: [YYYY-MM-DD]_
