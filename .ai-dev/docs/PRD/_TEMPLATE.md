# 📋 Feature PRD — [FEAT-XXX: Feature Name]

> **Copy this template to `docs/PRD/features/FEAT_XXX_name.md` for each new feature.**  
> Keep each feature PRD focused — one PRD per feature for AI token efficiency.

---

## Metadata

| Field | Value |
|-------|-------|
| **Feature ID** | FEAT-XXX |
| **Feature Name** | _[Name]_ |
| **Priority** | P0 / P1 / P2 |
| **Phase** | Phase X |
| **Author** | _[Your Name]_ |
| **Created** | YYYY-MM-DD |
| **Last Updated** | YYYY-MM-DD |
| **Status** | Draft / Review / Approved / In Dev / Done |

---

## Overview

### Problem Statement
> _What problem does this feature solve? Why does it need to exist?_

### Proposed Solution
> _High-level description of what we are building._

### Success Criteria
> _How do we know this feature is done and working? (These become acceptance tests)_
- [ ] _Criterion 1_
- [ ] _Criterion 2_
- [ ] _Criterion 3_

---

## In Scope / Out of Scope

| In Scope | Out of Scope |
|----------|-------------|
| _What this PRD covers_ | _Explicitly what it does NOT cover_ |

---

## User Stories

> Format: **As a [persona], I want to [action] so that [benefit].**

### Story 1 — [Short Name]
**As a** _[persona]_,  
**I want to** _[action]_,  
**So that** _[benefit]_.

**Acceptance Criteria:**
- [ ] _Given [context], when [action], then [expected result]_
- [ ] _Given [context], when [action], then [expected result]_

---

### Story 2 — [Short Name]
**As a** _[persona]_,  
**I want to** _[action]_,  
**So that** _[benefit]_.

**Acceptance Criteria:**
- [ ] _Given [context], when [action], then [expected result]_

---

## Functional Requirements

| ID | Requirement | Priority | Notes |
|----|-------------|----------|-------|
| FR-1 | _Functional requirement statement_ | Must / Should / Could | |
| FR-2 | | | |

---

## Non-Functional Requirements

| Category | Requirement |
|----------|------------|
| **Performance** | _e.g., Page load < 2s on 4G_ |
| **Security** | _e.g., Input must be validated server-side_ |
| **Accessibility** | _e.g., WCAG 2.1 AA compliant_ |
| **Scalability** | _e.g., Must handle 1000 concurrent users_ |
| **Browser Support** | _e.g., Chrome 90+, Firefox 90+, Safari 15+_ |

---

## UI / UX Requirements

### Reference Pages
> List HTML page templates from `ui/pages/` that are relevant to this feature.

- `ui/pages/[page-name].html` — _[What is shown on this page]_

### User Flow
```
[User lands on page] → [Action 1] → [Action 2] → [Final State]
```

### UI Components Needed
- _Component 1 (new or existing)_
- _Component 2_

### Design Notes
- _e.g., Follow existing form patterns from `ui/UI_GUIDELINES.md`_
- _e.g., Mobile-first layout required_

---

## API Requirements

> Reference `docs/SPECS/API_SPEC.md` for full endpoint documentation.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/...` | _What it does_ |
| GET | `/api/...` | _What it returns_ |

---

## Data Requirements

> Reference `docs/SPECS/DATABASE_SPEC.md` for full schema documentation.

**Tables affected:**
- `_table_name_` — _what changes_

**New tables needed:**
- `_table_name_` — _purpose_

---

## Security Considerations

> Reference `docs/SECURITY.md` for full security requirements.

- [ ] Input validation required for: _[fields]_
- [ ] Authorization check: _[who can access this]_
- [ ] Data sensitivity: _[what sensitive data is involved]_
- [ ] _Any other security-specific notes_

---

## Dependencies

| Dependency | Type | Notes |
|-----------|------|-------|
| _e.g., FEAT-001 (Auth)_ | Feature prerequisite | Must be complete first |
| _e.g., Stripe SDK_ | External library | Already installed |

---

## Open Questions

| # | Question | Owner | Resolution |
|---|---------|-------|-----------|
| 1 | _Unresolved question_ | _Name_ | Pending |

---

## Implementation Notes

> Notes for the developer (or AI) implementing this feature.

- _Any gotchas, hints, or implementation approach preferences_
- _e.g., "Use the existing `useForm` hook from `src/hooks/useForm.ts`"_

---

## Test Requirements

> Full test cases in `tests/TEST_CASES.md`. Reference feature ID: FEAT-XXX.

- [ ] Unit tests for: _[function/module]_
- [ ] Integration tests for: _[API endpoint or flow]_
- [ ] E2E tests for: _[user flow]_

---

## Checklist

- [ ] PRD reviewed and approved
- [ ] Acceptance criteria defined
- [ ] UI pages referenced / created
- [ ] API spec updated
- [ ] DB spec updated
- [ ] Security requirements reviewed
- [ ] Test cases written
- [ ] Implementation complete
- [ ] Tests passing
- [ ] CHANGELOG updated
