# 📋 Feature PRD — [FEAT-007: Labels, Priorities & Filtering]

---

## Metadata

| Field | Value |
|-------|-------|
| **Feature ID** | FEAT-007 |
| **Feature Name** | Labels, Priorities & Filtering |
| **Priority** | P1 |
| **Phase** | Phase 2 |
| **Author** | Dev Team |
| **Created** | 2026-04-01 |
| **Last Updated** | 2026-04-01 |
| **Status** | Approved |

---

## Overview

### Problem Statement
> As projects grow, a flat list of tasks becomes hard to navigate. Teams need a way to categorize, tag, and filter tasks beyond just status and assignee. Labels let teams create custom categories (e.g., "Bug", "Feature", "Design", "Urgent") that provide instant visual context. Without filtering, finding the right task in a 100-item list is tedious.

### Proposed Solution
> Build an Admin-manageable **Labels** system per project (custom colored tags). Tasks can have multiple labels. Introduce a comprehensive **Filter & Sort** system on task lists supporting: status, priority, label, assignee, due date range, and sort direction.

### Success Criteria
- [ ] Admin can create, edit, and delete labels per project
- [ ] Members can add/remove labels on tasks
- [ ] Task list can be filtered by 1+ labels simultaneously
- [ ] Task list supports combined filters (e.g., status=In Progress AND label=Bug)
- [ ] Sort options: due date, priority, created date, alphabetical
- [ ] Filters persist within the session (not page-refresh)

---

## In Scope / Out of Scope

| In Scope | Out of Scope |
|----------|-------------|
| Custom label creation per project | Global workspace labels |
| Multi-label tagging on tasks | Label hierarchy / sub-labels |
| Multi-criteria filtering | Saved filter views / bookmarks |
| Sort options (5 options) | Full-text search across task content |
| Filter state persists in URL params | Smart filters / AI suggestions |

---

## User Stories

### Story 1 — Create Label
**As an** Admin,  
**I want to** create custom labels for a project,  
**So that** my team can categorize tasks in ways meaningful to our workflow.

**Acceptance Criteria:**
- [ ] Given I go to Project Settings > Labels, when I create a label with name "Bug" and color "#EF4444", then the label appears in the labels list
- [ ] Given a label name that already exists for this project, when I try to create it, then I see "A label with this name already exists"
- [ ] Given there are labels, when I edit a label's color, then the update reflects immediately on all tasks using that label

---

### Story 2 — Tag Task with Labels
**As a** Member,  
**I want to** add one or more labels to a task,  
**So that** the task is categorized and discoverable through filtering.

**Acceptance Criteria:**
- [ ] Given I open a task detail, when I click the "Labels" field, then I see a dropdown of all project labels
- [ ] Given I select 2 labels, when I view the task in the list, then both label badges appear on the task row
- [ ] Given I remove a label, when I save, then the label badge disappears from the task

---

### Story 3 — Filter Task List
**As a** Member,  
**I want to** filter the task list by one or more criteria,  
**So that** I can focus on the specific subset of tasks relevant to my current context.

**Acceptance Criteria:**
- [ ] Given I select "Status: In Progress" and "Label: Bug", when the filter is applied, then only tasks matching BOTH criteria are shown
- [ ] Given I clear all filters, when the filter is reset, then all project tasks are shown again
- [ ] Given I apply filters including a due date range, when the list updates, then only tasks with due dates in that range appear

---

### Story 4 — Sort Task List
**As a** Member,  
**I want to** sort the task list,  
**So that** I can see the most urgent or most recent tasks at the top.

**Acceptance Criteria:**
- [ ] Given I select "Sort by: Due Date (soonest first)", when sorted, then tasks with nearest due dates appear first; tasks without due dates appear last
- [ ] Given I select "Sort by: Priority (highest first)", when sorted, then Critical > High > Medium > Low tasks are ordered
- [ ] Sort selection persists until the user changes it or navigates away

---

## Functional Requirements

| ID | Requirement | Priority | Notes |
|----|-------------|----------|-------|
| FR-1 | Admin can create / edit / delete labels per project | Must | |
| FR-2 | Label: name (required, max 50 chars), color (hex, required) | Must | |
| FR-3 | Tasks can have 0 to N labels (many-to-many) | Must | |
| FR-4 | Filter options: status, priority, label(s), assignee, due date range | Must | |
| FR-5 | Multiple values per filter combine as OR within same field (e.g., status IN [todo, in_progress]) | Must | |
| FR-6 | Filters across fields combine as AND (status filter AND label filter) | Must | |
| FR-7 | Sort options: created_at DESC (default), due_date ASC, priority DESC, title ASC | Should | |
| FR-8 | Filter + sort state encoded in URL query params | Should | Enables shareable links |
| FR-9 | Filter bar shows active filter count badge | Should | |

---

## Non-Functional Requirements

| Category | Requirement |
|----------|------------|
| **Performance** | Filtered query returns in < 400ms for 500 tasks |
| **Security** | Label management restricted to project admins |
| **Accessibility** | Filter dropdowns fully keyboard accessible; labels have text + color |
| **Scalability** | `task_labels` join table indexed on both task_id and label_id |
| **Browser Support** | Chrome 90+, Firefox 90+, Safari 15+, Edge 90+ |

---

## API Requirements

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects/:id/labels` | Get all labels for a project |
| POST | `/api/projects/:id/labels` | Create label |
| PATCH | `/api/labels/:id` | Update label |
| DELETE | `/api/labels/:id` | Delete label (removes from all tasks) |
| POST | `/api/tasks/:id/labels` | Add label to task |
| DELETE | `/api/tasks/:id/labels/:labelId` | Remove label from task |
| GET | `/api/projects/:id/tasks` | Extended with filter + sort query params |

---

## Data Requirements

**New tables needed:**
- `labels` — `id`, `project_id` (FK), `name` (VARCHAR 50), `color` (VARCHAR 7), `created_at`, `updated_at`
- `task_labels` — `task_id` (FK), `label_id` (FK), PRIMARY KEY(`task_id`, `label_id`)

---

## Dependencies

| Dependency | Type | Notes |
|-----------|------|-------|
| FEAT-002 (Projects) | Feature prerequisite | Labels belong to projects |
| FEAT-003 (Tasks) | Feature prerequisite | Labels are applied to tasks |

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
