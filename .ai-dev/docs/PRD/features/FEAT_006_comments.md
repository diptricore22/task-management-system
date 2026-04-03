# 📋 Feature PRD — [FEAT-006: Comments & Task Activity Log]

---

## Metadata

| Field | Value |
|-------|-------|
| **Feature ID** | FEAT-006 |
| **Feature Name** | Comments & Task Activity Log |
| **Priority** | P1 |
| **Phase** | Phase 1 |
| **Author** | Dev Team |
| **Created** | 2026-04-01 |
| **Last Updated** | 2026-04-01 |
| **Status** | Approved |

---

## Overview

### Problem Statement
> Tasks without context cause confusion. Teams often need to discuss decisions, ask questions, or leave notes directly on a task — not buried in a chat tool. Without comments, task collaboration happens outside the system, making it hard to track why decisions were made or what was discussed.

### Proposed Solution
> Add a **Comments** section to the task detail view. Members can post, edit (within 15 minutes), and delete their own comments. Admins can delete any comment. A **Task Activity Log** (non-editable, system-generated) appears below comments, tracking status changes, assignment changes, and other mutations on the task.

### Success Criteria
- [ ] Member can post a comment on any task in their project
- [ ] Comment author can edit within 15 minutes of posting
- [ ] Comment author or Admin can delete a comment
- [ ] Task activity log shows all changes (status, assignee, priority, due date) in chronological order
- [ ] Activity log and comments load within 500ms

---

## In Scope / Out of Scope

| In Scope | Out of Scope |
|----------|-------------|
| Post, edit (15 min window), delete comments | Threaded replies / reactions |
| Task activity log (system-generated) | Mentions (@user) — Phase 2 |
| Admin can delete any comment | Rich text / markdown support — Phase 2 |
| Comment author → soft-delete | Real-time comment updates via websockets — Phase 2 |
| Pagination for comments/activity | File attachment to comments — Phase 2 |

---

## User Stories

### Story 1 — Post Comment
**As a** Member,  
**I want to** post a comment on a task,  
**So that** I can communicate context, questions, or decisions directly on the work item.

**Acceptance Criteria:**
- [ ] Given I am on a task detail, when I type a comment and click "Send", then my comment appears at the bottom of the comment list with my name, avatar, and timestamp
- [ ] Given an empty comment body, when I try to submit, then the submit button is disabled
- [ ] Given a comment > 5000 characters, when I try to submit, then I see "Comment is too long (max 5000 characters)"

---

### Story 2 — Edit Comment
**As a** comment author,  
**I want to** edit my comment within 15 minutes of posting,  
**So that** I can correct typos or add missing information.

**Acceptance Criteria:**
- [ ] Given my comment was posted less than 15 minutes ago, when I click "Edit", then the comment text becomes an editable field
- [ ] Given my comment was posted more than 15 minutes ago, when I view it, then there is no "Edit" option
- [ ] Given I save an edit, when the edit succeeds, then the comment shows "(edited)" label and the updated text

---

### Story 3 — Delete Comment
**As a** comment author or Admin,  
**I want to** delete a comment,  
**So that** outdated or incorrect information is removed from the task.

**Acceptance Criteria:**
- [ ] Given I am the comment author, when I click "Delete" and confirm, then the comment is removed from view
- [ ] Given I am an Admin, when I click "Delete" on any comment and confirm, then it is removed regardless of author
- [ ] Given I am a Member trying to delete another user's comment, when I attempt, then I receive a `403` error

---

### Story 4 — View Task Activity Log
**As a** Member,  
**I want to** see a log of all changes made to a task,  
**So that** I understand the full history of the task without relying on memory.

**Acceptance Criteria:**
- [ ] Given a task has had status changes, assignee changes, and priority updates, when I view the task detail, then each change appears as an activity entry: "Alice changed status from Todo to In Progress · 3 hours ago"
- [ ] Given the activity log has > 20 entries, when I scroll, then more entries load
- [ ] Activity log entries are NOT editable or deletable (system-generated only)

---

## Functional Requirements

| ID | Requirement | Priority | Notes |
|----|-------------|----------|-------|
| FR-1 | Members and Admins can post comments on tasks within their projects | Must | |
| FR-2 | Comment body: required, max 5000 characters | Must | |
| FR-3 | Comment authors can edit their own comment within 15 minutes of creation | Should | |
| FR-4 | Comment authors can delete their own comment at any time | Must | |
| FR-5 | Admins can delete any comment on any task in their scope | Must | |
| FR-6 | Viewers (read-only role) can view but not post comments | Should | |
| FR-7 | Task activity log records: status changes, priority changes, assignee changes, due date changes | Must | Written by service layer automatically |
| FR-8 | Activity log entries are immutable (no edit/delete) | Must | |
| FR-9 | Comment and activity log are combined in a chronological feed on task detail | Should | |
| FR-10 | Comments are soft-deleted (show "Comment deleted" placeholder? — TBD) | Should | |

---

## Non-Functional Requirements

| Category | Requirement |
|----------|------------|
| **Performance** | Comments + activity load in < 500ms for tasks with 100 comments |
| **Security** | Only project members can view/post comments; only author/admin can delete |
| **Accessibility** | Comment input properly labeled; keyboard submittable (Ctrl+Enter) |
| **Scalability** | Index `task_id` on comments table |
| **Browser Support** | Chrome 90+, Firefox 90+, Safari 15+, Edge 90+ |

---

## UI / UX Requirements

### Reference Pages
- `apps/web/src/app/projects/[id]/tasks/[taskId]/page.tsx` — Task detail page (comments section at bottom)

### User Flow
```
[Task detail page — bottom section]
→ [Activity + Comments feed, chronological]
→ [Comment input box at bottom]
→ Type comment → [Click Send or Ctrl+Enter] → [POST /api/tasks/:id/comments]
→ Comment appears at bottom of feed

[My comment, < 15 min old] → [Hover → Edit button]
→ [Inline edit textarea] → [Save] → [PATCH /api/comments/:id]
→ [Comment updated, "(edited)" shown]

[My comment / Any comment (Admin)] → [Hover → Delete button]
→ [Confirm modal] → [DELETE /api/comments/:id]
→ [Comment removed from feed]
```

### UI Components Needed
- `CommentInput` — textarea + character count + submit button (disabled when empty)
- `CommentItem` — avatar, author name, timestamp, body text, edit/delete actions (conditional)
- `ActivityLogItem` — icon, human-readable action, relative timestamp (system-style, no actions)
- `TaskActivityFeed` — merged chronological list of `CommentItem` and `ActivityLogItem`

### Design Notes
- System activity log items should be visually distinct from user comments (lighter, smaller, different icon)
- "Edited" label displayed inline next to timestamp: "2 hours ago (edited)"
- Comment submit via keyboard: Ctrl+Enter (Windows/Linux), Cmd+Enter (Mac)
- Character count shown below input when > 4000 chars used (approaching limit)

---

## API Requirements

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks/:id/comments` | Get comments + activity for a task |
| POST | `/api/tasks/:id/comments` | Post a new comment |
| PATCH | `/api/comments/:id` | Edit own comment (15-min window enforced server-side) |
| DELETE | `/api/comments/:id` | Soft-delete comment (author or admin) |

---

## Data Requirements

**New tables needed:**
- `comments`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | |
| `task_id` | UUID | FK → tasks.id, NOT NULL | |
| `author_id` | UUID | FK → users.id, NOT NULL | |
| `body` | TEXT | NOT NULL | Max 5000 chars enforced at app layer |
| `edited_at` | TIMESTAMPTZ | NULL | Set on edit |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT NOW() | |
| `updated_at` | TIMESTAMPTZ | NOT NULL DEFAULT NOW() | |
| `deleted_at` | TIMESTAMPTZ | NULL | Soft delete |

**Indexes:**
- `idx_comments_task_id` on `task_id`
- `idx_comments_author_id` on `author_id`

**Existing tables modified:**
- `activity_logs` (from FEAT-005) — task-level changes are logged here; `task_id` foreign key used

---

## Security Considerations

- [ ] Input validation required for: `body` (required, max 5000 chars, string)
- [ ] Authorization check: commenter must be a member of the task's project
- [ ] Authorization check for delete: `author_id === currentUser.id` OR `currentUser.role === 'admin'`
- [ ] 15-minute edit window enforced server-side: compare `created_at` to `NOW()` on `PATCH`
- [ ] Soft-delete: `deleted_at` is set; consider whether to show "Comment deleted" in feed

---

## Dependencies

| Dependency | Type | Notes |
|-----------|------|-------|
| FEAT-001 (Auth) | Feature prerequisite | Auth required to post comments |
| FEAT-003 (Tasks) | Feature prerequisite | Comments belong to tasks |
| FEAT-005 (Dashboard) | Feature prerequisite | activity_logs table created in FEAT-005 |

---

## Open Questions

| # | Question | Owner | Resolution |
|---|---------|-------|------------|
| 1 | Should soft-deleted comments show a "Comment deleted" placeholder? | Product | Pending |
| 2 | Should Viewers (read-only role) be able to comment? | Product | Pending — current spec: no |
| 3 | Is 15 minutes the right edit window, or should it be configurable? | Product | Pending |

---

## Implementation Notes

- Activity log entries: write from `tasks.service.ts` on every mutation (compare before/after values)
- 15-min edit window: `const canEdit = new Date() - new Date(comment.createdAt) < 15 * 60 * 1000`
- GET comments endpoint: join `activity_logs` (type = task-mutation) and `comments` for the task, sort by `created_at ASC`, return as unified array with `type: 'comment' | 'activity'`
- For the feed, frontend merges and sorts the two arrays by date client-side (or backend merges them in the response)

---

## Test Requirements

- [ ] Unit tests for: `comments.service.ts` — create, edit (15-min window boundary), delete (author vs admin)
- [ ] Unit tests for: activity log write on task field changes
- [ ] Integration tests for: `POST /api/tasks/:id/comments`, `PATCH /api/comments/:id` (edit window), `DELETE /api/comments/:id` (auth check)
- [ ] E2E tests for: post comment, edit comment, view activity log after status change

---

## Checklist

- [x] PRD reviewed and approved
- [x] Acceptance criteria defined
- [ ] UI pages referenced / created
- [ ] API spec updated
- [ ] DB spec updated
- [x] Security requirements reviewed
- [ ] Test cases written
- [ ] Implementation complete
- [ ] Tests passing
- [ ] CHANGELOG updated
