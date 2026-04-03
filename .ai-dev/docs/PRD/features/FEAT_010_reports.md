# 📋 Feature PRD — [FEAT-010: Admin Reports & Analytics]

---

## Metadata

| Field | Value |
|-------|-------|
| **Feature ID** | FEAT-010 |
| **Feature Name** | Admin Reports & Analytics |
| **Priority** | P2 |
| **Phase** | Phase 2 |
| **Author** | Dev Team |
| **Created** | 2026-04-01 |
| **Last Updated** | 2026-04-01 |
| **Status** | Approved |

---

## Overview

### Problem Statement
> Admins have no way to measure team performance, identify blockers, or track delivery trends. Without data-driven reports, project management decisions are based on gut feel. Admins need visibility into task completion rates, throughput, and member workload to make informed staffing and prioritization decisions.

### Proposed Solution
> Build an **Admin Reports** page with pre-built analytics views: task completion over time, tasks by status distribution, member workload, and overdue task trends. Reports are filterable by project and date range. All charts use server-side aggregation — no raw data exports for MVP.

### Success Criteria
- [ ] Admin can view task completion trend chart (tasks done per week over last 12 weeks)
- [ ] Admin can see workload table: each member, count of assigned open tasks, count overdue
- [ ] Admin can filter reports by project and date range
- [ ] Reports page loads in < 2 seconds
- [ ] Non-admin users cannot access the reports page

---

## In Scope / Out of Scope

| In Scope | Out of Scope |
|----------|-------------|
| Task completion trend (weekly, last 12 weeks) | CSV / Excel export |
| Status distribution chart (donut chart) | Real-time analytics |
| Member workload table | Custom report builder |
| Overdue tasks trend | Cross-workspace analytics |
| Filter by project + date range | Financial / billing reports |

---

## User Stories

### Story 1 — Completion Trend
**As an** Admin,  
**I want to** see how many tasks were completed each week,  
**So that** I can identify if the team velocity is improving or declining.

**Acceptance Criteria:**
- [ ] Given I navigate to /reports, when the page loads, then I see a bar chart: X-axis = last 12 weeks, Y-axis = tasks completed
- [ ] Given I select a specific project, when the chart updates, then it shows only that project's data
- [ ] Given there were no completions in a week, when shown on chart, then the bar shows 0 (not missing)

---

### Story 2 — Member Workload
**As an** Admin,  
**I want to** see how many open tasks each team member has,  
**So that** I can rebalance workload when someone is overloaded.

**Acceptance Criteria:**
- [ ] Given I view the workload table, when it loads, then I see each member's name, open task count, overdue count, sorted by open task count DESC
- [ ] Given a member has 0 tasks, when shown in the table, then they still appear with 0s

---

### Story 3 — Status Distribution
**As an** Admin,  
**I want to** see the breakdown of tasks by status,  
**So that** I can identify if too many tasks are blocked or stuck in review.

**Acceptance Criteria:**
- [ ] Given I view the status distribution chart, when it loads, then I see a donut chart with 5 segments, one per status
- [ ] Given I hover a segment, when tooltip appears, then it shows: status name, count, and percentage

---

## Functional Requirements

| ID | Requirement | Priority | Notes |
|----|-------------|----------|-------|
| FR-1 | Reports page accessible to admin role only | Must | |
| FR-2 | Task completion trend: weekly counts for last 12 weeks | Must | |
| FR-3 | Status distribution: count per status for selected project/date range | Must | |
| FR-4 | Member workload table: open task count + overdue count per member | Must | |
| FR-5 | Filter: project selector (all projects or specific project) | Must | |
| FR-6 | Filter: date range picker (preset: last 4 weeks, last 3 months, custom) | Should | |
| FR-7 | All charts are recharts (or Chart.js) based | Should | Prefer recharts (React-native) |

---

## Non-Functional Requirements

| Category | Requirement |
|----------|------------|
| **Performance** | Reports API responses < 1s using aggregation queries |
| **Security** | All report endpoints check `role === 'admin'` server-side |
| **Accessibility** | Charts must have data table fallback for screen readers |

---

## API Requirements

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reports/completion-trend` | Weekly task completion counts |
| GET | `/api/reports/status-distribution` | Task count per status |
| GET | `/api/reports/member-workload` | Open + overdue task count per member |

**Common query params:** `projectId` (optional), `from` (date), `to` (date)

---

## Data Requirements

> No new tables needed. All data derived from `tasks` and `users` tables via aggregation queries.

---

## Dependencies

| Dependency | Type | Notes |
|-----------|------|-------|
| FEAT-001 (Auth) | Feature prerequisite | Admin role check |
| FEAT-003 (Tasks) | Feature prerequisite | All data from tasks table |
| recharts | npm library | Chart rendering |

---

## Implementation Notes

- All aggregation done server-side in SQL — never fetch all rows and aggregate in JS
- Completion trend: `GROUP BY DATE_TRUNC('week', updated_at) WHERE status = 'done'`
- Status distribution: `GROUP BY status WHERE project_id = :projectId AND deleted_at IS NULL`
- Workload: `GROUP BY assignee_id` with COUNT for total and COUNT filtered on due_date < NOW()

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
