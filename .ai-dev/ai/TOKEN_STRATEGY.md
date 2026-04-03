# 💡 AI Token Strategy

> **Guidelines for prompting AI efficiently — maximize output quality while minimizing token usage.**

---

## Core Principle

> **"Chunk small, context-load smart."**  
> Feed AI only what it needs for the current task — not the entire codebase.

---

## 📦 Feature-Chunked PRD Strategy

Each feature lives in its own PRD file: `docs/PRD/features/FEAT_XXX_name.md`

When working on a feature, the AI session context should contain:
1. `ai/PROJECT_CONTEXT.md` (condensed — ~500 tokens)
2. The relevant `FEAT_XXX.md` PRD (~300-600 tokens)
3. The relevant spec sections (only the parts needed)
4. The specific file(s) being edited

**Do NOT paste the entire codebase into context.**

---

## 🪄 Prompting Patterns

### Pattern 1: Starting a New Feature
```
Context: [Paste PROJECT_CONTEXT.md]
Feature PRD: [Paste FEAT_XXX.md]
Task: Implement the [specific function/component] for this feature.
Reference the API_SPEC.md for the endpoint contract.
Output: Only the file [filename] — use '// ... existing code' for unchanged parts.
```

### Pattern 2: Debugging
```
Stack trace: [paste error]
Relevant file: [paste only the relevant function/section]
Expected behavior: [describe]
Actual behavior: [describe]
```

### Pattern 3: Code Review
```
Review this file for: security issues, performance issues, and standards compliance.
File: [paste file]
Standards reference: [paste relevant section of CODING_STANDARDS.md]
```

### Pattern 4: Database / API Design
```
Context: [paste DATABASE_SPEC.md or API_SPEC.md summary]
Task: Design the schema/endpoint for [feature].
Constraints: [list from SECURITY.md or business rules]
Output: SQL migration OR OpenAPI YAML — not both.
```

### Pattern 5: Resuming Work
```
[Paste the "Resume Prompt" from PROGRESS.md]
Continue from where we left off. First file to work on: [filename]
```

---

## 📏 Context Size Guidelines

| Session Type | Recommended Context |
|-------------|-------------------|
| New feature build | PROJECT_CONTEXT + Feature PRD + 1-2 spec sections |
| Bug fix | Error + 1 file section + brief project context |
| UI component | UI_GUIDELINES + Component spec + page HTML reference |
| Database work | DATABASE_SPEC + feature requirements only |
| Security review | SECURITY.md + file being reviewed |
| Full session resume | PROGRESS.md resume prompt + PROJECT_CONTEXT |

---

## ✂️ What to Strip Before Pasting

When pasting files into AI context, strip:
- File headers and license comments (not needed by AI)
- Large commented-out blocks of old code
- Test data / mock data files
- Log outputs beyond the relevant error

---

## 🔁 Iterative Development Pattern

```
1. Feed: PROJECT_CONTEXT + Feature PRD
2. Ask: AI to plan the implementation (summary only)
3. Confirm: Plan looks correct
4. Ask: Implement file 1
5. Review: Paste back if correction needed
6. Ask: Implement file 2
... repeat
7. After feature done: Ask AI to update CHANGELOG and test cases
```

---

## 🚫 Don'ts

- Don't paste your entire `src/` directory into context
- Don't re-explain the full project each time — use `PROJECT_CONTEXT.md`
- Don't ask for multiple large features in one prompt
- Don't paste raw database dumps — use the schema definition instead
- Don't ask AI to "just make it work" — be specific about the expected output format
