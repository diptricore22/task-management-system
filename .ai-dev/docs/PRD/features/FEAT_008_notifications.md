# 📋 Feature PRD — [FEAT-008: Due Dates, Reminders & Notifications]

---

## Metadata

| Field | Value |
|-------|-------|
| **Feature ID** | FEAT-008 |
| **Feature Name** | Due Dates, Reminders & Notifications |
| **Priority** | P1 |
| **Phase** | Phase 2 |
| **Author** | Dev Team |
| **Created** | 2026-04-01 |
| **Last Updated** | 2026-04-01 |
| **Status** | Approved |

---

## Overview

### Problem Statement
> Setting a due date on a task is meaningless if no one is reminded it's approaching. Users forget deadlines without proactive alerts. The current in-app notification foundation (FEAT-004) needs to be extended with due-date-based reminder logic and email notification delivery to create a genuinely useful alerting system.

### Proposed Solution
> Extend task due dates with a **notification system**: in-app bell notifications + email reminders for: (1) tasks due today, (2) tasks due tomorrow, (3) task assignment, (4) task comment. A server-side scheduled job runs daily to evaluate upcoming due dates and create notifications. Users can control their notification preferences per channel (in-app / email).

### Success Criteria
- [ ] Assignee receives an in-app notification when a task is assigned to them
- [ ] Assignee receives an in-app notification when a comment is posted on their task
- [ ] Assignee receives an email when their task is due tomorrow (daily job)
- [ ] Assignee receives an email when their task is overdue (daily job)
- [ ] User can disable email notifications from profile settings
- [ ] All email notifications link back to the specific task

---

## In Scope / Out of Scope

| In Scope | Out of Scope |
|----------|-------------|
| In-app bell notifications (unread count + list) | Push notifications (browser / mobile) |
| Email notifications (due tomorrow, overdue, assigned, commented) | Slack / webhook integrations (Phase 3) |
| Daily scheduled job for due-date reminders | Custom reminder schedules per task |
| Notification preferences (on/off per type) | Digest emails (weekly summary) |
| Email transactional via Resend (or Nodemailer) | In-app notification sounds |

---

## User Stories

### Story 1 — In-App Notification on Assignment
**As a** Member,  
**I want to** receive an in-app notification when a task is assigned to me,  
**So that** I am immediately aware of new work without having to check the system.

**Acceptance Criteria:**
- [ ] Given a task is assigned to me, when I next view the app, then the bell icon shows a red badge with the unread count
- [ ] Given I click the bell, when the notification list opens, then I see: "Alex assigned you 'API Integration' in Project Alpha · 5 min ago"
- [ ] Given I click the notification, when it opens, then I am taken directly to the task detail

---

### Story 2 — Email Reminder: Due Tomorrow
**As an** assignee,  
**I want to** receive an email reminder for tasks due the next day,  
**So that** I am not surprised by imminent deadlines.

**Acceptance Criteria:**
- [ ] Given I have a task due tomorrow and email notifications are enabled, when the daily job runs (8:00 AM), then I receive an email: "Reminder: 'API Integration' is due tomorrow"
- [ ] Given I have email notifications disabled, when the daily job runs, then I do NOT receive the email
- [ ] Given the email, when I click the task link, then I am taken to the task detail (with auth redirect if needed)

---

### Story 3 — Email Notification: Overdue Task
**As an** assignee,  
**I want to** receive an email when my task is overdue,  
**So that** overdue work doesn't silently slip through.

**Acceptance Criteria:**
- [ ] Given my task due date has passed and it is not `done`, when the daily job runs, then I receive an overdue email
- [ ] Given the task was already marked overdue in a previous email, when the daily job runs again, then I do NOT receive a duplicate (debounce to once per task per overdue period)

---

### Story 4 — Notification Preferences
**As a** Member,  
**I want to** control which email notifications I receive,  
**So that** I am not overwhelmed by emails.

**Acceptance Criteria:**
- [ ] Given I go to Profile > Notifications, when I toggle off "Due date reminders", then I no longer receive due-date reminder emails
- [ ] Given I toggle off all email notifications, when the daily job runs, then I receive zero emails
- [ ] In-app notifications cannot be fully disabled (only email can be)

---

## Functional Requirements

| ID | Requirement | Priority | Notes |
|----|-------------|----------|-------|
| FR-1 | In-app notifications for: task assigned, comment posted on my task | Must | Extends FEAT-004 foundation |
| FR-2 | Email notifications for: task due tomorrow, task overdue, task assigned | Should | |
| FR-3 | Daily scheduled job runs at 08:00 AM (server timezone) | Must | Use node-cron or Bull queue |
| FR-4 | Overdue email sent once per task per overdue period (debounce) | Must | Track last_notified_at |
| FR-5 | User can toggle email notifications on/off per type in profile settings | Should | |
| FR-6 | Email template includes: task name, project name, due date, direct link to task | Must | |
| FR-7 | In-app notification bell shows unread count badge | Must | |
| FR-8 | Mark all notifications as read button | Should | |

---

## Non-Functional Requirements

| Category | Requirement |
|----------|------------|
| **Performance** | Daily job completes in < 30 seconds for 10,000 tasks |
| **Security** | Email links include time-limited deep-link token (or require re-auth) |
| **Reliability** | Job failures must be logged; partial failures should not crash the job |
| **Scalability** | Job uses batch queries; never fetch all tasks into memory at once |
| **Browser Support** | Email templates render correctly in Gmail, Outlook, Apple Mail |

---

## API Requirements

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | Get paginated notification list for current user |
| PATCH | `/api/notifications/read-all` | Mark all as read |
| PATCH | `/api/notifications/:id/read` | Mark single notification as read |
| GET | `/api/users/me/notification-preferences` | Get notification settings |
| PATCH | `/api/users/me/notification-preferences` | Update notification settings |

---

## Data Requirements

**New tables needed:**
- `notification_preferences` — `user_id` (PK, FK), `email_due_tomorrow` (BOOL DEFAULT true), `email_overdue` (BOOL DEFAULT true), `email_assigned` (BOOL DEFAULT true), `email_commented` (BOOL DEFAULT false), `updated_at`

**Modified tables:**
- `notifications` (from FEAT-004) — add `task_id` (nullable FK), `type` (enum extended)

---

## Dependencies

| Dependency | Type | Notes |
|-----------|------|-------|
| FEAT-003 (Tasks) | Feature prerequisite | Due dates are on tasks |
| FEAT-004 (Assignments) | Feature prerequisite | notifications table created in FEAT-004 |
| Resend or Nodemailer | External service | Email delivery |
| node-cron | npm library | Scheduled job |

---

## Implementation Notes

- Scheduled job: query `tasks WHERE due_date = CURRENT_DATE + 1 AND status != 'done' AND assignee_id IS NOT NULL`
- Overdue debounce: add `last_due_notified_at` column to tasks table — only send if `last_due_notified_at IS NULL OR last_due_notified_at < NOW() - INTERVAL '24 hours'`
- Email sending: wrap in try/catch per user; log failures, continue batch
- Email template: simple HTML with inline styles (compatible with all mail clients)

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
