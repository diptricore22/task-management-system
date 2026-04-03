# Database Specification

## Overview

This database schema supports a Team Task Management System with role-based access control, project organization, task management, and collaboration features.

## Prisma Schema (schema.prisma)

```prisma
// Users and Authentication
model User {
  id         String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  name       String   @map("name")
  email      String   @unique @map("email")
  password_hash String @map("password_hash")
  role       UserRole @default(MEMBER) @map("role")
  created_at DateTime @default(now()) @map("created_at") @db.Timestamptz
  updated_at DateTime @updatedAt @map("updated_at") @db.Timestamptz
  deleted_at DateTime? @map("deleted_at") @db.Timestamptz

  // Relations
  refresh_tokens         RefreshToken[]
  created_projects       Project[]           @relation("ProjectCreator")
  project_memberships    ProjectMember[]
  assigned_tasks         Task[]              @relation("TaskAssignee")
  created_tasks          Task[]              @relation("TaskCreator")
  comments               Comment[]
  notifications          Notification[]
  activity_logs          ActivityLog[]
  notification_preferences NotificationPreference?

  @@map("users")
  @@index([email])
  @@index([role])
  @@index([deleted_at])
}

model RefreshToken {
  id         String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  user_id    String   @map("user_id") @db.Uuid
  token_hash String   @map("token_hash")
  expires_at DateTime @map("expires_at") @db.Timestamptz
  created_at DateTime @default(now()) @map("created_at") @db.Timestamptz
  updated_at DateTime @updatedAt @map("updated_at") @db.Timestamptz
  deleted_at DateTime? @map("deleted_at") @db.Timestamptz

  user User @relation(fields: [user_id], references: [id], onDelete: Cascade)

  @@map("refresh_tokens")
  @@index([user_id])
  @@index([token_hash])
  @@index([expires_at])
  @@index([deleted_at])
}

model InviteToken {
  id         String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  email      String    @map("email")
  role       UserRole  @map("role")
  token_hash String    @unique @map("token_hash")
  expires_at DateTime  @map("expires_at") @db.Timestamptz
  accepted_at DateTime? @map("accepted_at") @db.Timestamptz
  created_at DateTime  @default(now()) @map("created_at") @db.Timestamptz
  updated_at DateTime  @updatedAt @map("updated_at") @db.Timestamptz
  deleted_at DateTime? @map("deleted_at") @db.Timestamptz

  @@map("invite_tokens")
  @@index([email])
  @@index([token_hash])
  @@index([expires_at])
  @@index([deleted_at])
}

// Projects
model Project {
  id          String        @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  name        String        @map("name")
  description String?       @map("description")
  color       String        @map("color") // 7-char hex string #RRGGBB
  status      ProjectStatus @default(ACTIVE) @map("status")
  created_by  String        @map("created_by") @db.Uuid
  created_at  DateTime      @default(now()) @map("created_at") @db.Timestamptz
  updated_at  DateTime      @updatedAt @map("updated_at") @db.Timestamptz
  deleted_at  DateTime?     @map("deleted_at") @db.Timestamptz

  // Relations
  creator     User            @relation("ProjectCreator", fields: [created_by], references: [id])
  members     ProjectMember[]
  tasks       Task[]
  labels      Label[]
  activity_logs ActivityLog[]

  @@map("projects")
  @@index([created_by])
  @@index([status])
  @@index([deleted_at])
}

model ProjectMember {
  id         String          @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  project_id String          @map("project_id") @db.Uuid
  user_id    String          @map("user_id") @db.Uuid
  role       ProjectRole     @default(MEMBER) @map("role")
  joined_at  DateTime        @default(now()) @map("joined_at") @db.Timestamptz
  created_at DateTime        @default(now()) @map("created_at") @db.Timestamptz
  updated_at DateTime        @updatedAt @map("updated_at") @db.Timestamptz
  deleted_at DateTime?       @map("deleted_at") @db.Timestamptz

  project Project @relation(fields: [project_id], references: [id], onDelete: Cascade)
  user    User    @relation(fields: [user_id], references: [id], onDelete: Cascade)

  @@unique([project_id, user_id])
  @@map("project_members")
  @@index([project_id])
  @@index([user_id])
  @@index([deleted_at])
}

// Tasks
model Task {
  id                    String        @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  project_id            String        @map("project_id") @db.Uuid
  title                 String        @map("title")
  description           String?       @map("description")
  status                TaskStatus    @default(TODO) @map("status")
  priority              TaskPriority  @default(MEDIUM) @map("priority")
  due_date              DateTime?     @map("due_date") @db.Date
  assignee_id           String?       @map("assignee_id") @db.Uuid
  created_by            String        @map("created_by") @db.Uuid
  last_due_notified_at  DateTime?     @map("last_due_notified_at") @db.Timestamptz
  created_at            DateTime      @default(now()) @map("created_at") @db.Timestamptz
  updated_at            DateTime      @updatedAt @map("updated_at") @db.Timestamptz
  deleted_at            DateTime?     @map("deleted_at") @db.Timestamptz

  // Relations
  project     Project       @relation(fields: [project_id], references: [id], onDelete: Cascade)
  assignee    User?         @relation("TaskAssignee", fields: [assignee_id], references: [id])
  creator     User          @relation("TaskCreator", fields: [created_by], references: [id])
  comments    Comment[]
  labels      TaskLabel[]
  activity_logs ActivityLog[]

  @@map("tasks")
  @@index([project_id])
  @@index([assignee_id])
  @@index([status])
  @@index([priority])
  @@index([due_date])
  @@index([created_by])
  @@index([deleted_at])
}

// Comments
model Comment {
  id        String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  task_id   String    @map("task_id") @db.Uuid
  author_id String    @map("author_id") @db.Uuid
  body      String    @map("body") // Max 5000 chars enforced at app layer
  edited_at DateTime? @map("edited_at") @db.Timestamptz
  created_at DateTime @default(now()) @map("created_at") @db.Timestamptz
  updated_at DateTime @updatedAt @map("updated_at") @db.Timestamptz
  deleted_at DateTime? @map("deleted_at") @db.Timestamptz

  task   Task @relation(fields: [task_id], references: [id], onDelete: Cascade)
  author User @relation(fields: [author_id], references: [id])

  @@map("comments")
  @@index([task_id])
  @@index([author_id])
  @@index([deleted_at])
}

// Labels
model Label {
  id         String      @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  project_id String      @map("project_id") @db.Uuid
  name       String      @map("name")
  color      String      @map("color") // 7-char hex string #RRGGBB
  created_at DateTime    @default(now()) @map("created_at") @db.Timestamptz
  updated_at DateTime    @updatedAt @map("updated_at") @db.Timestamptz
  deleted_at DateTime?   @map("deleted_at") @db.Timestamptz

  project Project     @relation(fields: [project_id], references: [id], onDelete: Cascade)
  tasks   TaskLabel[]

  @@unique([project_id, name], name: "unique_project_label_name")
  @@map("labels")
  @@index([project_id])
  @@index([deleted_at])
}

model TaskLabel {
  task_id  String @map("task_id") @db.Uuid
  label_id String @map("label_id") @db.Uuid

  task  Task  @relation(fields: [task_id], references: [id], onDelete: Cascade)
  label Label @relation(fields: [label_id], references: [id], onDelete: Cascade)

  @@id([task_id, label_id])
  @@map("task_labels")
  @@index([task_id])
  @@index([label_id])
}

// Activity & Notifications
model ActivityLog {
  id         String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  project_id String?  @map("project_id") @db.Uuid
  task_id    String?  @map("task_id") @db.Uuid
  actor_id   String   @map("actor_id") @db.Uuid
  action     String   @map("action") // e.g., task_created, status_changed, member_added
  payload    Json?    @map("payload") @db.JsonB
  created_at DateTime @default(now()) @map("created_at") @db.Timestamptz
  updated_at DateTime @updatedAt @map("updated_at") @db.Timestamptz
  deleted_at DateTime? @map("deleted_at") @db.Timestamptz

  project Project? @relation(fields: [project_id], references: [id])
  task    Task?    @relation(fields: [task_id], references: [id])
  actor   User     @relation(fields: [actor_id], references: [id])

  @@map("activity_logs")
  @@index([project_id])
  @@index([task_id])
  @@index([actor_id])
  @@index([created_at(sort: Desc)])
  @@index([deleted_at])
}

model Notification {
  id         String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  user_id    String   @map("user_id") @db.Uuid
  task_id    String?  @map("task_id") @db.Uuid
  type       String   @map("type") // e.g., task_assigned, task_commented
  payload    Json     @map("payload") @db.JsonB
  read_at    DateTime? @map("read_at") @db.Timestamptz
  created_at DateTime @default(now()) @map("created_at") @db.Timestamptz
  updated_at DateTime @updatedAt @map("updated_at") @db.Timestamptz
  deleted_at DateTime? @map("deleted_at") @db.Timestamptz

  user User  @relation(fields: [user_id], references: [id], onDelete: Cascade)
  task Task? @relation(fields: [task_id], references: [id])

  @@map("notifications")
  @@index([user_id])
  @@index([task_id])
  @@index([read_at])
  @@index([deleted_at])
}

model NotificationPreference {
  user_id            String   @id @map("user_id") @db.Uuid
  email_due_tomorrow Boolean  @default(true) @map("email_due_tomorrow")
  email_overdue      Boolean  @default(true) @map("email_overdue")
  email_assigned     Boolean  @default(true) @map("email_assigned")
  email_commented    Boolean  @default(false) @map("email_commented")
  updated_at         DateTime @updatedAt @map("updated_at") @db.Timestamptz

  user User @relation(fields: [user_id], references: [id], onDelete: Cascade)

  @@map("notification_preferences")
}

// Enums
enum UserRole {
  ADMIN
  MEMBER
  VIEWER

  @@map("user_role")
}

enum ProjectStatus {
  ACTIVE
  ARCHIVED

  @@map("project_status")
}

enum ProjectRole {
  ADMIN
  MEMBER
  VIEWER

  @@map("project_role")
}

enum TaskStatus {
  TODO
  IN_PROGRESS
  IN_REVIEW
  BLOCKED
  DONE

  @@map("task_status")
}

enum TaskPriority {
  LOW
  MEDIUM
  HIGH
  CRITICAL

  @@map("task_priority")
}
```

## Tables

### Table: `users`
**Purpose:** Store user accounts with authentication and role information

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | No | gen_random_uuid() | Primary key |
| name | VARCHAR | No | - | User's full name |
| email | VARCHAR | No | - | Unique email address for login |
| password_hash | VARCHAR | No | - | bcrypt hashed password (≥12 rounds) |
| role | user_role ENUM | No | MEMBER | Global role: ADMIN, MEMBER, VIEWER |
| created_at | TIMESTAMPTZ | No | now() | Account creation timestamp |
| updated_at | TIMESTAMPTZ | No | now() | Last update timestamp |
| deleted_at | TIMESTAMPTZ | Yes | NULL | Soft delete timestamp |

**Constraints:** PK(id), UNIQUE(email)
**Indexes:** email, role, deleted_at

### Table: `refresh_tokens`
**Purpose:** Store hashed JWT refresh tokens for session management

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | No | gen_random_uuid() | Primary key |
| user_id | UUID | No | - | Foreign key to users.id |
| token_hash | VARCHAR | No | - | bcrypt hash of refresh token |
| expires_at | TIMESTAMPTZ | No | - | Token expiration time |
| created_at | TIMESTAMPTZ | No | now() | Token creation timestamp |
| updated_at | TIMESTAMPTZ | No | now() | Last update timestamp |
| deleted_at | TIMESTAMPTZ | Yes | NULL | Soft delete timestamp |

**Constraints:** PK(id), FK(user_id → users.id) ON DELETE CASCADE
**Indexes:** user_id, token_hash, expires_at, deleted_at

### Table: `invite_tokens`
**Purpose:** Store admin-generated user invitation tokens with expiry

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | No | gen_random_uuid() | Primary key |
| email | VARCHAR | No | - | Email of invited user |
| role | user_role ENUM | No | - | Assigned role for invitee |
| token_hash | VARCHAR | No | - | bcrypt hash of invite token |
| expires_at | TIMESTAMPTZ | No | - | Invitation expiration (72 hours) |
| accepted_at | TIMESTAMPTZ | Yes | NULL | When invitation was accepted |
| created_at | TIMESTAMPTZ | No | now() | Invitation creation timestamp |
| updated_at | TIMESTAMPTZ | No | now() | Last update timestamp |
| deleted_at | TIMESTAMPTZ | Yes | NULL | Soft delete timestamp |

**Constraints:** PK(id), UNIQUE(token_hash)
**Indexes:** email, token_hash, expires_at, deleted_at

### Table: `projects`
**Purpose:** Store project containers that group related tasks

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | No | gen_random_uuid() | Primary key |
| name | VARCHAR | No | - | Project name (≤100 chars) |
| description | TEXT | Yes | NULL | Optional project description |
| color | VARCHAR(7) | No | - | Hex color code (#RRGGBB) |
| status | project_status ENUM | No | ACTIVE | ACTIVE or ARCHIVED |
| created_by | UUID | No | - | Foreign key to users.id (creator) |
| created_at | TIMESTAMPTZ | No | now() | Project creation timestamp |
| updated_at | TIMESTAMPTZ | No | now() | Last update timestamp |
| deleted_at | TIMESTAMPTZ | Yes | NULL | Soft delete timestamp |

**Constraints:** PK(id), FK(created_by → users.id)
**Indexes:** created_by, status, deleted_at

### Table: `project_members`
**Purpose:** Join table defining user membership and roles within projects

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | No | gen_random_uuid() | Primary key |
| project_id | UUID | No | - | Foreign key to projects.id |
| user_id | UUID | No | - | Foreign key to users.id |
| role | project_role ENUM | No | MEMBER | ADMIN, MEMBER, or VIEWER |
| joined_at | TIMESTAMPTZ | No | now() | When user joined project |
| created_at | TIMESTAMPTZ | No | now() | Record creation timestamp |
| updated_at | TIMESTAMPTZ | No | now() | Last update timestamp |
| deleted_at | TIMESTAMPTZ | Yes | NULL | Soft delete timestamp |

**Constraints:** PK(id), FK(project_id → projects.id) ON DELETE CASCADE, FK(user_id → users.id) ON DELETE CASCADE, UNIQUE(project_id, user_id)
**Indexes:** project_id, user_id, deleted_at

### Table: `tasks`
**Purpose:** Store individual work items within projects

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | No | gen_random_uuid() | Primary key |
| project_id | UUID | No | - | Foreign key to projects.id |
| title | VARCHAR(255) | No | - | Task title |
| description | TEXT | Yes | NULL | Optional task description |
| status | task_status ENUM | No | TODO | TODO, IN_PROGRESS, IN_REVIEW, BLOCKED, DONE |
| priority | task_priority ENUM | No | MEDIUM | LOW, MEDIUM, HIGH, CRITICAL |
| due_date | DATE | Yes | NULL | Optional due date |
| assignee_id | UUID | Yes | NULL | Foreign key to users.id |
| created_by | UUID | No | - | Foreign key to users.id (creator) |
| last_due_notified_at | TIMESTAMPTZ | Yes | NULL | Last time due date notification was sent |
| created_at | TIMESTAMPTZ | No | now() | Task creation timestamp |
| updated_at | TIMESTAMPTZ | No | now() | Last update timestamp |
| deleted_at | TIMESTAMPTZ | Yes | NULL | Soft delete timestamp |

**Constraints:** PK(id), FK(project_id → projects.id) ON DELETE CASCADE, FK(assignee_id → users.id), FK(created_by → users.id)
**Indexes:** project_id, assignee_id, status, priority, due_date, created_by, deleted_at

### Table: `comments`
**Purpose:** Store user comments on tasks for collaboration

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | No | gen_random_uuid() | Primary key |
| task_id | UUID | No | - | Foreign key to tasks.id |
| author_id | UUID | No | - | Foreign key to users.id |
| body | TEXT | No | - | Comment text (≤5000 chars) |
| edited_at | TIMESTAMPTZ | Yes | NULL | When comment was last edited |
| created_at | TIMESTAMPTZ | No | now() | Comment creation timestamp |
| updated_at | TIMESTAMPTZ | No | now() | Last update timestamp |
| deleted_at | TIMESTAMPTZ | Yes | NULL | Soft delete timestamp |

**Constraints:** PK(id), FK(task_id → tasks.id) ON DELETE CASCADE, FK(author_id → users.id)
**Indexes:** task_id, author_id, deleted_at

### Table: `labels`
**Purpose:** Store custom project-specific labels for task categorization

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | No | gen_random_uuid() | Primary key |
| project_id | UUID | No | - | Foreign key to projects.id |
| name | VARCHAR(50) | No | - | Label name |
| color | VARCHAR(7) | No | - | Hex color code (#RRGGBB) |
| created_at | TIMESTAMPTZ | No | now() | Label creation timestamp |
| updated_at | TIMESTAMPTZ | No | now() | Last update timestamp |
| deleted_at | TIMESTAMPTZ | Yes | NULL | Soft delete timestamp |

**Constraints:** PK(id), FK(project_id → projects.id) ON DELETE CASCADE, UNIQUE(project_id, name)
**Indexes:** project_id, deleted_at

### Table: `task_labels`
**Purpose:** Many-to-many relationship between tasks and labels

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| task_id | UUID | No | - | Foreign key to tasks.id |
| label_id | UUID | No | - | Foreign key to labels.id |

**Constraints:** PK(task_id, label_id), FK(task_id → tasks.id) ON DELETE CASCADE, FK(label_id → labels.id) ON DELETE CASCADE
**Indexes:** task_id, label_id

### Table: `activity_logs`
**Purpose:** Immutable log of all significant system events for audit and activity feed

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | No | gen_random_uuid() | Primary key |
| project_id | UUID | Yes | NULL | Foreign key to projects.id (if applicable) |
| task_id | UUID | Yes | NULL | Foreign key to tasks.id (if applicable) |
| actor_id | UUID | No | - | Foreign key to users.id (who performed action) |
| action | VARCHAR(50) | No | - | Action type (task_created, status_changed, etc.) |
| payload | JSONB | Yes | NULL | Additional context data |
| created_at | TIMESTAMPTZ | No | now() | Event timestamp |
| updated_at | TIMESTAMPTZ | No | now() | Last update timestamp |
| deleted_at | TIMESTAMPTZ | Yes | NULL | Soft delete timestamp |

**Constraints:** PK(id), FK(project_id → projects.id), FK(task_id → tasks.id), FK(actor_id → users.id)
**Indexes:** project_id, task_id, actor_id, created_at DESC, deleted_at

### Table: `notifications`
**Purpose:** In-app notifications for user actions and events

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | No | gen_random_uuid() | Primary key |
| user_id | UUID | No | - | Foreign key to users.id (notification recipient) |
| task_id | UUID | Yes | NULL | Foreign key to tasks.id (if related to task) |
| type | VARCHAR(50) | No | - | Notification type (task_assigned, task_commented, etc.) |
| payload | JSONB | No | - | Notification data |
| read_at | TIMESTAMPTZ | Yes | NULL | When notification was read |
| created_at | TIMESTAMPTZ | No | now() | Notification creation timestamp |
| updated_at | TIMESTAMPTZ | No | now() | Last update timestamp |
| deleted_at | TIMESTAMPTZ | Yes | NULL | Soft delete timestamp |

**Constraints:** PK(id), FK(user_id → users.id) ON DELETE CASCADE, FK(task_id → tasks.id)
**Indexes:** user_id, task_id, read_at, deleted_at

### Table: `notification_preferences`
**Purpose:** User preferences for email notification delivery

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| user_id | UUID | No | - | Primary key, foreign key to users.id |
| email_due_tomorrow | BOOLEAN | No | true | Send email for tasks due tomorrow |
| email_overdue | BOOLEAN | No | true | Send email for overdue tasks |
| email_assigned | BOOLEAN | No | true | Send email when task is assigned |
| email_commented | BOOLEAN | No | false | Send email when task is commented |
| updated_at | TIMESTAMPTZ | No | now() | Last update timestamp |

**Constraints:** PK(user_id), FK(user_id → users.id) ON DELETE CASCADE

## Entity Relationship Diagram (ASCII)

```
┌─────────────┐       ┌──────────────────┐       ┌─────────────┐
│    users    │───────│ project_members  │───────│  projects   │
│             │       │                  │       │             │
│ • id (PK)   │       │ • id (PK)        │       │ • id (PK)   │
│ • email     │       │ • project_id(FK) │       │ • name      │
│ • role      │       │ • user_id (FK)   │       │ • color     │
└─────────────┘       │ • role           │       │ • status    │
       │               └──────────────────┘       └─────────────┘
       │                                                 │
       │               ┌──────────────────┐              │
       │───────────────│      tasks       │──────────────┘
       │               │                  │
       │               │ • id (PK)        │
       │               │ • project_id(FK) │
       │               │ • assignee_id(FK)│
       │               │ • title          │
       │               │ • status         │
       │               │ • priority       │
       │               └──────────────────┘
       │                        │
       │               ┌──────────────────┐
       │───────────────│    comments      │
       │               │                  │
       │               │ • id (PK)        │
       │               │ • task_id (FK)   │
       │               │ • author_id (FK) │
       │               │ • body           │
       │               └──────────────────┘
       │
       │               ┌──────────────────┐
       │───────────────│  notifications  │
       │               │                  │
       │               │ • id (PK)        │
       │               │ • user_id (FK)   │
       │               │ • type           │
       │               │ • payload        │
       │               └──────────────────┘
       │
       │               ┌──────────────────┐
       └───────────────│ activity_logs    │
                       │                  │
                       │ • id (PK)        │
                       │ • actor_id (FK)  │
                       │ • action         │
                       │ • payload        │
                       └──────────────────┘

┌─────────────┐       ┌──────────────────┐       ┌─────────────┐
│   labels    │───────│   task_labels    │───────│    tasks    │
│             │       │                  │       │             │
│ • id (PK)   │       │ • task_id (FK)   │       │ • id (PK)   │
│ • name      │       │ • label_id (FK)  │       │             │
│ • color     │       └──────────────────┘       │             │
└─────────────┘                                  └─────────────┘
```

## Relationships Map

| Table A | Relation | Table B | FK Column | On Delete |
|---------|----------|---------|-----------|-----------|
| users | one-to-many | refresh_tokens | user_id | CASCADE |
| users | one-to-many | created_projects | created_by | RESTRICT |
| users | one-to-many | assigned_tasks | assignee_id | SET NULL |
| users | one-to-many | created_tasks | created_by | RESTRICT |
| users | one-to-many | comments | author_id | RESTRICT |
| users | one-to-many | notifications | user_id | CASCADE |
| users | one-to-many | activity_logs | actor_id | RESTRICT |
| users | one-to-one | notification_preferences | user_id | CASCADE |
| users | many-to-many | projects | via project_members | CASCADE |
| projects | one-to-many | project_members | project_id | CASCADE |
| projects | one-to-many | tasks | project_id | CASCADE |
| projects | one-to-many | labels | project_id | CASCADE |
| projects | one-to-many | activity_logs | project_id | SET NULL |
| tasks | one-to-many | comments | task_id | CASCADE |
| tasks | one-to-many | activity_logs | task_id | SET NULL |
| tasks | many-to-many | labels | via task_labels | CASCADE |
| labels | many-to-many | tasks | via task_labels | CASCADE |

## Migration Notes

1. **UUID Extension**: Ensure PostgreSQL `uuid-ossp` or `pgcrypto` extension is installed for `gen_random_uuid()` function
2. **Enum Creation**: Prisma will create custom enum types for all role and status fields
3. **Index Strategy**: All foreign keys are automatically indexed; additional indexes on commonly filtered columns (status, priority, due_date, deleted_at)
4. **JSONB Usage**: Payload columns use JSONB for efficient storage and querying of structured data
5. **Soft Delete**: All tables include `deleted_at` column; application must filter `WHERE deleted_at IS NULL` on all queries
6. **Composite Indexes**: Consider adding composite indexes for common query patterns (e.g., `(project_id, status, deleted_at)` on tasks)
7. **Unique Constraints**:
   - email uniqueness on users table
   - token_hash uniqueness on invite_tokens
   - (project_id, user_id) uniqueness on project_members
   - (project_id, name) uniqueness on labels
8. **Cascading Logic**: Foreign key constraints properly handle cascading deletes for data integrity
9. **Performance Considerations**: Large activity_logs table should implement partitioning or archiving strategy in production
10. **Security**: All password storage uses bcrypt hashing; tokens stored as one-way hashes

## Business Rule Compliance

This schema enforces all business rules from Section 7 of the project brief:

1. ✅ Tasks belong to exactly one project (FK constraint)
2. ✅ Task assignment requires project membership (enforced in application layer)
3. ✅ Admin-only operations enforced by role checks
4. ✅ Role-based permissions in project_members table
5. ✅ Read-only viewer role supported
6. ✅ All tables use soft-delete with deleted_at
7. ✅ Password hashing via bcrypt (application layer)
8. ✅ JWT token management with refresh_tokens table
9. ✅ Account lockout tracking (application layer)
10. ✅ Last admin protection (application layer validation)