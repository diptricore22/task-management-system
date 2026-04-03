# Prisma Schema Model Reference

**Specification:** `.ai-dev/docs/SPECS/DATABASE_SPEC.md`
**Generated:** 2026-04-03

---

## Model-to-Business-Purpose Mapping

### Authentication & User Management

| Model | Purpose | Key Relationships |
|-------|---------|-------------------|
| **User** | Core user accounts with global roles (ADMIN, MEMBER, VIEWER) and authentication credentials. Stores user identity and system-wide permissions. | 1:N → RefreshToken, Project (creator), ProjectMember, Task (assignee/creator), Comment, Notification, ActivityLog, NotificationPreference |
| **RefreshToken** | Store hashed JWT refresh tokens for session management. Enables long-lived sessions with secure token rotation. Supports 7-day expiration windows. | N:1 → User |
| **InviteToken** | Admin-generated invitation tokens for onboarding new users. Includes email, role assignment, and 72-hour expiration. Tracks acceptance workflow. | None (email-based, not user-bound until acceptance) |

### Project Management

| Model | Purpose | Key Relationships |
|-------|---------|-------------------|
| **Project** | Project containers that group related work and team collaboration. Each project has a creator, members, tasks, and labels. Supports archival via status enum. | 1:N → ProjectMember, Task, Label, ActivityLog / N:1 → User (creator) |
| **ProjectMember** | Join table defining user membership and roles within specific projects (ADMIN, MEMBER, VIEWER). Enforces project-level access control. Unique on (project_id, user_id). | N:1 → Project, User |

### Task Management

| Model | Purpose | Key Relationships |
|-------|---------|-------------------|
| **Task** | Individual work items within a project. Includes status (TODO, IN_PROGRESS, IN_REVIEW, BLOCKED, DONE), priority (LOW, MEDIUM, HIGH, CRITICAL), optional due dates, and assignee tracking. Belongs to exactly one project. | N:1 → Project, User (assignee, creator) / 1:N → Comment, TaskLabel, ActivityLog |
| **Comment** | User comments on tasks for collaboration and discussion. Tracks author, edit history via `edited_at`, and supports soft-delete. Max 5000 chars enforced at app layer. | N:1 → Task, User (author) |

### Labels & Categorization

| Model | Purpose | Key Relationships |
|-------|---------|-------------------|
| **Label** | Custom project-specific labels for task categorization and filtering. Unique on (project_id, name). Used for grouping and searching related tasks. | N:1 → Project / 1:N → TaskLabel |
| **TaskLabel** | Many-to-many junction table between tasks and labels. Supports multiple labels per task. Composite primary key on (task_id, label_id) with cascading deletes. | N:1 → Task, Label |

### Activity & Notifications

| Model | Purpose | Key Relationships |
|-------|---------|-------------------|
| **ActivityLog** | Immutable audit trail of all significant system events (task creation, status changes, member additions, etc.). Tracks actor, action, and optional payload. Optional project_id and task_id for scoping. Created timestamp enables chronological querying in descending order. | N:1 → Project (optional), Task (optional), User (actor) |
| **Notification** | In-app notifications for user actions and events (e.g., task_assigned, task_commented). Stores type and payload (JSON) for rich notification content. Track read status via `read_at`. | N:1 → User, Task (optional) |
| **NotificationPreference** | User preferences for email notification delivery (1:1 with User). Controls which notification types trigger emails (due_tomorrow, overdue, assigned, commented). | 1:1 → User |

---

## Business Rule Enforcement

| Rule | Enforcement Mechanism |
|------|----------------------|
| Tasks belong to exactly one project | FK constraint: Task.project_id required, non-nullable |
| Task assignee must be a user | FK constraint: Task.assignee_id optional (can be unassigned), references User.id |
| Project members must have a role | TaskStatus & ProjectRole enums with ADMIN/MEMBER/VIEWER |
| (project_id, user_id) uniqueness | Unique constraint on ProjectMember table |
| (task_id, label_id) uniqueness | Composite primary key on TaskLabel |
| (project_id, name) uniqueness | Unique constraint on Label table |
| Soft-delete pattern | `deleted_at` nullable timestamp on all entities (except NotificationPreference) |
| All timestamps standardized | `created_at` (now()), `updated_at` (@updatedAt), `deleted_at` (nullable) on soft-deletable models |

---

## Relational Integrity (ON DELETE Behavior)

| Relation | ON DELETE | Reason |
|----------|-----------|--------|
| User → RefreshToken | CASCADE | Token invalidation when user deleted |
| User → ProjectMember | CASCADE | Auto-remove from projects when user deleted |
| User → Task (assignee) | SET NULL | Task remains, assignee cleared |
| User → Comment | RESTRICT | Prevent deletion if user has comments (admin responsibility) |
| Project → ProjectMember | CASCADE | Remove memberships when project deleted |
| Project → Task | CASCADE | Delete tasks when project deleted |
| Project → Label | CASCADE | Delete labels when project deleted |
| Task → Comment | CASCADE | Delete comments when task deleted |
| Task → TaskLabel | CASCADE | Remove label associations when task deleted |
| Label → TaskLabel | CASCADE | Remove label associations when label deleted |

---

## Performance Indexes

**Query Optimization Indexes:**

- **User:** email (unique), role, deleted_at
- **RefreshToken:** user_id, token_hash, expires_at, deleted_at
- **InviteToken:** email, token_hash, expires_at, deleted_at
- **Project:** created_by, status, deleted_at
- **ProjectMember:** project_id, user_id, deleted_at
- **Task:** project_id, assignee_id, status, priority, due_date, created_by, deleted_at
- **Comment:** task_id, author_id, deleted_at
- **Label:** project_id, deleted_at
- **TaskLabel:** task_id, label_id
- **ActivityLog:** project_id, task_id, actor_id, created_at DESC, deleted_at
- **Notification:** user_id, task_id, read_at, deleted_at

---

## Column Conventions

All soft-deletable entities follow this pattern:

```
id        UUID PRIMARY KEY    <- gen_random_uuid()
created_at TIMESTAMPTZ        <- now()
updated_at TIMESTAMPTZ        <- @updatedAt (auto-update)
deleted_at TIMESTAMPTZ NULL   <- Soft delete marker
```

**Exceptions:**
- **NotificationPreference:** No deleted_at (1:1 with User, managed via User deletion)
- **RefreshToken:** Has deleted_at for token revocation tracking
- **ActivityLog, Notification:** Full soft-delete support for audit compliance

---

## Enum Values

| Enum | Values | Purpose |
|------|--------|---------|
| **UserRole** | ADMIN, MEMBER, VIEWER | Global system roles |
| **ProjectStatus** | ACTIVE, ARCHIVED | Project lifecycle state |
| **ProjectRole** | ADMIN, MEMBER, VIEWER | Project-level access control |
| **TaskStatus** | TODO, IN_PROGRESS, IN_REVIEW, BLOCKED, DONE | Task workflow stages |
| **TaskPriority** | LOW, MEDIUM, HIGH, CRITICAL | Task urgency classification |

---

## Future Consideration: Activity Log Partitioning

The `activity_logs` table may grow very large in production. Consider implementing:
- **Time-based partitioning** by month or quarter
- **Archival strategy** for logs older than 12 months
- **Read replica** for analytics queries to avoid performance impact
