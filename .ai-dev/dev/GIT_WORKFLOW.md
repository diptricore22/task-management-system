# 🔀 Git Workflow

> **Branch strategy, commit conventions, and PR process for this project.**

---

## Branch Strategy

We follow a simplified **GitFlow** strategy:

```
main          ← Production-ready code only. Protected.
  └── develop ← Integration branch (optional for larger teams)
        ├── feat/feature-name
        ├── fix/bug-name
        ├── chore/task-name
        └── hotfix/critical-issue
```

### Branch Rules

| Branch | Purpose | Who creates | Merges to |
|--------|---------|------------|-----------|
| `main` | Production code | Never directly | — |
| `develop` | Integration (large projects) | Never directly | `main` via release PR |
| `feat/*` | New features | Developer | `develop` or `main` |
| `fix/*` | Bug fixes | Developer | `develop` or `main` |
| `hotfix/*` | Critical production fixes | Developer | `main` directly |
| `chore/*` | Dependencies, config, CI | Developer | `develop` or `main` |
| `docs/*` | Documentation only | Developer | `develop` or `main` |

### Branch Naming

```
feat/FEAT-001-user-authentication
fix/FEAT-003-qr-code-not-generating
hotfix/payment-double-charge
chore/update-prisma-to-5.8
docs/update-api-spec
```

---

## Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short summary in present tense, imperative>

[optional body — explain WHY not what]

[optional footer — issue refs, breaking changes]
```

### Types

| Type | When to Use |
|------|------------|
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation changes only |
| `style` | Formatting, missing semicolons (no code change) |
| `refactor` | Code restructuring — not a bug fix or feature |
| `test` | Adding or updating tests |
| `chore` | Build process, dependencies, CI/CD |
| `hotfix` | Critical production fix |
| `perf` | Performance improvements |

### Good Commit Examples

```bash
feat(auth): add refresh token rotation on login
fix(users): prevent duplicate email registration
docs(prd): add FEAT-005 acceptance criteria
refactor(orders): extract pricing logic to PricingService
test(auth): add unit tests for token expiry
chore(deps): upgrade Next.js to 14.2.0
hotfix(payments): prevent double-charge on network retry
```

### Bad Commit Examples

```bash
fix bug              ← too vague
WIP                  ← don't commit WIP to shared branches
update               ← not descriptive
FEAT-001             ← no context
asdfgh               ← obvious
```

---

## Pull Request Process

### Before Opening a PR

- [ ] Code works locally — run the app and test manually
- [ ] All tests pass: `npm test`
- [ ] No linting errors: `npm run lint`
- [ ] No TypeScript errors: `npm run type-check`
- [ ] No secrets or `.env` files included
- [ ] CHANGELOG updated
- [ ] PROGRESS.md updated

### PR Description Template

```markdown
## Summary
[What does this PR do? Link to feature PRD if applicable]
Related: FEAT-XXX

## Changes Made
- 
- 

## How to Test
1. 
2. 

## Screenshots (UI changes only)
[before/after screenshots]

## Checklist
- [ ] Tests added/updated
- [ ] No console.log left in
- [ ] Security considerations reviewed
- [ ] CHANGELOG updated
```

### Merge Rules

- Squash merge for features (clean history on `main`)
- Rebase merge for hotfixes (preserve commit)
- Delete branch after merge
- At least 1 approval required (on team projects)

---

## Tagging & Releases

```bash
# Tag a release
git tag -a v1.0.0 -m "Release v1.0.0 — initial launch"
git push origin v1.0.0
```

Align tags with CHANGELOG version entries.

---

## .gitignore Essentials

Ensure your `.gitignore` contains at minimum:

```
# Environment
.env
.env.local
.env.production
.env.staging

# Dependencies
node_modules/
.pnp
.pnp.js

# Build outputs
.next/
dist/
build/
out/

# Logs
*.log
npm-debug.log*

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/settings.json
.idea/

# Testing
coverage/
```
