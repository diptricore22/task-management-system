# ✅ Acceptance Criteria

> **Defines the "done" criteria for each feature. A feature is not complete until ALL its acceptance criteria pass.**  
> These criteria are derived from the feature PRDs in `docs/PRD/features/`.

---

## How to Use This File

1. When a Feature PRD is approved, add its acceptance criteria here
2. During development, use these as your manual QA checklist
3. When writing E2E / integration tests, map them to these criteria
4. Feature is "Done" only when all ✅ boxes are checked

---

## Acceptance Criteria Format

```
### AC-[FEAT_ID]-[NUMBER] — [Short Description]
**Feature:** [FEAT-XXX]
**Given** [initial state/context]
**When** [action taken]
**Then** [expected result]
**Verified by:** [Manual / Unit Test / Integration Test / E2E]
Status: ⚫ Not Tested | 🔄 Testing | ✅ Passed | ❌ Failed
```

---

## FEAT-001 — [Feature Name]

### AC-001-01 — [Short Description]
**Feature:** FEAT-001  
**Given** _[context]_  
**When** _[action]_  
**Then** _[expected result]_  
**Verified by:** _[test type]_  
**Status:** ⚫ Not Tested

---

### AC-001-02 — [Short Description]
**Feature:** FEAT-001  
**Given** _[context]_  
**When** _[action]_  
**Then** _[expected result]_  
**Verified by:** _[test type]_  
**Status:** ⚫ Not Tested

---

## Acceptance Criteria Summary

| AC ID | Feature | Description | Verified By | Status |
|-------|---------|-------------|-------------|--------|
| AC-001-01 | FEAT-001 | _Description_ | E2E | ⚫ |

**Status Legend:** ✅ Passed | ❌ Failed | 🔄 In Progress | ⚫ Not Started

---

## Definition of Done (DoD)

A feature is **Done** when ALL of the following are true:

- [ ] All acceptance criteria for the feature are ✅ Passed
- [ ] Code is reviewed (self-review if solo)
- [ ] Unit tests written and passing
- [ ] No console.log or debug code left
- [ ] CHANGELOG updated
- [ ] PROGRESS.md session note updated
- [ ] Feature status updated in `PROJECT_STATUS.md`
- [ ] No new TypeScript errors
- [ ] All linting rules pass
- [ ] Tested on mobile viewport (for UI features)
