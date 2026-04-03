# 📋 Feature PRD — [FEAT-009: Kanban Board View]

---

## Metadata

| Field | Value |
|-------|-------|
| **Feature ID** | FEAT-009 |
| **Feature Name** | Kanban Board View |
| **Priority** | P2 |
| **Phase** | Phase 2 |
| **Author** | Dev Team |
| **Created** | 2026-04-01 |
| **Last Updated** | 2026-04-01 |
| **Status** | Approved |

---

## Overview

### Problem Statement
> A list view is efficient for data-heavy management, but teams that use visual workflows (e.g., developers using Scrum) need a Kanban board to see task flow across statuses at a glance. Without a board view, the system feels incomplete compared to alternatives like Trello or Jira.

### Proposed Solution
> Build a **Kanban Board View** as an alternative view toggle for the project task list. Tasks are displayed as cards in columns corresponding to statuses: Todo | In Progress | In Review | Blocked | Done. Tasks can be moved between columns via drag-and-drop, updating their status in real time.

### Success Criteria
- [ ] Users can toggle between "List View" and "Board View" per project
- [ ] Board shows 5 columns: Todo, In Progress, In Review, Blocked, Done
- [ ] Dragging a card from one column to another updates the task status via API
- [ ] Board loads within 1.5 seconds for a project with 100 tasks
- [ ] All filters from FEAT-007 apply in board view as well

---

## In Scope / Out of Scope

| In Scope | Out of Scope |
|----------|-------------|
| 5-column kanban (one per status) | Custom column creation / ordering |
| Drag-and-drop to change status | Drag-and-drop to reorder within a column |
| Task card: title, assignee avatar, priority, labels, due date | Swimlane grouping (by assignee/label) |
| View toggle (list ↔ board) persisted per user per project | Real-time board updates (websockets) |
| Filters from FEAT-007 applied to board | Story point / estimation features |

---

## User Stories

### Story 1 — Switch to Board View
**As a** Member,  
**I want to** switch from list view to board view for a project,  
**So that** I can see the status distribution of tasks visually.

**Acceptance Criteria:**
- [ ] Given I am on a project page in list view, when I click the "Board" view toggle, then tasks are displayed in kanban columns
- [ ] Given I switch to board view, when I navigate away and return, then the board view preference is remembered
- [ ] Given a column has no tasks, when I view the board, then the empty column is still shown with an "Add task" prompt

---

### Story 2 — Drag Task to New Status
**As a** Member,  
**I want to** drag a task card to a different column,  
**So that** I can update its status through a visual, intuitive action.

**Acceptance Criteria:**
- [ ] Given I drag a task card from "Todo" to "In Progress", when I drop it, then the task's status is updated and the card moves to the correct column
- [ ] Given the API call fails, when the drag fails, then the card returns to its original column and I see an error toast
- [ ] Given I am a Viewer (read-only role), when I try to drag a card, then the drag is disabled and I see a tooltip "You have view-only access"

---

## Functional Requirements

| ID | Requirement | Priority | Notes |
|----|-------------|----------|-------|
| FR-1 | Board view available as a toggle alongside list view | Must | |
| FR-2 | 5 columns corresponding to task statuses | Must | |
| FR-3 | Drag-and-drop card between columns updates task status via PATCH /api/tasks/:id | Must | |
| FR-4 | Card shows: title, assignee avatar, priority icon, labels, due date | Should | |
| FR-5 | Columns show task count in header | Should | |
| FR-6 | View preference (list/board) stored in browser localStorage (per project) | Should | |
| FR-7 | Filters from FEAT-007 apply in board view | Should | |
| FR-8 | Viewer role cannot drag cards | Must | |

---

## Non-Functional Requirements

| Category | Requirement |
|----------|------------|
| **Performance** | Board renders in < 1.5s for 100 tasks across 5 columns |
| **Accessibility** | Drag-and-drop must have keyboard alternative (status dropdown on card) |
| **Library** | Use `@dnd-kit/core` or `react-beautiful-dnd` — evaluate before implementation |
| **Mobile** | Drag-and-drop on mobile is acceptable to be limited; status can be changed via tap |

---

## API Requirements

> No new API endpoints required. Uses `PATCH /api/tasks/:id` with `{ status }` body.

---

## Data Requirements

> No new tables required. Status change recorded in `activity_logs`.

---

## Dependencies

| Dependency | Type | Notes |
|-----------|------|-------|
| FEAT-003 (Tasks) | Feature prerequisite | Tasks are the cards on the board |
| FEAT-007 (Labels) | Feature prerequisite | Labels shown on board cards |
| @dnd-kit/core | npm library | Drag-and-drop implementation |

---

## Implementation Notes

- Use `@dnd-kit/core` (recommended over react-beautiful-dnd which is no longer maintained)
- Optimistic UI: update card column immediately on drag, revert on API error
- Board data is loaded from the same task list API (`GET /api/projects/:id/tasks?limit=200`)
- Keep task card component shared between list view and board view with variant prop

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
